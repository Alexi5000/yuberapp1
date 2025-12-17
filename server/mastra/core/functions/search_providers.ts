// file: src/mastra/core/functions/search_providers.ts
// description: Find service providers by issue or category and location
// reference: src/mastra/tools/yelpSearchTool.ts, src/mastra/tools/categorizeIssueTool.ts

import * as z from "zod/v4";
import { searchYelp } from "@/mastra/tools/yelpSearchTool";
import { categorizeIssue } from "@/mastra/tools/categorizeIssueTool";
import { ServiceAgentSchema, LocationSchema } from "@/mastra/schemas";
import { logger } from "@/lib/logger";

// =============================================================================
// SCHEMAS
// =============================================================================

/**
 * Input schema for search_providers function
 */
export const SearchProvidersInputSchema = z.object({
  // Either issue text OR category required
  issue: z.string().optional(),
  category: z.string().optional(),
  location: LocationSchema,
}).refine(
  (data) => data.issue || data.category,
  { message: "Either issue or category is required" }
);

export type SearchProvidersInput = z.infer<typeof SearchProvidersInputSchema>;

/**
 * Output schema for search_providers function
 */
export const SearchProvidersOutputSchema = z.object({
  success: z.boolean(),
  providers: z.array(ServiceAgentSchema).optional(),
  category: z.string().optional(),
  confidence: z.number().optional(),
  error: z.object({
    code: z.string(),
    message: z.string(),
  }).optional(),
});

export type SearchProvidersOutput = z.infer<typeof SearchProvidersOutputSchema>;

// =============================================================================
// SEARCH PROVIDERS FUNCTION
// =============================================================================

/**
 * search_providers - Find service providers by issue or category
 *
 * If an issue text is provided, it will be categorized first.
 * Then queries Yelp for matching service providers.
 *
 * Features:
 * - Auto-categorization of issue text
 * - Filters by rating and review count
 * - Sorted by rating
 * - Falls back to mock data if Yelp unavailable
 *
 * Single Responsibility: Provider discovery
 *
 * @param input - Issue text or category, plus location
 * @returns List of matching service providers
 */
export async function search_providers(
  input: SearchProvidersInput
): Promise<SearchProvidersOutput> {
  const { issue, location } = input;
  let { category } = input;
  let confidence: number | undefined;

  logger.tool.execute("search_providers", {
    has_issue: Boolean(issue),
    has_category: Boolean(category),
  });

  try {
    // Categorize issue if no category provided
    if (!category && issue) {
      const categorize_result = await categorizeIssue(issue);

      if (!categorize_result.success) {
        return {
          success: false,
          error: {
            code: "CATEGORIZATION_FAILED",
            message: "Failed to categorize issue",
          },
        };
      }

      category = categorize_result.data.category;
      confidence = categorize_result.data.confidence;

      logger.tool.debug("Issue categorized", { category, confidence });
    }

    if (!category) {
      return {
        success: false,
        error: {
          code: "MISSING_CATEGORY",
          message: "Could not determine service category",
        },
      };
    }

    // Search for providers
    const search_result = await searchYelp(category, location.lat, location.lng);

    if (!search_result.success) {
      return {
        success: false,
        category,
        confidence,
        error: search_result.error || {
          code: "SEARCH_FAILED",
          message: "Failed to search for providers",
        },
      };
    }

    logger.tool.result("search_providers", true, {
      category,
      provider_count: search_result.data?.length || 0,
    });

    return {
      success: true,
      providers: search_result.data || [],
      category,
      confidence,
    };
  } catch (error) {
    logger.tool.error("search_providers failed", error);

    return {
      success: false,
      category,
      confidence,
      error: {
        code: "SEARCH_ERROR",
        message: error instanceof Error ? error.message : "Unknown error",
      },
    };
  }
}

