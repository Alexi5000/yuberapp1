import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

for (const name of Object.keys(process.env)) {
  if (!['PATH', 'HOME', 'TMPDIR'].includes(name)) delete process.env[name];
}
const directory = await mkdtemp(join(tmpdir(), 'yuber-database-'));
process.env.TURSO_DATABASE_URL = `file:${join(directory, 'test.db')}`;
process.env.NODE_ENV = 'test';
globalThis.fetch = async () => { throw new Error('Network disabled in database regression'); };

const { migrate } = await import('drizzle-orm/libsql/migrator');
const database = await import('../server/db');
const db = await database.getDb();
assert.ok(db);
try {
  await migrate(db, { migrationsFolder: join(import.meta.dir, '../drizzle') });
  await database.upsertUser({ openId: 'database-test', name: 'Before' });
  await database.upsertUser({ openId: 'database-test', name: 'After' });
  const user = await database.getUserByOpenId('database-test');
  assert.ok(user);
  assert.equal(user.name, 'After');
  assert.equal(user.role, 'user');
  await database.updateUserOnboarding(user.id, { onboardingCompleted: true });
  assert.equal((await database.getUserById(user.id))?.onboardingCompleted, true);
  const conversation = await database.createConversation(user.id, 'Broken pipe');
  assert.ok(conversation);
  await database.addMessage({ conversationId: conversation.id, role: 'user', content: 'Water leak' });
  assert.equal((await database.getMessagesByConversation(conversation.id))[0]?.content, 'Water leak');
  await database.addSearchHistory({ userId: user.id, query: 'plumber' });
  assert.equal((await database.getSearchHistoryByUser(user.id))[0]?.query, 'plumber');
  const transaction = await db.$client.transaction('write');
  await transaction.execute({ sql: 'UPDATE users SET name = ? WHERE id = ?', args: ['Rollback', user.id] });
  await transaction.rollback();
  assert.equal((await database.getUserById(user.id))?.name, 'After');
  db.$client.close();
  const { createClient } = await import('@libsql/client');
  const reopened = createClient({ url: process.env.TURSO_DATABASE_URL });
  try {
    assert.equal((await reopened.execute({ sql: 'SELECT name FROM users WHERE id = ?', args: [user.id] })).rows[0]?.name, 'After');
  } finally {
    reopened.close();
  }
  console.log('PASS: migration, upsert, role, onboarding, conversation/messages, search history, rollback, reopen persistence');
} finally {
  db.$client.close();
  await rm(directory, { recursive: true, force: true });
}
