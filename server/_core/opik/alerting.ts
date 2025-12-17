/**
 * Alerting Module
 *
 * Provides metric aggregation logging and threshold warning capabilities
 * for monitoring LLM system health in production.
 *
 * @module opik/alerting
 */

import { logger } from "../logger";

/**
 * Trace data for aggregation
 */
export interface TraceData {
  id: string;
  status: "success" | "error" | "running";
  latencyMs: number;
  tokens?: {
    prompt: number;
    completion: number;
    total: number;
  };
  metrics?: Record<string, number>;
}

/**
 * Aggregated metrics result
 */
export interface AggregatedMetrics {
  successRate: number;
  errorRate: number;
  averageLatencyMs: number;
  p95LatencyMs: number;
  totalTokens: number;
  averageTokensPerRequest: number;
  traceCount: number;
  successCount: number;
  errorCount: number;
}

/**
 * Alert thresholds configuration
 */
export interface AlertThresholds {
  errorRateThreshold: number;       // 0.0 to 1.0, default 0.1 (10%)
  p95LatencyThresholdMs: number;    // milliseconds, default 5000
  hallucinationThreshold: number;   // 0.0 to 1.0, default 0.3
}

/**
 * Default alert thresholds
 */
export const DEFAULT_THRESHOLDS: AlertThresholds = {
  errorRateThreshold: 0.1,          // 10% error rate
  p95LatencyThresholdMs: 5000,      // 5 seconds
  hallucinationThreshold: 0.3,      // 30% hallucination score
};

/**
 * Alert types for threshold warnings
 */
export type AlertType = "error_rate" | "latency" | "hallucination";

/**
 * Alert record for logging
 */
export interface AlertRecord {
  type: AlertType;
  severity: "warning" | "critical";
  message: string;
  currentValue: number;
  threshold: number;
  timestamp: Date;
  traceIds?: string[];
}

/**
 * Metric log entry formatted for future email alerting
 */
export interface MetricLogEntry {
  timestamp: string;
  type: "aggregated_metrics" | "threshold_warning" | "trace_flagged";
  data: AggregatedMetrics | AlertRecord | { traceId: string; reason: string; score: number };
}


/**
 * Computes aggregated metrics from a collection of traces
 *
 * Requirements: 8.1
 *
 * @param traces - Array of trace data to aggregate
 * @returns Aggregated metrics including success rate, latency, error rate, token usage
 */
export function computeAggregatedMetrics(traces: TraceData[]): AggregatedMetrics {
  if (traces.length === 0) {
    return {
      successRate: 0,
      errorRate: 0,
      averageLatencyMs: 0,
      p95LatencyMs: 0,
      totalTokens: 0,
      averageTokensPerRequest: 0,
      traceCount: 0,
      successCount: 0,
      errorCount: 0,
    };
  }

  const successCount = traces.filter((t) => t.status === "success").length;
  const errorCount = traces.filter((t) => t.status === "error").length;
  const traceCount = traces.length;

  const successRate = successCount / traceCount;
  const errorRate = errorCount / traceCount;

  // Compute average latency
  const totalLatency = traces.reduce((sum, t) => sum + t.latencyMs, 0);
  const averageLatencyMs = totalLatency / traceCount;

  // Compute P95 latency
  const sortedLatencies = traces.map((t) => t.latencyMs).sort((a, b) => a - b);
  const p95Index = Math.floor(sortedLatencies.length * 0.95);
  const p95LatencyMs = sortedLatencies[Math.min(p95Index, sortedLatencies.length - 1)] ?? 0;

  // Compute token usage
  const totalTokens = traces.reduce((sum, t) => sum + (t.tokens?.total ?? 0), 0);
  const tracesWithTokens = traces.filter((t) => t.tokens?.total !== undefined);
  const averageTokensPerRequest =
    tracesWithTokens.length > 0 ? totalTokens / tracesWithTokens.length : 0;

  return {
    successRate,
    errorRate,
    averageLatencyMs,
    p95LatencyMs,
    totalTokens,
    averageTokensPerRequest,
    traceCount,
    successCount,
    errorCount,
  };
}

/**
 * Logs aggregated metrics in a format suitable for future email alerting
 *
 * Requirements: 8.1, 8.5
 *
 * @param metrics - Aggregated metrics to log
 * @returns The formatted log entry
 */
