/**
 * SpanWrapper Module
 *
 * Higher-order functions that wrap tool executions with span tracing.
 * Creates child spans linked to parent traces for hierarchical tracing.
 *
 * @module opik/spanWrapper
 */

import { getOpikClient, type SpanInput, type SpanOutput, type ActiveSpan } from "./client";
import type { SpanType, SpanStatus, ErrorDetails } from "./schemas";

/**
 * Result from a span-wrapped tool execution
 */
export interface SpanWrappedResult<T> {
  result: T;
  spanId: string | null;
  durationMs: number;
}

/**
 * Tool execution context for span creation
 */
export interface ToolSpanContext {
  parentTraceId: string;
  parentSpanId?: string;
}

/**
 * Base tool output interface
 */
export interface ToolOutput {
  success: boolean;
  data?: unknown;
  error?: {
    code: string;
    message: string;
  };
}

/**
 * Tool-specific span data for categorizeIssueTool
 * Requirements: 3.1
 */
export interface CategorizeIssueSpanData {
  inputIssue: string;
  outputCategory?: string;
  confidence?: number;
  executionTimeMs: number;
}

/**
 * Tool-specific span data for yelpSearchTool
 * Requirements: 3.2
 */
export interface YelpSearchSpanData {
  searchParams: {
    category: string;
    lat: number;
    lng: number;
  };
  resultCount?: number;
  filteredCount?: number;
  apiLatencyMs?: number;
  fallbackUsed: boolean;
}

/**
 * Tool-specific span data for dispatchAgentTool
 * Requirements: 3.4
 */
export interface DispatchAgentSpanData {
  requestId: string;
  agentId: string;
  eta?: number;
  costEstimate?: number;
  status: "success" | "error";
}

/**
 * Union type for all tool-specific span data
 */
export type ToolSpanData =
  | CategorizeIssueSpanData
  | YelpSearchSpanData
  | DispatchAgentSpanData;


/**
 * Wraps a tool execution with span tracing
 *
 * Creates a child span linked to the parent trace with:
 * - Tool name
 * - Input parameters
 * - Output
 * - Execution time
 * - Error details (if any)
 *
 * Requirements: 2.3
 *
 * @param toolName - Name of the tool being wrapped
 * @param context - Parent trace context for linking spans
 * @returns A function that wraps tool execution with span tracing
 */
export function wrapTool<TInput, TOutput extends ToolOutput>(
  toolName: string,
  context: ToolSpanContext
): (execute: (input: TInput) => Promise<TOutput>) => (input: TInput) => Promise<SpanWrappedResult<TOutput>> {
  return (execute: (input: TInput) => Promise<TOutput>) => {
    return async (input: TInput): Promise<SpanWrappedResult<TOutput>> => {
      const client = getOpikClient();
      const startTime = Date.now();

      // Create span input
      const spanInput: SpanInput = {
        name: toolName,
        type: "tool" as SpanType,
        input: input as unknown,
        parentSpanId: context.parentSpanId,
      };

      // Create child span linked to parent trace
      let activeSpan: ActiveSpan | null = null;
      try {
        activeSpan = await client.createSpan(context.parentTraceId, spanInput);
      } catch {
        // Graceful degradation - continue without span tracing
      }

      // Execute the tool
      let result: TOutput;
      let error: ErrorDetails | undefined;
      let status: SpanStatus = "success";

      try {
        result = await execute(input);

        // Check if result contains an error
        if (!result.success && result.error) {
          error = {
            code: result.error.code,
            message: result.error.message,
          };
          status = "error";
        }
      } catch (err) {
        const durationMs = Date.now() - startTime;
        error = {
          code: "TOOL_EXECUTION_ERROR",
          message: err instanceof Error ? err.message : "Unknown error",
          stack: err instanceof Error ? err.stack : undefined,
        };
        status = "error";

        // End span with error
        if (activeSpan) {
          try {
            const spanOutput: SpanOutput = {
              output: null,
              status,
              error,
              durationMs,
            };
            await client.endSpan(activeSpan.id, spanOutput);
          } catch {
            // Ignore span errors
          }
        }

        // Re-throw the error
        throw err;
      }

      const durationMs = Date.now() - startTime;

      // End span with success
      if (activeSpan) {
        try {
          const spanOutput: SpanOutput = {
            output: result.data ?? result,
            status,
            error,
            durationMs,
          };
          await client.endSpan(activeSpan.id, spanOutput);
        } catch {
          // Ignore span errors
        }
      }

      return {
        result,
        spanId: activeSpan?.id ?? null,
        durationMs,
      };
    };
  };
}

