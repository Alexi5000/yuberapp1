import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { migrate } from 'drizzle-orm/libsql/migrator';
import { initializeConversationMemory, ScopedConversationMemory } from '../server/mastra/memory/scoped_conversation_memory';

const directory = await mkdtemp(join(tmpdir(), 'yuber-scoped-memory-'));
const url = `file:${join(directory, 'memory.db')}`;
let client = createClient({ url });
const blockNetwork = () => { throw new Error('Network disabled in memory regression'); };
globalThis.fetch = Object.assign(async () => blockNetwork(), { preconnect: blockNetwork });
try {
  await migrate(drizzle(client), { migrationsFolder: join(import.meta.dir, '../drizzle') });
  await client.execute("INSERT INTO users(id, openId) VALUES (1, 'alice'), (2, 'bob')");
  await client.execute("INSERT INTO conversations(id, oderId, userId) VALUES (1, 'existing', 1)");
  await client.execute("INSERT INTO messages(conversationId, role, content) VALUES (1, 'user', 'Existing app message')");
  const originalSchema = await client.execute("SELECT sql FROM sqlite_master WHERE name = 'messages'");
  await initializeConversationMemory(client);
  await initializeConversationMemory(client);
  await assert.rejects(ScopedConversationMemory.forUser(client, 999), /Unknown/);
  await assert.rejects(ScopedConversationMemory.forUser(client, NaN), /Invalid/);
  const alice = await ScopedConversationMemory.forUser(client, 1);
  const bob = await ScopedConversationMemory.forUser(client, 2);
  for (let index = 0; index < 5; index++) {
    const message = await alice.add_message({ session_id: 'shared', user_id: '1', role: 'user', content: `message ${index}` });
    assert.match(message.id, /^[a-f0-9-]{36}$/);
    assert.ok(Math.abs(message.created_at - Date.now() / 1000) < 5);
  }
  await assert.rejects(bob.add_message({ session_id: 'shared', user_id: '2', role: 'assistant', content: 'attack' }), /not owned/);
  await assert.rejects(alice.add_message({ session_id: 'other', user_id: '2', role: 'user', content: 'spoof' }), /does not match/);
  assert.deepEqual(await bob.get_messages('shared'), []);
  assert.equal(await bob.prune('shared', 0), 0);
  assert.equal((await alice.get_messages('shared')).length, 5);
  assert.deepEqual((await alice.get_messages('shared', 2)).map(m => m.content), ['message 3', 'message 4']);
  assert.deepEqual(await alice.get_messages('shared', 0), []);
  await assert.rejects(alice.prune('shared', -1), /non-negative/);
  await assert.rejects(alice.get_messages('shared', 1.5), /non-negative/);
  assert.equal(await alice.prune('shared', 2), 3);
  await alice.add_message({ session_id: "quote' OR 1=1 --", user_id: '1', role: 'assistant', content: 'SQL remains data' });
  assert.equal((await alice.get_messages("quote' OR 1=1 --"))[0]?.content, 'SQL remains data');
  client.close();
  client = createClient({ url });
  const reopened = await ScopedConversationMemory.forUser(client, 1);
  assert.deepEqual(await reopened.get_agent_messages('shared'), [{ role: 'user', content: 'message 3' }, { role: 'user', content: 'message 4' }]);
  await reopened.clear_session('shared');
  assert.deepEqual(await reopened.get_messages('shared'), []);
  assert.equal((await reopened.get_messages("quote' OR 1=1 --")).length, 1);
  const bobAgain = await ScopedConversationMemory.forUser(client, 2);
  await assert.rejects(bobAgain.add_message({ session_id: 'shared', user_id: '2', role: 'user', content: 'take over cleared session' }), /not owned/);
  assert.deepEqual((await client.execute("SELECT sql FROM sqlite_master WHERE name = 'messages'")).rows, originalSchema.rows);
  assert.equal((await client.execute('SELECT * FROM messages')).rows[0]?.content, 'Existing app message');
  assert.equal((await client.execute('SELECT COUNT(*) AS n FROM users')).rows[0]?.n, 2);
  console.log('PASS: existing app schema/data, known-user binding, ownership, ordered history, limits, pruning, injection resistance, reopen persistence, cleared-session ownership');
} finally {
  client.close();
  await rm(directory, { recursive: true, force: true });
}
