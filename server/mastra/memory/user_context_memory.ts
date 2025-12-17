// file: src/mastra/memory/user_context_memory.ts
// description: Turso-backed implementation of user context memory for long-term preferences and history
// reference: src/mastra/core/interfaces/memory.ts, src/lib/db/store.ts

import { execute } from "@/lib/turso";
import { SQL } from "@/lib/db/schema";
import { store } from "@/store";
import { logger } from "@/lib/logger";
import type { IUserContextMemory, UserContext } from "@/mastra/core/interfaces/memory";

// =============================================================================
// CONSTANTS
// =============================================================================

/**
 * Preference key for storing favorite providers as JSON array
 */
const FAVORITES_KEY = "favorite_providers";

/**
 * Maximum number of recent issues to track
 */
const MAX_RECENT_ISSUES = 10;

// =============================================================================
// USER CONTEXT MEMORY IMPLEMENTATION
// =============================================================================

/**
 * TursoUserContextMemory - Long-term user preferences and history backed by Turso
 *
 * Implements IUserContextMemory interface for persistent user context.
 * Stores preferences in dedicated table and derives history from existing data.
 *
 * Features:
 * - Key-value preference storage
 * - Favorite providers management
 * - Aggregated user context from requests/dispatches
 *
 * Single Responsibility: Only handles user context persistence operations
 */
export class TursoUserContextMemory implements IUserContextMemory {
  /**
   * Set a user preference
   */
  async set_preference(user_id: string, key: string, value: string): Promise<void> {
    // Ensure user exists first
    await store.ensureUser(user_id);

    await execute(SQL.UPSERT_PREFERENCE, {
      user_id,
      key,
      value,
    });

    logger.store.debug("Preference set", { user_id, key });
  }

  /**
   * Get a user preference
   */
  async get_preference(user_id: string, key: string): Promise<string | undefined> {
    const result = await execute(SQL.GET_PREFERENCE, { user_id, key });

    if (result.rows.length === 0) {
      return undefined;
    }

    return (result.rows[0] as unknown as { value: string }).value;
  }

  /**
   * Get all preferences for a user
   */
  async get_all_preferences(user_id: string): Promise<Record<string, string>> {
    const result = await execute(SQL.GET_ALL_PREFERENCES, { user_id });

    const preferences: Record<string, string> = {};
    for (const row of result.rows as unknown as Array<{ key: string; value: string }>) {
      preferences[row.key] = row.value;
    }

    return preferences;
  }

  /**
   * Add a provider to user's favorites
   * Stores as JSON array in preferences
   */
  async add_favorite_provider(user_id: string, provider_id: string): Promise<void> {
    const favorites = await this.get_favorite_providers(user_id);

    // Don't add duplicates
    if (!favorites.includes(provider_id)) {
      favorites.push(provider_id);
      await this.set_preference(user_id, FAVORITES_KEY, JSON.stringify(favorites));
      logger.store.debug("Favorite provider added", { user_id, provider_id });
    }
  }

  /**
   * Remove a provider from user's favorites
   */
  async remove_favorite_provider(user_id: string, provider_id: string): Promise<void> {
    const favorites = await this.get_favorite_providers(user_id);
    const filtered = favorites.filter((id) => id !== provider_id);

    if (filtered.length !== favorites.length) {
      await this.set_preference(user_id, FAVORITES_KEY, JSON.stringify(filtered));
      logger.store.debug("Favorite provider removed", { user_id, provider_id });
    }
  }

  /**
   * Get user's favorite providers
   */
  async get_favorite_providers(user_id: string): Promise<string[]> {
    const favorites_json = await this.get_preference(user_id, FAVORITES_KEY);

    if (!favorites_json) {
      return [];
    }

    try {
      return JSON.parse(favorites_json) as string[];
    } catch {
      logger.store.debug("Failed to parse favorites, returning empty", { user_id });
      return [];
    }
  }

  /**
   * Get full user context summary
   * Aggregates preferences, favorites, and history patterns from existing data
   */
  async get_context(user_id: string): Promise<UserContext> {
    // Get preferences
    const preferences = await this.get_all_preferences(user_id);

    // Get favorites (already parsed)
    const favorite_providers = await this.get_favorite_providers(user_id);

    // Get recent issues from user's requests
    const requests = await store.getRequestsByUserId(user_id);
    const recent_issues = requests
      .slice(0, MAX_RECENT_ISSUES)
      .map((req) => req.issue)
      .filter((issue): issue is string => Boolean(issue));

    return {
      user_id,
      preferences,
      favorite_providers,
      recent_issues,
      request_count: requests.length,
    };
  }
}

// =============================================================================
// SINGLETON INSTANCE
// =============================================================================

/**
 * Default singleton instance of user context memory
 */
export const user_context_memory = new TursoUserContextMemory();

// =============================================================================
// FACTORY
// =============================================================================

/**
 * Factory function to create user context memory instances
 * Useful for testing
 */
export function create_user_context_memory(): IUserContextMemory {
  return new TursoUserContextMemory();
}

