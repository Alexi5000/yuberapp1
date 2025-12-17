// file: server/_core/llm.ts
// description: Yelp AI orchestration that leverages the typed Yelp client and env config
// reference: server/_core/env.ts, server/_core/yelp_ai_client.ts

import { createYelpClient } from './yelp_ai_client';
import { type UserContext, type YelpAIResponse } from './yelp_ai_types';
export type Role = 'system' | 'user' | 'assistant';
export type Message = { role: Role, content: string };
export type InvokeParams = { messages: Message[], location?: { latitude: number, longitude: number }, conversationId?: number };
type YelpBusinesses = NonNullable<YelpAIResponse['response']['businesses']>;
export type InvokeResult = { text: string, businesses: YelpBusinesses, conversationId?: string | null };

const conversationChatMap = new Map<number, string>();

/**
 * Call Yelp AI Chat API v2 through the shared client
 * This is the ONLY external API we use for AI features
 */
export async function invokeLLM(params: InvokeParams): Promise<InvokeResult> {
  const client = createYelpClient();

  const userMessages = params.messages.filter(m => m.role === 'user');
  const query = userMessages.map(m => m.content).join(' ');

  const userContext: UserContext | undefined = params.location ? { location: params.location } : undefined;
  const existingChatId = params.conversationId ? conversationChatMap.get(params.conversationId) ?? null : null;

  if (existingChatId) {
    client.setChatId(existingChatId);
  }

  const response = await client.sendMessage(query, userContext);
  const nextBusinesses: YelpBusinesses = response.response.businesses ?? [];

  if (params.conversationId && response.chat_id) {
    conversationChatMap.set(params.conversationId, response.chat_id);
  }

  return { text: response.response.text, businesses: nextBusinesses, conversationId: response.chat_id ?? null };
}

/**
 * Simple wrapper for chat completions that returns just the text
 */
export async function chat(query: string, location?: { latitude: number, longitude: number }): Promise<string> {
  const userMessage: Message = { role: 'user', content: query };
  const invokeParams: InvokeParams = location ? { messages: [userMessage], location } : { messages: [userMessage] };
  const result = await invokeLLM(invokeParams);
  return result.text;
}

/**
 * Search for service providers using Yelp AI, with explicit location context in the user message
 */
export async function searchProviders(serviceRequest: string, location: { latitude: number, longitude: number }): Promise<InvokeResult> {
  const userContent = `${serviceRequest} near ${location.latitude}, ${location.longitude}`;

  return invokeLLM({
    messages: [{
      role: 'system',
      content: 'You are a helpful assistant that finds local service providers. Always recommend the best-rated, most reliable providers.'
    }, { role: 'user', content: userContent }],
    location
  });
}

export async function searchProvidersWithLogging(
  serviceRequest: string,
  location: { latitude: number, longitude: number }
): Promise<InvokeResult & { debug: { request: string, location: { latitude: number, longitude: number } } }> {
  const result = await searchProviders(serviceRequest, location);
  console.info('[YelpAI] searchProviders result', {
    request: serviceRequest,
    location,
    businesses: result.businesses?.map(b => ({ id: b.id, name: b.name, distance: b.distance }))
  });
  return { ...result, debug: { request: serviceRequest, location } };
}
