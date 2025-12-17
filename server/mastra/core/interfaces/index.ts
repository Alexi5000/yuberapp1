// file: src/mastra/core/interfaces/index.ts
// description: Barrel export for memory interfaces
// reference: src/mastra/memory/

export {
  // Message types
  MessageSchema,
  MessageInputSchema,
  type Message,
  type MessageInput,

  // User preference types
  UserPreferenceSchema,
  UserContextSchema,
  type UserPreference,
  type UserContext,

  // Memory interfaces
  type IConversationMemory,
  type IUserContextMemory,

  // Factory types
  type ConversationMemoryFactory,
  type UserContextMemoryFactory,
} from "./memory";

