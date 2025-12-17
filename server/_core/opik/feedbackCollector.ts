/**
 * FeedbackCollector Module
 *
 * Handles human feedback collection and storage for traces.
 * Supports thumbs up/down feedback with optional comments.
 *
 * @module opik/feedbackCollector
 */

import { getOpikClient } from "./client";
import type { Feedback } from "./schemas";

/**
 * Input for submitting feedback
 */
export interface FeedbackSubmission {
  type: "thumbs_up" | "thumbs_down";
  comment?: string;
  userId?: string;
}

/**
 * Stored feedback with full metadata
 */
export interface StoredFeedback {
  id: string;
  traceId: string;
  type: "thumbs_up" | "thumbs_down";
  score: number;
  comment?: string;
  userId?: string;
  timestamp: number; // Unix timestamp (seconds)
}

/**
 * Feedback filter options for querying traces
 */
export type FeedbackFilter = "positive" | "negative" | "none" | "all";

/**
 * In-memory feedback storage for local development
 * In production, feedback is stored in the Opik server
 */
const feedbackStore: Map<string, StoredFeedback[]> = new Map();

/**
 * Converts feedback type to numeric score
 * thumbs_up = 1, thumbs_down = -1
 */
export function feedbackTypeToScore(type: "thumbs_up" | "thumbs_down"): number {
  return type === "thumbs_up" ? 1 : -1;
}

/**
 * Converts numeric score to feedback type
 */
export function scoreToFeedbackType(score: number): "thumbs_up" | "thumbs_down" {
  return score >= 0 ? "thumbs_up" : "thumbs_down";
}

/**
 * FeedbackCollector class
 *
 * Handles submission and retrieval of human feedback on traces.
 * Supports thumbs up/down ratings with optional comments.
 *
 * Requirements: 11.1, 11.2, 11.3, 11.4
 */
export class FeedbackCollector {
  /**
   * Submit feedback for a trace
   *
   * Records feedback type (thumbs up/down), timestamp, and optional comment.
   * Attaches the feedback to the corresponding trace.
   *
   * Requirements: 11.1, 11.2, 11.3
   *
   * @param traceId - ID of the trace to attach feedback to
   * @param feedback - Feedback submission data
   * @returns The stored feedback with generated ID and timestamp
   */
  async submitFeedback(
    traceId: string,
    feedback: FeedbackSubmission
  ): Promise<StoredFeedback> {
    const storedFeedback: StoredFeedback = {
      id: crypto.randomUUID(),
      traceId,
      type: feedback.type,
      score: feedbackTypeToScore(feedback.type),
      comment: feedback.comment,
      userId: feedback.userId,
      timestamp: Math.floor(Date.now() / 1000), // Unix timestamp (seconds)
    };

    // Store locally
    const existing = feedbackStore.get(traceId) ?? [];
    existing.push(storedFeedback);
    feedbackStore.set(traceId, existing);

    // Also send to Opik server if available
    try {
      const client = getOpikClient();
      await client.addFeedback(traceId, {
        type: feedback.type,
        comment: feedback.comment,
        userId: feedback.userId,
      });
    } catch {
      // Graceful degradation - feedback is still stored locally
      console.warn(
        `[FeedbackCollector] Failed to send feedback to Opik server for trace ${traceId}`
      );
    }

    return storedFeedback;
  }

  /**
   * Get all feedback for a trace
   *
   * @param traceId - ID of the trace to get feedback for
   * @returns Array of feedback for the trace
   */
  getFeedback(traceId: string): StoredFeedback[] {
    return feedbackStore.get(traceId) ?? [];
  }

  /**
   * Get all feedback across all traces
   *
   * @returns Array of all stored feedback
   */
  getAllFeedback(): StoredFeedback[] {
    const allFeedback: StoredFeedback[] = [];
    for (const feedbackList of feedbackStore.values()) {
      allFeedback.push(...feedbackList);
    }
    return allFeedback;
  }

  /**
   * Check if a trace has any feedback
   *
   * @param traceId - ID of the trace to check
   * @returns true if the trace has feedback
   */
  hasFeedback(traceId: string): boolean {
    const feedback = feedbackStore.get(traceId);
    return feedback !== undefined && feedback.length > 0;
  }

