# `server/mastra/tools/`

Tool wrappers exposed to Mastra agents (the “actions” an agent can take).

## Principles

- Tools should be deterministic and validate inputs
- Keep side effects explicit (network/db)
- Prefer returning structured objects (not strings) so agents can reason over them


