// file: server/_core/env.ts
// description: Centralized environment variable parsing with validation
// reference: server/db.ts, server/_core/llm.ts

import { z } from 'zod';

const envSchema = z.object({
  TURSO_DATABASE_URL: z.string().optional(),
  TURSO_AUTH_TOKEN: z.string().optional(),
  JWT_SECRET: z.string().optional(),
  YELP_API_KEY: z.string().optional(),
  YELP_CLIENT_ID: z.string().optional(),
  GROQ_API_KEY: z.string().optional(),
  VITE_APP_ID: z.string().optional(),
  OWNER_OPEN_ID: z.string().optional(),
  NODE_ENV: z.enum(['development', 'production', 'test']).optional()
}).transform(env => ({
  databaseUrl: env.TURSO_DATABASE_URL ?? '',
  databaseAuthToken: env.TURSO_AUTH_TOKEN ?? '',
  cookieSecret: env.JWT_SECRET ?? 'change-this-secret-in-production',
  yelpApiKey: env.YELP_API_KEY ?? '',
  yelpClientId: env.YELP_CLIENT_ID ?? '',
  groqApiKey: env.GROQ_API_KEY ?? '',
  appId: env.VITE_APP_ID ?? 'yuber-local',
  isProduction: env.NODE_ENV === 'production',
  ownerOpenId: env.OWNER_OPEN_ID ?? 'local-owner'
}));

const envSource = typeof Bun !== 'undefined' ? Bun.env : process.env;
const parsedEnv = envSchema.safeParse(envSource);

if (!parsedEnv.success) {
  const formatted = parsedEnv.error.format();
  console.warn('[Env] Invalid environment configuration; falling back to defaults:', formatted);
}

export const ENV = parsedEnv.success ? parsedEnv.data : envSchema.parse({});

if (!ENV.databaseUrl) {
  console.warn('[Env] TURSO_DATABASE_URL not set; database-backed features will be disabled.');
}