  /**
   * Get the latest feedback for a trace
   *
   * @param traceId - ID of the trace
   * @returns The most recent feedback or undefined
   */
  getLatestFeedback(traceId: string): StoredFeedback | undefined {
    const feedback = feedbackStore.get(traceId);
    if (!feedback || feedback.length === 0) {
      return undefined;
    }
    return feedback[feedback.length - 1];
  }

  /**
   * Get aggregate feedback score for a trace
   *
   * @param traceId - ID of the trace
   * @returns Average score or undefined if no feedback
   */
  getAggregateScore(traceId: string): number | undefined {
    const feedback = feedbackStore.get(traceId);
    if (!feedback || feedback.length === 0) {
      return undefined;
    }
    const sum = feedback.reduce((acc, f) => acc + f.score, 0);
    return sum / feedback.length;
  }

  /**
   * Clear all feedback (useful for testing)
   */
  clearAll(): void {
    feedbackStore.clear();
  }

  /**
   * Clear feedback for a specific trace
   *
   * @param traceId - ID of the trace to clear feedback for
   */
  clearForTrace(traceId: string): void {
    feedbackStore.delete(traceId);
  }
}


/**
 * Trace with feedback information for filtering
 */
export interface TraceWithFeedback {
  traceId: string;
  feedback: StoredFeedback[];
}

/**
 * Determines the feedback category for a trace
 *
 * @param feedback - Array of feedback for the trace
 * @returns "positive" if net positive, "negative" if net negative, "none" if no feedback
 */
export function getFeedbackCategory(
  feedback: StoredFeedback[]
): "positive" | "negative" | "none" {
  if (feedback.length === 0) {
    return "none";
  }

  const totalScore = feedback.reduce((acc, f) => acc + f.score, 0);

  if (totalScore > 0) {
    return "positive";
  } else if (totalScore < 0) {
    return "negative";
  }

  // If total is 0 but there is feedback, use the latest feedback
  const latest = feedback[feedback.length - 1];
  return latest.score >= 0 ? "positive" : "negative";
}

/**
 * Checks if a trace matches the given feedback filter
 *
 * Requirements: 11.4
 *
 * @param traceId - ID of the trace to check
 * @param filter - Filter to apply (positive, negative, none, all)
 * @param collector - FeedbackCollector instance to use
 * @returns true if the trace matches the filter
 */
export function matchesFeedbackFilter(
  traceId: string,
  filter: FeedbackFilter,
  collector: FeedbackCollector
): boolean {
  if (filter === "all") {
    return true;
  }

  const feedback = collector.getFeedback(traceId);
  const category = getFeedbackCategory(feedback);

  return category === filter;
}

/**
 * Filters an array of trace IDs by feedback
 *
 * Requirements: 11.4
 *
 * @param traceIds - Array of trace IDs to filter
 * @param filter - Filter to apply (positive, negative, none, all)
 * @param collector - FeedbackCollector instance to use
 * @returns Filtered array of trace IDs
 */
export function filterTracesByFeedback(
  traceIds: string[],
  filter: FeedbackFilter,
  collector: FeedbackCollector
): string[] {
  if (filter === "all") {
    return traceIds;
  }

  return traceIds.filter((traceId) =>
    matchesFeedbackFilter(traceId, filter, collector)
  );
}

/**
 * Groups traces by their feedback category
 *
 * @param traceIds - Array of trace IDs to group
 * @param collector - FeedbackCollector instance to use
 * @returns Object with traces grouped by feedback category
 */
export function groupTracesByFeedback(
  traceIds: string[],
  collector: FeedbackCollector
): Record<"positive" | "negative" | "none", string[]> {
  const groups: Record<"positive" | "negative" | "none", string[]> = {
    positive: [],
    negative: [],
    none: [],
  };

  for (const traceId of traceIds) {
    const feedback = collector.getFeedback(traceId);
    const category = getFeedbackCategory(feedback);
    groups[category].push(traceId);
  }

  return groups;
}

/**
 * Singleton instance of FeedbackCollector
 */
let _collectorInstance: FeedbackCollector | null = null;

/**
 * Get the singleton FeedbackCollector instance
 */
export function getFeedbackCollector(): FeedbackCollector {
  if (!_collectorInstance) {
    _collectorInstance = new FeedbackCollector();
  }
  return _collectorInstance;
}

/**
 * Reset the singleton instance (useful for testing)
 */
export function resetFeedbackCollector(): void {
  if (_collectorInstance) {
    _collectorInstance.clearAll();
  }
  _collectorInstance = null;
}
