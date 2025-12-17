# `app/api/`

Next.js Route Handlers for server endpoints.

## What lives here

- **tRPC endpoint**: `trpc/[trpc]/route.ts`
- **Auth endpoints**:
  - `auth/login/route.ts` (email login)
  - `auth/demo-login/route.ts` (demo login)
  - `oauth/callback/route.ts` (OAuth callback redirect hook)

## Notes

Route handlers are thin wrappers. Most logic lives in `server/_core/*` and `server/routers.ts`.


