// file: server/_core/opik/client.ts
// description: Opik client wrapper providing tracing APIs with retries and graceful degradation
// reference: server/_core/opik/config.ts, server/_core/opik/schemas.ts

/**
 * Opik Client Module
 *
 * Central client for communicating with the self-hosted Opik server.
 * Implements graceful degradation, retry with exponential backoff,
 * feature flags, and sampling.
 *
 * @module opik/client
 */

import { Opik } from "opik";
import {
  type OpikClientConfig,
  readOpikConfig,
  isTracingEnabled,
} from "./config";
import type {
  TraceType,
  TraceStatus,
  SpanType,
  SpanStatus,
  ErrorDetails,
  TokenUsage,
  TraceMetadata,
} from "./schemas";

/**
 * JSON-compatible type for Opik SDK
 */
export type JsonValue = Record<string, unknown> | Record<string, unknown>[] | string;

/**
 * Input for creating a new trace
 * Aligned with TraceSchema from schemas.ts
 */
export interface TraceInput {
  name: string;
  type?: TraceType;
  input?: JsonValue;
  metadata?: Partial<TraceMetadata>;
}

/**
 * Output for completing a trace
 * Aligned with TraceSchema from schemas.ts
 */
export interface TraceOutput {
  output: unknown;
  status: TraceStatus;
  error?: ErrorDetails;
  tokens?: TokenUsage;
  cost?: number;
  latencyMs?: number;
  metrics?: Record<string, number>;
}

/**
 * Input for creating a new span
 * Aligned with SpanSchema from schemas.ts
 */
export interface SpanInput {
  name: string;
  type: SpanType;
  input: unknown;
  parentSpanId?: string;
}

/**
 * Output for completing a span
 * Aligned with SpanSchema from schemas.ts
 */
export interface SpanOutput {
  output: unknown;
  status: SpanStatus;
  error?: ErrorDetails;
  metrics?: Record<string, number>;
  durationMs?: number;
}

/**
 * Input for adding feedback to a trace
 */
export interface FeedbackInput {
  type: "thumbs_up" | "thumbs_down";
  comment?: string;
  userId?: string;
}

/**
 * Input for logging a metric
 */
export interface MetricInput {
  name: string;
  value: number;
  category: "quality" | "performance" | "cost";
}

/**
 * Trace object returned by createTrace
 * Represents an active trace that can be ended
 */
export interface ActiveTrace {
  id: string;
  name: string;
  type: TraceType;
  startTime: Date;
  projectName: string;
}

/**
 * Span object returned by createSpan
 * Represents an active span that can be ended
 */
export interface ActiveSpan {
  id: string;
  traceId: string;
  name: string;
  type: SpanType;
  startTime: Date;
}

/**
 * OpikClient - Central client for Opik observability
 *
 * Handles all communication with the self-hosted Opik server,
 * implementing graceful degradation and retry logic.
 */
export class OpikClient {
  private config: OpikClientConfig;
  private opikInstance: Opik | null = null;
  private isInitialized = false;
  private isHealthyFlag = false;
  private activeTraces: Map<string, { trace: unknown; startTime: Date }> = new Map();
  private activeSpans: Map<string, { span: unknown; traceId: string; startTime: Date }> = new Map();

  constructor(config?: OpikClientConfig) {
    this.config = config ?? readOpikConfig();
  }