export function logAggregatedMetrics(metrics: AggregatedMetrics): MetricLogEntry {
  const entry: MetricLogEntry = {
    timestamp: new Date().toISOString(),
    type: "aggregated_metrics",
    data: metrics,
  };

  // Log using the system logger with structured data
  logger.system.info("Opik Aggregated Metrics", {
    successRate: `${(metrics.successRate * 100).toFixed(2)}%`,
    errorRate: `${(metrics.errorRate * 100).toFixed(2)}%`,
    averageLatencyMs: metrics.averageLatencyMs.toFixed(2),
    p95LatencyMs: metrics.p95LatencyMs.toFixed(2),
    totalTokens: metrics.totalTokens,
    averageTokensPerRequest: metrics.averageTokensPerRequest.toFixed(2),
    traceCount: metrics.traceCount,
    successCount: metrics.successCount,
    errorCount: metrics.errorCount,
  });

  return entry;
}

/**
 * Checks if error rate exceeds threshold and logs critical warning
 *
 * Requirements: 8.2
 *
 * @param metrics - Aggregated metrics to check
 * @param thresholds - Alert thresholds
 * @returns Alert record if threshold exceeded, null otherwise
 */
export function checkErrorRateThreshold(
  metrics: AggregatedMetrics,
  thresholds: AlertThresholds = DEFAULT_THRESHOLDS
): AlertRecord | null {
  if (metrics.errorRate > thresholds.errorRateThreshold) {
    const alert: AlertRecord = {
      type: "error_rate",
      severity: "critical",
      message: `Error rate ${(metrics.errorRate * 100).toFixed(2)}% exceeds threshold ${(thresholds.errorRateThreshold * 100).toFixed(2)}%`,
      currentValue: metrics.errorRate,
      threshold: thresholds.errorRateThreshold,
      timestamp: new Date(),
    };

    logger.system.error(`[CRITICAL] ${alert.message}`, {
      errorRate: metrics.errorRate,
      threshold: thresholds.errorRateThreshold,
      errorCount: metrics.errorCount,
      traceCount: metrics.traceCount,
    });

    return alert;
  }

  return null;
}

/**
 * Checks if P95 latency exceeds threshold and logs performance warning
 *
 * Requirements: 8.3
 *
 * @param metrics - Aggregated metrics to check
 * @param thresholds - Alert thresholds
 * @returns Alert record if threshold exceeded, null otherwise
 */
export function checkLatencyThreshold(
  metrics: AggregatedMetrics,
  thresholds: AlertThresholds = DEFAULT_THRESHOLDS
): AlertRecord | null {
  if (metrics.p95LatencyMs > thresholds.p95LatencyThresholdMs) {
    const alert: AlertRecord = {
      type: "latency",
      severity: "warning",
      message: `P95 latency ${metrics.p95LatencyMs.toFixed(2)}ms exceeds threshold ${thresholds.p95LatencyThresholdMs}ms`,
      currentValue: metrics.p95LatencyMs,
      threshold: thresholds.p95LatencyThresholdMs,
      timestamp: new Date(),
    };

    logger.system.warn(`[PERFORMANCE] ${alert.message}`, {
      p95LatencyMs: metrics.p95LatencyMs,
      threshold: thresholds.p95LatencyThresholdMs,
      averageLatencyMs: metrics.averageLatencyMs,
    });

    return alert;
  }

  return null;
}

/**
 * Flags a trace for human review when hallucination score exceeds threshold
 *
 * Requirements: 8.4
 *
 * @param traceId - ID of the trace to flag
 * @param hallucinationScore - Hallucination score of the trace
 * @param thresholds - Alert thresholds
 * @returns Log entry if flagged, null otherwise
 */
export function flagTraceForHumanReview(
  traceId: string,
  hallucinationScore: number,
  thresholds: AlertThresholds = DEFAULT_THRESHOLDS
): MetricLogEntry | null {
  if (hallucinationScore > thresholds.hallucinationThreshold) {
    const entry: MetricLogEntry = {
      timestamp: new Date().toISOString(),
      type: "trace_flagged",
      data: {
        traceId,
        reason: "hallucination_threshold_exceeded",
        score: hallucinationScore,
      },
    };

    logger.system.warn(`[REVIEW REQUIRED] Trace ${traceId} flagged for human review`, {
      traceId,
      hallucinationScore: hallucinationScore.toFixed(4),
      threshold: thresholds.hallucinationThreshold,
      reason: "Hallucination score exceeds threshold",
    });

    return entry;
  }

  return null;
}

