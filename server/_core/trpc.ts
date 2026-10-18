// file: server/_core/trpc.ts
// description: tRPC helpers and middleware definitions for the server API
// reference: server/_core/context.ts, shared/const.ts

import { NOT_ADMIN_ERR_MSG, UNAUTHED_ERR_MSG } from '@shared/const';
import { initTRPC, TRPCError } from '@trpc/server';
import { type TrpcContext } from './context';

const t = initTRPC.context<TrpcContext>().create();

export const router = t.router;
const safeProcedure = t.procedure.use(async ({ ctx, type, next }) => {
  if (type === 'mutation') {
    const origin = ctx.req.headers.get('origin');
    if ((origin && origin !== ctx.req.nextUrl.origin) || ctx.req.headers.get('sec-fetch-site') === 'cross-site') {
      throw new TRPCError({ code: 'FORBIDDEN', message: 'Cross-origin mutations are not allowed' });
    }
  }
  return next();
});
export const publicProcedure = safeProcedure;

const requireUser = t.middleware(async opts => {
  const { ctx, next } = opts;

  if (!ctx.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: UNAUTHED_ERR_MSG });
  }

  return next({ ctx: { ...ctx, user: ctx.user } });
});

export const protectedProcedure = safeProcedure.use(requireUser);

export const adminProcedure = safeProcedure.use(t.middleware(async opts => {
  const { ctx, next } = opts;

  if (!ctx.user || ctx.user.role !== 'admin') {
    throw new TRPCError({ code: 'FORBIDDEN', message: NOT_ADMIN_ERR_MSG });
  }

  return next({ ctx: { ...ctx, user: ctx.user } });
}));
