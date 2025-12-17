/**
 * Opik Middleware Module
 *
 * Next.js middleware for API route instrumentation with Opik tracing.
 * Creates traces with HTTP method, path, headers, request body,
 * response status code, body size, and total duration.
 *
 * @module opik/middleware
 */

import { NextRequest } from "next/server";
import { getOpikClient, type TraceInput, type TraceOutput, type ActiveTrace } from "./client";
import type { TraceType, TraceStatus, ErrorDetails } from "./schemas";

/**
 * Trace context for propagating trace information through downstream calls
 */
export interface TraceContext {
  traceId: string;
  spanId?: string;
  parentSpanId?: string;
}

/**
 * API trace data captured from request/response
 */
export interface ApiTraceData {
  method: string;
  path: string;
  headers: Record<string, string>;
  requestBody?: unknown;
  responseStatus: number;
  responseBodySize: number;
  durationMs: number;
  error?: ErrorDetails;
}

/**
 * Options for withOpikTracing middleware
 */
export interface OpikTracingOptions {
  /** Custom name for the trace (defaults to "{method} {path}") */
  name?: string;
  /** Additional metadata to include in the trace */
  metadata?: Record<string, unknown>;
  /** Whether to capture request body (default: true) */
  captureRequestBody?: boolean;
  /** Whether to capture response body size (default: true) */
  captureResponseBodySize?: boolean;
  /** Linked workflow trace ID for correlation */
  linkedWorkflowTraceId?: string;
}

/**
 * Extended request with trace context
 */
export interface TracedRequest extends NextRequest {
  traceContext?: TraceContext;
}

/**
 * Handler type for Next.js API routes
 */
export type ApiHandler = (request: NextRequest) => Promise<Response>;

/**
 * Handler type with trace context
 */
export type TracedApiHandler = (request: TracedRequest) => Promise<Response>;

// Global trace context storage (per-request)
const traceContextStorage = new Map<string, TraceContext>();

/**
 * Sets the current trace context for downstream calls
 */
export function setTraceContext(requestId: string, context: TraceContext): void {
  traceContextStorage.set(requestId, context);
}

/**
 * Gets the current trace context
 */
export function getTraceContext(requestId: string): TraceContext | undefined {
  return traceContextStorage.get(requestId);
}

/**
 * Clears the trace context after request completion
 */
export function clearTraceContext(requestId: string): void {
  traceContextStorage.delete(requestId);
}

/**
 * Extracts safe headers from request (excludes sensitive headers)
 */
function extractSafeHeaders(headers: Headers): Record<string, string> {
  const safeHeaders: Record<string, string> = {};
  const sensitiveHeaders = new Set([
    "authorization",
    "cookie",
    "set-cookie",
    "x-api-key",
    "x-auth-token",
  ]);

  headers.forEach((value, key) => {
    if (!sensitiveHeaders.has(key.toLowerCase())) {
      safeHeaders[key] = value;
    }
  });

  return safeHeaders;
}

/**
 * Gets the current environment from environment variables
 */
function getCurrentEnvironment(): "development" | "staging" | "production" {
  const env = process.env.ENVIRONMENT || process.env.NODE_ENV;
  if (env === "production") return "production";
  if (env === "staging") return "staging";
  return "development";
}

/**
 * Generates a unique request ID
 */
function generateRequestId(): string {
  return crypto.randomUUID();
}


/**
 * Higher-order function that wraps Next.js API route handlers with Opik tracing
 *
 * Creates a trace with:
 * - HTTP method, path, headers, request body
 * - Response status code, body size, total duration
 * - Propagates trace context through downstream calls
 *
 * Requirements: 9.1, 9.3, 9.4
 *
 * @param handler - The API route handler to wrap
 * @param options - Optional configuration for tracing
 * @returns Wrapped handler with tracing enabled
 */
