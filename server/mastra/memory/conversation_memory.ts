// file: src/mastra/memory/conversation_memory.ts
// description: Turso-backed implementation of conversation memory for session-based chat history
// reference: src/mastra/core/interfaces/memory.ts, src/lib/turso.ts

import { v4 as uuidv4 } from "uuid";
import { execute } from "@/lib/turso";
import { SQL } from "@/lib/db/schema";
import { logger } from "@/lib/logger";
import type {
  IConversationMemory,
  Message,
  MessageInput,
} from "@/mastra/core/interfaces/memory";

// =============================================================================
// ROW TYPE
// =============================================================================

interface MessageRow {
  id: string;
  session_id: string;
  user_id: string;
  role: string;
  content: string;
  created_at: number;
}

/**
 * Convert database row to Message type
 */
function row_to_message(row: MessageRow): Message {
  return {
    id: row.id,
    session_id: row.session_id,
    user_id: row.user_id,
    role: row.role as "user" | "assistant" | "system",
    content: row.content,
    created_at: row.created_at,
  };
}

// =============================================================================
// CONVERSATION MEMORY IMPLEMENTATION
// =============================================================================

/**
 * TursoConversationMemory - Persistent conversation storage backed by Turso/LibSQL
 *
 * Implements IConversationMemory interface for session-based chat history.
 * Messages are stored per session and can be retrieved for agent context.
 *
 * Features:
 * - Add messages to sessions
 * - Retrieve messages with optional limit
 * - Format messages for agent consumption
 * - Auto-prune old messages to prevent unbounded growth
 *
 * Single Responsibility: Only handles message persistence operations
 */
export class TursoConversationMemory implements IConversationMemory {
  /**
   * Default maximum messages to keep per session when pruning
   */
  private readonly default_keep_count: number;

  constructor(default_keep_count: number = 50) {
    this.default_keep_count = default_keep_count;
  }

  /**
   * Add a message to the conversation
   */
  async add_message(input: MessageInput): Promise<Message> {
    const id = uuidv4();

    await execute(SQL.INSERT_MESSAGE, {
      id,
      session_id: input.session_id,
      user_id: input.user_id,
      role: input.role,
      content: input.content,
    });

    // Fetch the created message to get the timestamp
    const result = await execute(
      "SELECT * FROM messages WHERE id = :id",
      { id }
    );

    const row = result.rows[0] as unknown as MessageRow;
    const message = row_to_message(row);

    logger.store.debug("Message added", {
      session_id: input.session_id,
      role: input.role,
    });

    return message;
  }

  /**
   * Get all messages for a session
   * @param session_id - Session identifier
   * @param limit - Maximum number of messages to return (most recent)
   */
  async get_messages(session_id: string, limit?: number): Promise<Message[]> {
    let result;

    if (limit) {
      // Get most recent messages (descending), then reverse to chronological order
      result = await execute(SQL.GET_MESSAGES_BY_SESSION_LIMIT, {
        session_id,
        limit,
      });
      const rows = result.rows as unknown as MessageRow[];
      return rows.map(row_to_message).reverse();
    } else {
      // Get all messages in chronological order
      result = await execute(SQL.GET_MESSAGES_BY_SESSION, { session_id });
      const rows = result.rows as unknown as MessageRow[];
      return rows.map(row_to_message);
    }
  }

  /**
   * Get messages formatted for agent consumption
   * Returns array of {role, content} pairs in chronological order
   */
  async get_agent_messages(
    session_id: string,
    limit?: number
  ): Promise<Array<{ role: string; content: string }>> {
    const messages = await this.get_messages(session_id, limit);

    return messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));
  }

  /**
   * Clear all messages for a session
   */
  async clear_session(session_id: string): Promise<void> {
    await execute(SQL.DELETE_MESSAGES_BY_SESSION, { session_id });

    logger.store.debug("Session cleared", { session_id });
  }

  /**
   * Prune old messages, keeping only the most recent N per session
   * @returns Number of messages deleted
   */
  async prune(session_id: string, keep_count?: number): Promise<number> {
    const count_to_keep = keep_count ?? this.default_keep_count;

    // Get count before pruning
    const before_result = await execute(SQL.COUNT_MESSAGES_BY_SESSION, {
      session_id,
    });
    const before_count = (before_result.rows[0] as unknown as { count: number }).count;

    // Prune
    await execute(SQL.PRUNE_MESSAGES, {
      session_id,
      keep_count: count_to_keep,
    });

    // Get count after pruning
    const after_result = await execute(SQL.COUNT_MESSAGES_BY_SESSION, {
      session_id,
    });
    const after_count = (after_result.rows[0] as unknown as { count: number }).count;

    const deleted = before_count - after_count;

    if (deleted > 0) {
      logger.store.debug("Messages pruned", {
        session_id,
        deleted,
        remaining: after_count,
      });
    }

    return deleted;
  }
}

// =============================================================================
// SINGLETON INSTANCE
// =============================================================================

/**
 * Default singleton instance of conversation memory
 */
export const conversation_memory = new TursoConversationMemory();

// =============================================================================
// FACTORY
// =============================================================================

/**
 * Factory function to create conversation memory instances
 * Useful for testing with different configurations
 */
export function create_conversation_memory(
  default_keep_count?: number
): IConversationMemory {
  return new TursoConversationMemory(default_keep_count);
}

