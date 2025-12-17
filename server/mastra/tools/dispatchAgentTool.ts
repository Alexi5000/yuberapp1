import { createTool } from "@mastra/core/tools";
import * as z from "zod/v4";
import { store } from "@/store";
import { DispatchResultSchema } from "@/mastra/schemas";
import { wrapDispatchAgentTool, type ToolSpanContext, type SpanWrappedResult } from "@/lib/opik/spanWrapper";

// Tool output schema
export const DispatchAgentOutputSchema = z.object({
  success: z.boolean(),
  data: DispatchResultSchema.optional(),
  error: z
    .object({
      code: z.string(),
      message: z.string(),
    })
    .optional(),
});

export type DispatchAgentOutput = z.infer<typeof DispatchAgentOutputSchema>;

/**
 * Core dispatch logic - exported for testing.
 * Creates a dispatch assignment with calculated ETA and cost estimate.
 * Returns error object for invalid inputs instead of throwing.
 */
export async function createDispatch(
  requestId: string | undefined | null,
  agentId: string | undefined | null
): Promise<DispatchAgentOutput> {
  // Validate required inputs
  if (!requestId || !agentId) {
    return {
      success: false,
      error: {
        code: "INVALID_INPUT",
        message: "Missing requestId or agentId",
      },
    };
  }

  // Validate requestId is not empty string
  if (requestId.trim() === "" || agentId.trim() === "") {
    return {
      success: false,
      error: {
        code: "INVALID_INPUT",
        message: "requestId and agentId cannot be empty",
      },
    };
  }

  // Calculate ETA (15-45 minutes) and cost estimate ($50-$250)
  const eta = Math.floor(Math.random() * 30) + 15;
  const costEstimate = Math.floor(Math.random() * 200) + 50;

  // Create dispatch in store
  const dispatch = await store.createDispatch({
    requestId,
    agentId,
    eta,
    costEstimate,
    status: "dispatched",
    yelpLink: `https://yelp.com/biz/${agentId}`,
  });

  return { success: true, data: dispatch };
}

/**
 * Mastra tool wrapper for dispatch creation.
 * Creates a DispatchResult with calculated ETA and cost estimate.
 * Sets status to "dispatched" and records dispatchedAt timestamp.
 */
export const dispatchAgentTool = createTool({
  id: "dispatch-agent-tool",
  description: "Creates dispatch assignment for a service request",
  inputSchema: z.object({
    requestId: z.string(),
    agentId: z.string(),
  }),
  outputSchema: DispatchAgentOutputSchema,
  execute: async (context) => {
    const input = context as any;
    const params = input.requestId ? input : (input.context || input.input || input);
    console.log("[DispatchTool] Execute params:", JSON.stringify(params));
    return createDispatch(params.requestId, params.agentId);
  },
});

/**
 * Input type for dispatchAgentTool with span tracing
 */
export interface DispatchAgentSpanInput {
  requestId: string;
  agentId: string;
}

/**
 * Creates a traced version of the createDispatch function
 *
 * Wraps the createDispatch function with Opik span tracing to capture:
 * - Request ID
 * - Agent ID
 * - Calculated ETA
 * - Cost estimate
 * - Success/failure status
 *
 * Requirements: 3.4
 *
 * @param context - Parent trace context for linking spans
 * @returns A function that executes createDispatch with span tracing
 */
export function createTracedDispatch(
  context: ToolSpanContext
): (input: DispatchAgentSpanInput) => Promise<SpanWrappedResult<DispatchAgentOutput>> {
  const wrapper = wrapDispatchAgentTool<DispatchAgentSpanInput, DispatchAgentOutput>(context);

  return wrapper(async (input: DispatchAgentSpanInput): Promise<DispatchAgentOutput> => {
    return createDispatch(input.requestId, input.agentId);
  });
}

/**
 * Executes createDispatch with Opik span tracing
 *
 * Convenience function that creates a traced tool and executes it.
 *
 * @param requestId - Request ID to dispatch
 * @param agentId - Agent ID to dispatch
 * @param context - Parent trace context for linking spans
 * @returns Span-wrapped result with dispatch output, spanId, and duration
 */
export async function executeTracedDispatch(
  requestId: string,
  agentId: string,
  context: ToolSpanContext
): Promise<SpanWrappedResult<DispatchAgentOutput>> {
  const tracedTool = createTracedDispatch(context);
  return tracedTool({ requestId, agentId });
}
