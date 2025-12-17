# `client/src/`

Client app source code.

## Main areas

- `App.tsx`: screen navigation + orchestration of the main product flow
- `providers/`: React providers (tRPC, React Query, theme)
- `components/`: reusable UI and screen components
- `pages/`: legacy “page-like” components (some screens are still here)
- `lib/`: client utilities and types (`trpc.ts`, `types.ts`, `utils.ts`)
- `types/`: TS declaration patches (e.g., JSX custom elements)

# `client/src/`

Main React code for the client-only “phone UI”.

## Layout

- `_core/`: shared app hooks/services (client-only)
- `components/`: reusable UI components, screens, and UI primitives
- `lib/`: shared client helpers and types (tRPC client, utilities)
- `pages/`: legacy/alternate screen implementations (some screens are mirrored in `components/screens/`)
- `providers/`: provider wiring (React Query + tRPC)
- `hooks/`, `contexts/`: state utilities

## Navigation

Screen IDs come from `shared/lib/brand.ts` and navigation is handled by `hooks/useScreenNavigation.ts`.


