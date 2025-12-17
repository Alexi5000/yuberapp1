// file: src/mastra/core/functions/get_history.ts
// description: Get user's request history, conversations, and favorites
// reference: src/lib/db/store.ts, src/mastra/memory/user_context_memory.ts

import * as z from "zod/v4";
import { store } from "@/store";
import { user_context_memory } from "@/mastra/memory/user_context_memory";
import { conversation_memory } from "@/mastra/memory/conversation_memory";
import { UserRequestSchema, DispatchResultSchema } from "@/mastra/schemas";
import { logger } from "@/lib/logger";
import type { IConversationMemory, IUserContextMemory } from "@/mastra/core/interfaces/memory";

// =============================================================================
// SCHEMAS
// =============================================================================

/**
 * Input schema for get_history function
 */
export const GetHistoryInputSchema = z.object({
  user_id: z.string().min(1),
  include_conversations: z.boolean().optional().default(false),
  limit: z.number().optional().default(10),
});

export type GetHistoryInput = z.infer<typeof GetHistoryInputSchema>;

/**
 * Request with optional dispatch info
 */
export const RequestWithDispatchSchema = UserRequestSchema.extend({
  dispatch: DispatchResultSchema.optional(),
});

export type RequestWithDispatch = z.infer<typeof RequestWithDispatchSchema>;

/**
 * Conversation summary schema
 */
export const ConversationSummarySchema = z.object({
  session_id: z.string(),
  message_count: z.number(),
  last_message_at: z.number(),
  preview: z.string(),
});

export type ConversationSummary = z.infer<typeof ConversationSummarySchema>;

/**
 * Output schema for get_history function
 */
export const GetHistoryOutputSchema = z.object({
  success: z.boolean(),
  user_id: z.string(),
  requests: z.array(RequestWithDispatchSchema).optional(),
  favorites: z.array(z.string()).optional(),
  conversations: z.array(ConversationSummarySchema).optional(),
  preferences: z.record(z.string(), z.string()).optional(),
  error: z.object({
    code: z.string(),
    message: z.string(),
  }).optional(),
});

export type GetHistoryOutput = z.infer<typeof GetHistoryOutputSchema>;

// =============================================================================
// DEPENDENCIES
// =============================================================================

/**
 * Dependencies for get_history function
 */
export interface GetHistoryDependencies {
  user_context_memory: IUserContextMemory;
  conversation_memory: IConversationMemory;
}

const default_dependencies: GetHistoryDependencies = {
  user_context_memory,
  conversation_memory,
};

// =============================================================================
// GET HISTORY FUNCTION
// =============================================================================

/**
 * get_history - Get user's request history, favorites, and conversations
 *
 * Aggregates user data from multiple sources:
 * - Service requests from store
 * - Dispatches for each request
 * - Favorite providers from user context
 * - Conversation summaries (optional)
 *
 * Features:
 * - Paginated request history
 * - Includes dispatch details for each request
 * - Favorite providers list
 * - User preferences
 * - Optional conversation summaries
 *
 * Single Responsibility: User history aggregation
 *
 * @param input - User ID and options
 * @param deps - Optional dependencies for testing
 * @returns Aggregated user history
 */
export async function get_history(
  input: GetHistoryInput,
  deps: GetHistoryDependencies = default_dependencies
): Promise<GetHistoryOutput> {
  const { user_id, include_conversations, limit } = input;
  const { user_context_memory: ctx_mem } = deps;

  logger.tool.execute("get_history", { user_id, include_conversations, limit });

  try {
    // Get user requests
    const all_requests = await store.getRequestsByUserId(user_id);
    const requests = all_requests.slice(0, limit);

    // Enrich requests with dispatch info
    const requests_with_dispatch: RequestWithDispatch[] = await Promise.all(
      requests.map(async (request) => {
        if (request.dispatchId) {
          const dispatch_data = await store.getDispatch(request.dispatchId);
          return { ...request, dispatch: dispatch_data };
        }
        return request;
      })
    );

    // Get user context
    const favorites = await ctx_mem.get_favorite_providers(user_id);
    const preferences = await ctx_mem.get_all_preferences(user_id);

    // Build response
    const response: GetHistoryOutput = {
      success: true,
      user_id,
      requests: requests_with_dispatch,
      favorites,
      preferences,
    };

    // Include conversation summaries if requested
    // Note: This is a simplified implementation - in production you'd want
    // to query sessions by user_id from a sessions table
    if (include_conversations) {
      // Placeholder - would need session tracking to fully implement
      response.conversations = [];
    }

    logger.tool.result("get_history", true, {
      request_count: requests.length,
      favorite_count: favorites.length,
    });

    return response;
  } catch (error) {
    logger.tool.error("get_history failed", error);

    return {
      success: false,
      user_id,
      error: {
        code: "HISTORY_ERROR",
        message: error instanceof Error ? error.message : "Unknown error",
      },
    };
  }
}

