// file: server/_core/opik/costLatencyTracker.ts
// description: Utilities for estimating token cost and tracking latencies for traces/spans
// reference: server/_core/opik/schemas.ts, server/_core/opik/client.ts

/**
 * Cost and Latency Tracker Module
 *
 * Tracks token usage, estimated costs, and latencies for LLM calls and external APIs.
 * Records prompt tokens, completion tokens, total tokens, estimated cost based on
 * model pricing, end-to-end latency, and external API latencies.
 *
 * @module opik/costLatencyTracker
 */

import type { TokenUsage } from "./schemas";

/**
 * Model pricing configuration (per 1K tokens in USD)
 * Pricing as of late 2024
 */
export const MODEL_PRICING: Record<string, { prompt: number; completion: number }> = {
  "gpt-4o": { prompt: 0.005, completion: 0.015 },
  "gpt-4o-mini": { prompt: 0.00015, completion: 0.0006 },
  "gpt-4-turbo": { prompt: 0.01, completion: 0.03 },
  "gpt-4": { prompt: 0.03, completion: 0.06 },
  "gpt-3.5-turbo": { prompt: 0.0005, completion: 0.0015 },
  "claude-3-opus": { prompt: 0.015, completion: 0.075 },
  "claude-3-sonnet": { prompt: 0.003, completion: 0.015 },
  "claude-3-haiku": { prompt: 0.00025, completion: 0.00125 },
};

/**
 * Default model for cost estimation when model is unknown
 */
export const DEFAULT_MODEL = "gpt-4o";

/**
 * Cost tracking data for a trace or span
 */
export interface CostData {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  estimatedCost: number;
  model: string;
}

/**
 * Latency tracking data for a trace or span
 */
export interface LatencyData {
  startTime: number;
  endTime: number;
  durationMs: number;
}

/**
 * External API latency data
 */
export interface ExternalApiLatency {
  apiName: string;
  latencyMs: number;
  timestamp: Date;
  success: boolean;
}

/**
 * Complete cost and latency tracking data for a trace
 */
export interface TraceCostLatencyData {
  traceId: string;
  cost: CostData;
  latency: LatencyData;
  externalApiLatencies: ExternalApiLatency[];
}

/**
 * Computes estimated cost based on model pricing and token usage
 *
 * Requirements: 6.2
 *
 * @param model - The model name (e.g., "gpt-4o", "gpt-3.5-turbo")
 * @param promptTokens - Number of prompt tokens
 * @param completionTokens - Number of completion tokens
 * @returns Estimated cost in USD
 */
export function computeEstimatedCost(
  model: string,
  promptTokens: number,
  completionTokens: number
): number {
  if (promptTokens < 0 || completionTokens < 0) {
    return 0;
  }

  const modelLower = model.toLowerCase();
  const defaultPricing = MODEL_PRICING[DEFAULT_MODEL] ?? { prompt: 0, completion: 0 };
  const pricing = MODEL_PRICING[modelLower] ?? defaultPricing;

  const promptCost = (promptTokens / 1000) * pricing.prompt;
  const completionCost = (completionTokens / 1000) * pricing.completion;

  return promptCost + completionCost;
}


/**
 * Creates cost data from token usage
 *
 * Requirements: 6.1, 6.2
 *
 * @param model - The model name
 * @param promptTokens - Number of prompt tokens
 * @param completionTokens - Number of completion tokens
 * @returns CostData object with all token counts and estimated cost
 */
export function createCostData(
  model: string,
  promptTokens: number,
  completionTokens: number
): CostData {
  const safePromptTokens = Math.max(0, Math.floor(promptTokens));
  const safeCompletionTokens = Math.max(0, Math.floor(completionTokens));
  const totalTokens = safePromptTokens + safeCompletionTokens;
  const estimatedCost = computeEstimatedCost(model, safePromptTokens, safeCompletionTokens);

  return {
    promptTokens: safePromptTokens,
    completionTokens: safeCompletionTokens,
    totalTokens,
    estimatedCost,
    model: model || DEFAULT_MODEL,
  };
}

