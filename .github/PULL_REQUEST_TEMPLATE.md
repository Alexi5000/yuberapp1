## Summary

**What changed?**

**Why is this change needed?**

**What user or operator behavior changes?**

## Validation

| Check | Status | Notes |
|---|---|---|
| `bun run validate:env` | ☐ Pass / ☐ N/A |  |
| `bun run check` | ☐ Pass / ☐ N/A |  |
| `bun run build` | ☐ Pass / ☐ N/A |  |
| `/api/health` smoke test | ☐ Pass / ☐ N/A |  |
| `/api/health?ready=true` readiness test | ☐ Pass / ☐ N/A |  |

## Release Impact

- [ ] I did not commit secrets, tokens, database dumps, or generated local files.
- [ ] I updated `.env.example` if configuration changed.
- [ ] I updated `README.md`, `SETUP.md`, `RELEASES.md`, or `docs/PRODUCTION_READINESS.md` if behavior changed.
- [ ] I reviewed whether the change affects authentication, payments, provider dispatch, or production data.
- [ ] I described any migration, rollback, or operator action required for deployment.

## Screenshots or Logs

Attach screenshots, health-check responses, or build logs when they help reviewers understand the change.
