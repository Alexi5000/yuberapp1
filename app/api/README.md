# `app/api/`

Next.js Route Handlers that expose backend functionality.

## What lives here

- `auth/*`: demo/email login endpoints that set the session cookie
- `oauth/callback`: OAuth callback redirect helper (currently routes to demo login flow)
- `trpc/[trpc]`: the tRPC endpoint used by the client

## Notes

These handlers are thin wrappers; most logic lives in `server/_core/*` and `server/routers.ts`.

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


