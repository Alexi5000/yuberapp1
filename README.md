# YUBER 3

YUBER is a Next.js (App Router) + Bun application that renders a mobile-style “phone UI” in the browser, backed by a tRPC API and a Turso/libSQL database via Drizzle ORM.

## Tech stack

- Next.js App Router (`app/`)
- React
- Bun (package manager + scripts)
- tRPC (`app/api/trpc` + `server/routers.ts`)
- Drizzle ORM + Turso/libSQL (`drizzle/` + `server/db.ts`)
- Tailwind CSS (`app/globals.css`)

## Repository layout (what to read first)

- `app/`: Next.js routes, layouts, and API route handlers
- `client/`: Client application shell (the “phone UI”) and UI components
- `server/`: Server-side tRPC routers and backend helpers (auth, env, DB, external API clients)
- `shared/`: Shared constants and “brand” screen IDs used by the client navigation
- `drizzle/`: DB schema + migrations (SQLite/libSQL)
- `scripts/`: One-off scripts for DB inspection/seed and key verification
- `docs/`: Diagrams and architecture notes

## Entry points

- **Web UI**: `app/page.tsx` dynamically loads `client/src/app_entry.tsx` (client-only)
- **tRPC endpoint**: `app/api/trpc/[trpc]/route.ts` mounts `server/routers.ts`
- **Auth routes**:
  - `app/api/auth/demo-login/route.ts`
  - `app/api/auth/login/route.ts`
  - `app/api/oauth/callback/route.ts`

## Core patterns / conventions

- **Screen navigation is driven by IDs** in `shared/lib/brand.ts` (`SCREENS`), used throughout `client/src/App.tsx`.
- **tRPC is the API surface**. Client calls live in React code via `client/src/lib/trpc.ts` + `client/src/providers/client_providers.tsx`.
- **DB access is centralized** in `server/db.ts`. Schema is defined in `drizzle/schema.ts`.
- **Environment config is centralized** in `server/_core/env.ts`.

## Local development

1. Install dependencies:

```bash
bun install
```

2. Create `.env` from the example:

```bash
cp .env.example .env
```

3. Run migrations (requires Turso credentials):

```bash
bun run db:push
```

4. Start dev server:

```bash
bun run dev
```

Open `http://localhost:3000`.

## Environment variables (minimum)

See `.env.example` for the full list. Common required values:

- `TURSO_DATABASE_URL`
- `TURSO_AUTH_TOKEN`
- `YELP_API_KEY`
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
- `JWT_SECRET`

## Production build

```bash
bun run build
bun run start
```

# Yuber3

Yuber3 is a Bun-powered Next.js (App Router) application that renders a client-only “phone UI” experience and exposes a typed API via tRPC. It integrates with Turso/libSQL via Drizzle ORM and can search providers via Yelp.

## Tech stack

- **Runtime/package manager**: Bun
- **Web framework**: Next.js App Router
- **UI**: React, Tailwind CSS, Radix UI primitives
- **API**: tRPC + TanStack React Query
- **DB**: Turso/libSQL + Drizzle ORM
- **Validation**: Zod

## Quick start (local)

1. Install dependencies:

```bash
bun install
```

2. Create `.env` from `.env.example` and fill in values:

```bash
cp .env.example .env
```

3. Run database migrations (Drizzle):

```bash
bun run db:push
```

4. Start the dev server:

```bash
bun run dev
```

Open `http://localhost:3000`.

## Environment variables

The app reads env vars from `.env`. Minimum useful variables:

- **TURSO_DATABASE_URL**: Turso/libSQL database URL
- **TURSO_AUTH_TOKEN**: Turso auth token
- **YELP_API_KEY**: Yelp API key (required for Yelp REST search)
- **NEXT_PUBLIC_GOOGLE_MAPS_API_KEY**: Google Maps key (client-side)
- **JWT_SECRET**: Cookie/JWT secret for local sessions

See `.env.example` for the full list of placeholders.

## Scripts

- **dev**: `bun run dev` (Next dev server)
- **build**: `bun run build` (production build)
- **start**: `bun run start` (run production server; requires `bun run build` first)
- **check**: `bun run check` (TypeScript typecheck)
- **db:push**: `bun run db:push` (generate + apply Drizzle migrations)

## Architecture overview

### Rendering model (high level)

The Next.js App Router renders a minimal shell and dynamically loads the client app:

- `app/page.tsx` dynamically imports `client/src/app_entry.tsx` with `ssr: false`.
- `client/src/App.tsx` hosts the “phone UI” and does screen navigation via `shared/lib/brand.ts`.

### API model

Typed API is exposed via tRPC:

- `app/api/trpc/[trpc]/route.ts` mounts the tRPC fetch adapter.
- `server/routers.ts` defines the main `appRouter`.
- `server/_core/context.ts` attaches `ctx.user` when session cookies are present.

### Auth model

Local cookie-based sessions:

- `server/_core/localAuth.ts` signs/verifies JWT session cookies.
- `app/api/auth/login/route.ts` and `app/api/auth/demo-login/route.ts` issue cookies via `server/_core/oauth.ts`.

### Database model

Drizzle + libSQL:

- `drizzle/schema.ts` defines tables.
- `server/db.ts` is the data-access layer used by routers.

## Directory guide

- `app/`: Next.js App Router pages + route handlers
- `client/`: “phone UI” client code (components/screens/pages) and tRPC client wiring
- `server/`: tRPC router + server-side helpers (auth/db/yelp)
- `shared/`: shared constants and types (e.g. screen IDs)
- `drizzle/`: schema + migrations
- `scripts/`: DB maintenance and verification scripts
- `docs/`: diagrams and docs
- `patches/`: patch-package style patches for dependencies

## Notes

- Do not commit secrets. `.env.example` must contain placeholders only.
- `bun.lock` is tracked; `package-lock.json` is not used.


