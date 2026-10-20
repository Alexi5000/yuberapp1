<div align="center">

<img src="assets/icon.png" alt="Yuber Logo" width="120" />

# Yuber

### AI-Native Emergency Home Services Dispatch

**Describe what broke. Yuber classifies the emergency, finds a nearby professional, creates a typed service workflow, and tracks the job from request to resolution.**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-16-000?logo=nextdotjs)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-61dafb?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-7.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Bun](https://img.shields.io/badge/Bun-1.3.4-f9f1e1?logo=bun)](https://bun.sh)
[![tRPC](https://img.shields.io/badge/tRPC-11-2596be)](https://trpc.io)
[![Drizzle](https://img.shields.io/badge/Drizzle-libSQL-c5f74f)](https://orm.drizzle.team)

[Product](#product) · [Architecture](#architecture) · [Quick Start](#quick-start) · [Operations](#operations) · [Release Notes](RELEASES.md) · [Production Readiness](docs/PRODUCTION_READINESS.md)

---

<img src="assets/cover.png" alt="Yuber product cover" width="100%" />

</div>

---

## Why this exists

**What it does.** Yuber is a Next.js 16 application that takes a plain-English description of a home emergency, classifies it with Mastra-based agents, searches Yelp Fusion for nearby providers, and records a booking that the user can track in a phone-style browser UI. Persistence is Drizzle ORM on Turso/libSQL, the API is tRPC 11, and the app ships with a Docker image, Railway config, and a CI regression suite.

**Who it serves.** A homeowner or renter who needs a plumber, locksmith, or electrician right now and does not want to search, call around, or sit in a phone tree. Secondary audience: engineers evaluating an AI-dispatch prototype that already has typed routers, migrations, health checks, and security regressions in place.

**Why Alex built it.** The repository was created 2025-12-07 and seeded on 2025-12-17 as a hackathon entry (commit `8d118c5`, 2025-12-17: "chore(repo): add hackathon docs and github hygiene"; `HACKATHON.md` is a judge review guide). The original README story (commit `4171cb4`, 2025-12-17: "docs(readme): move story to top") records the motivation: "Yuber started in a late night Discord voice call. Three strangers were talking about why every AI app still feels like a chatbot that can't help in the real world ... Pipes bursting. Doors locked. Power failing." Alex handled the agents and automation, with @cipher-rc5 on architecture and @digitalpersonalab on the frontend. In May 2026 the prototype was hardened toward production (PR #22, merged 2026-05-16: health/readiness endpoints, env validation, security headers), and in October 2026 the dependency tree and auth/authorization paths were repaired and covered by CI regressions (PRs #40 to #67, 2026-10-18).

**Real-world use case (2025–2026 evidence).** **Proposed use case.** A renter's kitchen pipe bursts at 11 pm. They type "my kitchen pipe burst and water is everywhere" into Yuber. The help agent classifies the request as emergency plumbing and extracts the location; the dispatch agent queries Yelp Fusion for top-rated plumbers nearby[^3] and creates a pending booking record in Turso/libSQL[^4]; the tracking screen shows the request state while the user shuts off the water. The stack choices are current: the app targets the Next.js 16 release line[^1] and pins Bun 1.3.x as runtime and package manager in `Dockerfile` and CI[^2]. The repository contains the agents, routers, schema, and regression tests for this flow, but no evidence of a live deployment with real providers, so the scenario is proposed rather than verified.

[^1]: Next.js 16 release post, Vercel, published 2025-10-21. https://nextjs.org/blog/next-16
[^2]: Bun v1.3 release post, published 2025-10-10. https://bun.com/blog/bun-v1.3
[^3]: Yelp Fusion API introduction, Yelp Developers, page revision dated 2026-07-15. https://docs.developer.yelp.com/docs/fusion-intro
[^4]: Turso documentation (libSQL hosted database), last modified 2026-07-30. https://docs.turso.tech/

## Product

Yuber is a full-stack service-discovery and emergency-dispatch application for home incidents. A user describes the problem in plain English, the application classifies the need, searches for relevant providers, creates a booking-oriented workflow, and gives the user a polished mobile-style experience in the browser. The codebase is intentionally designed as a production candidate rather than a static landing page: it includes application routes, API handlers, authentication helpers, tRPC routers, Drizzle schema, migrations, Docker packaging, CI, and deployment documentation.

> “My kitchen pipe burst and water is everywhere.” Yuber turns that sentence into a structured emergency workflow: classify the incident, locate nearby plumbers, preserve the conversation, create a booking record, and track the job through completion.

## Architecture

| Layer | Technology | Repository Surface | Purpose |
|---|---|---|---|
| Interface | Next.js App Router, React 19, Tailwind CSS, Radix UI | `app/`, `client/src/`, `client/src/components/` | Renders the mobile-inspired customer experience and authenticated screens. |
| API | Next.js route handlers, tRPC 11, TanStack Query | `app/api/`, `server/routers/` | Provides typed client/server communication and operational endpoints. |
| AI workflow | Mastra, OpenAI-compatible LLM configuration | `server/mastra/`, `server/_core/llm.ts` | Supports triage, provider matching, and dispatch-oriented assistance. |
| Persistence | Turso/libSQL, Drizzle ORM | `server/db.ts`, `drizzle/schema.ts`, `drizzle/*.sql` | Stores users, conversations, messages, providers, bookings, reviews, payment metadata, referrals, and search history. |
| External services | Yelp Fusion, Google Maps, optional Opik | `server/_core/yelp_*.ts`, `server/_core/opik/`, `.env.example` | Connects discovery, maps, and optional observability integrations. |
| Delivery | Bun 1.3.4, Docker, Railway, GitHub Actions | `Dockerfile`, `railway.toml`, `.github/workflows/ci.yml` | Builds, validates, and packages the application for production review. |

### AI Agent Model

Yuber’s AI layer is organized around specialized responsibilities rather than a single generic chatbot. The help agent focuses on triage and clarification, the dispatch agent focuses on provider selection and booking context, and the settings agent focuses on user preferences. This separation makes the system easier to test, extend, and replace as the product evolves from demo workflows into real provider fulfillment.

| Agent | Responsibility | Expected Production Evolution |
|---|---|---|
| Help Agent | Understands the user’s emergency and extracts service requirements. | Add deterministic guardrails, escalation rules, and emergency disclaimers. |
| Dispatch Agent | Searches and ranks providers based on location, category, rating, and availability. | Connect to verified provider onboarding, dispatch notifications, and acceptance tracking. |
| Settings Agent | Manages user preferences such as location, notification state, and account settings. | Expand into role-based owner/admin preferences and privacy controls. |

## Quick Start

Yuber uses Bun as the package manager and runtime. The project is tested against Bun `1.3.4`, Node.js `22`, TypeScript `7.0`, and Next.js `16`.

```bash
git clone https://github.com/Alexi5000/yuberapp1.git
cd yuberapp1
bun install --frozen-lockfile
cp .env.example .env.local
bun run validate:env
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) after the development server starts. Local development can run with missing production secrets, but database-backed and external-provider features remain degraded until the relevant environment variables are configured.

### Production Configuration

Production deployments must configure secrets in the hosting platform rather than committing them to the repository. The strict production gate is available through `bun run validate:env:prod` and fails when required variables are missing.

| Variable | Production Required | Description |
|---|---:|---|
| `TURSO_DATABASE_URL` | Yes | Primary Turso/libSQL database URL. |
| `TURSO_AUTH_TOKEN` | Yes | Hosted Turso authentication token. |
| `JWT_SECRET` | Yes | High-entropy cookie signing secret. |
| `YELP_API_KEY` | Yes | Yelp Fusion API key for provider discovery. |
| `OPENAI_API_KEY` | Yes | LLM key for AI triage and dispatch support. |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Yes | Client-side Google Maps rendering and ETA UI. |
| `OWNER_OPEN_ID` | No | Optional initial owner/admin identity. |
| `OPIK_API_KEY` | No | Optional observability key for LLM traces and analytics. |

## Scripts

| Command | Purpose |
|---|---|
| `bun run dev` | Starts the Next.js development server. |
| `bun run build` | Creates an optimized production build. |
| `bun run start` | Runs the production server after a build. |
| `bun run check` | Runs TypeScript with `--noEmit`. |
| `bun run validate:env` | Prints a safe environment inventory without exposing secret values. |
| `bun run validate:env:prod` | Enforces the production environment contract. |
| `bun run ci` | Runs environment inventory, typecheck, and production build. |
| `bun run db:generate` | Generates Drizzle migration output. |
| `bun run db:migrate` | Applies Drizzle migrations. |
| `bun run db:push` | Generates and applies migrations in sequence. |

## Operations

The application exposes a liveness and readiness API at `/api/health`. The default endpoint is suitable for uptime monitors and Docker healthchecks. The readiness mode at `/api/health?ready=true` returns `503` until production configuration is complete and the database connection succeeds.

| Endpoint | Runtime Use | Success Behavior |
|---|---|---|
| `/api/health` | Container healthcheck, uptime monitor, smoke test | Returns HTTP `200` with `ready: true` only when dependencies are healthy. |
| `/api/health?ready=true` | Load balancer readiness, release gate | Returns HTTP `200` only when production env and database checks pass; otherwise returns `503`. |

The Docker image is built from `oven/bun:1.3.4`, uses Next.js standalone output, and includes a native `HEALTHCHECK` that calls the health endpoint. Railway-compatible deployment metadata is included in `railway.toml`.

## Database

The Drizzle schema is defined in `drizzle/schema.ts` and includes tables for users, conversations, messages, providers, bookings, reviews, payment-method metadata, favorite providers, referrals, and search history. Migration files are committed under `drizzle/` so schema changes can be reviewed before deployment.

```bash
bun run db:generate
bun run db:migrate
```

For production, run migrations against staging first, validate `/api/health?ready=true`, and then apply the same migration set to production during a controlled release window.

## Project Structure

```text
yuberapp1/
├── app/                    # Next.js App Router pages and API routes
│   ├── api/                # auth, health, OAuth, and tRPC endpoints
│   └── login/              # login route
├── client/src/             # phone-style client application
│   ├── components/         # reusable UI and design-system components
│   ├── contexts/           # React context providers
│   ├── hooks/              # custom hooks
│   └── pages/              # screen-level views
├── drizzle/                # schema, relations, and migrations
├── server/                 # backend logic, routers, auth, Yelp clients, agents
│   ├── _core/              # env, cookies, local auth, LLM, Yelp, Opik helpers
│   ├── mastra/             # help, dispatch, and settings agents
│   └── routers/            # tRPC routers
├── shared/                 # shared constants and cross-cutting definitions
├── scripts/                # database, key verification, and environment tools
├── docs/                   # architecture, screenshots, and readiness docs
└── .github/                # CI, issue templates, pull request template, CODEOWNERS
```

## Testing

CI (`.github/workflows/ci.yml`) runs on pull requests, pushes to `main`, and a daily schedule. The `typecheck` job installs with `bun install --frozen-lockfile`, runs `bun run check`, then the regression scripts below, then `bun run build`. The `dependency-audit` job runs `bun audit --audit-level=low`. Branch protection on `main` requires `typecheck`, `dependency-audit`, and `CodeQL` to pass.

| Command | What it covers |
|---|---|
| `bun run check` | TypeScript `--noEmit` across the app. |
| `bun run test:session` | Session issuance, expiry, and rejection paths. |
| `bun run test:database` | libSQL client and Drizzle compatibility. |
| `bun run test:opik`, `bun run test:chart`, `bun run test:transport`, `bun run test:telemetry`, `bun run test:math-tooling` | Vendor SDK and dependency-upgrade regressions. |
| `bun run test:scoped-memory`, `bun run test:mastra` | Scoped memory migration and Mastra provider/workflow compatibility. |
| `bun scripts/test-application-security.ts` | Cross-account reads/writes, cookie deletion, cross-origin rejection, forged sessions, against a temporary migrated SQLite database and the real tRPC handlers. |
| `bun run test:vendor-upgrades`, `bun run test:components` | UI library upgrade compatibility. |

These tests run locally against SQLite and mocked providers. They do not exercise a live identity provider, a hosted Turso database, real Yelp or OpenAI traffic, or a deployed environment. Treat them as a build gate, not as deployment verification.

## Deployment

The repository ships `Dockerfile` (built from `oven/bun:1.3.4`, Next.js standalone output, native `HEALTHCHECK` on `/api/health`), `docker-compose.yml`, and `railway.toml`. `bun run validate:env:prod` is the strict configuration gate and fails when a production-required variable is missing.

Not verified in this repository as of 2026-10-20:

- A live identity provider. Demo and email-only login require `ENABLE_LOCAL_DEMO_AUTH=true` and are restricted to localhost development and test; production rejects local/demo sessions, but no real provider login has been integrated or tested here.
- Session revocation beyond rotating `JWT_SECRET` (rotation invalidates all previously issued sessions; there is no per-session revocation list).
- Rate limiting or quotas for paid search and AI endpoints.
- Payments. The schema has payment-method placeholders; no processor is integrated.
- Provider fulfillment. Dispatch creates pending bookings; no provider acceptance, notification, or completion flow has been run against real providers.

See [`docs/PRODUCTION_READINESS.md`](docs/PRODUCTION_READINESS.md) for the release checklist.

## Security

- Open Dependabot alerts as of 2026-10-20: 0. `bun audit --audit-level=low` reported no vulnerabilities on the same date.
- Secret scanning and push protection are enabled; Dependabot (Bun and GitHub Actions ecosystems) and CodeQL run on the repository.
- Baseline HTTP security headers and a CSP are set in `next.config.mjs`; cookies are HttpOnly, SameSite=Lax, and Secure in production.
- Report vulnerabilities privately as described in [`SECURITY.md`](SECURITY.md). Do not open public issues for security problems.

## Documentation

| Document | Purpose |
|---|---|
| [Production Readiness](docs/PRODUCTION_READINESS.md) | Release gate, health checks, environment contract, and remaining product decisions. |
| [Release Notes](RELEASES.md) | Version history and the current hardening candidate. |
| [Setup Guide](SETUP.md) | Local, Docker, and deployment setup details. |
| [Security Policy](SECURITY.md) | Vulnerability reporting and supported versions. |
| [Contributing Guide](CONTRIBUTING.md) | Development workflow and contribution standards. |
| [Architecture Diagram](docs/app_flow_and_agents.mmd) | Mermaid diagram of the user, agent, and backend flow. |

## Production Roadmap

| Priority | Workstream | Rationale |
|---|---|---|
| P0 | Integrate verified production authentication; demo/email-only login is restricted to localhost development/test. | Prevents unintended public access and clarifies owner/admin flows. |
| P0 | Configure Turso, Yelp, OpenAI, Google Maps, and JWT secrets in the deployment platform. | Required for the strict production readiness gate. |
| P1 | Add integration tests for login, provider search, booking creation, and readiness checks. | Converts the current build gate into behavior-level confidence. |
| P1 | Choose fulfillment strategy: affiliate lead routing, manual dispatch, or verified provider onboarding. | Determines whether dispatch remains simulated or becomes transactional. |
| P2 | Add payment processor integration after legal and data-handling decisions. | The schema contains payment metadata placeholders but no production payment processor should be assumed. |
| P2 | Add observability dashboards and alerting for latency, LLM failures, and provider-search errors. | Makes production operations measurable and supportable. |

## Contributors

| Contributor | Role |
|---|---|
| [@Alexi5000](https://github.com/Alexi5000) | Product, AI agents, and automation. |
| [@cipher-rc5](https://github.com/cipher-rc5) | System architecture. |
| [@digitalpersonalab](https://github.com/digitalpersonalab) | Frontend and design. |

## License

Yuber is released under the [MIT License](LICENSE).

---

<div align="center">

**Built by [Alex Cinovoj](https://github.com/Alexi5000), Founder & CTO of TechTide AI**

*Your pipe burst. Help is already on the way.*

</div>
