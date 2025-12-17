/**
 * TraceWrapper Module
 *
 * Higher-order functions that wrap agent and workflow executions with tracing.
 * Captures input messages, output response, model name, token usage, latency,
 * and metadata (userId, sessionId, requestId, environment, timestamp).
 *
 * @module opik/traceWrapper
 */

import { getOpikClient, type TraceInput, type TraceOutput, type ActiveTrace, type SpanInput, type SpanOutput, type ActiveSpan } from "./client";
import type { TraceType, TraceStatus, TokenUsage, ErrorDetails, SpanType, SpanStatus } from "./schemas";

/**
 * Metadata for trace creation
 */
export interface TraceWrapperMetadata {
  userId?: string;
  sessionId?: string;
  requestId?: string;
  environment: "development" | "staging" | "production";
}

/**
 * Result from a traced execution
 */
export interface TracedResult<T> {
  result: T;
  traceId: string | null;
  latencyMs: number;
}

/**
 * Agent execution context with token usage
 */
export interface AgentExecutionResult {
  output: unknown;
  model?: string;
  tokens?: TokenUsage;
  error?: ErrorDetails;
}

/**
 * Workflow execution result
 */
export interface WorkflowExecutionResult {
  success: boolean;
  output?: unknown;
  error?: { code: string; message: string };
}

/**
 * Agent interface for wrapping
 */
export interface WrappableAgent {
  name: string;
  generate: (input: unknown) => Promise<AgentExecutionResult>;
}

/**
 * Workflow interface for wrapping
 */
export interface WrappableWorkflow {
  id: string;
  execute: (input: unknown) => Promise<WorkflowExecutionResult>;
}


/**
 * Get current environment from NODE_ENV or ENVIRONMENT
 */
function getCurrentEnvironment(): "development" | "staging" | "production" {
  const env = process.env.ENVIRONMENT || process.env.NODE_ENV;
  if (env === "production") return "production";
  if (env === "staging") return "staging";
  return "development";
}

/**
 * Wraps an agent execution with tracing
 *
 * Creates a trace around agent executions capturing:
 * - Input messages
 * - Output response
 * - Model name
 * - Token usage
 * - Latency
 * - Metadata (userId, sessionId, requestId, environment, timestamp)
 *
 * Requirements: 2.1, 2.2, 2.4
 *
 * @param agentName - Name of the agent being wrapped
 * @param metadata - Trace metadata (userId, sessionId, requestId, environment)
 * @returns A function that wraps agent execution with tracing
 */
export function wrapAgent<TInput, TOutput extends AgentExecutionResult>(
  agentName: string,
  metadata: TraceWrapperMetadata
): (execute: (input: TInput) => Promise<TOutput>) => (input: TInput) => Promise<TracedResult<TOutput>> {
  return (execute: (input: TInput) => Promise<TOutput>) => {
    return async (input: TInput): Promise<TracedResult<TOutput>> => {
      const client = getOpikClient();
      const startTime = Date.now();

      // Create trace input
      const traceInput: TraceInput = {
        name: agentName,
        type: "agent" as TraceType,
        input: input as Record<string, unknown>,
        metadata: {
          userId: metadata.userId,
          sessionId: metadata.sessionId,
          requestId: metadata.requestId,
          environment: metadata.environment || getCurrentEnvironment(),
        },
      };

      // Create trace
      let activeTrace: ActiveTrace | null = null;
      try {
        activeTrace = await client.createTrace(traceInput);
      } catch {
        // Graceful degradation - continue without tracing
      }

      // Execute the agent
      let result: TOutput;
      let error: ErrorDetails | undefined;
      let status: TraceStatus = "success";

      try {
        result = await execute(input);

        // Check if result contains an error
        if (result.error) {
          error = result.error;
          status = "error";
        }
      } catch (err) {
        const latencyMs = Date.now() - startTime;
        error = {
          code: "AGENT_EXECUTION_ERROR",
          message: err instanceof Error ? err.message : "Unknown error",
          stack: err instanceof Error ? err.stack : undefined,
        };
        status = "error";

        // End trace with error
        if (activeTrace) {
          try {
            const traceOutput: TraceOutput = {
              output: null,
              status,
              error,
              latencyMs,
            };
            await client.endTrace(activeTrace.id, traceOutput);
          } catch {
            // Ignore trace errors
          }
        }

        // Re-throw the error
        throw err;
      }

      const latencyMs = Date.now() - startTime;

      // End trace with success
      if (activeTrace) {
        try {
          const traceOutput: TraceOutput = {
            output: result.output,
            status,
            error,
            tokens: result.tokens,
            latencyMs,
            metrics: result.model ? { model: 1 } : undefined,
          };
          await client.endTrace(activeTrace.id, traceOutput);
        } catch {
          // Ignore trace errors
        }
      }

      return {
        result,
        traceId: activeTrace?.id ?? null,
        latencyMs,
      };
    };
  };
}


