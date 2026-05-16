# Yuber Local and Production Setup

This guide describes how to run Yuber locally, verify configuration safely, apply database migrations, and prepare a production deployment. Yuber is a full-stack Next.js application that depends on Bun, Turso/libSQL, Yelp, OpenAI-compatible LLM access, and Google Maps for the complete production experience.

## Prerequisites

| Tool or Service | Recommended Version | Required For |
|---|---:|---|
| Bun | `1.3.4` | Dependency installation, scripts, development, and production runtime. |
| Node.js | `22.x` | Tooling compatibility for the Next.js and TypeScript ecosystem. |
| Docker | Current stable | Containerized local smoke tests and production-image validation. |
| Turso/libSQL | Hosted database | Production persistence and migration validation. |
| Yelp Fusion API | Active key | Live provider search. |
| OpenAI-compatible API | Active key | AI triage and dispatch assistance. |
| Google Maps API | Browser key | Map rendering and location UX. |

## Clone and Install

```bash
git clone https://github.com/Alexi5000/yuberapp1.git
cd yuberapp1
bun install --frozen-lockfile
```

## Environment Configuration

Copy the example template and fill in the values you need for the workflows you are testing.

```bash
cp .env.example .env.local
bun run validate:env
```

The non-strict validation command is safe for development and pull requests because it only reports whether each variable is configured. It does not print secret values. Production deployments should use the stricter release gate.

```bash
bun run validate:env:prod
```

| Variable | Required for Production | Notes |
|---|---:|---|
| `TURSO_DATABASE_URL` | Yes | Use a hosted `libsql://...` URL for production. |
| `TURSO_AUTH_TOKEN` | Yes | Required for hosted Turso databases. |
| `JWT_SECRET` | Yes | Generate with `openssl rand -base64 48`. |
| `YELP_API_KEY` | Yes | Required for live provider discovery. |
| `OPENAI_API_KEY` | Yes | Required for AI triage and dispatch support. |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Yes | Required for client-side maps. |
| `OPIK_API_KEY` | No | Optional observability integration. |

## Database Setup

Create a Turso database and token before running production migrations.

```bash
turso db create yuber-production
turso db show yuber-production --url
turso db tokens create yuber-production
```

After configuring the database URL and token, generate and apply migrations.

```bash
bun run db:generate
bun run db:migrate
```

For local demos, you can seed provider data after migrations.

```bash
bun scripts/seed-providers.mjs
```

## Local Development

```bash
bun run dev
```

Open [http://localhost:3000](http://localhost:3000). Then verify the operational endpoint.

```bash
curl http://localhost:3000/api/health
```

The endpoint may report `degraded` until production secrets and a reachable database are configured. That is expected for local UI work. Readiness mode is stricter and is intended for deployment gates.

```bash
curl -i "http://localhost:3000/api/health?ready=true"
```

## Docker Setup

The Docker image is pinned to Bun `1.3.4`, builds Next.js standalone output, and includes a healthcheck that calls `/api/health`.

```bash
docker compose up --build
```

Run migrations in the container when the app service is running and environment variables are configured.

```bash
docker compose exec app bun run db:push
```

## Validation Before Pull Request

Run the same command sequence locally that CI runs for review branches.

```bash
bun run ci
```

This command executes environment inventory, TypeScript typecheck, and the production build. A release candidate should additionally pass the strict environment check in the target deployment environment.

```bash
bun run validate:env:prod
```

## Troubleshooting

| Symptom | Likely Cause | Resolution |
|---|---|---|
| `TURSO_DATABASE_URL not set` appears during build | Database-backed features are not configured in local development. | Configure `.env.local` or ignore for UI-only local work. |
| `/api/health?ready=true` returns `503` | Production env variables are missing or database ping failed. | Run `bun run validate:env:prod`, verify Turso credentials, and retry. |
| Docker container starts but stays unhealthy | The app process or health endpoint is unreachable inside the container. | Inspect `docker compose logs app` and confirm `PORT=3000`. |
| TypeScript fails after schema changes | Generated types or imports are stale. | Run `bun run db:generate`, review migration output, then run `bun run check`. |
| CSP errors appear in the browser console | A production integration needs an explicit source in `next.config.mjs`. | Add the narrowest allowed domain and avoid wildcard expansion unless unavoidable. |