/**
 * Creates latency data from start and end times
 *
 * Requirements: 6.3
 *
 * @param startTime - Start timestamp in milliseconds
 * @param endTime - End timestamp in milliseconds (optional, defaults to now)
 * @returns LatencyData object with timing information
 */
export function createLatencyData(
  startTime: number,
  endTime?: number
): LatencyData {
  const end = endTime ?? Date.now();
  const durationMs = Math.max(0, end - startTime);

  return {
    startTime,
    endTime: end,
    durationMs,
  };
}

/**
 * Creates external API latency record
 *
 * Requirements: 6.4
 *
 * @param apiName - Name of the external API (e.g., "yelp", "stripe")
 * @param latencyMs - Latency in milliseconds
 * @param success - Whether the API call was successful
 * @returns ExternalApiLatency record
 */
export function createExternalApiLatency(
  apiName: string,
  latencyMs: number,
  success: boolean
): ExternalApiLatency {
  return {
    apiName,
    latencyMs: Math.max(0, latencyMs),
    timestamp: new Date(),
    success,
  };
}

/**
 * Converts TokenUsage to CostData
 *
 * @param tokens - TokenUsage object from trace
 * @param model - Model name for cost calculation
 * @returns CostData object
 */
export function tokenUsageToCostData(tokens: TokenUsage, model: string): CostData {
  return createCostData(model, tokens.prompt, tokens.completion);
}

/**
 * CostLatencyTracker class for tracking costs and latencies across traces
 */
export class CostLatencyTracker {
  private traceData: Map<string, TraceCostLatencyData> = new Map();

  /**
   * Starts tracking for a new trace
   *
   * @param traceId - Unique trace identifier
   * @param model - Model name for cost calculation
   * @returns Start timestamp
   */
  startTrace(traceId: string, model: string = DEFAULT_MODEL): number {
    const startTime = Date.now();

    this.traceData.set(traceId, {
      traceId,
      cost: {
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0,
        estimatedCost: 0,
        model,
      },
      latency: {
        startTime,
        endTime: 0,
        durationMs: 0,
      },
      externalApiLatencies: [],
    });

    return startTime;
  }

  /**
   * Records token usage for a trace
   *
   * Requirements: 6.1
   *
   * @param traceId - Trace identifier
   * @param promptTokens - Number of prompt tokens
   * @param completionTokens - Number of completion tokens
   */
  recordTokenUsage(
    traceId: string,
    promptTokens: number,
    completionTokens: number
  ): void {
    const data = this.traceData.get(traceId);
    if (!data) return;

    data.cost = createCostData(data.cost.model, promptTokens, completionTokens);
  }

  /**
   * Records end-to-end latency for a trace
   *
   * Requirements: 6.3
   *
   * @param traceId - Trace identifier
   * @param endTime - End timestamp (optional, defaults to now)
   */
  recordLatency(traceId: string, endTime?: number): void {
    const data = this.traceData.get(traceId);
    if (!data) return;

    data.latency = createLatencyData(data.latency.startTime, endTime);
  }

  /**
   * Records external API latency
   *
   * Requirements: 6.4
   *
   * @param traceId - Trace identifier
   * @param apiName - Name of the external API
   * @param latencyMs - Latency in milliseconds
   * @param success - Whether the API call was successful
   */
  recordExternalApiLatency(
    traceId: string,
    apiName: string,
    latencyMs: number,
    success: boolean
  ): void {
    const data = this.traceData.get(traceId);
    if (!data) return;

    data.externalApiLatencies.push(
      createExternalApiLatency(apiName, latencyMs, success)
    );
  }

  /**
   * Gets the complete cost and latency data for a trace
   *
   * @param traceId - Trace identifier
   * @returns TraceCostLatencyData or undefined if not found
   */
  getTraceData(traceId: string): TraceCostLatencyData | undefined {
    return this.traceData.get(traceId);
  }

