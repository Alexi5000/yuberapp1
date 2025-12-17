import { createTool } from "@mastra/core/tools";
import * as z from "zod/v4";
import { ServiceAgentSchema, type ServiceAgent } from "@/mastra/schemas";
import { getMockProviders } from "@/mastra/data/mockProviders";
import { wrapYelpSearchTool, type ToolSpanContext, type SpanWrappedResult } from "@/lib/opik/spanWrapper";
import {
  YELP_MIN_RATING,
  YELP_MIN_REVIEW_COUNT,
  YELP_FUSION_API_URL,
  DEFAULT_RETRY_ATTEMPTS,
  DEFAULT_RETRY_DELAY_MS,
  BACKOFF_MULTIPLIER,
  HTTP_STATUS,
} from "@/lib/constants";
import { logger } from "@/lib/logger";

// Output schema for yelp search result
export const YelpSearchOutputSchema = z.object({
  success: z.boolean(),
  data: z.array(ServiceAgentSchema).optional(),
  error: z.object({
    code: z.string(),
    message: z.string(),
  }).optional(),
});

export type YelpSearchOutput = z.infer<typeof YelpSearchOutputSchema>;

// Yelp API business response type (partial, only fields we need)
interface YelpBusiness {
  id: string;
  name: string;
  rating: number;
  review_count: number;
  distance?: number;
  phone: string;
  image_url: string;
}

interface YelpSearchResponse {
  businesses: YelpBusiness[];
}

/**
 * Filters Yelp businesses by rating and review count criteria.
 * Requirements: rating >= YELP_MIN_RATING, review_count >= YELP_MIN_REVIEW_COUNT
 */
export function filterYelpBusinesses(businesses: YelpBusiness[]): YelpBusiness[] {
  return businesses.filter(
    (b) => b.rating >= YELP_MIN_RATING && b.review_count >= YELP_MIN_REVIEW_COUNT
  );
}

/**
 * Transforms Yelp business data to ServiceAgent format.
 */
export function transformToServiceAgent(
  business: YelpBusiness,
  category: string
): ServiceAgent {
  return {
    id: business.id,
    name: business.name,
    category,
    rating: business.rating,
    reviewCount: business.review_count,
    distance: business.distance ?? 0,
    available: true,
    yelpBusinessId: business.id,
    phone: business.phone || "",
    imageUrl: business.image_url || "https://example.com/placeholder.jpg",
  };
}

/**
 * Sleep utility for retry delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Determines if an HTTP status code should trigger a retry
 * Retry on: rate limits (429), server errors (5xx)
 * Don't retry on: client errors (400-499 except 429)
 */
function shouldRetry(status: number): boolean {
  return status === HTTP_STATUS.RATE_LIMITED || status >= HTTP_STATUS.INTERNAL_ERROR;
}

/**
 * Core search logic - exported for testing.
 * Queries Yelp Fusion API for service providers matching category and location.
 * 
 * Features:
 * - Exponential backoff retry for rate limits (429) and server errors (5xx)
 * - No retry for client errors (400, 401, 403, 404)
 * - Falls back to mock data after exhausting retries (never throws)
 * 
 * AI-PROOF: Retry logic mirrors YelpAIClient for consistency.
 */