/**
 * Creates a span-wrapped version of a tool
 *
 * Convenience function that wraps a tool object with span tracing.
 *
 * @param tool - The tool to wrap
 * @param context - Parent trace context for linking spans
 * @returns A wrapped tool with span tracing enabled
 */
export function createSpanWrappedTool<TInput, TOutput extends ToolOutput>(
  tool: { name: string; execute: (input: TInput) => Promise<TOutput> },
  context: ToolSpanContext
): { name: string; execute: (input: TInput) => Promise<SpanWrappedResult<TOutput>> } {
  const wrapper = wrapTool<TInput, TOutput>(tool.name, context);
  return {
    name: tool.name,
    execute: wrapper(tool.execute.bind(tool)),
  };
}


/**
 * Wraps categorizeIssueTool with span tracing
 *
 * Logs: input issue, output category, confidence, execution time
 * Requirements: 3.1
 *
 * @param context - Parent trace context for linking spans
 * @returns A function that wraps categorizeIssueTool execution with span tracing
 */
export function wrapCategorizeIssueTool<TInput extends { issue: string }, TOutput extends ToolOutput & { data?: { category: string; confidence: number } }>(
  context: ToolSpanContext
): (execute: (input: TInput) => Promise<TOutput>) => (input: TInput) => Promise<SpanWrappedResult<TOutput>> {
  return (execute: (input: TInput) => Promise<TOutput>) => {
    return async (input: TInput): Promise<SpanWrappedResult<TOutput>> => {
      const client = getOpikClient();
      const startTime = Date.now();

      // Create span input with tool-specific data
      const spanInput: SpanInput = {
        name: "categorizeIssueTool",
        type: "tool" as SpanType,
        input: {
          issue: input.issue,
        },
        parentSpanId: context.parentSpanId,
      };

      let activeSpan: ActiveSpan | null = null;
      try {
        activeSpan = await client.createSpan(context.parentTraceId, spanInput);
      } catch {
        // Graceful degradation
      }

      let result: TOutput;
      let error: ErrorDetails | undefined;
      let status: SpanStatus = "success";

      try {
        result = await execute(input);

        if (!result.success && result.error) {
          error = { code: result.error.code, message: result.error.message };
          status = "error";
        }
      } catch (err) {
        const durationMs = Date.now() - startTime;
        error = {
          code: "CATEGORIZE_ISSUE_ERROR",
          message: err instanceof Error ? err.message : "Unknown error",
          stack: err instanceof Error ? err.stack : undefined,
        };
        status = "error";

        if (activeSpan) {
          try {
            await client.endSpan(activeSpan.id, { output: null, status, error, durationMs });
          } catch { /* ignore */ }
        }
        throw err;
      }

      const durationMs = Date.now() - startTime;

      if (activeSpan) {
        try {
          const spanOutput: SpanOutput = {
            output: {
              category: result.data?.category,
              confidence: result.data?.confidence,
            },
            status,
            error,
            durationMs,
            metrics: {
              executionTimeMs: durationMs,
              confidence: result.data?.confidence ?? 0,
            },
          };
          await client.endSpan(activeSpan.id, spanOutput);
        } catch { /* ignore */ }
      }

      return { result, spanId: activeSpan?.id ?? null, durationMs };
    };
  };
}

