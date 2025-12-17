/**
 * Opik Integration Module
 *
 * Central export point for all Opik observability and evaluation components.
 * Provides tracing, evaluation metrics, feedback collection, and dataset management
 * for LLM applications.
 *
 * @module opik
 */

// ============================================================================
// Client
// ============================================================================
export {
  OpikClient,
  getOpikClient,
  resetOpikClient,
  buildSpanHierarchy,
  flattenSpanHierarchy,
  createHierarchicalTrace,
  isValidHierarchicalOrder,
  type JsonValue,
  type TraceInput,
  type TraceOutput,
  type SpanInput,
  type SpanOutput,
  type FeedbackInput,
  type MetricInput,
  type ActiveTrace,
  type ActiveSpan,
  type HierarchicalSpan,
  type HierarchicalTrace,
  type FlatSpan,
} from "./client";

// ============================================================================
// Configuration
// ============================================================================
export {
  readOpikConfig,
  isTracingEnabled,
  getOpikConfig,
  resetConfigCache,
  type OpikClientConfig,
} from "./config";

// ============================================================================
// Schemas and Types
// ============================================================================
export {
  // Schemas
  ErrorDetailsSchema,
  TokenUsageSchema,
  FeedbackSchema,
  TraceMetadataSchema,
  TraceStatusSchema,
  TraceTypeSchema,
  TraceSchema,
  SpanTypeSchema,
  SpanStatusSchema,
  SpanSchema,
  DatasetItemSchema,
  // Types
  type ErrorDetails,
  type TokenUsage,
  type Feedback,
  type TraceMetadata,
  type TraceStatus,
  type TraceType,
  type Trace,
  type SpanType,
  type SpanStatus,
  type Span,
  type DatasetItem,
  // Serialization helpers
  serializeTrace,
  deserializeTrace,
  serializeSpan,
  deserializeSpan,
  serializeDatasetItem,
  deserializeDatasetItem,
} from "./schemas";

// ============================================================================
// Trace Wrapper
// ============================================================================
export {
  wrapAgent,
  wrapWorkflow,
  wrapWorkflowWithSteps,
  createTracedAgent,
  createTracedWorkflow,
  createWorkflowStepSpan,
  createWorkflowContext,
  addStepSpanToContext,
  recordWorkflowStepError,
  recordWorkflowError,
  setCurrentTraceId,
  getCurrentTraceId,
  type TraceWrapperMetadata,
  type TracedResult,
  type AgentExecutionResult,
  type WorkflowExecutionResult,
  type WrappableAgent,
  type WrappableWorkflow,
  type WorkflowStepResult,
  type WorkflowStepSpan,
  type WorkflowContext,
  type WorkflowErrorDetails,
} from "./traceWrapper";

// ============================================================================
// Span Wrapper
// ============================================================================
export {
  wrapTool,
  createSpanWrappedTool,
  wrapCategorizeIssueTool,
  wrapYelpSearchTool,
  wrapDispatchAgentTool,
  wrapToolWithErrorLogging,
  type SpanWrappedResult,
  type ToolSpanContext,
  type ToolOutput,
  type CategorizeIssueSpanData,
  type YelpSearchSpanData,
  type DispatchAgentSpanData,
  type ToolSpanData,
} from "./spanWrapper";

// ============================================================================
// Metric Computer
// ============================================================================
export {
  MetricComputer,
  getMetricComputer,
  resetMetricComputer,
  computeRelevance,
  computeHallucination,
  computeSelectionQuality,
  computeCategoryAccuracy,
  computeCost,
  clampMetric,
  attachMetricsToTrace,
  computeAndAttachMetrics,
  storeMetricsForTrace,
  getMetricsForTrace,
  clearMetricStore,
  getTracesWithMetrics,
  KNOWN_CATEGORY_MAPPINGS,
  type MetricInput as MetricComputerInput,
  type MetricResult,
  type MetricAttachmentResult,
} from "./metricComputer";

// ============================================================================
// Feedback Collector
// ============================================================================
export {
  FeedbackCollector,
  getFeedbackCollector,
  resetFeedbackCollector,
  feedbackTypeToScore,
  scoreToFeedbackType,
  getFeedbackCategory,
  matchesFeedbackFilter,
  filterTracesByFeedback,
  groupTracesByFeedback,
  type FeedbackSubmission,
  type StoredFeedback,
  type FeedbackFilter,
  type TraceWithFeedback,
} from "./feedbackCollector";

// ============================================================================
// Dataset Manager
// ============================================================================
export {
  DatasetManager,
  getDatasetManager,
  resetDatasetManager,
  computeAggregateMetrics,
  type Dataset,
  type ItemResult,
  type AggregateMetrics,
  type ExperimentResult,
  type ExperimentRunner,
} from "./datasetManager";

// ============================================================================
// Middleware
// ============================================================================
export {
  withOpikTracing,
  withWorkflowLinking,
  linkWorkflowTrace,
  setTraceContext,
  getTraceContext,
  clearTraceContext,
  storeTraceForCorrelation,
  getStoredTrace,
  linkTraces,
  queryCorrelatedTraces,
  clearTraceCorrelationStore,
  getAllStoredTraces,
  type TraceContext,
  type ApiTraceData,
  type OpikTracingOptions,
  type TracedRequest,
  type ApiHandler,
  type TracedApiHandler,
  type StoredTraceData,
  type CorrelatedTraceResult,
} from "./middleware";

// ============================================================================
// Alerting
// ============================================================================
export {
  AlertingService,
  getAlertingService,
  resetAlertingService,
  computeAggregatedMetrics,
  logAggregatedMetrics,
  checkErrorRateThreshold,
  checkLatencyThreshold as checkAlertingLatencyThreshold,
  flagTraceForHumanReview,
  checkAllThresholds,
  logThresholdWarning,
  DEFAULT_THRESHOLDS,
  type TraceData,
  type AggregatedMetrics as AlertingAggregatedMetrics,
  type AlertThresholds,
  type AlertType,
  type AlertRecord,
  type MetricLogEntry,
} from "./alerting";

// ============================================================================
// Cost and Latency Tracker
// ============================================================================
export {
  CostLatencyTracker,
  getCostLatencyTracker,
  resetCostLatencyTracker,
  LatencyThresholdChecker,
  getLatencyThresholdChecker,
  resetLatencyThresholdChecker,
  computeEstimatedCost,
  createCostData,
  createLatencyData,
  createExternalApiLatency,
  tokenUsageToCostData,
  withExternalApiTracking,
  aggregateCostData,
  aggregateLatencyData,
  checkLatencyThreshold,
  flagTraceForLatency,
  getFlaggedTraces,
  getFlaggedTrace,
  isTraceFlagged,
  clearFlaggedTrace,
  clearAllFlaggedTraces,
  getFlaggedTraceCount,
  checkTrackerLatencyThreshold,
  MODEL_PRICING,
  DEFAULT_MODEL,
  DEFAULT_LATENCY_THRESHOLD_MS,
  type CostData,
  type LatencyData,
  type ExternalApiLatency,
  type TraceCostLatencyData,
  type LatencyThresholdConfig,
  type LatencyThresholdResult,
} from "./costLatencyTracker";
