// file: src/mastra/core/functions/chat.ts
// description: Conversational AI intake with memory - core function for agent chat
// reference: src/mastra/agents/helpAgent.ts, src/mastra/memory/conversation_memory.ts

import * as z from "zod/v4";
import { helpAgent } from "@/mastra/agents/helpAgent";
import { conversation_memory } from "@/mastra/memory/conversation_memory";
import { user_context_memory } from "@/mastra/memory/user_context_memory";
import { logger } from "@/lib/logger";
import type { IConversationMemory, IUserContextMemory } from "@/mastra/core/interfaces/memory";

// =============================================================================
// SCHEMAS
// =============================================================================

/**
 * Input schema for chat function
 */
export const ChatInputSchema = z.object({
  session_id: z.string().min(1),
  user_id: z.string().min(1),
  message: z.string().min(1),
});

export type ChatInput = z.infer<typeof ChatInputSchema>;

/**
 * Output schema for chat function
 */
export const ChatOutputSchema = z.object({
  success: z.boolean(),
  response: z.string().optional(),
  session_id: z.string(),
  message_count: z.number(),
  error: z.object({
    code: z.string(),
    message: z.string(),
  }).optional(),
});

export type ChatOutput = z.infer<typeof ChatOutputSchema>;

// =============================================================================
// CONFIGURATION
// =============================================================================

/**
 * Maximum messages to include in agent context
 */
const MAX_CONTEXT_MESSAGES = 20;

/**
 * Prune messages when session exceeds this count
 */
const PRUNE_THRESHOLD = 50;

// =============================================================================
// CHAT FUNCTION
// =============================================================================

/**
 * Dependencies for chat function - enables dependency injection
 */
export interface ChatDependencies {
  conversation_memory: IConversationMemory;
  user_context_memory: IUserContextMemory;
}

/**
 * Default dependencies using singleton instances
 */
const default_dependencies: ChatDependencies = {
  conversation_memory,
  user_context_memory,
};

/**
 * chat - Conversational AI intake with memory
 *
 * Executes the HelpAgent with conversation context and user preferences.
 * Stores messages for multi-turn conversations.
 *
 * Features:
 * - Persists conversation history per session
 * - Includes user context (preferences, past issues) in agent prompt
 * - Auto-prunes old messages to prevent unbounded growth
 * - Streams responses from agent
 *
 * Single Responsibility: Orchestrates agent execution with memory
 *
 * @param input - Session ID, user ID, and message
 * @param deps - Optional dependencies for testing
 * @returns Agent response with session metadata
 */
export async function chat(
  input: ChatInput,
  deps: ChatDependencies = default_dependencies
): Promise<ChatOutput> {
  const { session_id, user_id, message } = input;
  const { conversation_memory: conv_mem, user_context_memory: ctx_mem } = deps;

  logger.agent.invoke("HelpAgent", { session_id, user_id });

  try {
    // Store user message
    await conv_mem.add_message({
      session_id,
      user_id,
      role: "user",
      content: message,
    });

    // Get conversation history for context
    const history = await conv_mem.get_agent_messages(session_id, MAX_CONTEXT_MESSAGES);

    // Get user context for personalization
    const user_context = await ctx_mem.get_context(user_id);

    // Build system message with user context
    const context_note = user_context.request_count > 0
      ? `\n\nUser context: This user has made ${user_context.request_count} previous requests.`
      + (user_context.recent_issues.length > 0
        ? ` Recent issues: ${user_context.recent_issues.slice(0, 3).join(", ")}.`
        : "")
      : "";

    // Prepare messages for agent
    const messages = [
      ...(context_note ? [{ role: "system" as const, content: context_note }] : []),
      ...history,
    ];

    // Execute agent - cast messages to match Mastra's expected type
    const response = await helpAgent.generate(
      messages as Parameters<typeof helpAgent.generate>[0]
    );

    // Store assistant response
    await conv_mem.add_message({
      session_id,
      user_id,
      role: "assistant",
      content: response.text,
    });

    // Get current message count
    const all_messages = await conv_mem.get_messages(session_id);
    const message_count = all_messages.length;

    // Auto-prune if needed
    if (message_count > PRUNE_THRESHOLD) {
      await conv_mem.prune(session_id, PRUNE_THRESHOLD);
    }

    logger.agent.response("HelpAgent", { session_id, message_count });

    return {
      success: true,
      response: response.text,
      session_id,
      message_count,
    };
  } catch (error) {
    logger.agent.error("HelpAgent", {
      session_id,
      error: error instanceof Error ? error.message : String(error),
    });

    return {
      success: false,
      session_id,
      message_count: 0,
      error: {
        code: "CHAT_ERROR",
        message: error instanceof Error ? error.message : "Unknown error",
      },
    };
  }
}

/**
 * chat_stream - Streaming version of chat
 *
 * Returns a ReadableStream for real-time response streaming.
 * Messages are still persisted after stream completes.
 *
 * @param input - Session ID, user ID, and message
 * @param deps - Optional dependencies for testing
 * @returns ReadableStream of agent response chunks
 */
export async function chat_stream(
  input: ChatInput,
  deps: ChatDependencies = default_dependencies
): Promise<{ stream: ReadableStream<Uint8Array>; session_id: string }> {
  const { session_id, user_id, message } = input;
  const { conversation_memory: conv_mem, user_context_memory: ctx_mem } = deps;

  logger.agent.invoke("HelpAgent", { session_id, user_id, streaming: true });

  // Store user message
  await conv_mem.add_message({
    session_id,
    user_id,
    role: "user",
    content: message,
  });

  // Get conversation history
  const history = await conv_mem.get_agent_messages(session_id, MAX_CONTEXT_MESSAGES);

  // Get user context
  const user_context = await ctx_mem.get_context(user_id);
  const context_note = user_context.request_count > 0
    ? `\n\nUser context: This user has made ${user_context.request_count} previous requests.`
    : "";

  // Prepare messages
  const messages = [
    ...(context_note ? [{ role: "system" as const, content: context_note }] : []),
    ...history,
  ];

  // Stream from agent - cast messages to match Mastra's expected type
  const agent_stream = await helpAgent.stream(
    messages as Parameters<typeof helpAgent.stream>[0]
  );

  // Collect full response for storage
  let full_response = "";
  const encoder = new TextEncoder();

  const readable_stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const chunk of agent_stream.textStream) {
          full_response += chunk;
          controller.enqueue(encoder.encode(chunk));
        }

        // Store complete response
        await conv_mem.add_message({
          session_id,
          user_id,
          role: "assistant",
          content: full_response,
        });

        controller.close();
      } catch (error) {
        controller.error(error);
      }
    },
  });

  return { stream: readable_stream, session_id };
}

