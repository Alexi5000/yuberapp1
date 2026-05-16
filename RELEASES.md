# Yuber Release Notes

This file records reviewable repository milestones. Dates use ISO format and versions follow semantic versioning once production releases begin.

## 0.3.0 — Full-Stack Production Hardening Candidate

**Status:** proposed on the `production-hardening/full-stack-v1` branch.

This candidate converts the repository from a polished full-stack prototype into a deployment-ready codebase with explicit operational gates. It adds environment inventory, production validation scripts, health/readiness endpoints, pinned container runtime behavior, CI validation, and production-readiness documentation.

| Area | Change | Production Value |
|---|---|---|
| Operations | Added `/api/health` and `/api/health?ready=true`. | Gives uptime monitors, containers, and load balancers a clear liveness/readiness contract. |
| Configuration | Expanded `.env.example` and centralized production requirement reporting. | Makes missing secrets visible without leaking secret values. |
| CI | Added `bun run validate:env`, `bun run check`, and `bun run build` to pull-request validation. | Keeps documentation, type safety, and deployability reviewable before merge. |
| Container delivery | Pinned Bun image to `1.3.4` and added Docker `HEALTHCHECK`. | Reduces runtime drift and gives orchestrators a native process health signal. |
| Security | Added baseline HTTP response headers and CSP in `next.config.mjs`. | Establishes a safer default browser execution boundary. |
| Documentation | Added `docs/PRODUCTION_READINESS.md`. | Defines deploy gates, environment contracts, and remaining product decisions. |

### Release Gate

```bash
bun install --frozen-lockfile
bun run validate:env:prod
bun run check
bun run build
```

The branch is ready for code review after these checks pass locally and in CI. It should not be merged until the owner confirms production secret strategy, authentication policy, and whether demo login is allowed outside development.

## 0.2.0 — Branded Full-Stack Prototype

**Status:** current base version on `main` when the hardening branch was created.

The repository already contained a Next.js App Router application, React UI, tRPC routers, Drizzle schema, Turso/libSQL integration points, Docker/Railway assets, seed scripts, documentation templates, and branded README assets. This version built successfully in the sandbox after installing Bun `1.3.4`.

## 0.1.0 — Initial Application Foundation

**Status:** historical.

The initial foundation established the Yuber service-discovery concept, the core app shell, and early full-stack scaffolding for users, providers, bookings, messages, reviews, saved payment methods, referrals, and search history.
