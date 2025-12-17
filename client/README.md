# `client/`

Client-side “phone UI” application code.

## What lives here

- `client/src/`: React application used by the “phone UI”.
- `client/public/`: static assets used by the client build.

## Key entrypoints

- `client/src/app_entry.tsx`: wraps the app with providers (tRPC + React Query).
- `client/src/App.tsx`: main screen router/state orchestrator for the “phone UI”.
- `client/src/providers/client_providers.tsx`: tRPC + React Query client wiring.