/**
 * Wraps a workflow execution with tracing
 *
 * Creates a parent trace with:
 * - Workflow name
 * - Input parameters
 * - Start timestamp
 * - Total duration on completion
 * - Final status
 * - Output
 *
 * Requirements: 4.1, 4.2, 4.3
 *
 * @param workflowId - ID/name of the workflow being wrapped
 * @param metadata - Trace metadata (userId, sessionId, requestId, environment)
 * @returns A function that wraps workflow execution with tracing
 */
export function wrapWorkflow<TInput, TOutput extends WorkflowExecutionResult>(
  workflowId: string,
  metadata: TraceWrapperMetadata
): (execute: (input: TInput) => Promise<TOutput>) => (input: TInput) => Promise<TracedResult<TOutput>> {
  return (execute: (input: TInput) => Promise<TOutput>) => {
    return async (input: TInput): Promise<TracedResult<TOutput>> => {
      const client = getOpikClient();
      const startTime = Date.now();

      // Create trace input for workflow
      const traceInput: TraceInput = {
        name: workflowId,
        type: "workflow" as TraceType,
        input: input as Record<string, unknown>,
        metadata: {
          userId: metadata.userId,
          sessionId: metadata.sessionId,
          requestId: metadata.requestId,
          environment: metadata.environment || getCurrentEnvironment(),
        },
      };

      // Create parent trace
      let activeTrace: ActiveTrace | null = null;
      try {
        activeTrace = await client.createTrace(traceInput);
      } catch {
        // Graceful degradation - continue without tracing
      }

      // Execute the workflow
      let result: TOutput;
      let error: ErrorDetails | undefined;
      let status: TraceStatus = "success";

      try {
        result = await execute(input);

        // Check workflow result for errors
        if (!result.success && result.error) {
          error = {
            code: result.error.code,
            message: result.error.message,
          };
          status = "error";
        }
      } catch (err) {
        const latencyMs = Date.now() - startTime;
        error = {
          code: "WORKFLOW_EXECUTION_ERROR",
          message: err instanceof Error ? err.message : "Unknown error",
          stack: err instanceof Error ? err.stack : undefined,
        };
        status = "error";

        // End trace with error
        if (activeTrace) {
          try {
            const traceOutput: TraceOutput = {
              output: null,
              status,
              error,
              latencyMs,
            };
            await client.endTrace(activeTrace.id, traceOutput);
          } catch {
            // Ignore trace errors
          }
        }

        // Re-throw the error
        throw err;
      }

      const latencyMs = Date.now() - startTime;

      // End trace with final status and output
      if (activeTrace) {
        try {
          const traceOutput: TraceOutput = {
            output: result.output ?? result,
            status,
            error,
            latencyMs,
          };
          await client.endTrace(activeTrace.id, traceOutput);
        } catch {
          // Ignore trace errors
        }
      }

      return {
        result,
        traceId: activeTrace?.id ?? null,
        latencyMs,
      };
    };
  };
}

/**
 * Creates a traced version of an agent
 *
 * Convenience function that wraps an agent object with tracing.
 *
 * @param agent - The agent to wrap
 * @param metadata - Trace metadata
 * @returns A wrapped agent with tracing enabled
 */
export function createTracedAgent<TInput, TOutput extends AgentExecutionResult>(
  agent: { name: string; execute: (input: TInput) => Promise<TOutput> },
  metadata: TraceWrapperMetadata
): { name: string; execute: (input: TInput) => Promise<TracedResult<TOutput>> } {
  const wrapper = wrapAgent<TInput, TOutput>(agent.name, metadata);
  return {
    name: agent.name,
    execute: wrapper(agent.execute.bind(agent)),
  };
}

/**
 * Creates a traced version of a workflow
 *
 * Convenience function that wraps a workflow object with tracing.
 *
 * @param workflow - The workflow to wrap
 * @param metadata - Trace metadata
 * @returns A wrapped workflow with tracing enabled
 */