export async function searchYelp(
  category: string,
  lat: number,
  lng: number
): Promise<YelpSearchOutput> {
  const apiKey = process.env.YELP_API_KEY;

  if (!apiKey) {
    // Return mock data if no API key configured
    logger.tool.debug("🔍 Yelp API key not configured, using mock data", { category });
    return { success: true, data: getMockProviders(category) };
  }

  const url = new URL(YELP_FUSION_API_URL);
  url.searchParams.set("term", category);
  url.searchParams.set("latitude", lat.toString());
  url.searchParams.set("longitude", lng.toString());
  url.searchParams.set("sort_by", "rating");

  // Retry loop with exponential backoff
  for (let attempt = 0; attempt < DEFAULT_RETRY_ATTEMPTS; attempt++) {
    try {
      logger.tool.debug(`🔍 Yelp Fusion API attempt ${attempt + 1}/${DEFAULT_RETRY_ATTEMPTS}`, {
        category,
        lat,
        lng,
      });

      const response = await fetch(url.toString(), {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      });

      if (!response.ok) {
        const isRetryable = shouldRetry(response.status);
        const isLastAttempt = attempt === DEFAULT_RETRY_ATTEMPTS - 1;

        // Log the error
        logger.tool.error(`⚠️ Yelp Fusion API error (attempt ${attempt + 1})`, {
          status: response.status,
          statusText: response.statusText,
          category,
          willRetry: isRetryable && !isLastAttempt,
        });

        // Handle rate limiting with Retry-After header if available
        if (response.status === HTTP_STATUS.RATE_LIMITED) {
          const retryAfter = response.headers.get("Retry-After");
          const waitTime = retryAfter
            ? parseInt(retryAfter, 10) * 1000
            : DEFAULT_RETRY_DELAY_MS * Math.pow(BACKOFF_MULTIPLIER, attempt);

          if (!isLastAttempt) {
            logger.system.warn(`⏳ Rate limited, waiting ${waitTime}ms before retry`);
            await sleep(waitTime);
            continue;
          }
        }

        // Retry on server errors with exponential backoff
        if (isRetryable && !isLastAttempt) {
          const waitTime = DEFAULT_RETRY_DELAY_MS * Math.pow(BACKOFF_MULTIPLIER, attempt);
          logger.system.warn(`⏳ Server error ${response.status}, retrying in ${waitTime}ms`);
          await sleep(waitTime);
          continue;
        }

        // Don't retry client errors (400, 401, 403) or if retries exhausted
        logger.tool.error("⚠️ Yelp Fusion API failed, falling back to mock data", {
          status: response.status,
          category,
          attemptsExhausted: isLastAttempt,
        });
        return { success: true, data: getMockProviders(category) };
      }

      // Success! Parse and filter the response
      const data: YelpSearchResponse = await response.json();

      // Filter by rating and review count thresholds
      const filtered = filterYelpBusinesses(data.businesses);

      // Transform to ServiceAgent objects
      const serviceAgents = filtered.map((b) =>
        transformToServiceAgent(b, category)
      );

      logger.tool.result("yelpSearch", true, {
        category,
        totalResults: data.businesses.length,
        filteredResults: serviceAgents.length,
      });

      return { success: true, data: serviceAgents };
    } catch (error) {
      const isLastAttempt = attempt === DEFAULT_RETRY_ATTEMPTS - 1;

      logger.tool.error(`⚠️ Yelp Fusion API exception (attempt ${attempt + 1})`, {
        error: error instanceof Error ? error.message : String(error),
        category,
        willRetry: !isLastAttempt,
      });

      if (!isLastAttempt) {
        const waitTime = DEFAULT_RETRY_DELAY_MS * Math.pow(BACKOFF_MULTIPLIER, attempt);
        await sleep(waitTime);
        continue;
      }

      // All retries exhausted, fall back to mock data
      logger.tool.error("⚠️ Yelp Fusion API retries exhausted, falling back to mock data", {
        category,
        totalAttempts: DEFAULT_RETRY_ATTEMPTS,
      });
      return { success: true, data: getMockProviders(category) };
    }
  }

  // Should never reach here, but TypeScript needs this
  return { success: true, data: getMockProviders(category) };
}

/**
 * Mastra tool wrapper for Yelp search functionality.
 * Queries Yelp Fusion API for service providers.
 */
export const yelpSearchTool = createTool({
  id: "yelp-search",
  description: "Queries Yelp Fusion API for service providers matching category and location",
  inputSchema: z.object({
    category: z.string(),
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
  }),
  outputSchema: YelpSearchOutputSchema,
  execute: async (context) => {
    const input = context as any;
    // Handle different context structures (direct input vs nested vs mastra context)
    const params = input.category ? input : (input.context || input.input || input);
    
    return searchYelp(params.category, params.lat, params.lng);
  },
});

/**
 * Input type for yelpSearchTool with span tracing
 */
export interface YelpSearchInput {
  category: string;
  lat: number;
  lng: number;
}

/**
 * Creates a traced version of the searchYelp function
 *
 * Wraps the searchYelp function with Opik span tracing to capture:
 * - Search parameters (category, lat, lng)
 * - Number of results
 * - Filtered count
 * - API latency
 * - Fallback usage
 *
 * Requirements: 3.2
 *
 * @param context - Parent trace context for linking spans
 * @returns A function that executes searchYelp with span tracing
 */
export function createTracedYelpSearch(
  context: ToolSpanContext
): (input: YelpSearchInput) => Promise<SpanWrappedResult<YelpSearchOutput>> {
  const wrapper = wrapYelpSearchTool<YelpSearchInput, YelpSearchOutput>(context);

  return wrapper(async (input: YelpSearchInput): Promise<YelpSearchOutput> => {
    return searchYelp(input.category, input.lat, input.lng);
  });
}

/**
 * Executes searchYelp with Opik span tracing
 *
 * Convenience function that creates a traced tool and executes it.
 *
 * @param category - Service category to search for
 * @param lat - Latitude of search location
 * @param lng - Longitude of search location
 * @param context - Parent trace context for linking spans
 * @returns Span-wrapped result with search output, spanId, and duration
 */
export async function executeTracedYelpSearch(
  category: string,
  lat: number,
  lng: number,
  context: ToolSpanContext
): Promise<SpanWrappedResult<YelpSearchOutput>> {
  const tracedTool = createTracedYelpSearch(context);
  return tracedTool({ category, lat, lng });
}
