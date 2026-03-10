# Code Quality Rules
# LandedNZ — Claude Code enforcement document

---

## MUST (non-negotiable)

- **Explicit error handling** — every async operation must handle errors explicitly.
  No silent catches. No empty `catch {}` blocks. Always log or rethrow with context.

- **TypeScript strict mode** — no `any` without an inline comment explaining why.
  Suppression is not a comment. The comment must explain the reason.
  Example: `// any: Prisma $queryRaw returns unknown shape for raw vector results`

- **AppError for business failures** — never throw raw `Error` for expected failures.
  Use `AppError` from `shared/errors.ts` with a typed `ErrorCode`.
  ```typescript
  throw new AppError('TASK_NOT_FOUND', 'Task T08 not found in roadmap', 404)
  ```

- **AIFailureError for Claude API failures** — always catch SDK errors and wrap them.
  `AIFailureError` is caught INSIDE the chat service and degraded gracefully.
  It NEVER propagates to the global Fastify error handler.

- **Prompts in registry only** — all prompt construction lives in `core/prompts/registry.ts`.
  No prompt strings in services, routes, or anywhere else.
  If a string is going to be sent to the Claude API, it must be built in the registry.

- **No `console.log`** — use `logger` from `shared/logger.ts` with structured context.
  ```typescript
  // NEVER: console.log('Task scored', score)
  // ALWAYS: logger.info({ taskId, score }, 'Task scored')
  ```

- **Secrets in env vars** — NEVER hardcode API keys, DB connection strings, or credentials.
  All secrets come from `process.env.*`. Validated at startup in `shared/config.ts`.

- **Shared types in `packages/types/`** — anything crossing the mobile/api boundary lives there.
  Never duplicate types. Never redefine enums that already exist in `packages/types/index.ts`.

- **One responsibility per file** — if a file exports more than one primary concern, split it.
  Exception: test helper files may export multiple utilities.

---

## SHOULD (strong preference)

- **Comments for intent, not narration** — only comment non-obvious decisions, trade-offs,
  or constraints. Do not comment what the code obviously does.
  ```typescript
  // BAD: // loop through tasks
  // GOOD: // SOFT deps don't block — only reduce priority via scoring penalty
  ```

- **Async Fastify routes always** — non-async routes with unhandled promise rejections crash
  the process silently. Every route handler must be `async`.

- **Return early over nested conditionals** — guard clauses at the top, happy path at the bottom.

- **Named constants over magic numbers** — scoring weights and time urgency bonuses must be
  named constants, not raw numbers inline.
  ```typescript
  const DEPENDENCY_PENALTY = -50
  const CRISIS_TIME_URGENCY_BONUS = 30
  ```

- **Test files next to source** — `scoring.ts` and `scoring.test.ts` in the same folder.
  Do not put tests in a separate top-level `__tests__/` directory.

---

## NEVER

- NEVER import `@anthropic-ai/sdk` anywhere except `shared/ai/claude.client.ts`.
  This is architectural constraint C03. One file owns all SDK access.

- NEVER import from Fastify, Prisma, or any framework inside `core/`.
  `core/` contains pure functions only. Zero framework dependencies.

- NEVER import between `features/roadmap/` and `features/chat/`.
  These two features are architecturally isolated. Shared types go in `packages/types/`.

- NEVER use `db push` — always `migrate dev`.
  `db push` skips migration history. Migration history is required for production.

- NEVER commit `.env.local`, secrets, or API keys.

- NEVER force-push to `main`.

- NEVER present a specific NZ number (cost, time, rate) to the user without checking
  its `numberType` (A/B/C) in the knowledge base and applying the correct caveat.

- NEVER inline prompt strings in services or routes. Registry only.

---

## Architecture boundaries (enforced by pre-tool-use hook)

```
features/roadmap/  ←—————————×—————————→  features/chat/
                              ↑
                    no cross-imports ever
                    shared types → packages/types/

core/ ←————— no Fastify, no Prisma, no @anthropic-ai/sdk ————→ ever

@anthropic-ai/sdk ←———— imported only in shared/ai/claude.client.ts ————→ nowhere else

prompt strings ←———— constructed only in core/prompts/registry.ts ————→ nowhere else
```