export function withOpikTracing(
  handler: TracedApiHandler,
  options: OpikTracingOptions = {}
): ApiHandler {
  return async (request: NextRequest): Promise<Response> => {
    const client = getOpikClient();
    const startTime = Date.now();
    const requestId = generateRequestId();

    // Extract request information
    const method = request.method;
    const url = new URL(request.url);
    const path = url.pathname;
    const headers = extractSafeHeaders(request.headers);

    // Capture request body if enabled
    let requestBody: unknown = undefined;
    if (options.captureRequestBody !== false) {
      try {
        // Clone the request to read body without consuming it
        const clonedRequest = request.clone();
        const contentType = request.headers.get("content-type") || "";
        if (contentType.includes("application/json")) {
          requestBody = await clonedRequest.json();
        }
      } catch {
        // Ignore body parsing errors
      }
    }

    // Create trace name
    const traceName = options.name || `${method} ${path}`;

    // Create trace input
    const traceInput: TraceInput = {
      name: traceName,
      type: "api" as TraceType,
      input: {
        method,
        path,
        headers,
        body: requestBody,
        query: Object.fromEntries(url.searchParams),
      } as Record<string, unknown>,
      metadata: {
        requestId,
        environment: getCurrentEnvironment(),
        ...options.metadata,
      },
    };

    // Create trace
    let activeTrace: ActiveTrace | null = null;
    try {
      activeTrace = await client.createTrace(traceInput);
    } catch {
      // Graceful degradation - continue without tracing
    }

    // Set trace context for downstream calls
    if (activeTrace) {
      const traceContext: TraceContext = {
        traceId: activeTrace.id,
      };
      setTraceContext(requestId, traceContext);

      // Add trace context to request for handler access
      (request as TracedRequest).traceContext = traceContext;
    }

    // Execute the handler
    let response: Response;
    let error: ErrorDetails | undefined;
    let status: TraceStatus = "success";

    try {
      response = await handler(request as TracedRequest);
    } catch (err) {
      const durationMs = Date.now() - startTime;
      error = {
        code: "API_HANDLER_ERROR",
        message: err instanceof Error ? err.message : "Unknown error",
        stack: err instanceof Error ? err.stack : undefined,
      };
      status = "error";

      // End trace with error
      if (activeTrace) {
        try {
          const traceOutput: TraceOutput = {
            output: {
              status: 500,
              error: error.message,
            },
            status,
            error,
            latencyMs: durationMs,
          };
          await client.endTrace(activeTrace.id, traceOutput);
        } catch {
          // Ignore trace errors
        }
      }

      // Clear trace context
      clearTraceContext(requestId);

      // Re-throw the error
      throw err;
    }

    const durationMs = Date.now() - startTime;

    // Determine response body size
    let responseBodySize = 0;
    if (options.captureResponseBodySize !== false) {
      const contentLength = response.headers.get("content-length");
      if (contentLength) {
        responseBodySize = parseInt(contentLength, 10);
      }
    }

    // Check for error status codes
    if (response.status >= 400) {
      status = "error";
      error = {
        code: `HTTP_${response.status}`,
        message: `HTTP ${response.status} ${response.statusText}`,
      };
    }

    // End trace with response data
    if (activeTrace) {
      try {
        const traceOutput: TraceOutput = {
          output: {
            status: response.status,
            statusText: response.statusText,
            bodySize: responseBodySize,
            headers: Object.fromEntries(response.headers),
          },
          status,
          error,
          latencyMs: durationMs,
          metrics: {
            responseStatus: response.status,
            responseBodySize,
            durationMs,
          },
        };
        await client.endTrace(activeTrace.id, traceOutput);
      } catch {
        // Ignore trace errors
      }
    }

    // Clear trace context
    clearTraceContext(requestId);

    return response;
  };
}


/**
 * Links an API trace to a workflow execution trace
 *
 * Creates a correlation between the API request trace and the workflow
 * trace that was executed as part of handling the request.
 *
 * Requirements: 9.2
 *
 * @param apiTraceId - The API trace ID
 * @param workflowTraceId - The workflow trace ID to link
 */
export async function linkWorkflowTrace(
  apiTraceId: string,
  workflowTraceId: string
): Promise<void> {
  const client = getOpikClient();

  if (!client.isHealthy()) {
    return;
  }

  try {
    // Create a span in the API trace that references the workflow
    await client.createSpan(apiTraceId, {
      name: "workflow_execution",
      type: "workflow_step",
      input: {
        linkedWorkflowTraceId: workflowTraceId,
        linkType: "api_to_workflow",
      },
    });
  } catch {
    // Graceful degradation - ignore linking errors
  }
}

/**
 * Stored trace data for correlation queries
 */
export interface StoredTraceData {
  id: string;
  type: TraceType;
  name: string;
  linkedTraceIds: string[];
  spanIds: string[];
  metadata: Record<string, unknown>;
  startTime: Date;
  endTime?: Date;
  status: TraceStatus;
}

