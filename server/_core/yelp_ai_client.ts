// file: server/_core/yelp_ai_client.ts
// description: Typed Yelp AI client that wraps chat requests with env-based auth
// reference: server/_core/env.ts, server/_core/yelp_ai_validation.ts, server/_core/yelp_ai_types.ts

import { ENV } from './env';
import { type UserContext, type YelpAIResponse } from './yelp_ai_types';
import { validateYelpAIResponse } from './yelp_ai_validation';

interface YelpChatMessage {
  query: string;
  chat_id: string | null;
  user_context?: UserContext;
}

const YELP_AI_CHAT_URL = 'https://api.yelp.com/ai/chat/v2';

export class YelpAIClient {
  private apiKey: string;
  private chatId: string | null = null;

  constructor (apiKey: string) {
    this.apiKey = apiKey;

    if (!this.apiKey) {
      throw new Error('YELP_API_KEY is not configured. Add it to your .env file.');
    }
  }

  async sendMessage(query: string, userContext?: UserContext): Promise<YelpAIResponse> {
    const payload: YelpChatMessage = { query, chat_id: this.chatId };

    if (userContext) {
      payload.user_context = userContext;
    }

    const response = await fetch(YELP_AI_CHAT_URL, {
      method: 'POST',
      headers: { accept: 'application/json', 'content-type': 'application/json', Authorization: `Bearer ${this.apiKey}` },
      body: JSON.stringify(payload)
    });

    const rawText = await response.text();

    if (!response.ok) {
      let errorMessage = response.statusText;
      try {
        const parsed = JSON.parse(rawText) as { error?: string, message?: string };
        errorMessage = parsed.error || parsed.message || response.statusText;
      } catch {
        if (rawText) {
          errorMessage = `${response.statusText}: ${rawText}`;
        }
      }
      const safeBody = rawText || errorMessage;
      throw new Error(`Yelp API error (${response.status}): ${safeBody}`);
    }

    const rawData = JSON.parse(rawText);
    const data = validateYelpAIResponse(rawData);
    this.chatId = data.chat_id ?? this.chatId;
    return data;
  }

  resetConversation(): void {
    this.chatId = null;
  }

  setChatId(chatId: string | null): void {
    this.chatId = chatId;
  }

  getChatId(): string | null {
    return this.chatId;
  }
}

export function createYelpClient(): YelpAIClient {
  return new YelpAIClient(ENV.yelpApiKey);
}
