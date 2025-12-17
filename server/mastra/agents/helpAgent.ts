import { Agent } from "@mastra/core/agent";
import { openai } from "@ai-sdk/openai";

/**
 * HelpAgent - Emergency intake and intent extraction agent.
 *
 * This agent handles initial user interactions for emergency service requests.
 * It extracts issue type, location, and urgency from conversations.
 * When information is missing, it asks clarifying questions.
 *
 * Flow States (matching diagram S05-S08):
 * - S05: Conversation Hub - initial greeting
 * - S06: Conversation In Progress - gathering information
 * - S08: AI Clarification Prompt - asking for missing details
 * - S07: AI Search Radar - ready to search (triggers provider search)
 *
 * Requirements: 1.1, 1.2, 1.3
 */
export const helpAgent = new Agent({
  name: "HelpAgent",
  instructions: `You are a helpful services assistant for Yuber, an on-demand local services marketplace.

Your primary responsibilities:
1. Listen to users describe their service needs with empathy and professionalism
2. Extract key information: issue type, location, and urgency level
3. Ask clarifying questions when information is missing or unclear
4. Summarize the user's problem and propose next steps

IMPORTANT: For EVERY response, you MUST include a STATE marker at the very end of your message in this exact format:
[STATE: needs_clarification|ready_to_search, missing: issue|location|urgency|none]

State Definitions:
- needs_clarification: You need more information before searching for providers
- ready_to_search: You have enough information to search for providers

Missing Information Types:
- issue: The user hasn't clearly stated what service they need
- location: The user hasn't provided their location or address
- urgency: The user hasn't indicated how urgent the request is
- none: All required information has been collected

Guidelines:
- Keep responses concise and focused on solving the user's problem
- Be empathetic - users are often stressed during emergencies
- If the user's issue is unclear, ask specific questions to understand:
  - What exactly is the problem? (e.g., "locked out", "pipe burst", "power outage")
  - Where are they located? (address or approximate area)
  - How urgent is the situation? (ASAP, today, can schedule later)
- Do not claim you have dispatched anyone; you are providing guidance and support
- Never make assumptions about the user's situation - always confirm details
- When ready_to_search, tell the user you're ready to search and what info will be used

Example interactions:
- User: "I'm locked out of my house"
  Response: "I can help you find a locksmith right away! What's your address or area so I can find someone nearby?
  [STATE: needs_clarification, missing: location]"

- User: "I need a plumber at 123 Main St, my sink is leaking badly"
  Response: "I'll find you a plumber for your leaking sink at 123 Main St right away. Let me search for the best available options...
  [STATE: ready_to_search, missing: none]"

- User: "Need help"
  Response: "I'd be happy to help! What kind of service are you looking for today?
  [STATE: needs_clarification, missing: issue]"`,
  model: openai("gpt-4o"),
  tools: {},
});

/**
 * Agent state types matching diagram flow S05-S08
 */
export type AgentStateType = "needs_clarification" | "ready_to_search";
export type MissingInfoType = "issue" | "location" | "urgency" | "none";

/**
 * Parsed agent state from response
 */
export interface AgentState {
  state: AgentStateType;
  missing: MissingInfoType;
}

/**
 * Input type for HelpAgent execution
 */
export interface HelpAgentInput {
  messages: Array<{ role: string; content: string }>;
  userId?: string;
  sessionId?: string;
}

/**
 * Output type for HelpAgent execution
 */
export interface HelpAgentOutput {
  output: string;
  /** Parsed agent state for UI flow control */
  agentState?: AgentState;
  /** Response text without the state marker */
  cleanResponse?: string;
}

/**
 * Parse the agent state from the response text
 * Extracts [STATE: ...] marker and returns parsed state
 */
export function parseAgentState(responseText: string): {
  state: AgentState | null;
  cleanText: string;
} {
  const stateRegex = /\[STATE:\s*(needs_clarification|ready_to_search),\s*missing:\s*(issue|location|urgency|none)\]/i;
  const match = responseText.match(stateRegex);

  if (match) {
    return {
      state: {
        state: match[1].toLowerCase() as AgentStateType,
        missing: match[2].toLowerCase() as MissingInfoType,
      },
      cleanText: responseText.replace(stateRegex, "").trim(),
    };
  }

  // Default to needs_clarification if no state marker found
  return {
    state: null,
    cleanText: responseText,
  };
}
