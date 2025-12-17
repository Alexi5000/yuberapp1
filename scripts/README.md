# `scripts/`

One-off scripts used for inspection, seeding, and verifying external integrations.

## Common scripts

- `db-reset.ts`: reset the database state (destructive)
- `seed-providers.mjs`: seed provider records
- `seed-columbus.ts`: seed a sample dataset for Columbus-area demo flows
- `verify-keys.ts`: sanity-check environment keys and connectivity

Run scripts with Bun, for example:

```bash
bun run scripts/verify-keys.ts
```

# `scripts/`

Utility scripts for local development and maintenance.

## Examples

- `db-reset.ts`: reset DB state
- `db-inspect*.ts`: inspect DB contents/shape
- `seed-*.ts|.mjs`: seed sample data
- `verify-keys.ts`: sanity-check required API keys (expects env vars)


