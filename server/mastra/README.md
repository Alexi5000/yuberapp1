# `server/mastra/`

Agent + workflow implementation (Mastra integration).

## Status

This folder is currently **excluded from the main build** via `tsconfig.json` to keep the core product path compiling under strict TypeScript while agent tooling is iterated.

## Structure

- `agents/`: agent definitions (dispatch, help, settings)
- `tools/`: tool wrappers used by agents
- `workflows/`: multi-step workflows
- `memory/`: short/long-term memory adapters


