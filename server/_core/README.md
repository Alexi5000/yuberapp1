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


