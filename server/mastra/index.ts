// file: src/mastra/index.ts
// description: Unified Mastra facade - single entry point for all AI agent functionality
// reference: src/mastra/core/functions/, src/mastra/agents/, src/mastra/memory/

import { Mastra } from "@mastra/core";

// =============================================================================
// CORE FUNCTIONS (Public API)
// =============================================================================

import {
  chat,
  chat_stream,
  search_providers,
  dispatch,
  get_history,
} from "@/mastra/core/functions";

// =============================================================================
// INTERNAL IMPORTS (Private - used by facade)
// =============================================================================

// Agents
import { helpAgent } from "@/mastra/agents/helpAgent";
import { dispatchAgent } from "@/mastra/agents/dispatchAgent";

// Workflows
import { emergencyWorkflow } from "@/mastra/workflows/emergencyWorkflow";

// Memory
import { conversation_memory, user_context_memory } from "@/mastra/memory";

// =============================================================================
// MASTRA INSTANCE
// =============================================================================

/**
 * Internal Mastra instance for direct agent/workflow access
 * Use the `mastra` facade object for most operations
 */
export const mastraInstance = new Mastra({
  agents: {
    helpAgent,
    dispatchAgent,
  },
  workflows: {
    emergencyWorkflow,
  },
});

// =============================================================================
// UNIFIED FACADE
// =============================================================================

/**
 * Mastra Facade - Clean API for Yuber Backend
 *
 * Provides 4 core functions following Clean Architecture principles:
 *
 * 1. chat(session_id, user_id, message) - Conversational AI with memory
 * 2. search_providers(issue/category, location) - Find service providers
 * 3. dispatch(request_id, provider_id) - Assign provider to request
 * 4. get_history(user_id) - User's requests, favorites, conversations
 *
 * Uncle Bob Principles Applied:
 * - Single Responsibility: Each function does ONE thing
 * - Dependency Inversion: Functions use interfaces, not implementations
 * - Interface Segregation: Small, focused function signatures
 * - Open/Closed: Memory implementations are swappable
 *
 * AI-Proofing:
 * - Zod schemas at all boundaries
 * - Memory is injectable for testing
 * - Functions are composable
 * - Tracing-ready via Opik wrappers
 */
export const mastra = {
  // -------------------------------------------------------------------------
  // Core Functions
  // -------------------------------------------------------------------------

  /**
   * Conversational AI intake with memory
   *
   * Executes the HelpAgent with conversation history and user context.
   * Stores messages for multi-turn conversations.
   *
   * @example
   * ```ts
   * const result = await mastra.chat({
   *   session_id: "session-123",
   *   user_id: "user-456",
   *   message: "I'm locked out of my house"
   * });
   * ```
   */
  chat,

  /**
   * Streaming version of chat
   *
   * Returns a ReadableStream for real-time response streaming.
   *
   * @example
   * ```ts
   * const { stream, session_id } = await mastra.chat_stream({
   *   session_id: "session-123",
   *   user_id: "user-456",
   *   message: "I need help"
   * });
   * ```
   */
  chat_stream,

  /**
   * Find service providers by issue or category
   *
   * Auto-categorizes issue text if no category provided.
   * Queries Yelp for matching providers.
   *
   * @example
   * ```ts
   * const result = await mastra.search_providers({
   *   issue: "locked out of my car",
   *   location: { lat: 37.7749, lng: -122.4194 }
   * });
   * ```
   */
  search_providers,

  /**
   * Assign a service provider to a request
   *
   * Creates dispatch record with ETA and cost estimate.
   * Updates request status to "dispatched".
   *
   * @example
   * ```ts
   * const result = await mastra.dispatch({
   *   request_id: "req-123",
   *   provider_id: "yelp-biz-456"
   * });
   * ```
   */
  dispatch,

  /**
   * Get user's request history and favorites
   *
   * Aggregates requests, dispatches, and preferences.
   *
   * @example
   * ```ts
   * const result = await mastra.get_history({
   *   user_id: "user-456",
   *   limit: 10
   * });
   * ```
   */
  get_history,

  // -------------------------------------------------------------------------
  // Memory Access (for advanced use cases)
  // -------------------------------------------------------------------------

  /**
   * Direct access to conversation memory
   * Use for session management, clearing history, etc.
   */
  memory: {
    conversation: conversation_memory,
    user_context: user_context_memory,
  },

  // -------------------------------------------------------------------------
  // Internal Instance (for direct agent access if needed)
  // -------------------------------------------------------------------------

  /**
   * Direct access to Mastra instance
   * Use sparingly - prefer the core functions above
   */
  instance: mastraInstance,
};

// =============================================================================
// TYPE EXPORTS
// =============================================================================

// Core function types
export type {
  ChatInput,
  ChatOutput,
  ChatDependencies,
  SearchProvidersInput,
  SearchProvidersOutput,
  DispatchInput,
  DispatchOutput,
  GetHistoryInput,
  GetHistoryOutput,
  GetHistoryDependencies,
  RequestWithDispatch,
  ConversationSummary,
} from "@/mastra/core/functions";

// Memory interface types
export type {
  Message,
  MessageInput,
  UserPreference,
  UserContext,
  IConversationMemory,
  IUserContextMemory,
} from "@/mastra/core/interfaces";

// Schema types
export type {
  Location,
  RequestStatus,
  PaymentStatus,
  UserRequest,
  ServiceAgent,
  DispatchResult,
  Payment,
} from "@/mastra/schemas";

// =============================================================================
// SCHEMA EXPORTS
// =============================================================================

export {
  ChatInputSchema,
  ChatOutputSchema,
  SearchProvidersInputSchema,
  SearchProvidersOutputSchema,
  DispatchInputSchema,
  DispatchOutputSchema,
  GetHistoryInputSchema,
  GetHistoryOutputSchema,
} from "@/mastra/core/functions";

export {
  MessageSchema,
  MessageInputSchema,
  UserPreferenceSchema,
  UserContextSchema,
} from "@/mastra/core/interfaces";

// =============================================================================
// BACKWARD COMPATIBILITY EXPORTS
// =============================================================================

// Re-export agents for existing code that imports directly
export { helpAgent } from "@/mastra/agents/helpAgent";
export { dispatchAgent } from "@/mastra/agents/dispatchAgent";

// Re-export workflow for existing code
export { emergencyWorkflow } from "@/mastra/workflows/emergencyWorkflow";

// Re-export tools for existing code
export { categorizeIssueTool } from "@/mastra/tools/categorizeIssueTool";
export { yelpSearchTool } from "@/mastra/tools/yelpSearchTool";
export { dispatchAgentTool } from "@/mastra/tools/dispatchAgentTool";
export { processPaymentTool } from "@/mastra/tools/processPaymentTool";
export { getHistoryTool } from "@/mastra/tools/getHistoryTool";
