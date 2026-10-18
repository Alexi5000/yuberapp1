# `server/mastra/memory/`

Conversation/user memory utilities used by agents.

## Goal

Provide a consistent way to read/write context so agent decisions stay grounded and repeatable.


## Migration preparation: scoped conversation persistence

`ScopedConversationMemory` is an independently tested persistence adapter for the pending Mastra upgrade. It is not connected to existing chat routes or the legacy singleton. Dependency versions and production behavior remain unchanged.

Provision its additive `mastra_sessions` and `mastra_messages` tables explicitly with `initializeConversationMemory(client)`. Existing Drizzle `users`, `conversations`, and `messages` tables are retained. Construct a per-request instance with `ScopedConversationMemory.forUser(client, authenticatedUser.id)` only after the server authenticates the request. Never pass a user ID from request input. This factory verifies the user exists; it does not authenticate callers.

Message input uses the decimal string of that existing integer user ID. Sessions retain their owner after message clearing. Reads and deletes are scoped to the bound user; another user cannot append to or take over a session. History orders by insertion sequence rather than timestamps, which can tie within one second. A zero limit returns no messages; negative and fractional limits are rejected.

The schema initializer does not run at import time. No existing legacy records are copied because the original legacy tables and identity mapping are absent from this repository. Connecting this adapter requires replacing the process-wide chat singleton with a request-scoped instance, resolving the legacy user ID contract, restoring request/dispatch/payment storage and user preferences, and completing the Mastra/provider migration. Do not treat this module alone as completed dispatch or authentication integration.

Run `bun run test:scoped-memory`. The test creates the actual Drizzle application schema in a temporary libSQL file, verifies application data preservation and tenant isolation, and reopens the file to verify persistence. It uses no provider credentials or network.