/**
 * In-memory trace correlation store
 * In production, this would be backed by a database
 */
const traceCorrelationStore = new Map<string, StoredTraceData>();

/**
 * Stores trace data for correlation queries
 */
export function storeTraceForCorrelation(traceData: StoredTraceData): void {
  traceCorrelationStore.set(traceData.id, traceData);
}

/**
 * Gets stored trace data by ID
 */
export function getStoredTrace(traceId: string): StoredTraceData | undefined {
  return traceCorrelationStore.get(traceId);
}

/**
 * Links two traces for correlation
 */
export function linkTraces(traceId1: string, traceId2: string): void {
  const trace1 = traceCorrelationStore.get(traceId1);
  const trace2 = traceCorrelationStore.get(traceId2);

  if (trace1 && !trace1.linkedTraceIds.includes(traceId2)) {
    trace1.linkedTraceIds.push(traceId2);
  }
  if (trace2 && !trace2.linkedTraceIds.includes(traceId1)) {
    trace2.linkedTraceIds.push(traceId1);
  }
}

/**
 * Correlated trace result with all related spans
 */
export interface CorrelatedTraceResult {
  apiTrace: StoredTraceData;
  agentTraces: StoredTraceData[];
  toolSpans: StoredTraceData[];
  workflowTraces: StoredTraceData[];
}

/**
 * Queries API traces with correlated agent, tool, and workflow spans
 *
 * Returns API traces with all correlated traces and spans in a structured format.
 *
 * Requirements: 9.5
 *
 * @param apiTraceId - The API trace ID to query
 * @returns Correlated trace result with all related traces
 */
export function queryCorrelatedTraces(apiTraceId: string): CorrelatedTraceResult | null {
  const apiTrace = traceCorrelationStore.get(apiTraceId);

  if (!apiTrace || apiTrace.type !== "api") {
    return null;
  }

  const agentTraces: StoredTraceData[] = [];
  const toolSpans: StoredTraceData[] = [];
  const workflowTraces: StoredTraceData[] = [];

  // Collect all linked traces
  const visited = new Set<string>();
  const toVisit = [...apiTrace.linkedTraceIds];

  while (toVisit.length > 0) {
    const traceId = toVisit.pop()!;
    if (visited.has(traceId)) continue;
    visited.add(traceId);

    const trace = traceCorrelationStore.get(traceId);
    if (!trace) continue;

    // Categorize by type
    switch (trace.type) {
      case "agent":
        agentTraces.push(trace);
        break;
      case "workflow":
        workflowTraces.push(trace);
        break;
      default:
        // Tool spans are stored as traces with specific naming
        if (trace.name.includes("tool") || trace.metadata.spanType === "tool") {
          toolSpans.push(trace);
        }
    }

    // Add linked traces to visit queue
    for (const linkedId of trace.linkedTraceIds) {
      if (!visited.has(linkedId)) {
        toVisit.push(linkedId);
      }
    }
  }

  return {
    apiTrace,
    agentTraces,
    toolSpans,
    workflowTraces,
  };
}

/**
 * Clears the trace correlation store (useful for testing)
 */
export function clearTraceCorrelationStore(): void {
  traceCorrelationStore.clear();
}

/**
 * Gets all stored traces (useful for testing)
 */
export function getAllStoredTraces(): StoredTraceData[] {
  return Array.from(traceCorrelationStore.values());
}

/**
 * Creates a middleware-compatible handler that links workflow traces
 *
 * This is a convenience wrapper for handlers that execute workflows
 * and need to link the workflow trace to the API trace.
 *
 * Requirements: 9.2
 *
 * @param handler - The handler that returns a workflow trace ID
 * @returns Wrapped handler that links traces
 */
export function withWorkflowLinking(
  handler: (request: TracedRequest) => Promise<{ response: Response; workflowTraceId?: string | null }>
): TracedApiHandler {
  return async (request: TracedRequest): Promise<Response> => {
    const result = await handler(request);

    // Link workflow trace if available
    if (request.traceContext?.traceId && result.workflowTraceId) {
      await linkWorkflowTrace(request.traceContext.traceId, result.workflowTraceId);
      linkTraces(request.traceContext.traceId, result.workflowTraceId);
    }

    return result.response;
  };
}