  /**
   * Ends tracking for a trace and returns final data
   *
   * @param traceId - Trace identifier
   * @returns Final TraceCostLatencyData or undefined
   */
  endTrace(traceId: string): TraceCostLatencyData | undefined {
    const data = this.traceData.get(traceId);
    if (!data) return undefined;

    // Ensure latency is recorded
    if (data.latency.endTime === 0) {
      this.recordLatency(traceId);
    }

    return data;
  }

  /**
   * Clears tracking data for a trace
   *
   * @param traceId - Trace identifier
   */
  clearTrace(traceId: string): void {
    this.traceData.delete(traceId);
  }

  /**
   * Clears all tracking data
   */
  clearAll(): void {
    this.traceData.clear();
  }

  /**
   * Gets all active trace IDs
   */
  getActiveTraceIds(): string[] {
    return Array.from(this.traceData.keys());
  }
}

/**
 * Singleton instance of CostLatencyTracker
 */
let _trackerInstance: CostLatencyTracker | null = null;

/**
 * Gets the singleton CostLatencyTracker instance
 */
export function getCostLatencyTracker(): CostLatencyTracker {
  if (!_trackerInstance) {
    _trackerInstance = new CostLatencyTracker();
  }
  return _trackerInstance;
}

/**
 * Resets the singleton instance (useful for testing)
 */
export function resetCostLatencyTracker(): void {
  if (_trackerInstance) {
    _trackerInstance.clearAll();
  }
  _trackerInstance = null;
}

/**
 * Helper to wrap an async function with latency tracking
 *
 * @param traceId - Trace identifier
 * @param apiName - Name of the API being called
 * @param fn - Async function to wrap
 * @returns Result of the function with latency recorded
 */
export async function withExternalApiTracking<T>(
  traceId: string,
  apiName: string,
  fn: () => Promise<T>
): Promise<T> {
  const tracker = getCostLatencyTracker();
  const startTime = Date.now();
  let success = true;

  try {
    const result = await fn();
    return result;
  } catch (error) {
    success = false;
    throw error;
  } finally {
    const latencyMs = Date.now() - startTime;
    tracker.recordExternalApiLatency(traceId, apiName, latencyMs, success);
  }
}

/**
 * Aggregates cost data from multiple traces
 *
 * @param costDataArray - Array of CostData objects
 * @returns Aggregated cost data
 */
export function aggregateCostData(costDataArray: CostData[]): {
  totalPromptTokens: number;
  totalCompletionTokens: number;
  totalTokens: number;
  totalCost: number;
  averageCost: number;
} {
  if (costDataArray.length === 0) {
    return {
      totalPromptTokens: 0,
      totalCompletionTokens: 0,
      totalTokens: 0,
      totalCost: 0,
      averageCost: 0,
    };
  }

  const totals = costDataArray.reduce(
    (acc, data) => ({
      totalPromptTokens: acc.totalPromptTokens + data.promptTokens,
      totalCompletionTokens: acc.totalCompletionTokens + data.completionTokens,
      totalTokens: acc.totalTokens + data.totalTokens,
      totalCost: acc.totalCost + data.estimatedCost,
    }),
    { totalPromptTokens: 0, totalCompletionTokens: 0, totalTokens: 0, totalCost: 0 }
  );

  return {
    ...totals,
    averageCost: totals.totalCost / costDataArray.length,
  };
}

/**
 * Aggregates latency data from multiple traces
 *
 * @param latencyDataArray - Array of LatencyData objects
 * @returns Aggregated latency statistics
 */
