// file: src/mastra/core/interfaces/memory.ts
// description: Memory interface definitions (ports) for conversation and user context storage
// reference: src/mastra/memory/conversation_memory.ts, src/mastra/memory/user_context_memory.ts

import * as z from "zod/v4";

// =============================================================================
// MESSAGE SCHEMAS
// =============================================================================

/**
 * Schema for a chat message
 */
export const MessageSchema = z.object({
  id: z.string(),
  session_id: z.string(),
  user_id: z.string(),
  role: z.enum(["user", "assistant", "system"]),
  content: z.string(),
  created_at: z.number(), // Unix timestamp
});

export type Message = z.infer<typeof MessageSchema>;

/**
 * Schema for message input (without id and created_at)
 */
export const MessageInputSchema = z.object({
  session_id: z.string(),
  user_id: z.string(),
  role: z.enum(["user", "assistant", "system"]),
  content: z.string(),
});

export type MessageInput = z.infer<typeof MessageInputSchema>;

// =============================================================================
// USER PREFERENCE SCHEMAS
// =============================================================================

/**
 * Schema for user preference
 */
export const UserPreferenceSchema = z.object({
  user_id: z.string(),
  key: z.string(),
  value: z.string(),
  updated_at: z.number(), // Unix timestamp
});

export type UserPreference = z.infer<typeof UserPreferenceSchema>;

/**
 * Schema for user context summary
 */
export const UserContextSchema = z.object({
  user_id: z.string(),
  preferences: z.record(z.string(), z.string()),
  favorite_providers: z.array(z.string()),
  recent_issues: z.array(z.string()),
  request_count: z.number(),
});

export type UserContext = z.infer<typeof UserContextSchema>;

// =============================================================================
// CONVERSATION MEMORY INTERFACE
// =============================================================================

/**
 * IConversationMemory - Session-based chat history storage
 *
 * Responsible for:
 * - Storing messages per session
 * - Retrieving conversation history
 * - Auto-pruning old messages
 *
 * Single Responsibility: Only handles message persistence
 */
export interface IConversationMemory {
  /**
   * Add a message to the conversation
   */
  add_message(input: MessageInput): Promise<Message>;

  /**
   * Get all messages for a session
   * @param session_id - Session identifier
   * @param limit - Maximum number of messages to return (most recent)
   */
  get_messages(session_id: string, limit?: number): Promise<Message[]>;

  /**
   * Get messages formatted for agent consumption
   * Returns array of {role, content} pairs
   */
  get_agent_messages(session_id: string, limit?: number): Promise<Array<{ role: string; content: string }>>;

  /**
   * Clear all messages for a session
   */
  clear_session(session_id: string): Promise<void>;

  /**
   * Prune old messages, keeping only the most recent N per session
   */
  prune(session_id: string, keep_count: number): Promise<number>;
}

// =============================================================================
// USER CONTEXT MEMORY INTERFACE
// =============================================================================

/**
 * IUserContextMemory - Long-term user preferences and history
 *
 * Responsible for:
 * - Storing user preferences
 * - Tracking favorite providers
 * - Summarizing user history patterns
 *
 * Single Responsibility: Only handles user context persistence
 */
export interface IUserContextMemory {
  /**
   * Set a user preference
   */
  set_preference(user_id: string, key: string, value: string): Promise<void>;

  /**
   * Get a user preference
   */
  get_preference(user_id: string, key: string): Promise<string | undefined>;

  /**
   * Get all preferences for a user
   */
  get_all_preferences(user_id: string): Promise<Record<string, string>>;

  /**
   * Add a provider to user's favorites
   */
  add_favorite_provider(user_id: string, provider_id: string): Promise<void>;

  /**
   * Remove a provider from user's favorites
   */
  remove_favorite_provider(user_id: string, provider_id: string): Promise<void>;

  /**
   * Get user's favorite providers
   */
  get_favorite_providers(user_id: string): Promise<string[]>;

  /**
   * Get full user context summary
   * Aggregates preferences, favorites, and history patterns
   */
  get_context(user_id: string): Promise<UserContext>;
}

// =============================================================================
// FACTORY TYPES
// =============================================================================

/**
 * Factory function type for creating conversation memory instances
 * Enables dependency injection and testing
 */
export type ConversationMemoryFactory = () => IConversationMemory;

/**
 * Factory function type for creating user context memory instances
 * Enables dependency injection and testing
 */
export type UserContextMemoryFactory = () => IUserContextMemory;

