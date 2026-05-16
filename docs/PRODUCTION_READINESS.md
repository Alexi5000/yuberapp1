# Yuber Production Readiness Guide

Yuber is now organized as a full-stack Next.js application with a typed React interface, server-side API routes, tRPC services, Drizzle ORM, Turso/libSQL persistence, Docker packaging, Railway configuration, and CI validation. This guide defines the release gate for moving the repository from a polished prototype into a production-operated service.

## Runtime Architecture

| Layer | Production Choice | Repository Surface | Operational Notes |
|---|---|---|---|
| Web interface | Next.js App Router with React 19 and TypeScript | `app/`, `components/`, `lib/` | Built through `bun run build` with typed routes and strict TypeScript checks. |
| API boundary | Next.js route handlers and tRPC | `app/api/`, `server/routers/` | Health and readiness checks are exposed at `/api/health` and `/api/health?ready=true`. |
| Persistence | Drizzle ORM with Turso/libSQL | `server/db.ts`, `drizzle/schema.ts`, `drizzle/*.sql` | Production requires `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN`. |
| AI services | OpenAI-compatible provider keys | `server/_core/llm.ts`, `server/mastra/` | Production requires `OPENAI_API_KEY`; optional observability is configured through Opik. |
| Provider search | Yelp Fusion API | `server/services/` | Production requires `YELP_API_KEY`; test data can be seeded for local demos. |
| Maps | Google Maps client key | client map components and env template | Production requires `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`. |
| Delivery | Docker, Railway, or Next-compatible host | `Dockerfile`, `railway.toml`, `next.config.mjs` | Container healthcheck calls `/api/health`; CI validates typecheck and production build. |

## Required Release Gate

The repository should be considered deployable when the following command sequence passes in a clean environment.

```bash
bun install --frozen-lockfile
bun run validate:env:prod
bun run check
bun run build
```

`bun run validate:env` is intentionally safe for pull requests because it prints whether variables are configured without revealing secret values. `bun run validate:env:prod` is the stricter release gate and fails when production-critical configuration is missing.

## Health and Readiness

The application exposes two operational modes from the same endpoint. `GET /api/health` is a liveness check and returns process health without failing simply because production secrets are absent in local development. `GET /api/health?ready=true` is a readiness check and returns `503` until production-required environment variables are configured and the database ping succeeds.

| Endpoint | Purpose | Expected Production Result |
|---|---|---|
| `/api/health` | Liveness for uptime monitors and container healthchecks | HTTP `200`, with `status: ready` once all dependencies are live. |
| `/api/health?ready=true` | Release and load-balancer readiness | HTTP `200` only when environment and database checks pass. |

## Environment Contract

| Variable | Required for Production | Purpose |
|---|---:|---|
| `TURSO_DATABASE_URL` | Yes | Primary libSQL/Turso database endpoint. |
| `TURSO_AUTH_TOKEN` | Yes | Hosted database authentication token. |
| `JWT_SECRET` | Yes | High-entropy HTTP-only cookie signing secret. |
| `YELP_API_KEY` | Yes | Live local provider search. |
| `OPENAI_API_KEY` | Yes | AI-assisted service triage and dispatch workflows. |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Yes | Client-side maps and geospatial UI. |
| `OWNER_OPEN_ID` | No | Optional initial owner/admin identity. |
| `OPIK_API_KEY` | No | Optional LLM observability and trace analytics. |

## Security Baseline

The Next.js configuration now applies baseline HTTP response headers for frame prevention, MIME sniffing protection, referrer control, permissions policy, and content security policy. These headers should be validated in staging because production providers, image domains, and map integrations may require deliberate CSP expansion. The application should not add broad wildcard sources unless a live integration proves it is necessary.

## Database Operations

The schema and migration files live in `drizzle/`. The expected production migration path is explicit and reviewable.

```bash
bun run db:generate
bun run db:migrate
```

Before a production release, run the migration command against a staging Turso database, verify `/api/health?ready=true`, and then repeat the migration against production during a controlled release window.

## Remaining Production Work

| Area | Status After This Hardening Pass | Next Decision |
|---|---|---|
| Authentication | Cookie signing and demo/login routes exist; production secret validation is now explicit. | Confirm final OAuth provider and disable demo login in production if it should not be public. |
| Payments | Schema placeholders exist for saved cards and bookings. | Choose Stripe or another payment processor before collecting real payment data. |
| Provider fulfillment | Yelp-backed discovery and seeded providers are present. | Decide whether the MVP uses affiliate leads, manual dispatch, or verified provider onboarding. |
| Observability | Optional Opik configuration is modeled. | Add runtime trace capture and alert routing after production account selection. |
| Testing | CI now runs env inventory, typecheck, and build. | Add unit/integration tests around auth, booking creation, and provider search once product flows are locked. |

## Release Checklist

| Check | Owner | Required Evidence |
|---|---|---|
| Secrets configured in deployment target | Platform owner | `bun run validate:env:prod` passes. |
| Database migrated | Backend owner | Migration log and healthy `/api/health?ready=true`. |
| Build verified from clean install | Engineering | CI green on pull request. |
| Security headers validated | Engineering | Browser smoke test and CSP console review. |
| Demo/admin policy confirmed | Product owner | Written decision in release notes. |
| Rollback path documented | Release owner | Previous image or commit SHA available. |
