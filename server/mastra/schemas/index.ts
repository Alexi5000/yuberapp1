import * as z from "zod/v4";

// Location Schema
export const LocationSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

// Request Status Enum
export const RequestStatusSchema = z.enum([
  "pending",
  "categorized",
  "searching",
  "matched",
  "dispatched",
  "in_progress",
  "completed",
  "cancelled",
]);

// Payment Status Enum
export const PaymentStatusSchema = z.enum([
  "pending",
  "processing",
  "completed",
  "failed",
]);

// UserRequest Schema
export const UserRequestSchema = z.object({
  id: z.string().uuid(),
  userId: z.string(),
  location: LocationSchema,
  issue: z.string(),
  category: z.string().optional(),
  urgency: z.enum(["low", "medium", "high"]).default("medium"),
  status: RequestStatusSchema,
  createdAt: z.number(), // Unix timestamp (seconds)
  dispatchId: z.string().uuid().optional(),
});

// ServiceAgent Schema
export const ServiceAgentSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.string(),
  rating: z.number().min(0).max(5),
  reviewCount: z.number().min(0),
  distance: z.number().min(0),
  available: z.boolean(),
  yelpBusinessId: z.string(),
  phone: z.string(),
  imageUrl: z.string().url(),
  location: LocationSchema.optional(), // Provider coordinates for map display
});


// DispatchResult Schema
export const DispatchResultSchema = z.object({
  id: z.string().uuid(),
  requestId: z.string().uuid(),
  agentId: z.string(),
  eta: z.number(),
  costEstimate: z.number(),
  status: z.enum(["dispatched", "in_progress", "completed", "cancelled"]),
  yelpLink: z.string().url(),
  dispatchedAt: z.number(), // Unix timestamp (seconds)
});

// Payment Schema
export const PaymentSchema = z.object({
  id: z.string().uuid(),
  dispatchId: z.string().uuid(),
  amount: z.number().positive(),
  method: z.string(),
  status: PaymentStatusSchema,
  transactionId: z.string(),
  createdAt: z.number(), // Unix timestamp (seconds)
});

// Yelp AI Chat API Response Schemas
export const YelpAIEntitySchema = z.object({
  type: z.string(),
  name: z.string(),
  rating: z.number().min(0).max(5).optional(),
  price_range: z.string().optional(),
  hours: z.string().optional(),
});

export const YelpAIResponseSchema = z.object({
  chat_id: z.string(),
  timestamp: z.string().datetime(),
  response: z.object({
    text: z.string(),
    entities: z.array(YelpAIEntitySchema),
    context_summary: z.string(),
  }),
});

// Type exports
export type Location = z.infer<typeof LocationSchema>;
export type RequestStatus = z.infer<typeof RequestStatusSchema>;
export type PaymentStatus = z.infer<typeof PaymentStatusSchema>;
export type UserRequest = z.infer<typeof UserRequestSchema>;
export type ServiceAgent = z.infer<typeof ServiceAgentSchema>;
export type DispatchResult = z.infer<typeof DispatchResultSchema>;
export type Payment = z.infer<typeof PaymentSchema>;
export type YelpAIEntity = z.infer<typeof YelpAIEntitySchema>;
export type YelpAIResponse = z.infer<typeof YelpAIResponseSchema>;