export function aggregateLatencyData(latencyDataArray: LatencyData[]): {
  minLatencyMs: number;
  maxLatencyMs: number;
  avgLatencyMs: number;
  p50LatencyMs: number;
  p95LatencyMs: number;
  p99LatencyMs: number;
} {
  if (latencyDataArray.length === 0) {
    return {
      minLatencyMs: 0,
      maxLatencyMs: 0,
      avgLatencyMs: 0,
      p50LatencyMs: 0,
      p95LatencyMs: 0,
      p99LatencyMs: 0,
    };
  }

  const durations = latencyDataArray.map((d) => d.durationMs).sort((a, b) => a - b);
  const sum = durations.reduce((a, b) => a + b, 0);

  const percentile = (arr: number[], p: number): number => {
    const index = Math.ceil((p / 100) * arr.length) - 1;
    return arr[Math.max(0, index)] ?? 0;
  };

  return {
    minLatencyMs: durations[0] ?? 0,
    maxLatencyMs: durations[durations.length - 1] ?? 0,
    avgLatencyMs: sum / durations.length,
    p50LatencyMs: percentile(durations, 50),
    p95LatencyMs: percentile(durations, 95),
    p99LatencyMs: percentile(durations, 99),
  };
}


/**
 * Default latency threshold in milliseconds
 * Traces exceeding this threshold will be flagged for review
 */
export const DEFAULT_LATENCY_THRESHOLD_MS = 5000;

/**
 * Latency threshold configuration
 */
export interface LatencyThresholdConfig {
  /** Threshold in milliseconds for flagging traces */
  thresholdMs: number;
  /** Whether to log warnings when threshold is exceeded */
  logWarnings: boolean;
}

/**
 * Result of latency threshold check
 */
export interface LatencyThresholdResult {
  traceId: string;
  latencyMs: number;
  thresholdMs: number;
  exceedsThreshold: boolean;
  flaggedForReview: boolean;
}

/**
 * In-memory store for flagged traces
 */
const flaggedTraces = new Map<string, LatencyThresholdResult>();

/**
 * Checks if a trace's latency exceeds the configured threshold
 *
 * Requirements: 6.5
 *
 * @param traceId - Trace identifier
 * @param latencyMs - Latency in milliseconds
 * @param config - Threshold configuration
 * @returns LatencyThresholdResult indicating if trace should be flagged
 */
export function checkLatencyThreshold(
  traceId: string,
  latencyMs: number,
  config: LatencyThresholdConfig = {
    thresholdMs: DEFAULT_LATENCY_THRESHOLD_MS,
    logWarnings: true,
  }
): LatencyThresholdResult {
  const exceedsThreshold = latencyMs > config.thresholdMs;

  const result: LatencyThresholdResult = {
    traceId,
    latencyMs,
    thresholdMs: config.thresholdMs,
    exceedsThreshold,
    flaggedForReview: exceedsThreshold,
  };

  if (exceedsThreshold) {
    // Store flagged trace
    flaggedTraces.set(traceId, result);

    if (config.logWarnings) {
      console.warn(
        `[LatencyThreshold] Trace ${traceId} flagged for review: latency ${latencyMs}ms exceeds threshold ${config.thresholdMs}ms`
      );
    }
  }

  return result;
}

/**
 * Flags a trace for review based on latency
 *
 * Requirements: 6.5
 *
 * @param traceId - Trace identifier
 * @param latencyMs - Latency in milliseconds
 * @param thresholdMs - Threshold in milliseconds (optional, uses default)
 * @returns true if trace was flagged, false otherwise
 */
export function flagTraceForLatency(
  traceId: string,
  latencyMs: number,
  thresholdMs: number = DEFAULT_LATENCY_THRESHOLD_MS
): boolean {
  const result = checkLatencyThreshold(traceId, latencyMs, {
    thresholdMs,
    logWarnings: true,
  });

  return result.flaggedForReview;
}

/**
 * Gets all flagged traces
 *
 * @returns Array of flagged trace results
 */
export function getFlaggedTraces(): LatencyThresholdResult[] {
  return Array.from(flaggedTraces.values());
}

/**
 * Gets a specific flagged trace
 *
 * @param traceId - Trace identifier
 * @returns LatencyThresholdResult or undefined if not flagged
 */
export function getFlaggedTrace(traceId: string): LatencyThresholdResult | undefined {
  return flaggedTraces.get(traceId);
}

/**
 * Checks if a trace is flagged for review
 *
 * @param traceId - Trace identifier
 * @returns true if trace is flagged
 */
