# `server/`

Server-side code powering the app’s API layer (tRPC) and integrations.

## What lives here

- `routers.ts`: main tRPC router (providers, bookings, auth helpers, etc.)
- `routers/`: additional router modules (e.g., agent endpoints)
- `_core/`: shared server utilities (auth, env, cookie handling, Yelp clients)
- `db.ts`: Drizzle/libSQL data access layer

## How requests flow

1. Client calls `/api/trpc/*` via `client/src/lib/trpc.ts`.
2. Next.js route handler `app/api/trpc/[trpc]/route.ts` dispatches to `server/routers.ts`.
3. Router procedures call `server/db.ts` or external APIs (Yelp REST/AI).

# `server/`

Server-side application logic used by Next.js route handlers and tRPC.

## What lives here

- `routers.ts`: the main tRPC `appRouter`
- `routers/`: tRPC sub-routers (e.g. `agent.ts`)
- `_core/`: auth, env parsing, Yelp clients, tRPC helpers, and other server utilities
- `db.ts`: data access layer over Drizzle/libSQL

## Entry points

- `app/api/trpc/[trpc]/route.ts` calls into `server/routers.ts` and `server/_core/context.ts`.


