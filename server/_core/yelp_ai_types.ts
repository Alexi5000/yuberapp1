// file: server/_core/yelp_ai_types.ts
// description: Type and schema definitions for Yelp AI chat payloads and responses
// reference: server/_core/yelp_ai_validation.ts, server/_core/yelp_ai_client.ts

import { z } from 'zod';

export const yelp_coordinates_schema = z.object({ latitude: z.number(), longitude: z.number() });
export const user_context_schema = z.object({ location: yelp_coordinates_schema.optional() });
export const yelp_business_schema = z.object({
  id: z.string(),
  name: z.string(),
  rating: z.number(),
  review_count: z.number(),
  price: z.string().optional(),
  location: z.object({
    address1: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zip_code: z.string().optional()
  }),
  phone: z.string().optional(),
  categories: z.array(z.object({ title: z.string() })).optional(),
  image_url: z.string(),
  url: z.string(),
  distance: z.number().optional()
});

export const yelp_ai_response_schema = z.object({
  response: z.object({ text: z.string(), businesses: z.array(yelp_business_schema).optional() }),
  chat_id: z.string().nullable().optional()
});

export type UserContext = z.infer<typeof user_context_schema>;
export type YelpBusiness = z.infer<typeof yelp_business_schema>;
export type YelpAIResponse = z.infer<typeof yelp_ai_response_schema>;