export function isTraceFlagged(traceId: string): boolean {
  return flaggedTraces.has(traceId);
}

/**
 * Clears a flagged trace (e.g., after review)
 *
 * @param traceId - Trace identifier
 */
export function clearFlaggedTrace(traceId: string): void {
  flaggedTraces.delete(traceId);
}

/**
 * Clears all flagged traces
 */
export function clearAllFlaggedTraces(): void {
  flaggedTraces.clear();
}

/**
 * Gets count of flagged traces
 */
export function getFlaggedTraceCount(): number {
  return flaggedTraces.size;
}

/**
 * LatencyThresholdChecker class for managing latency threshold checks
 */
export class LatencyThresholdChecker {
  private config: LatencyThresholdConfig;

  constructor(config?: Partial<LatencyThresholdConfig>) {
    this.config = {
      thresholdMs: config?.thresholdMs ?? DEFAULT_LATENCY_THRESHOLD_MS,
      logWarnings: config?.logWarnings ?? true,
    };
  }

  /**
   * Gets the current threshold configuration
   */
  getConfig(): LatencyThresholdConfig {
    return { ...this.config };
  }

  /**
   * Updates the threshold configuration
   */
  setConfig(config: Partial<LatencyThresholdConfig>): void {
    if (config.thresholdMs !== undefined) {
      this.config.thresholdMs = config.thresholdMs;
    }
    if (config.logWarnings !== undefined) {
      this.config.logWarnings = config.logWarnings;
    }
  }

  /**
   * Checks if latency exceeds threshold and flags trace if needed
   *
   * Requirements: 6.5
   *
   * @param traceId - Trace identifier
   * @param latencyMs - Latency in milliseconds
   * @returns LatencyThresholdResult
   */
  check(traceId: string, latencyMs: number): LatencyThresholdResult {
    return checkLatencyThreshold(traceId, latencyMs, this.config);
  }

  /**
   * Checks multiple traces and returns all that exceed threshold
   *
   * @param traces - Array of trace data with latency
   * @returns Array of flagged trace results
   */
  checkMultiple(
    traces: Array<{ traceId: string; latencyMs: number }>
  ): LatencyThresholdResult[] {
    return traces
      .map((t) => this.check(t.traceId, t.latencyMs))
      .filter((r) => r.flaggedForReview);
  }

  /**
   * Gets all flagged traces
   */
  getFlagged(): LatencyThresholdResult[] {
    return getFlaggedTraces();
  }

  /**
   * Clears all flagged traces
   */
  clearFlagged(): void {
    clearAllFlaggedTraces();
  }
}

/**
 * Singleton instance of LatencyThresholdChecker
 */
let _checkerInstance: LatencyThresholdChecker | null = null;

/**
 * Gets the singleton LatencyThresholdChecker instance
 */
export function getLatencyThresholdChecker(): LatencyThresholdChecker {
  if (!_checkerInstance) {
    _checkerInstance = new LatencyThresholdChecker();
  }
  return _checkerInstance;
}

/**
 * Resets the singleton instance (useful for testing)
 */
export function resetLatencyThresholdChecker(): void {
  clearAllFlaggedTraces();
  _checkerInstance = null;
}

/**
 * Integrates latency threshold checking with CostLatencyTracker
 *
 * @param tracker - CostLatencyTracker instance
 * @param traceId - Trace identifier
 * @param thresholdMs - Threshold in milliseconds (optional)
 * @returns LatencyThresholdResult or undefined if trace not found
 */
export function checkTrackerLatencyThreshold(
  tracker: CostLatencyTracker,
  traceId: string,
  thresholdMs: number = DEFAULT_LATENCY_THRESHOLD_MS
): LatencyThresholdResult | undefined {
  const data = tracker.getTraceData(traceId);
  if (!data) return undefined;

  return checkLatencyThreshold(traceId, data.latency.durationMs, {
    thresholdMs,
    logWarnings: true,
  });
}
