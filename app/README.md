# `app/`

Next.js App Router directory.

## What lives here

- Route handlers for pages (`page.tsx`) and layouts (`layout.tsx`)
- API route handlers under `app/api/*` (tRPC + auth endpoints)
- Global styles in `globals.css`

## Key files

- `layout.tsx`: root document shell and global CSS/script wiring
- `page.tsx`: loads the client application shell (`client/src/app_entry.tsx`) with `ssr: false`
- `api/trpc/[trpc]/route.ts`: tRPC fetch adapter handler

# `app/`

Next.js App Router entrypoint for the web application.

## What lives here

- **Routes and pages**: `page.tsx`, `layout.tsx`, and route segments (e.g. `login/`).
- **API route handlers**: `api/**` (tRPC endpoint + auth endpoints).

## Key entrypoints

- `app/layout.tsx`: root layout, global styles, shared scripts.
- `app/page.tsx`: loads the client-only UI via dynamic import (`ssr: false`).
- `app/api/trpc/[trpc]/route.ts`: tRPC fetch adapter endpoint.