  /**
   * Initialize the Opik client with connection validation
   * Implements graceful degradation - never throws on failure
   */
  async initialize(): Promise<void> {
    // Check if tracing is enabled
    if (!isTracingEnabled(this.config)) {
      console.warn(
        "[OpikClient] Tracing disabled - OPIK_URL not configured or OPIK_ENABLED is false"
      );
      this.isInitialized = true;
      this.isHealthyFlag = false;
      return;
    }

    try {
      // Create Opik instance
      this.opikInstance = new Opik({
        apiKey: "local", // Self-hosted doesn't require real API key
        apiUrl: this.config.url,
        projectName: this.config.projectName,
        workspaceName: this.config.workspace ?? "",
      });

      // Validate connection with retry
      const connected = await this.validateConnectionWithRetry();

      if (connected) {
        this.isHealthyFlag = true;
        console.info(
          `[OpikClient] Successfully connected to Opik server at ${this.config.url}`
        );
      } else {
        console.warn(
          `[OpikClient] Failed to connect to Opik server at ${this.config.url} after ${this.config.retryAttempts} attempts. Tracing disabled.`
        );
        this.isHealthyFlag = false;
        this.opikInstance = null;
      }
    } catch (error) {
      // Graceful degradation - log and continue without tracing
      console.warn(
        `[OpikClient] Initialization failed: ${error instanceof Error ? error.message : "Unknown error"}. Tracing disabled.`
      );
      this.isHealthyFlag = false;
      this.opikInstance = null;
    }

    this.isInitialized = true;
  }

  /**
   * Validate connection with exponential backoff retry
   */
  private async validateConnectionWithRetry(): Promise<boolean> {
    for (let attempt = 0; attempt < this.config.retryAttempts; attempt++) {
      try {
        // Simple health check - try to access the server
        const response = await fetch(`${this.config.url}/api/v1/private/health`, {
          method: "GET",
          signal: AbortSignal.timeout(5000),
        });

        if (response.ok) {
          return true;
        }
      } catch (error) {
        const delay = this.config.retryDelayMs * Math.pow(2, attempt);
        console.warn(
          `[OpikClient] Connection attempt ${attempt + 1}/${this.config.retryAttempts} failed. Retrying in ${delay}ms...`
        );

        if (attempt < this.config.retryAttempts - 1) {
          await this.sleep(delay);
        }
      }
    }

    return false;
  }

  /**
   * Execute an operation with retry logic
   */
  async executeWithRetry<T>(
    operation: () => Promise<T>,
    operationName: string
  ): Promise<T | null> {
    if (!this.isHealthyFlag || !this.opikInstance) {
      return null;
    }

    for (let attempt = 0; attempt < this.config.retryAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        const delay = this.config.retryDelayMs * Math.pow(2, attempt);
        console.warn(
          `[OpikClient] ${operationName} attempt ${attempt + 1}/${this.config.retryAttempts} failed: ${error instanceof Error ? error.message : "Unknown error"}`
        );

        if (attempt < this.config.retryAttempts - 1) {
          await this.sleep(delay);
        }
      }
    }

