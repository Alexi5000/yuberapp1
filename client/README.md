# `client/`

Client-side application implementation (the “phone UI”) rendered inside the Next.js app.

## What lives here

- `public/`: static assets used by the client (local-only helpers, test pages)
- `src/`: the client app, UI components, screens, and tRPC wiring

## Entry points

- `src/app_entry.tsx`: wraps the app in providers (tRPC/React Query)
- `src/App.tsx`: main client app that manages screen navigation and flow state

# `client/`

Client-side “phone UI” application code.

## What lives here

- `client/src/`: React application used by the “phone UI”.
- `client/public/`: static assets used by the client build.

## Key entrypoints

- `client/src/app_entry.tsx`: wraps the app with providers (tRPC + React Query).
- `client/src/App.tsx`: main screen router/state orchestrator for the “phone UI”.
- `client/src/providers/client_providers.tsx`: tRPC + React Query client wiring.


