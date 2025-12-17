import { createTool } from "@mastra/core/tools";
import * as z from "zod/v4";
import { store } from "@/store";
import { UserRequestSchema, type UserRequest } from "@/mastra/schemas";
import { wrapTool, type ToolSpanContext, type SpanWrappedResult, type ToolOutput } from "@/lib/opik/spanWrapper";

// Tool output schema
export const GetHistoryOutputSchema = z.object({
  requests: z.array(UserRequestSchema),
});

export type GetHistoryOutput = z.infer<typeof GetHistoryOutputSchema>;

// Input schema for get history
export const GetHistoryInputSchema = z.object({
  userId: z.string(),
});

export type GetHistoryInput = z.infer<typeof GetHistoryInputSchema>;

/**
 * Core history retrieval logic - exported for testing.
 * Queries Turso database for requests by userId.
 * Returns empty array if no requests found.
 */
export async function getHistory(userId: string | undefined | null): Promise<GetHistoryOutput> {
  // Handle missing or empty userId - return empty array
  if (!userId || userId.trim() === "") {
    return { requests: [] };
  }

  const requests = await store.getRequestsByUserId(userId);
  return { requests };
}

/**
 * Mastra tool wrapper for history retrieval.
 * Retrieves user request history from In-Memory Store.
 */
export const getHistoryTool = createTool({
  id: "get-history",
  description: "Retrieves user request history from database",
  inputSchema: GetHistoryInputSchema,
  outputSchema: GetHistoryOutputSchema,
  execute: async (context) => {
    const input = context as unknown as GetHistoryInput;
    return await getHistory(input.userId);
  },
});

/**
 * Converts GetHistoryOutput to ToolOutput format for span wrapper
 */
function toToolOutput(output: GetHistoryOutput): ToolOutput {
  return {
    success: true,
    data: output.requests,
  };
}

/**
 * Creates a traced version of the getHistory function
 *
 * Wraps the getHistory function with Opik span tracing to capture:
 * - User ID
 * - Number of requests returned
 * - Execution time
 *
 * Requirements: 3.1, 3.2, 3.3, 3.4 (general tool tracing)
 *
 * @param context - Parent trace context for linking spans
 * @returns A function that executes getHistory with span tracing
 */
export function createTracedGetHistory(
  context: ToolSpanContext
): (input: GetHistoryInput) => Promise<SpanWrappedResult<ToolOutput>> {
  const wrapper = wrapTool<GetHistoryInput, ToolOutput>("getHistoryTool", context);

  return wrapper(async (input: GetHistoryInput): Promise<ToolOutput> => {
    const result = await getHistory(input.userId);
    return toToolOutput(result);
  });
}

/**
 * Executes getHistory with Opik span tracing
 *
 * Convenience function that creates a traced tool and executes it.
 *
 * @param userId - User ID to retrieve history for
 * @param context - Parent trace context for linking spans
 * @returns Span-wrapped result with history output, spanId, and duration
 */
export async function executeTracedGetHistory(
  userId: string,
  context: ToolSpanContext
): Promise<SpanWrappedResult<ToolOutput>> {
  const tracedTool = createTracedGetHistory(context);
  return tracedTool({ userId });
}