    console.warn(
      `[OpikClient] ${operationName} failed after ${this.config.retryAttempts} attempts. Failing silently.`
    );
    return null;
  }

  /**
   * Sleep for specified milliseconds
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Shutdown the client gracefully
   */
  async shutdown(): Promise<void> {
    if (this.opikInstance) {
      try {
        await this.opikInstance.flush();
      } catch (error) {
        console.warn(
          `[OpikClient] Error during shutdown: ${error instanceof Error ? error.message : "Unknown error"}`
        );
      }
    }

    this.activeTraces.clear();
    this.activeSpans.clear();
    this.opikInstance = null;
    this.isHealthyFlag = false;
    this.isInitialized = false;
  }

  /**
   * Check if the client is healthy and connected
   */
  isHealthy(): boolean {
    return this.isHealthyFlag && this.opikInstance !== null;
  }

  /**
   * Check if the client has been initialized
   */
  isReady(): boolean {
    return this.isInitialized;
  }

  /**
   * Check if tracing should occur based on feature flag and sampling
   */
  shouldTrace(): boolean {
    // Check feature flag
    if (!this.config.enabled) {
      return false;
    }

    // Check if healthy
    if (!this.isHealthyFlag) {
      return false;
    }

    // Apply sampling
    return Math.random() < this.config.sampleRate;
  }

  /**
   * Create a new trace
   * Sends trace data to the self-hosted Opik server
   * Requirements: 1.5, 2.1
   */
  async createTrace(input: TraceInput): Promise<ActiveTrace | null> {
    if (!this.shouldTrace()) {
      return null;
    }

    return this.executeWithRetry(async () => {
      const traceId = crypto.randomUUID();
      const startTime = new Date();
      const traceType = input.type ?? "agent";

      // Create trace on the Opik server.
      // The Opik SDK's trace input typing is narrower than our internal JsonValue,
      // so we pass the payload as `unknown` and avoid explicitly passing `undefined`.
      const tracePayload = {
        name: input.name,
        ...(input.input === undefined ? {} : { input: input.input }),
        metadata: {
          ...input.metadata,
          type: traceType,
        },
        projectName: this.config.projectName,
      };

      const trace = (this.opikInstance as unknown as { trace: (opts: unknown) => unknown }).trace(tracePayload);

      this.activeTraces.set(traceId, { trace, startTime });

      return {
        id: traceId,
        name: input.name,
        type: traceType,
        startTime,
        projectName: this.config.projectName,
      };
    }, "createTrace");
  }

  /**
   * Create a child span within a trace
   * Links the span to its parent trace for hierarchical tracing
   * Requirements: 2.3
   */
  async createSpan(traceId: string, input: SpanInput): Promise<ActiveSpan | null> {
    if (!this.shouldTrace()) {
      return null;
    }

    const traceData = this.activeTraces.get(traceId);
    if (!traceData) {
      console.warn(`[OpikClient] Cannot create span - trace ${traceId} not found`);
      return null;
    }

    return this.executeWithRetry(async () => {
      const spanId = crypto.randomUUID();
      const startTime = new Date();

      // Create span using the trace's span method - sends to Opik server
      const span = (traceData.trace as { span: (opts: unknown) => unknown }).span({
        name: input.name,
        type: input.type,
        input: input.input,
        parentSpanId: input.parentSpanId,
      });

      this.activeSpans.set(spanId, { span, traceId, startTime });

      return {
        id: spanId,
        traceId,
        name: input.name,
        type: input.type,
        startTime,
      };
    }, "createSpan");
  }

  /**
   * End a trace with output
   * Completes the trace and sends final data to Opik server
   * Requirements: 1.5
   */
  async endTrace(traceId: string, output: TraceOutput): Promise<void> {
    const traceData = this.activeTraces.get(traceId);
    if (!traceData) {
      return;
    }

    await this.executeWithRetry(async () => {
      const trace = traceData.trace as {
        end: (opts: unknown) => void;
      };

      const endTime = new Date();
      const latencyMs = output.latencyMs ?? (endTime.getTime() - traceData.startTime.getTime());

      // End trace and send to Opik server
      trace.end({
        output: output.output,
        metadata: {
          status: output.status,
          error: output.error,
          tokens: output.tokens,
          cost: output.cost,
          latencyMs,
          metrics: output.metrics,
          endTime: endTime.toISOString(),
        },
      });

      this.activeTraces.delete(traceId);
    }, "endTrace");
  }

  /**
   * End a span with output
   * Completes the span and sends final data to Opik server
   */
  async endSpan(spanId: string, output: SpanOutput): Promise<void> {
    const spanData = this.activeSpans.get(spanId);
    if (!spanData) {
      return;
    }

    await this.executeWithRetry(async () => {
      const span = spanData.span as {
        end: (opts: unknown) => void;
      };

      const endTime = new Date();
      const durationMs = output.durationMs ?? (endTime.getTime() - spanData.startTime.getTime());

      // End span and send to Opik server
      span.end({
        output: output.output,
        metadata: {
          status: output.status,
          error: output.error,
          metrics: output.metrics,
          durationMs,
          endTime: endTime.toISOString(),
        },
      });

      this.activeSpans.delete(spanId);
    }, "endSpan");
  }

  /**
   * Add feedback to a trace
   */
  async addFeedback(traceId: string, feedback: FeedbackInput): Promise<void> {
    if (!this.isHealthyFlag || !this.opikInstance) {
      return;
    }

    await this.executeWithRetry(async () => {
      // Feedback is typically added via the Opik API
      // This is a placeholder for the actual implementation
      console.info(
        `[OpikClient] Feedback recorded for trace ${traceId}: ${feedback.type}`
      );
    }, "addFeedback");
  }

  /**
   * Log a metric for a trace
   */
  async logMetric(traceId: string, metric: MetricInput): Promise<void> {
    if (!this.isHealthyFlag || !this.opikInstance) {
      return;
    }

    await this.executeWithRetry(async () => {
      console.info(
        `[OpikClient] Metric logged for trace ${traceId}: ${metric.name}=${metric.value}`
      );
    }, "logMetric");
  }

  /**
   * Get the current configuration
   */
  getConfig(): OpikClientConfig {
    return { ...this.config };
  }

  /**
   * Get the underlying Opik instance (for advanced usage)
   */
  getOpikInstance(): Opik | null {
    return this.opikInstance;
  }

  /**
   * Get all active spans for a trace
   * Returns spans in the order they were created
   */
  getActiveSpansForTrace(traceId: string): ActiveSpan[] {
    const spans: ActiveSpan[] = [];
    for (const [spanId, spanData] of this.activeSpans.entries()) {
      if (spanData.traceId === traceId) {
        spans.push({
          id: spanId,
          traceId: spanData.traceId,
          name: "", // Name not stored in activeSpans
          type: "tool", // Type not stored in activeSpans
          startTime: spanData.startTime,
        });
      }
    }
    return spans.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
  }

  /**
   * Get an active trace by ID
   */
  getActiveTrace(traceId: string): ActiveTrace | null {
    const traceData = this.activeTraces.get(traceId);
    if (!traceData) {
      return null;
    }
    return {
      id: traceId,
      name: "", // Name not stored
      type: "agent", // Type not stored
      startTime: traceData.startTime,
      projectName: this.config.projectName,
    };
  }
}

