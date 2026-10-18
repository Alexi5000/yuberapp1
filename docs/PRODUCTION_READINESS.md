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

The following checks are necessary but not sufficient for production release. Verified production authentication is not implemented: demo/email-only login requires ENABLE_LOCAL_DEMO_AUTH=true and is restricted to localhost development/test requests, and production rejects all existing local/demo sessions. Do not enable public customer accounts until a real identity provider is integrated and tested.

```bash
bun install --frozen-lockfile
bun run validate:env:prod
bun run check
bun scripts/test-application-security.ts
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

### Application security closeout

Session issuance requires a non-placeholder JWT secret of at least 32 characters. Sessions must expire and match the configured application; production rejects local/demo identities. Rotate the deployed JWT secret to revoke previously issued sessions. Cookies use HttpOnly, SameSite=Lax and Secure in production. Mutations reject cross-origin browser requests, and logout now propagates the deletion cookie through the tRPC HTTP adapter.

Conversation/message access and booking reads/writes verify the authenticated owner's identity before data access or changes. Linked conversations and reviews must belong to the caller; reviews must match a completed booking and its provider. In production, customers can cancel pending/confirmed bookings but cannot complete jobs or write provider coordinates. New production bookings remain pending without invented dispatch ETAs.

The application regression uses a temporary migrated SQLite database, two independent users, and actual tRPC/HTTP handlers. It covers cross-account reads/writes, unauthorized side effects, cookie deletion, cross-origin rejection, forged legacy sessions and unsafe signing secrets.

Production external Yelp/search endpoints require authentication; local public review reads expose only public fields. Review insertion atomically rejects duplicate booking reviews without deleting historical rows.

Remaining production work: verified identity integration, distributed rate limiting for paid search/AI endpoints, payment-provider integration, verified provider authorization and fulfillment, and a deployment-level review of secrets, redirects, CSP and upstream access controls. Experimental Mastra tool modules excluded from the live router remain simulations and must not be exposed as authenticated production operations without a separate security review. Dependency alerts and these application checks cannot establish an absence of all vulnerabilities.

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
| Authentication | Demo/email-only sign-in and local/demo sessions are blocked in production. | Integrate and verify a real identity provider before enabling customer accounts. |
| Payments | Schema placeholders exist for saved cards and bookings. | Choose Stripe or another payment processor before collecting real payment data. |
| Provider fulfillment | Yelp-backed discovery and seeded providers are present. | Decide whether the MVP uses affiliate leads, manual dispatch, or verified provider onboarding. |
| Observability | Optional Opik configuration is modeled. | Add runtime trace capture and alert routing after production account selection. |
| Testing | CI runs typecheck, security/compatibility regressions, production build and an all-severity dependency audit on PRs, main pushes and daily. | Validate deployment secrets, real identity and provider integrations in staging; local tests do not establish deployed security. |

## Release Checklist

| Check | Owner | Required Evidence |
|---|---|---|
| Secrets configured in deployment target | Platform owner | `bun run validate:env:prod` passes. |
| Database migrated | Backend owner | Migration log and healthy `/api/health?ready=true`. |
| Build verified from clean install | Engineering | CI green on pull request. |
| Security headers validated | Engineering | Browser smoke test and CSP console review. |
| Production identity verified | Release owner | Real identity-provider login and authorization tests pass; demo auth remains disabled. |
| Rollback path documented | Release owner | Previous image or commit SHA available. |
