// file: drizzle.config.ts
// description: Drizzle kit configuration targeting Turso libSQL database
// reference: drizzle/schema.ts

import { defineConfig } from 'drizzle-kit';

const connectionString = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!connectionString) {
  throw new Error('TURSO_DATABASE_URL is required to run drizzle commands');
}

export default defineConfig({
  schema: './drizzle/schema.ts',
  out: './drizzle',
  dialect: 'turso', // 'driver' is deprecated; use 'dialect'
  dbCredentials: { url: connectionString, authToken: authToken }
});
