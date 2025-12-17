// file: server/_core/context.ts
// description: tRPC context builder for Next.js fetch adapter with optional user session
// reference: server/_core/localAuth.ts, server/_core/trpc.ts
import { type NextRequest } from 'next/server';
import { type User } from '../../drizzle/schema';
import { localAuth } from './localAuth';

export type TrpcContext = { req: NextRequest, user: User | null, responseHeaders: Headers };

export async function createContext(opts: { req: NextRequest }): Promise<TrpcContext> {
  let user: User | null = null;

  try {
    user = await localAuth.authenticateRequest(opts.req);
  } catch (error) {
    user = null;
  }

  return { req: opts.req, user, responseHeaders: new Headers() };
}
