import { createClient } from '@libsql/client';

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;
if (!url) {
  console.error('Missing TURSO_DATABASE_URL');
  process.exit(1);
}
const client = createClient({ url, authToken });

async function main() {
  const tables = await client.execute(`SELECT name FROM sqlite_master WHERE type='table' ORDER BY name`);
  console.log('Tables:', tables.rows);

  const providersInfo = await client.execute(`PRAGMA table_info(providers);`);
  console.log('\nproviders columns:\n', providersInfo.rows);

  const counts = await client.execute(`SELECT COUNT(*) as count FROM providers;`);
  console.log('\nprovider count:', counts.rows);

  const sample = await client.execute(`SELECT id, name, category FROM providers LIMIT 5;`);
  console.log('\nsample providers:', sample.rows);
}

main().catch((err) => {
  console.error('DB inspect error', err);
  process.exit(1);
});
