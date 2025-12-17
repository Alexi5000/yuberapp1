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


