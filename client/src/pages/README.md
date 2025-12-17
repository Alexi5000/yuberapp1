# `client/src/pages/`

Legacy “page-style” components.

## Why this exists

The current app renders primarily via `client/src/App.tsx` + `client/src/components/screens/*`, but some older UI flows still live in `pages/`.

## Guidance

- Prefer adding new product screens under `client/src/components/screens/`.
- Keep `pages/` as compatibility/iteration space until migrated.


