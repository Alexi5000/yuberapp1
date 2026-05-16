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
  OPENAI_API_KEY: z.string().optional(),
  GROQ_API_KEY: z.string().optional(),
  OPIK_API_KEY: z.string().optional(),
  OPIK_PROJECT_NAME: z.string().optional(),
  NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: z.string().optional(),
  NEXT_PUBLIC_FRONTEND_FORGE_API_KEY: z.string().optional(),
  NEXT_PUBLIC_FRONTEND_FORGE_API_URL: z.string().url().optional(),
  VITE_APP_ID: z.string().optional(),
  OWNER_OPEN_ID: z.string().optional(),
  NODE_ENV: z.enum(['development', 'production', 'test']).optional()
}).transform(env => ({
  databaseUrl: env.TURSO_DATABASE_URL ?? '',
  databaseAuthToken: env.TURSO_AUTH_TOKEN ?? '',
  cookieSecret: env.JWT_SECRET ?? 'change-this-secret-in-production',
  yelpApiKey: env.YELP_API_KEY ?? '',
  yelpClientId: env.YELP_CLIENT_ID ?? '',
  openaiApiKey: env.OPENAI_API_KEY ?? '',
  groqApiKey: env.GROQ_API_KEY ?? '',
  opikApiKey: env.OPIK_API_KEY ?? '',
  opikProjectName: env.OPIK_PROJECT_NAME ?? 'yuber',
  googleMapsApiKey: env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? '',
  forgeApiKey: env.NEXT_PUBLIC_FRONTEND_FORGE_API_KEY ?? '',
  forgeApiUrl: env.NEXT_PUBLIC_FRONTEND_FORGE_API_URL ?? 'https://forge.butterfly-effect.dev',
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

type EnvironmentRequirement = {
  name: string;
  description: string;
  productionRequired: boolean;
  configured: boolean;
};

export function getEnvironmentStatus() {
  const requirements: EnvironmentRequirement[] = [
    {
      name: 'TURSO_DATABASE_URL',
      description: 'Primary libSQL/Turso database URL used by Drizzle-backed persistence.',
      productionRequired: true,
      configured: Boolean(ENV.databaseUrl)
    },
    {
      name: 'TURSO_AUTH_TOKEN',
      description: 'Authentication token for hosted Turso databases. Local file-backed libSQL does not require it.',
      productionRequired: true,
      configured: Boolean(ENV.databaseAuthToken)
    },
    {
      name: 'JWT_SECRET',
      description: 'High-entropy signing secret for HTTP-only session cookies.',
      productionRequired: true,
      configured: Boolean(ENV.cookieSecret && ENV.cookieSecret !== 'change-this-secret-in-production')
    },
    {
      name: 'YELP_API_KEY',
      description: 'Yelp Fusion API key for live provider search.',
      productionRequired: true,
      configured: Boolean(ENV.yelpApiKey)
    },
    {
      name: 'OPENAI_API_KEY',
      description: 'LLM provider key used by AI triage and dispatch assistance.',
      productionRequired: true,
      configured: Boolean(ENV.openaiApiKey)
    },
    {
      name: 'NEXT_PUBLIC_GOOGLE_MAPS_API_KEY',
      description: 'Client-side Google Maps key for live map rendering and ETA views.',
      productionRequired: true,
      configured: Boolean(ENV.googleMapsApiKey)
    },
    {
      name: 'OWNER_OPEN_ID',
      description: 'Initial administrator identity for protected owner workflows.',
      productionRequired: false,
      configured: Boolean(ENV.ownerOpenId && ENV.ownerOpenId !== 'local-owner')
    },
    {
      name: 'OPIK_API_KEY',
      description: 'Optional observability key for trace capture, cost, and latency analytics.',
      productionRequired: false,
      configured: Boolean(ENV.opikApiKey)
    }
  ];

  const missingProduction = requirements.filter(item => item.productionRequired && !item.configured);

  return {
    appId: ENV.appId,
    nodeEnv: ENV.isProduction ? 'production' : 'development-or-test',
    productionReady: missingProduction.length === 0,
    requirements,
    missingProduction: missingProduction.map(item => item.name)
  };
}

if (!ENV.databaseUrl) {
  console.warn('[Env] TURSO_DATABASE_URL not set; database-backed features will be disabled.');
}
