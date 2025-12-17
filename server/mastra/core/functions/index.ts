// file: src/mastra/core/functions/index.ts
// description: Barrel export for core Mastra functions
// reference: src/mastra/index.ts

// Chat function - Conversational AI intake with memory
export {
  chat,
  chat_stream,
  ChatInputSchema,
  ChatOutputSchema,
  type ChatInput,
  type ChatOutput,
  type ChatDependencies,
} from "./chat";

// Search providers function - Find service providers
export {
  search_providers,
  SearchProvidersInputSchema,
  SearchProvidersOutputSchema,
  type SearchProvidersInput,
  type SearchProvidersOutput,
} from "./search_providers";

// Dispatch function - Assign provider to request
export {
  dispatch,
  DispatchInputSchema,
  DispatchOutputSchema,
  type DispatchInput,
  type DispatchOutput,
} from "./dispatch";

// Get history function - User's requests and favorites
export {
  get_history,
  GetHistoryInputSchema,
  GetHistoryOutputSchema,
  RequestWithDispatchSchema,
  ConversationSummarySchema,
  type GetHistoryInput,
  type GetHistoryOutput,
  type GetHistoryDependencies,
  type RequestWithDispatch,
  type ConversationSummary,
} from "./get_history";

