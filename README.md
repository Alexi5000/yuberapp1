# Yuber3

## Story

Yuber started in a late night Discord voice call.
Three strangers were talking about why every AI app still feels like a chatbot that can’t help in the real world.

We wondered why no one built an agent that actually solves problems.
Real problems.
Pipes bursting.
Doors locked.
Power failing.

That call turned into a mission.

What it does

Yuber is instant help with intelligent dispatch.
You tell the AI what happened in plain English.

It understands your crisis.
It finds the nearest top rated pro through Yelp.
It dispatches them automatically.
It tracks the job until help arrives.

No searching.
No phone trees.
No panic.

How we built it

We built it out loud on Discord.
Metabunny led the front end.
Cipher built the system architecture.
Alex handled the agents and automation.

We kept the stack fast.
Bun.
Next.
Mastra.
Tailwind.
In memory data for near zero latency.

Everything was built in small, fast loops.
Plan then execute.
Ship, then refine.

Challenges we ran into

Agents taking too long to decide.
Slow APIs slowing down emergencies.

We had to cut anything that added friction.
We rebuilt flows until they felt instant.

We learned people will forgive many things,
but not lag during a crisis.

Accomplishments that we're proud of

We built a working prototype in one Discord call.
We built trust before we built code.

We shipped without meeting in person.
We proved you can build real products with strangers who care about the same problems.

What we learned

Speed matters.
Clarity matters more.

AI should take action, not just chat.
People want outcomes, not information.

And great teams can form anywhere.
Even at 2 AM in a Discord voice channel.

What's next for Yuber

Faster dispatching.
More service categories.
Real partnerships with small businesses.

We want Yuber to be the first call on someone’s worst day.
We want local pros to get real customers, not random leads.

And we want to keep building the same way we started.
In the open.
In the community.
In the calls where real builders meet.

## Screenshots

Drop screenshots into `docs/screenshots/` using these exact filenames and they’ll render automatically on GitHub:

- `docs/screenshots/splash.png`
- `docs/screenshots/signup.png`
- `docs/screenshots/tracking.png`
- `docs/screenshots/rating.png`

![Splash](docs/screenshots/splash.png)
![Signup](docs/screenshots/signup.png)
![Tracking](docs/screenshots/tracking.png)
![Rating](docs/screenshots/rating.png)

> Note: these images will not display until the actual `.png` files are committed at the paths above.

Yuber3 is a Bun-powered Next.js (App Router) application that renders a client-only “phone UI” experience and exposes a typed API via tRPC. It integrates with Turso/libSQL via Drizzle ORM and can search providers via Yelp.

## Project map (what each part is)

| Part | What it is | Start here |
| --- | --- | --- |
| `app/` | Next.js App Router pages/layouts + API route handlers | `app/page.tsx`, `app/layout.tsx`, `app/api/trpc/[trpc]/route.ts` |
| `client/` | Client “phone UI” app (screens + components) rendered inside Next | `client/src/app_entry.tsx`, `client/src/App.tsx` |
| `server/` | tRPC routers + server utilities (auth, env, DB, Yelp) | `server/routers.ts`, `server/db.ts`, `server/_core/` |
| `shared/` | Shared constants and canonical screen IDs | `shared/lib/brand.ts`, `shared/const.ts` |
| `drizzle/` | Drizzle schema + migrations for libSQL/SQLite | `drizzle/schema.ts`, `drizzle/README.md` |
| `scripts/` | One-off utilities (seed/inspect/verify) | `scripts/README.md` |
| `docs/` | Diagrams and architecture notes | `docs/app_flow_and_agents.mmd` |
| `patches/` | Dependency patch files (when needed) | `patches/README.md` |

## Tech stack

- **Runtime/package manager**: Bun
- **Web framework**: Next.js App Router
- **UI**: React, Tailwind CSS, Radix UI primitives
- **API**: tRPC + TanStack React Query
- **DB**: Turso/libSQL + Drizzle ORM
- **Validation**: Zod

## Repository layout (what to read first)

- `app/`: Next.js routes, layouts, and API route handlers
- `client/`: Client application shell (the “phone UI”) and UI components
- `server/`: Server-side tRPC routers and backend helpers (auth, env, DB, external API clients)
- `shared/`: Shared constants and “brand” screen IDs used by the client navigation
- `drizzle/`: DB schema + migrations (SQLite/libSQL)
- `scripts/`: One-off scripts for DB inspection/seed and key verification
- `docs/`: Diagrams and architecture notes
- `patches/`: Dependency patches (when needed)

## Entry points

- **Web UI**: `app/page.tsx` dynamically loads `client/src/app_entry.tsx` (client-only)
- **tRPC endpoint**: `app/api/trpc/[trpc]/route.ts` mounts `server/routers.ts`
- **Auth routes**:
  - `app/api/auth/demo-login/route.ts`
  - `app/api/auth/login/route.ts`
  - `app/api/oauth/callback/route.ts`

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

