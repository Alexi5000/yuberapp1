import { randomUUID } from 'node:crypto';
import type { Client } from '@libsql/client';
import { MessageSchema, type IConversationMemory, type Message, type MessageInput } from '../core/interfaces/memory';

const statements = [
  `CREATE TABLE IF NOT EXISTS mastra_sessions (
    id TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id)
  )`,
  `CREATE TABLE IF NOT EXISTS mastra_messages (
    sequence INTEGER PRIMARY KEY AUTOINCREMENT,
    id TEXT NOT NULL UNIQUE,
    session_id TEXT NOT NULL REFERENCES mastra_sessions(id),
    role TEXT NOT NULL CHECK(role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    created_at INTEGER NOT NULL DEFAULT (unixepoch())
  )`,
  'CREATE INDEX IF NOT EXISTS mastra_messages_session_sequence ON mastra_messages(session_id, sequence)',
];

function count(value: number): number {
  if (!Number.isSafeInteger(value) || value < 0) throw new Error('Message count must be a non-negative safe integer');
  return value;
}

export async function initializeConversationMemory(client: Client): Promise<void> {
  await client.batch(statements, 'write');
}

export class ScopedConversationMemory implements IConversationMemory {
  private constructor(private readonly client: Client, private readonly userId: number) {}

  static async forUser(client: Client, authenticatedUserId: number): Promise<ScopedConversationMemory> {
    if (!Number.isSafeInteger(authenticatedUserId) || authenticatedUserId <= 0) throw new Error('Invalid authenticated user');
    const user = await client.execute({ sql: 'SELECT id FROM users WHERE id = ?', args: [authenticatedUserId] });
    if (!user.rows.length) throw new Error('Unknown authenticated user');
    return new ScopedConversationMemory(client, authenticatedUserId);
  }

  async add_message(input: MessageInput): Promise<Message> {
    if (input.user_id !== String(this.userId)) throw new Error('Message user does not match authenticated user');
    if (!input.session_id) throw new Error('Session ID is required');
    const id = randomUUID();
    const transaction = await this.client.transaction('write');
    try {
      await transaction.execute({
        sql: 'INSERT INTO mastra_sessions(id, user_id) VALUES (?, ?) ON CONFLICT(id) DO NOTHING',
        args: [input.session_id, this.userId],
      });
      const result = await transaction.execute({
        sql: `INSERT INTO mastra_messages(id, session_id, role, content)
          SELECT ?, id, ?, ? FROM mastra_sessions WHERE id = ? AND user_id = ?
          RETURNING id, session_id, role, content, created_at`,
        args: [id, input.role, input.content, input.session_id, this.userId],
      });
      if (!result.rows.length) throw new Error('Session is not owned by authenticated user');
      const message = MessageSchema.parse({ ...result.rows[0], user_id: String(this.userId) });
      await transaction.commit();
      return message;
    } catch (error) {
      await transaction.rollback();
      throw error;
    } finally {
      transaction.close();
    }
  }

  async get_messages(session_id: string, limit?: number): Promise<Message[]> {
    if (limit !== undefined) count(limit);
    const result = await this.client.execute({
      sql: `SELECT m.id, m.session_id, m.role, m.content, m.created_at
        FROM mastra_messages m JOIN mastra_sessions s ON s.id = m.session_id
        WHERE s.id = ? AND s.user_id = ? ORDER BY m.sequence DESC LIMIT ?`,
      args: [session_id, this.userId, limit ?? -1],
    });
    return result.rows.reverse().map(row => MessageSchema.parse({ ...row, user_id: String(this.userId) }));
  }

  async get_agent_messages(session_id: string, limit?: number): Promise<Array<{ role: string; content: string }>> {
    return (await this.get_messages(session_id, limit)).map(({ role, content }) => ({ role, content }));
  }

  async clear_session(session_id: string): Promise<void> {
    await this.prune(session_id, 0);
  }

  async prune(session_id: string, keep_count: number): Promise<number> {
    count(keep_count);
    const result = await this.client.execute({
      sql: `DELETE FROM mastra_messages WHERE session_id IN
        (SELECT id FROM mastra_sessions WHERE id = ? AND user_id = ?)
        AND sequence NOT IN (SELECT sequence FROM mastra_messages WHERE session_id = ? ORDER BY sequence DESC LIMIT ?)`,
      args: [session_id, this.userId, session_id, keep_count],
    });
    return result.rowsAffected;
  }
}
