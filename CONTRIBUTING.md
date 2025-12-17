# Contributing

Thanks for your interest in contributing to Yuber3.

## Development setup

- Install dependencies:

```bash
bun install
```

- Create your local environment file:

```bash
cp env.example .env
```

- Apply database migrations (Drizzle):

```bash
bun run db:push
```

- Start the dev server:

```bash
bun run dev
```

## Pull requests

- Keep PRs small and focused.
- Avoid committing secrets. `.env` is gitignored; use `env.example` for placeholders only.
- Run a typecheck before opening a PR:

```bash
bun run check
```

## Code style

- Prefer readable, well-named functions and modules.
- If you touch formatting, keep it consistent with existing project conventions (see `dprint.json`).


