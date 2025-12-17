/**
 * Opik Schemas Module
 *
 * Zod schemas for Trace, Span, Feedback, and Dataset data models.
 * These schemas provide runtime validation and TypeScript type inference.
 *
 * @module opik/schemas
 */

import * as z from "zod/v4";

/**
 * Error details schema for traces and spans
 */
export const ErrorDetailsSchema = z.object({
  code: z.string(),
  message: z.string(),
  stack: z.string().optional(),
});

export type ErrorDetails = z.infer<typeof ErrorDetailsSchema>;

/**
 * Token usage schema for LLM calls
 */
export const TokenUsageSchema = z.object({
  prompt: z.number().int().nonnegative(),
  completion: z.number().int().nonnegative(),
  total: z.number().int().nonnegative(),
});

export type TokenUsage = z.infer<typeof TokenUsageSchema>;

/**
 * Feedback schema for human feedback on traces
 */
export const FeedbackSchema = z.object({
  id: z.string().uuid(),
  traceId: z.string().uuid(),
  type: z.enum(["thumbs_up", "thumbs_down"]),
  score: z.number().min(-1).max(1), // -1 for thumbs_down, 1 for thumbs_up
  comment: z.string().optional(),
  userId: z.string().optional(),
  timestamp: z.coerce.date(),
});

export type Feedback = z.infer<typeof FeedbackSchema>;

/**
 * Trace metadata schema
 */
export const TraceMetadataSchema = z.object({
  userId: z.string().optional(),
  sessionId: z.string().optional(),
  requestId: z.string().optional(),
  environment: z.enum(["development", "staging", "production"]),
  model: z.string().optional(),
});

export type TraceMetadata = z.infer<typeof TraceMetadataSchema>;


/**
 * Trace status enum
 */
export const TraceStatusSchema = z.enum(["running", "success", "error"]);

export type TraceStatus = z.infer<typeof TraceStatusSchema>;

/**
 * Trace type enum
 */
export const TraceTypeSchema = z.enum(["agent", "workflow", "api"]);

export type TraceType = z.infer<typeof TraceTypeSchema>;

/**
 * Complete Trace schema
 *
 * Represents a complete record of an LLM interaction including input,
 * output, metadata, and timing information.
 */
export const TraceSchema = z.object({
  id: z.string().uuid(),
  projectName: z.string().min(1),
  name: z.string().min(1),
  type: TraceTypeSchema,
  input: z.unknown(),
  output: z.unknown().optional(),
  metadata: TraceMetadataSchema,
  startTime: z.coerce.date(),
  endTime: z.coerce.date().optional(),
  latencyMs: z.number().nonnegative().optional(),
  status: TraceStatusSchema,
  error: ErrorDetailsSchema.optional(),
  tokens: TokenUsageSchema.optional(),
  cost: z.number().nonnegative().optional(),
  metrics: z.record(z.string(), z.number()).optional(),
  feedback: z.array(FeedbackSchema).optional(),
});

export type Trace = z.infer<typeof TraceSchema>;

/**
 * Span type enum
 */
export const SpanTypeSchema = z.enum(["tool", "llm", "workflow_step", "external_api"]);

export type SpanType = z.infer<typeof SpanTypeSchema>;

/**
 * Span status enum
 */
export const SpanStatusSchema = z.enum(["running", "success", "error"]);

export type SpanStatus = z.infer<typeof SpanStatusSchema>;

/**
 * Complete Span schema
 *
 * Represents a unit of work within a trace representing a single operation
 * (agent call, tool execution, workflow step).
 */
export const SpanSchema = z.object({
  id: z.string().uuid(),
  traceId: z.string().uuid(),
  parentSpanId: z.string().uuid().optional(),
  name: z.string().min(1),
  type: SpanTypeSchema,
  input: z.unknown(),
  output: z.unknown().optional(),
  startTime: z.coerce.date(),
  endTime: z.coerce.date().optional(),
  durationMs: z.number().nonnegative().optional(),
  status: SpanStatusSchema,
  error: ErrorDetailsSchema.optional(),
  metrics: z.record(z.string(), z.number()).optional(),
});

export type Span = z.infer<typeof SpanSchema>;

/**
 * Dataset item schema for offline evaluation
 */
export const DatasetItemSchema = z.object({
  id: z.string().uuid(),
  input: z.unknown(),
  expectedOutput: z.unknown().optional(),
  groundTruth: z.record(z.string(), z.unknown()).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export type DatasetItem = z.infer<typeof DatasetItemSchema>;

/**
 * Serialization helpers
 */

/**
 * Serialize a Trace to JSON-compatible object
 */
export function serializeTrace(trace: Trace): string {
  return JSON.stringify({
    ...trace,
    startTime: trace.startTime.toISOString(),
    endTime: trace.endTime?.toISOString(),
    feedback: trace.feedback?.map((f) => ({
      ...f,
      timestamp: f.timestamp.toISOString(),
    })),
  });
}

/**
 * Deserialize a JSON string to a Trace object
 */
export function deserializeTrace(json: string): Trace {
  const parsed = JSON.parse(json);
  return TraceSchema.parse(parsed);
}

/**
 * Serialize a Span to JSON-compatible object
 */
export function serializeSpan(span: Span): string {
  return JSON.stringify({
    ...span,
    startTime: span.startTime.toISOString(),
    endTime: span.endTime?.toISOString(),
  });
}

/**
 * Deserialize a JSON string to a Span object
 */
export function deserializeSpan(json: string): Span {
  const parsed = JSON.parse(json);
  return SpanSchema.parse(parsed);
}

/**
 * Serialize a DatasetItem to JSON-compatible object
 */
export function serializeDatasetItem(item: DatasetItem): string {
  return JSON.stringify(item);
}

/**
 * Deserialize a JSON string to a DatasetItem object
 */
export function deserializeDatasetItem(json: string): DatasetItem {
  const parsed = JSON.parse(json);
  return DatasetItemSchema.parse(parsed);
}