export function createTracedWorkflow<TInput, TOutput extends WorkflowExecutionResult>(
  workflow: { id: string; execute: (input: TInput) => Promise<TOutput> },
  metadata: TraceWrapperMetadata
): { id: string; execute: (input: TInput) => Promise<TracedResult<TOutput>> } {
  const wrapper = wrapWorkflow<TInput, TOutput>(workflow.id, metadata);
  return {
    id: workflow.id,
    execute: wrapper(workflow.execute.bind(workflow)),
  };
}

/**
 * Gets the current trace ID from context (if available)
 * This can be used to link child spans to parent traces
 */
let _currentTraceId: string | null = null;

export function setCurrentTraceId(traceId: string | null): void {
  _currentTraceId = traceId;
}

export function getCurrentTraceId(): string | null {
  return _currentTraceId;
}

/**
 * Workflow step result interface
 */
export interface WorkflowStepResult {
  success: boolean;
  output?: unknown;
  error?: { code: string; message: string; stack?: string };
}

/**
 * Workflow step span data
 */
export interface WorkflowStepSpan {
  spanId: string | null;
  stepName: string;
  status: "success" | "error";
  durationMs: number;
}

/**
 * Active workflow context for managing step spans
 */
export interface WorkflowContext {
  traceId: string;
  workflowId: string;
  spans: WorkflowStepSpan[];
}

/**
 * Creates a workflow step span within a parent workflow trace
 *
 * Creates child spans for each workflow step (categorize, search, dispatch)
 * with step name, input, output, status, and duration.
 *
 * Requirements: 4.2
 *
 * @param traceId - Parent trace ID to link the span to
 * @param stepName - Name of the workflow step (e.g., "categorize", "search", "dispatch")
 * @returns A function that wraps step execution with span tracing
 */
