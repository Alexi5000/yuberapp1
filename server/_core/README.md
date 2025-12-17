# `server/_core/`

Core server utilities shared across routers.

## What lives here

- `env.ts`: environment variable parsing and defaults
- `localAuth.ts`: cookie/JWT session handling
- `oauth.ts`: demo/email login helpers and OAuth callback redirect
- `trpc.ts`: tRPC init + auth middleware (`publicProcedure`, `protectedProcedure`)
- `context.ts`: builds the tRPC request context (user + headers)
- `yelp_rest_search.ts`: direct Yelp REST API client
- `yelp_ai_client.ts`: Yelp AI client used by `llm.ts`
- `llm.ts`: orchestration wrapper for Yelp AI calls

# `server/_core/`

Core server utilities shared across route handlers and routers.

## Highlights

- `env.ts`: env parsing and defaults
- `localAuth.ts`: cookie/JWT session validation
- `oauth.ts`: login helpers (demo/email)
- `trpc.ts`: tRPC helpers and auth middleware
- `context.ts`: builds the tRPC context (`ctx.user`, headers)
- `yelp_rest_search.ts`: Yelp REST integration
- `llm.ts`: Yelp AI orchestration wrapper


