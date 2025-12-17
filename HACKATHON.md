# Hackathon review guide

## What to run

- Install dependencies:

```bash
bun install
```

- Create environment file:

```bash
cp env.example .env
```

- Run migrations (optional but recommended):

```bash
bun run db:push
```

- Start the app:

```bash
bun run dev
```

Open `http://localhost:3000`.

## Demo script (3 to 5 minutes)

- Open the app and walk through onboarding.
- Use demo login (see `app/api/auth/demo-login/`).
- Trigger a dispatch flow and show:
  - The AI understands the issue
  - Provider discovery (Yelp-backed when configured)
  - Tracking/progress UI

## Notes for judges

- `README.md` explains the overall architecture and entry points.
- `docs/app_flow_and_agents.mmd` contains the system flow diagram.
- This is a prototype; secrets are not included in the repository.