export function createWorkflowStepSpan<TInput, TOutput extends WorkflowStepResult>(
  traceId: string,
  stepName: string
): (execute: (input: TInput) => Promise<TOutput>) => (input: TInput) => Promise<{ result: TOutput; spanId: string | null; durationMs: number }> {
  return (execute: (input: TInput) => Promise<TOutput>) => {
    return async (input: TInput): Promise<{ result: TOutput; spanId: string | null; durationMs: number }> => {
      const client = getOpikClient();
      const startTime = Date.now();

      // Create span input for workflow step
      const spanInput: SpanInput = {
        name: stepName,
        type: "workflow_step" as SpanType,
        input: input as unknown,
      };

      // Create child span linked to parent trace
      let activeSpan: ActiveSpan | null = null;
      try {
        activeSpan = await client.createSpan(traceId, spanInput);
      } catch {
        // Graceful degradation - continue without span tracing
      }

      // Execute the workflow step
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
            stack: result.error.stack,
          };
          status = "error";
        }
      } catch (err) {
        const durationMs = Date.now() - startTime;
        error = {
          code: "WORKFLOW_STEP_ERROR",
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

      // End span with success or error status
      if (activeSpan) {
        try {
          const spanOutput: SpanOutput = {
            output: result.output ?? result,
            status,
            error,
            durationMs,
            metrics: {
              durationMs,
            },
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
 * Creates a workflow context for managing multiple step spans
 *
 * @param traceId - Parent trace ID
 * @param workflowId - Workflow identifier
 * @returns WorkflowContext for tracking spans
 */
export function createWorkflowContext(traceId: string, workflowId: string): WorkflowContext {
  return {
    traceId,
    workflowId,
    spans: [],
  };
}

/**
 * Adds a completed step span to the workflow context
 *
 * @param context - Workflow context
 * @param span - Completed step span data
 */
export function addStepSpanToContext(context: WorkflowContext, span: WorkflowStepSpan): void {
  context.spans.push(span);
}

/**
 * Records an error for a workflow step
 *
 * Records error details when a workflow step fails and updates the context.
 * This function should be called when a step encounters an error.
 *
 * Requirements: 4.4
 *
 * @param context - Workflow context
 * @param stepName - Name of the failed step
 * @param error - Error details
 * @param durationMs - Duration of the step before failure
 */
export function recordWorkflowStepError(
  context: WorkflowContext,
  stepName: string,
  error: { code: string; message: string; stack?: string },
  durationMs: number
): void {
  const stepSpan: WorkflowStepSpan = {
    spanId: null,
    stepName,
    status: "error",
    durationMs,
  };
  context.spans.push(stepSpan);
}

/**
 * Workflow error details for trace recording
 */
export interface WorkflowErrorDetails {
  stepName: string;
  error: ErrorDetails;
  durationMs: number;
  context: WorkflowContext;
}

/**
 * Records a workflow-level error to the trace
 *
 * Marks the trace with failure status and records comprehensive error details
 * including which step failed and the error information.
 *
 * Requirements: 4.4
 *
 * @param traceId - Trace ID to record error for
 * @param errorDetails - Error details including step name and error info
 */
export async function recordWorkflowError(
  traceId: string,
  errorDetails: WorkflowErrorDetails
): Promise<void> {
  const client = getOpikClient();

  const traceOutput: TraceOutput = {
    output: null,
    status: "error",
    error: {
      code: errorDetails.error.code,
      message: `Step '${errorDetails.stepName}' failed: ${errorDetails.error.message}`,
      stack: errorDetails.error.stack,
    },
    latencyMs: errorDetails.durationMs,
    metrics: {
      stepCount: errorDetails.context.spans.length,
      successfulSteps: errorDetails.context.spans.filter(s => s.status === "success").length,
      failedSteps: errorDetails.context.spans.filter(s => s.status === "error").length,
      failedAtStep: errorDetails.context.spans.length,
    },
  };

  try {
    await client.endTrace(traceId, traceOutput);
  } catch {
    // Graceful degradation - ignore trace errors
  }
}

/**
 * Wraps a workflow with step-level tracing
 *
 * Creates a parent trace and provides a context for creating child spans
 * for each workflow step. Records error details when steps fail and marks
 * the trace with failure status.
 *
 * Requirements: 4.1, 4.2, 4.3, 4.4
 *
 * @param workflowId - ID/name of the workflow being wrapped
 * @param metadata - Trace metadata (userId, sessionId, requestId, environment)
 * @returns A function that wraps workflow execution with step-level tracing
 */
export function wrapWorkflowWithSteps<TInput, TOutput extends WorkflowExecutionResult>(
  workflowId: string,
  metadata: TraceWrapperMetadata
): (
  execute: (input: TInput, context: WorkflowContext) => Promise<TOutput>
) => (input: TInput) => Promise<TracedResult<TOutput> & { context: WorkflowContext }> {
  return (execute: (input: TInput, context: WorkflowContext) => Promise<TOutput>) => {
    return async (input: TInput): Promise<TracedResult<TOutput> & { context: WorkflowContext }> => {
      const client = getOpikClient();
      const startTime = Date.now();

      // Create trace input for workflow
      const traceInput: TraceInput = {
        name: workflowId,
        type: "workflow" as TraceType,
        input: input as Record<string, unknown>,
        metadata: {
          userId: metadata.userId,
          sessionId: metadata.sessionId,
          requestId: metadata.requestId,
          environment: metadata.environment || getCurrentEnvironment(),
        },
      };

      // Create parent trace
      let activeTrace: ActiveTrace | null = null;
      try {
        activeTrace = await client.createTrace(traceInput);
      } catch {
        // Graceful degradation - continue without tracing
      }

      // Create workflow context for step spans
      const context = createWorkflowContext(
        activeTrace?.id ?? crypto.randomUUID(),
        workflowId
      );

      // Execute the workflow with context
      let result: TOutput;
      let error: ErrorDetails | undefined;
      let status: TraceStatus = "success";

      try {
        result = await execute(input, context);

        // Check workflow result for errors
        if (!result.success && result.error) {
          error = {
            code: result.error.code,
            message: result.error.message,
          };
          status = "error";
        }
      } catch (err) {
        const latencyMs = Date.now() - startTime;
        error = {
          code: "WORKFLOW_EXECUTION_ERROR",
          message: err instanceof Error ? err.message : "Unknown error",
          stack: err instanceof Error ? err.stack : undefined,
        };
        status = "error";

        // End trace with error
        if (activeTrace) {
          try {
            const traceOutput: TraceOutput = {
              output: null,
              status,
              error,
              latencyMs,
            };
            await client.endTrace(activeTrace.id, traceOutput);
          } catch {
            // Ignore trace errors
          }
        }

        // Re-throw the error
        throw err;
      }

      const latencyMs = Date.now() - startTime;

      // End trace with final status and output
      if (activeTrace) {
        try {
          const traceOutput: TraceOutput = {
            output: result.output ?? result,
            status,
            error,
            latencyMs,
            metrics: {
              stepCount: context.spans.length,
              successfulSteps: context.spans.filter(s => s.status === "success").length,
              failedSteps: context.spans.filter(s => s.status === "error").length,
            },
          };
          await client.endTrace(activeTrace.id, traceOutput);
        } catch {
          // Ignore trace errors
        }
      }

      return {
        result,
        traceId: activeTrace?.id ?? null,
        latencyMs,
        context,
      };
    };
  };
}
