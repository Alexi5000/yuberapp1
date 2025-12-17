import { createClient } from '@libsql/client';

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;
const client = createClient({ url, authToken });
async function main() {
  const tables = ['providers','search_results','searches','users','bookings'];
  for (const table of tables) {
    const count = await client.execute(`SELECT COUNT(*) as count FROM ${table};`);
    console.log(table, count.rows);
    if (table === 'search_results') {
      const sample = await client.execute(`SELECT * FROM search_results LIMIT 3;`);
      console.log('sample search_results', sample.rows);
    }
  }
}
main().catch(err=>{console.error(err);process.exit(1);});