/**
 * Wraps yelpSearchTool with span tracing
 *
 * Logs: search params, result count, filtered count, API latency, fallback usage
 * Requirements: 3.2
 *
 * @param context - Parent trace context for linking spans
 * @returns A function that wraps yelpSearchTool execution with span tracing
 */
export function wrapYelpSearchTool<
  TInput extends { category: string; lat: number; lng: number },
  TOutput extends ToolOutput & { data?: Array<unknown> }
>(
  context: ToolSpanContext
): (execute: (input: TInput) => Promise<TOutput>) => (input: TInput) => Promise<SpanWrappedResult<TOutput>> {
  return (execute: (input: TInput) => Promise<TOutput>) => {
    return async (input: TInput): Promise<SpanWrappedResult<TOutput>> => {
      const client = getOpikClient();
      const startTime = Date.now();

      const spanInput: SpanInput = {
        name: "yelpSearchTool",
        type: "tool" as SpanType,
        input: {
          category: input.category,
          lat: input.lat,
          lng: input.lng,
        },
        parentSpanId: context.parentSpanId,
      };

      let activeSpan: ActiveSpan | null = null;
      try {
        activeSpan = await client.createSpan(context.parentTraceId, spanInput);
      } catch { /* graceful degradation */ }

      let result: TOutput;
      let error: ErrorDetails | undefined;
      let status: SpanStatus = "success";

      try {
        result = await execute(input);

        if (!result.success && result.error) {
          error = { code: result.error.code, message: result.error.message };
          status = "error";
        }
      } catch (err) {
        const durationMs = Date.now() - startTime;
        error = {
          code: "YELP_SEARCH_ERROR",
          message: err instanceof Error ? err.message : "Unknown error",
          stack: err instanceof Error ? err.stack : undefined,
        };
        status = "error";

        if (activeSpan) {
          try {
            await client.endSpan(activeSpan.id, { output: null, status, error, durationMs });
          } catch { /* ignore */ }
        }
        throw err;
      }

      const durationMs = Date.now() - startTime;
      const resultCount = result.data?.length ?? 0;
      // Detect fallback usage - if we got results but no API key was set
      const fallbackUsed = !process.env.YELP_API_KEY && resultCount > 0;

      if (activeSpan) {
        try {
          const spanOutput: SpanOutput = {
            output: {
              resultCount,
              fallbackUsed,
            },
            status,
            error,
            durationMs,
            metrics: {
              resultCount,
              apiLatencyMs: durationMs,
              fallbackUsed: fallbackUsed ? 1 : 0,
            },
          };
          await client.endSpan(activeSpan.id, spanOutput);
        } catch { /* ignore */ }
      }

      return { result, spanId: activeSpan?.id ?? null, durationMs };
    };
  };
}


/**
 * Wraps dispatchAgentTool with span tracing
 *
 * Logs: requestId, agentId, ETA, cost estimate, status
 * Requirements: 3.4
 *
 * @param context - Parent trace context for linking spans
 * @returns A function that wraps dispatchAgentTool execution with span tracing
 */
export function wrapDispatchAgentTool<
  TInput extends { requestId: string; agentId: string },
  TOutput extends ToolOutput & { data?: { eta?: number; costEstimate?: number; status?: string } }
