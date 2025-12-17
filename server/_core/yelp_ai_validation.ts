// file: server/_core/yelp_ai_validation.ts
// description: Runtime validators for Yelp AI responses
// reference: server/_core/yelp_ai_types.ts, server/_core/yelp_ai_client.ts

import { yelp_ai_response_schema } from './yelp_ai_types';
import type { YelpAIResponse } from './yelp_ai_types';

export function validateYelpAIResponse(payload: unknown): YelpAIResponse {
  const parsed = yelp_ai_response_schema.safeParse(payload);

  if (!parsed.success) {
    throw new Error(`Invalid Yelp AI response: ${parsed.error.message}`);
  }

  return parsed.data;
}