/**
 * Hierarchical span node for trace queries
 */
export interface HierarchicalSpan {
  id: string;
  traceId: string;
  parentSpanId?: string | undefined;
  name: string;
  type: SpanType;
  input: unknown;
  output?: unknown | undefined;
  startTime: Date;
  endTime?: Date | undefined;
  durationMs?: number | undefined;
  status: SpanStatus;
  error?: ErrorDetails | undefined;
  metrics?: Record<string, number> | undefined;
  children: HierarchicalSpan[];
}

/**
 * Hierarchical trace with nested spans
 */
export interface HierarchicalTrace {
  id: string;
  projectName: string;
  name: string;
  type: TraceType;
  input: unknown;
  output?: unknown | undefined;
  metadata: Partial<TraceMetadata>;
  startTime: Date;
  endTime?: Date | undefined;
  latencyMs?: number | undefined;
  status: TraceStatus;
  error?: ErrorDetails | undefined;
  tokens?: TokenUsage | undefined;
  cost?: number | undefined;
  metrics?: Record<string, number> | undefined;
  spans: HierarchicalSpan[];
}

/**
 * Flat span data for building hierarchy
 */
export interface FlatSpan {
  id: string;
  traceId: string;
  parentSpanId?: string | undefined;
  name: string;
  type: SpanType;
  input: unknown;
  output?: unknown | undefined;
  startTime: Date;
  endTime?: Date | undefined;
  durationMs?: number | undefined;
  status: SpanStatus;
  error?: ErrorDetails | undefined;
  metrics?: Record<string, number> | undefined;
}

/**
 * Builds a hierarchical span tree from flat spans
 * Returns spans in parent-before-children order
 *
 * Requirements: 4.5
 *
 * @param spans - Flat array of spans
 * @returns Array of root spans with nested children
 */
