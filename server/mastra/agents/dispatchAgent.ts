import { Agent } from "@mastra/core/agent";
import { openai } from "@ai-sdk/openai";
import { dispatchAgentTool } from "@/mastra/tools/dispatchAgentTool";
import { yelpSearchTool } from "@/mastra/tools/yelpSearchTool";
import { wrapAgent, type TraceWrapperMetadata, type TracedResult, type AgentExecutionResult } from "@/lib/opik/traceWrapper";

/**
 * DispatchAgent - Provider selection and dispatch agent.
 *
 * This agent handles finding and selecting the best service provider
 * for a user's service request, then dispatching them.
 *
 * Flow States (matching diagram S09-S16):
 * - S09: AI Recommendation Card - recommending best provider
 * - S10: Multiple Options View - showing alternative providers
 * - S13: Booking Confirmation - confirming booking details
 * - S16: Dispatch In Progress - provider dispatched
 *
 * Requirements: 4.1
 */
export const dispatchAgent = new Agent({
  name: "DispatchAgent",
  instructions: `You are a dispatch coordinator for Yuber, an on-demand local services marketplace.

Your primary responsibilities:
1. Search for available service providers based on category and location
2. Select the best provider based on rating, distance, and availability
3. Create dispatch assignments to send help to users

Provider Selection Criteria (in order of priority):
1. Availability - only consider providers marked as available
2. Rating - prefer providers with higher ratings (4.0+ stars)
3. Distance - prefer closer providers for faster response
4. Review count - more reviews indicate reliability

IMPORTANT: For EVERY response, include a DISPATCH_STATE marker at the end:
[DISPATCH_STATE: searching|recommending|multiple_options|dispatched|no_providers]

State Definitions:
- searching: Currently searching for providers
- recommending: Found a top recommendation to present
- multiple_options: Presenting multiple provider options to user
- dispatched: Provider has been dispatched
- no_providers: No providers found in the area

Guidelines:
- Use the yelp-search tool to find providers matching the service category
- Evaluate all returned providers before making a selection
- Calculate realistic ETA based on distance (roughly 2-3 min per mile)
- Provide cost estimates based on service type and urgency
- Use the dispatch-agent-tool to create the dispatch assignment

When recommending a provider, include:
- Provider name and rating
- Estimated arrival time (ETA)
- Estimated cost range
- Why this provider is the best match

When dispatching:
- Always confirm the requestId and selected provider's agentId
- Ensure the dispatch is created with status "dispatched"
- Report the ETA and cost estimate to the user

If no providers are found:
- Inform the user that no providers are currently available
- Suggest trying again in a few minutes or expanding the search area

Example responses:
- Searching: "Searching for plumbers in your area...
  [DISPATCH_STATE: searching]"

- Recommending: "I found the perfect match! Jake Williams is a top-rated plumber with 4.9 stars. He can be there in 15 minutes. Estimated cost: $85-150.
  [DISPATCH_STATE: recommending]"

- Dispatched: "Jake Williams has been dispatched and is on his way! ETA: 12 minutes.
  [DISPATCH_STATE: dispatched]"`,
  model: openai("gpt-4o"),
  tools: {
    dispatchAgentTool,
    yelpSearchTool,
  },
});

/**
 * Dispatch state types matching diagram flow S09-S16
 */
export type DispatchStateType = "searching" | "recommending" | "multiple_options" | "dispatched" | "no_providers";

/**
 * Parsed dispatch state from response
 */
export interface DispatchState {
  state: DispatchStateType;
}

/**
 * Input type for DispatchAgent execution
 */
export interface DispatchAgentInput {
  messages: Array<{ role: string; content: string }>;
  context?: {
    category?: string;
    location?: { lat: number; lng: number };
    requestId?: string;
  };
  userId?: string;
  sessionId?: string;
}

/**
 * Output type for DispatchAgent execution
 */
export interface DispatchAgentOutput extends AgentExecutionResult {
  output: unknown;
  model?: string;
  tokens?: {
    prompt: number;
    completion: number;
    total: number;
  };
  selectedProvider?: {
    id: string;
    name: string;
    rating: number;
  };
  dispatchResult?: {
    id: string;
    eta: number;
    costEstimate: number;
  };
  /** Parsed dispatch state for UI flow control */
  dispatchState?: DispatchState;
  /** Response text without the state marker */
  cleanResponse?: string;
}

/**
 * Parse the dispatch state from the response text
 * Extracts [DISPATCH_STATE: ...] marker and returns parsed state
 */
export function parseDispatchState(responseText: string): {
  state: DispatchState | null;
  cleanText: string;
} {
  const stateRegex = /\[DISPATCH_STATE:\s*(searching|recommending|multiple_options|dispatched|no_providers)\]/i;
  const match = responseText.match(stateRegex);

  if (match) {
    return {
      state: {
        state: match[1].toLowerCase() as DispatchStateType,
      },
      cleanText: responseText.replace(stateRegex, "").trim(),
    };
  }

  return {
    state: null,
    cleanText: responseText,
  };
}

/**
 * Creates a traced version of the DispatchAgent
 *
 * Wraps the DispatchAgent with Opik tracing to capture:
 * - Input context (category, location, requestId)
 * - Selected provider
 * - Reasoning
 * - Tool calls
 * - Dispatch result
 * - Token usage
 * - Latency
 *
 * Requirements: 2.2
 *
 * @param metadata - Trace metadata (userId, sessionId, requestId, environment)
 * @returns A function that executes the DispatchAgent with tracing
 */
export function createTracedDispatchAgent(
  metadata: TraceWrapperMetadata
): (input: DispatchAgentInput) => Promise<TracedResult<DispatchAgentOutput>> {
  const wrapper = wrapAgent<DispatchAgentInput, DispatchAgentOutput>("DispatchAgent", metadata);

  return wrapper(async (input: DispatchAgentInput): Promise<DispatchAgentOutput> => {
    // Execute the agent using the generate method
    // Cast messages to expected type for Mastra API compatibility
    const response = await dispatchAgent.generate(input.messages as Parameters<typeof dispatchAgent.generate>[0]);

    // Extract token usage if available
    // Cast to 'any' to handle potential API differences in usage property names
    const usage = response.usage as { promptTokens?: number; completionTokens?: number; totalTokens?: number } | undefined;
    const tokens = usage
      ? {
          prompt: usage.promptTokens ?? 0,
          completion: usage.completionTokens ?? 0,
          total: usage.totalTokens ?? 0,
        }
      : undefined;

    // Parse dispatch state from response
    const { state: dispatchState, cleanText } = parseDispatchState(response.text);

    return {
      output: response.text,
      model: "gpt-4o",
      tokens,
      dispatchState: dispatchState ?? undefined,
      cleanResponse: cleanText,
    };
  });
}

/**
 * Executes the DispatchAgent with Opik tracing
 *
 * Convenience function that creates a traced agent and executes it.
 *
 * @param input - Agent input with messages and context
 * @param metadata - Trace metadata
 * @returns Traced result with agent output, traceId, and latency
 */
export async function executeTracedDispatchAgent(
  input: DispatchAgentInput,
  metadata: TraceWrapperMetadata
): Promise<TracedResult<DispatchAgentOutput>> {
  const tracedAgent = createTracedDispatchAgent(metadata);
  return tracedAgent(input);
}
