# `server/`

Server-side application logic used by Next.js route handlers and tRPC.

## What lives here

- `routers.ts`: the main tRPC `appRouter`
- `routers/`: tRPC sub-routers (e.g. `agent.ts`)
- `_core/`: auth, env parsing, Yelp clients, tRPC helpers, and other server utilities
- `db.ts`: data access layer over Drizzle/libSQL

## Entry points

- `app/api/trpc/[trpc]/route.ts` calls into `server/routers.ts` and `server/_core/context.ts`.


