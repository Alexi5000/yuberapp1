// file: app/api/trpc/[trpc]/route.ts
// description: tRPC fetch adapter handler for Next.js app router
// reference: server/routers.ts, server/_core/context.ts
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import type { NextRequest } from 'next/server';
import { createContext } from '../../../../server/_core/context';
import { appRouter } from '../../../../server/routers';

const handler = (req: NextRequest) =>
  fetchRequestHandler({ endpoint: '/api/trpc', req, router: appRouter, createContext: () => createContext({ req }) });

export { handler as GET, handler as POST };
