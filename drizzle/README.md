# `drizzle/`

Database schema and migrations for the app (SQLite/libSQL compatible).

## What lives here

- `schema.ts`: Drizzle schema (tables and types)
- `relations.ts`: Drizzle relations (when used)
- `migrations/`: migration outputs (when generated)
- `meta/`: migration journal/snapshots

## Related code

- `server/db.ts`: database access helpers
- `drizzle.config.ts`: Drizzle configuration

# `drizzle/`

Drizzle ORM schema and migration artifacts for the Turso/libSQL database.

## What lives here

- `schema.ts`: Drizzle table definitions (source of truth)
- `relations.ts`: relation helpers
- `migrations/`: generated migrations (if used)
- `meta/`: Drizzle snapshot metadata

## Related

- `drizzle.config.ts`: Drizzle configuration
- `server/db.ts`: DB access layer using this schema