>(
  context: ToolSpanContext
): (execute: (input: TInput) => Promise<TOutput>) => (input: TInput) => Promise<SpanWrappedResult<TOutput>> {
  return (execute: (input: TInput) => Promise<TOutput>) => {
    return async (input: TInput): Promise<SpanWrappedResult<TOutput>> => {
      const client = getOpikClient();
      const startTime = Date.now();

      const spanInput: SpanInput = {
        name: "dispatchAgentTool",
        type: "tool" as SpanType,
        input: {
          requestId: input.requestId,
          agentId: input.agentId,
        },
        parentSpanId: context.parentSpanId,
      };

      let activeSpan: ActiveSpan | null = null;
      try {
        activeSpan = await client.createSpan(context.parentTraceId, spanInput);
      } catch { /* graceful degradation */ }

      let result: TOutput;
      let error: ErrorDetails | undefined;
      let spanStatus: SpanStatus = "success";

      try {
        result = await execute(input);

        if (!result.success && result.error) {
          error = { code: result.error.code, message: result.error.message };
          spanStatus = "error";
        }
      } catch (err) {
        const durationMs = Date.now() - startTime;
        error = {
          code: "DISPATCH_AGENT_ERROR",
          message: err instanceof Error ? err.message : "Unknown error",
          stack: err instanceof Error ? err.stack : undefined,
        };
        spanStatus = "error";

        if (activeSpan) {
          try {
            await client.endSpan(activeSpan.id, { output: null, status: spanStatus, error, durationMs });
          } catch { /* ignore */ }
        }
        throw err;
      }

      const durationMs = Date.now() - startTime;

      if (activeSpan) {
        try {
          const spanOutput: SpanOutput = {
            output: {
              requestId: input.requestId,
              agentId: input.agentId,
              eta: result.data?.eta,
              costEstimate: result.data?.costEstimate,
              status: result.success ? "success" : "error",
            },
            status: spanStatus,
            error,
            durationMs,
            metrics: {
              eta: result.data?.eta ?? 0,
              costEstimate: result.data?.costEstimate ?? 0,
            },
          };
          await client.endSpan(activeSpan.id, spanOutput);
        } catch { /* ignore */ }
      }

      return { result, spanId: activeSpan?.id ?? null, durationMs };
    };
  };
}

/**
 * Wraps any tool with error logging in spans
 *
 * Logs: error code, message, stack trace for tool errors
 * Requirements: 3.5
 *
 * @param toolName - Name of the tool being wrapped
 * @param context - Parent trace context for linking spans
 * @returns A function that wraps tool execution with error logging
 */
export function wrapToolWithErrorLogging<TInput, TOutput extends ToolOutput>(
  toolName: string,
  context: ToolSpanContext
): (execute: (input: TInput) => Promise<TOutput>) => (input: TInput) => Promise<SpanWrappedResult<TOutput>> {
  return (execute: (input: TInput) => Promise<TOutput>) => {
    return async (input: TInput): Promise<SpanWrappedResult<TOutput>> => {
      const client = getOpikClient();
      const startTime = Date.now();

      const spanInput: SpanInput = {
        name: toolName,
        type: "tool" as SpanType,
        input: input as unknown,
        parentSpanId: context.parentSpanId,
      };

      let activeSpan: ActiveSpan | null = null;
      try {
        activeSpan = await client.createSpan(context.parentTraceId, spanInput);
      } catch { /* graceful degradation */ }

      let result: TOutput;
      let error: ErrorDetails | undefined;
      let status: SpanStatus = "success";

      try {
        result = await execute(input);

        // Check for error in result
        if (!result.success && result.error) {
          error = {
            code: result.error.code,
            message: result.error.message,
          };
          status = "error";
        }
      } catch (err) {
        const durationMs = Date.now() - startTime;
        // Capture full error details including stack trace
        error = {
          code: err instanceof Error && "code" in err ? String((err as Error & { code: string }).code) : "TOOL_ERROR",
          message: err instanceof Error ? err.message : "Unknown error",
          stack: err instanceof Error ? err.stack : undefined,
        };
        status = "error";

        if (activeSpan) {
          try {
            await client.endSpan(activeSpan.id, {
              output: null,
              status,
              error,
              durationMs,
            });
          } catch { /* ignore */ }
        }
        throw err;
      }

      const durationMs = Date.now() - startTime;

      if (activeSpan) {
        try {
          await client.endSpan(activeSpan.id, {
            output: result.data ?? result,
            status,
            error,
            durationMs,
          });
        } catch { /* ignore */ }
      }

      return { result, spanId: activeSpan?.id ?? null, durationMs };
    };
  };
}
