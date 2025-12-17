import { createTool } from "@mastra/core/tools";
import * as z from "zod/v4";
import { wrapCategorizeIssueTool, type ToolSpanContext, type SpanWrappedResult } from "@/lib/opik/spanWrapper";

// Output schema for category result
export const CategoryResultSchema = z.object({
  category: z.string(),
  confidence: z.number().min(0).max(1),
});

export type CategoryResult = z.infer<typeof CategoryResultSchema>;

// Tool output schema
export const CategorizeIssueOutputSchema = z.object({
  success: z.boolean(),
  data: CategoryResultSchema,
});

export type CategorizeIssueOutput = z.infer<typeof CategorizeIssueOutputSchema>;

/**
 * Core categorization logic - exported for testing.
 * Categorizes an issue text into a Yelp service category.
 * Uses keyword matching to determine the appropriate category.
 * Falls back to "handyman" for unmatched issues.
 *
 * 🦆 RUBBER DUCK / YAGNI NOTE:
 * This implementation uses simple keyword matching intentionally.
 * While LLM-based classification would provide better accuracy,
 * the current approach is:
 * - Fast (no API calls required)
 * - Deterministic (same input → same output)
 * - Testable (easy to verify behavior)
 * - Sufficient for MVP scope
 *
 * Future enhancement path (when needed):
 * 1. Collect categorization accuracy metrics via Opik
 * 2. If accuracy drops below threshold, consider LLM classification
 * 3. Use the HelpAgent's categorizeIssueTool for complex cases
 *
 * AI-PROOF: Keep this simple until metrics prove otherwise.
 */
export async function categorizeIssue(issue: string): Promise<CategorizeIssueOutput> {
  const lowerIssue = issue.toLowerCase();

  // Keyword matching for specific categories
  // Each keyword maps to a Yelp category with a confidence score
  if (lowerIssue.includes("locked out")) {
    return { success: true, data: { category: "locksmith", confidence: 0.95 } };
  }

  if (lowerIssue.includes("pipe") || lowerIssue.includes("water")) {
    return { success: true, data: { category: "plumber", confidence: 0.9 } };
  }

  if (lowerIssue.includes("electrical")) {
    return { success: true, data: { category: "electrician", confidence: 0.9 } };
  }

  if (lowerIssue.includes("window")) {
    return { success: true, data: { category: "glass", confidence: 0.85 } };
  }

  // Fallback to handyman for unmatched issues
  // Lower confidence signals potential need for clarification
  return { success: true, data: { category: "handyman", confidence: 0.5 } };
}

/**
 * Mastra tool wrapper for categorizeIssue function.
 */
export const categorizeIssueTool = createTool({
  id: "categorize-issue",
  description: "Maps issue text to Yelp category based on keyword matching",
  inputSchema: z.object({
    issue: z.string(),
  }),
  outputSchema: CategorizeIssueOutputSchema,
  execute: async (context) => {
    const input = context as unknown as { issue: string };
    return categorizeIssue(input.issue);
  },
});

/**
 * Input type for categorizeIssueTool with span tracing
 */
export interface CategorizeIssueInput {
  issue: string;
}

/**
 * Creates a traced version of the categorizeIssue function
 *
 * Wraps the categorizeIssue function with Opik span tracing to capture:
 * - Input issue text
 * - Output category
 * - Confidence score
 * - Execution time
 *
 * Requirements: 3.1
 *
 * @param context - Parent trace context for linking spans
 * @returns A function that executes categorizeIssue with span tracing
 */
export function createTracedCategorizeIssue(
  context: ToolSpanContext
): (input: CategorizeIssueInput) => Promise<SpanWrappedResult<CategorizeIssueOutput>> {
  const wrapper = wrapCategorizeIssueTool<CategorizeIssueInput, CategorizeIssueOutput>(context);

  return wrapper(async (input: CategorizeIssueInput): Promise<CategorizeIssueOutput> => {
    return categorizeIssue(input.issue);
  });
}

/**
 * Executes categorizeIssue with Opik span tracing
 *
 * Convenience function that creates a traced tool and executes it.
 *
 * @param issue - Issue text to categorize
 * @param context - Parent trace context for linking spans
 * @returns Span-wrapped result with category output, spanId, and duration
 */
export async function executeTracedCategorizeIssue(
  issue: string,
  context: ToolSpanContext
): Promise<SpanWrappedResult<CategorizeIssueOutput>> {
  const tracedTool = createTracedCategorizeIssue(context);
  return tracedTool({ issue });
}
