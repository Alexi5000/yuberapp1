import { createTool } from "@mastra/core/tools";
import * as z from "zod/v4";
import { store } from "@/store";
import { PaymentSchema } from "@/mastra/schemas";
import { wrapTool, type ToolSpanContext, type SpanWrappedResult, type ToolOutput } from "@/lib/opik/spanWrapper";

// Tool output schema
export const ProcessPaymentOutputSchema = z.object({
  success: z.boolean(),
  data: PaymentSchema.optional(),
  error: z
    .object({
      code: z.string(),
      message: z.string(),
    })
    .optional(),
});

export type ProcessPaymentOutput = z.infer<typeof ProcessPaymentOutputSchema>;

/**
 * Core payment processing logic - exported for testing.
 * Simulates payment processing with status transitions.
 * Returns error object for failure conditions instead of throwing.
 */
export async function processPayment(
  dispatchId: string | undefined | null,
  amount: number | undefined | null,
  method: string | undefined | null,
  simulateFailure = false
): Promise<ProcessPaymentOutput> {
  // Validate required inputs
  if (!dispatchId || amount === undefined || amount === null || !method) {
    return {
      success: false,
      error: {
        code: "INVALID_INPUT",
        message: "Missing dispatchId, amount, or method",
      },
    };
  }

  // Validate dispatchId is not empty string
  if (dispatchId.trim() === "") {
    return {
      success: false,
      error: {
        code: "INVALID_INPUT",
        message: "dispatchId cannot be empty",
      },
    };
  }

  // Validate method is not empty string
  if (method.trim() === "") {
    return {
      success: false,
      error: {
        code: "INVALID_INPUT",
        message: "method cannot be empty",
      },
    };
  }

  // Validate amount is positive
  if (amount <= 0) {
    return {
      success: false,
      error: {
        code: "INVALID_INPUT",
        message: "amount must be positive",
      },
    };
  }

  // Simulate payment failure (10% chance or forced via parameter)
  const shouldFail = simulateFailure || Math.random() < 0.1;
  if (shouldFail) {
    // Create payment with failed status
    const failedPayment = await store.createPayment({
      dispatchId,
      amount,
      method,
      status: "failed",
    });
    return {
      success: false,
      data: failedPayment,
      error: {
        code: "PAYMENT_FAILED",
        message: "Payment processing failed",
      },
    };
  }

  // Simulate status transitions: pending → processing → completed
  // Create payment with pending status first
  const payment = await store.createPayment({
    dispatchId,
    amount,
    method,
    status: "pending",
  });

  // Transition to processing
  await store.updatePaymentStatus(payment.id, "processing");

  // Transition to completed
  const completedPayment = await store.updatePaymentStatus(payment.id, "completed");

  return { success: true, data: completedPayment };
}

// Input schema for process payment
export const ProcessPaymentInputSchema = z.object({
  dispatchId: z.string(),
  amount: z.number(),
  method: z.string(),
});

export type ProcessPaymentInput = z.infer<typeof ProcessPaymentInputSchema>;

/**
 * Core payment processing logic wrapper that accepts the full input object.
 */
export async function processPaymentFromInput(
  input: ProcessPaymentInput
): Promise<ProcessPaymentOutput> {
  return processPayment(input.dispatchId, input.amount, input.method);
}

/**
 * Mastra tool wrapper for payment processing.
 * Simulates payment processing with status transitions.
 * Generates transactionId and createdAt timestamp on success.
 */
export const processPaymentTool = createTool({
  id: "process-payment",
  description: "Simulates payment processing for a dispatch",
  inputSchema: ProcessPaymentInputSchema,
  outputSchema: ProcessPaymentOutputSchema,
  execute: async (context) => {
    const input = context as unknown as ProcessPaymentInput;
    return processPayment(input.dispatchId, input.amount, input.method);
  },
});

/**
 * Converts ProcessPaymentOutput to ToolOutput format for span wrapper
 */
function toToolOutput(output: ProcessPaymentOutput): ToolOutput {
  return {
    success: output.success,
    data: output.data,
    error: output.error ? { code: output.error.code, message: output.error.message } : undefined,
  };
}

/**
 * Creates a traced version of the processPayment function
 *
 * Wraps the processPayment function with Opik span tracing to capture:
 * - Dispatch ID
 * - Amount
 * - Payment method
 * - Transaction status
 * - Execution time
 *
 * Requirements: 3.1, 3.2, 3.3, 3.4 (general tool tracing)
 *
 * @param context - Parent trace context for linking spans
 * @returns A function that executes processPayment with span tracing
 */
export function createTracedProcessPayment(
  context: ToolSpanContext
): (input: ProcessPaymentInput) => Promise<SpanWrappedResult<ToolOutput>> {
  const wrapper = wrapTool<ProcessPaymentInput, ToolOutput>("processPaymentTool", context);

  return wrapper(async (input: ProcessPaymentInput): Promise<ToolOutput> => {
    const result = await processPayment(input.dispatchId, input.amount, input.method);
    return toToolOutput(result);
  });
}

/**
 * Executes processPayment with Opik span tracing
 *
 * Convenience function that creates a traced tool and executes it.
 *
 * @param input - Payment input with dispatchId, amount, and method
 * @param context - Parent trace context for linking spans
 * @returns Span-wrapped result with payment output, spanId, and duration
 */
export async function executeTracedProcessPayment(
  input: ProcessPaymentInput,
  context: ToolSpanContext
): Promise<SpanWrappedResult<ToolOutput>> {
  const tracedTool = createTracedProcessPayment(context);
  return tracedTool(input);
}
