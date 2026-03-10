# Pre-Tool-Use Hook
# Runs before every tool call in a Claude Code session.

---

## TDD Guard

Before writing any implementation code in `apps/api/src/core/`:

- `core/priority/` — a failing test MUST exist before any implementation file is created or modified
- `core/dependencies/` — a failing test MUST exist before any implementation file is created or modified
- `core/prompts/` — a failing test MUST exist before any implementation file is created or modified

If about to write implementation code in `core/` without a corresponding failing test:
STOP. Write the test first. Run it. Confirm it fails. Then implement.

Red → Green → Refactor. No exceptions.

---

## Secret Detection

Before writing or editing any file, check that the content does not contain:

- Hardcoded API keys (strings matching `sk-ant-`, `sk-`, `eyJ`)
- Database connection strings with embedded credentials
- JWT secrets or signing keys
- Any value that belongs in `.env.local` instead of source code

If any of the above are detected: STOP. Move the value to `.env.local`.
NEVER commit secrets to source control.

Files that must NEVER contain secrets:
- Any file tracked by git
- `apps/api/src/shared/config.ts` — use `process.env.*` only
- `apps/api/prisma/schema.prisma` — use `env("DATABASE_URL")` only

---

## Architecture Boundary Guard

Before writing any import statement, check:

1. Is this a `features/roadmap/` file importing from `features/chat/`? → STOP. Violation of C01.
2. Is this a `features/chat/` file importing from `features/roadmap/`? → STOP. Violation of C01.
3. Is this a `core/` file importing from Fastify, Prisma, or `@anthropic-ai/sdk`? → STOP. Violation of C02.
4. Is this any file other than `shared/ai/claude.client.ts` importing from `@anthropic-ai/sdk`? → STOP. Violation of C03.
5. Is this a prompt string literal outside `core/prompts/registry.ts`? → STOP. Violation of C04.

If any boundary violation is detected: surface it immediately. Do not proceed.
See `.claude/constitution.md` for the full list of architectural constraints.
