import { createClient } from '@libsql/client';

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;
if (!url) throw new Error('TURSO_DATABASE_URL missing');

const client = createClient({ url, authToken });
const tables = ['bookings', 'messages', 'conversations', 'searchHistory', 'search_results', 'searches', 'user_preferences', 'providers', 'users'];

async function main() {
  for (const table of tables) {
    try {
      await client.execute(`DROP TABLE IF EXISTS ${table};`);
      console.log(`Dropped ${table}`);
    } catch (error) {
      console.error(`Failed dropping ${table}`, error);
    }
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