export function buildSpanHierarchy(spans: FlatSpan[]): HierarchicalSpan[] {
  // Create a map for quick lookup
  const spanMap = new Map<string, HierarchicalSpan>();

  // Initialize all spans with empty children arrays
  for (const span of spans) {
    spanMap.set(span.id, {
      ...span,
      children: [],
    });
  }

  // Build the hierarchy
  const rootSpans: HierarchicalSpan[] = [];

  for (const span of spans) {
    const hierarchicalSpan = spanMap.get(span.id)!;

    if (span.parentSpanId && spanMap.has(span.parentSpanId)) {
      // Add as child to parent
      const parent = spanMap.get(span.parentSpanId)!;
      parent.children.push(hierarchicalSpan);
    } else {
      // No parent or parent not found - this is a root span
      rootSpans.push(hierarchicalSpan);
    }
  }

  // Sort children by start time at each level
  const sortChildren = (span: HierarchicalSpan): void => {
    span.children.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
    for (const child of span.children) {
      sortChildren(child);
    }
  };

  // Sort root spans and their children
  rootSpans.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
  for (const root of rootSpans) {
    sortChildren(root);
  }

  return rootSpans;
}

/**
 * Flattens a hierarchical span tree to parent-before-children order
 *
 * Requirements: 4.5
 *
 * @param spans - Hierarchical spans
 * @returns Flat array in parent-before-children order
 */
export function flattenSpanHierarchy(spans: HierarchicalSpan[]): FlatSpan[] {
  const result: FlatSpan[] = [];

  const traverse = (span: HierarchicalSpan): void => {
    // Add parent first
    result.push({
      id: span.id,
      traceId: span.traceId,
      parentSpanId: span.parentSpanId,
      name: span.name,
      type: span.type,
      input: span.input,
      output: span.output,
      startTime: span.startTime,
      endTime: span.endTime,
      durationMs: span.durationMs,
      status: span.status,
      error: span.error,
      metrics: span.metrics,
    });

    // Then add children
    for (const child of span.children) {
      traverse(child);
    }
  };

  for (const span of spans) {
    traverse(span);
  }

  return result;
}

/**
 * Creates a hierarchical trace from a trace and its spans
 *
 * Requirements: 4.5
 *
 * @param trace - Base trace data
 * @param spans - Flat array of spans belonging to the trace
 * @returns Hierarchical trace with nested spans
 */
export function createHierarchicalTrace(
  trace: {
    id: string;
    projectName: string;
    name: string;
    type: TraceType;
    input: unknown;
    output?: unknown;
    metadata: Partial<TraceMetadata>;
    startTime: Date;
    endTime?: Date;
    latencyMs?: number;
    status: TraceStatus;
    error?: ErrorDetails;
    tokens?: TokenUsage;
    cost?: number;
    metrics?: Record<string, number>;
  },
  spans: FlatSpan[]
): HierarchicalTrace {
  return {
    ...trace,
    spans: buildSpanHierarchy(spans),
  };
}

/**
 * Validates that spans are in parent-before-children order
 *
 * Requirements: 4.5
 *
 * @param spans - Array of spans to validate
 * @returns true if spans are in valid hierarchical order
 */
export function isValidHierarchicalOrder(spans: FlatSpan[]): boolean {
  const seenIds = new Set<string>();

  for (const span of spans) {
    // If span has a parent, the parent must have been seen already
    if (span.parentSpanId && !seenIds.has(span.parentSpanId)) {
      return false;
    }
    seenIds.add(span.id);
  }

  return true;
}

/**
 * Singleton instance of OpikClient
 */
let _clientInstance: OpikClient | null = null;

/**
 * Get the singleton OpikClient instance
 */
export function getOpikClient(): OpikClient {
  if (!_clientInstance) {
    _clientInstance = new OpikClient();
  }
  return _clientInstance;
}

/**
 * Reset the singleton instance (useful for testing)
 */
export function resetOpikClient(): void {
  if (_clientInstance) {
    _clientInstance.shutdown();
  }
  _clientInstance = null;
}
