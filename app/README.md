# `app/`

Next.js App Router entrypoint for the web application.

## What lives here

- **Routes and pages**: `page.tsx`, `layout.tsx`, and route segments (e.g. `login/`).
- **API route handlers**: `api/**` (tRPC endpoint + auth endpoints).

## Key entrypoints

- `app/layout.tsx`: root layout, global styles, shared scripts.
- `app/page.tsx`: loads the client-only UI via dynamic import (`ssr: false`).
- `app/api/trpc/[trpc]/route.ts`: tRPC fetch adapter endpoint.