/**
 * Checks all thresholds and returns any triggered alerts
 *
 * Requirements: 8.2, 8.3, 8.4
 *
 * @param metrics - Aggregated metrics to check
 * @param thresholds - Alert thresholds
 * @returns Array of triggered alerts
 */
export function checkAllThresholds(
  metrics: AggregatedMetrics,
  thresholds: AlertThresholds = DEFAULT_THRESHOLDS
): AlertRecord[] {
  const alerts: AlertRecord[] = [];

  const errorAlert = checkErrorRateThreshold(metrics, thresholds);
  if (errorAlert) {
    alerts.push(errorAlert);
  }

  const latencyAlert = checkLatencyThreshold(metrics, thresholds);
  if (latencyAlert) {
    alerts.push(latencyAlert);
  }

  return alerts;
}

/**
 * Logs threshold warning in a format suitable for future email alerting
 *
 * Requirements: 8.5
 *
 * @param alert - Alert record to log
 * @returns The formatted log entry
 */
export function logThresholdWarning(alert: AlertRecord): MetricLogEntry {
  const entry: MetricLogEntry = {
    timestamp: new Date().toISOString(),
    type: "threshold_warning",
    data: alert,
  };

  // Already logged in the check functions, but return the entry for aggregation
  return entry;
}

/**
 * AlertingService class for managing metric aggregation and threshold warnings
 */
export class AlertingService {
  private thresholds: AlertThresholds;
  private logHistory: MetricLogEntry[] = [];
  private maxHistorySize: number;

  constructor(
    thresholds: AlertThresholds = DEFAULT_THRESHOLDS,
    maxHistorySize = 1000
  ) {
    this.thresholds = thresholds;
    this.maxHistorySize = maxHistorySize;
  }

  /**
   * Process traces and log aggregated metrics
   */
  processTraces(traces: TraceData[]): {
    metrics: AggregatedMetrics;
    alerts: AlertRecord[];
    logEntries: MetricLogEntry[];
  } {
    const metrics = computeAggregatedMetrics(traces);
    const metricsEntry = logAggregatedMetrics(metrics);
    const alerts = checkAllThresholds(metrics, this.thresholds);

    const logEntries: MetricLogEntry[] = [metricsEntry];

    for (const alert of alerts) {
      const alertEntry = logThresholdWarning(alert);
      logEntries.push(alertEntry);
    }

    // Store in history
    for (const entry of logEntries) {
      this.addToHistory(entry);
    }

    return { metrics, alerts, logEntries };
  }

  /**
   * Flag a trace for human review if hallucination score exceeds threshold
   */
  flagForReview(traceId: string, hallucinationScore: number): MetricLogEntry | null {
    const entry = flagTraceForHumanReview(traceId, hallucinationScore, this.thresholds);
    if (entry) {
      this.addToHistory(entry);
    }
    return entry;
  }

  /**
   * Get current thresholds
   */
  getThresholds(): AlertThresholds {
    return { ...this.thresholds };
  }

  /**
   * Update thresholds
   */
  setThresholds(thresholds: Partial<AlertThresholds>): void {
    this.thresholds = { ...this.thresholds, ...thresholds };
  }

  /**
   * Get log history
   */
  getLogHistory(): MetricLogEntry[] {
    return [...this.logHistory];
  }

  /**
   * Clear log history
   */
  clearHistory(): void {
    this.logHistory = [];
  }

  /**
   * Add entry to history with size limit
   */
  private addToHistory(entry: MetricLogEntry): void {
    this.logHistory.push(entry);
    if (this.logHistory.length > this.maxHistorySize) {
      this.logHistory.shift();
    }
  }
}

/**
 * Singleton instance of AlertingService
 */
let _alertingServiceInstance: AlertingService | null = null;

/**
 * Get the singleton AlertingService instance
 */
export function getAlertingService(): AlertingService {
  if (!_alertingServiceInstance) {
    _alertingServiceInstance = new AlertingService();
  }
  return _alertingServiceInstance;
}

/**
 * Reset the singleton instance (useful for testing)
 */
export function resetAlertingService(): void {
  _alertingServiceInstance = null;
}
