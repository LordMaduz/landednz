# Git Workflow Rules
# LandedNZ — Claude Code enforcement document

---

## Branch naming

```
feat/description      — new feature or capability
fix/description       — bug fix
chore/description     — tooling, deps, config, refactor
test/description      — adding or fixing tests only
docs/description      — documentation updates only
```

Examples:
- `feat/roadmap-scoring-engine`
- `fix/sse-timeout-railway`
- `chore/prisma-migrate-vector-column`
- `test/golden-examples-priority`

---

## Commit format — Conventional Commits with scope

```
<type>(<scope>): <short description>
```

**Types:** `feat`, `fix`, `test`, `docs`, `chore`, `refactor`

**Scopes:**
| Scope | Use for |
|-------|---------|
| `roadmap` | Roadmap engine, routes, service |
| `chat` | Chat service, SSE, guardrails, RAG |
| `onboarding` | Onboarding routes and service |
| `reminders` | Email reminder service |
| `auth` | Auth middleware, token validation |
| `core` | Pure functions in `core/priority/`, `core/dependencies/`, `core/prompts/` |
| `shared` | DB client, errors, logger, config, AI client |
| `mobile` | React Native screens, components, hooks |
| `deps` | Dependency updates |
| `claude` | CLAUDE.md, `.claude/` config files |

**Examples:**
```
feat(roadmap): AC-2-01 scoreTask golden examples pass
test(core): add resolveBlockedTasks unit tests for HARD dep
fix(chat): wrap SDK stream error as AIFailureError
chore(claude): update CLAUDE.md with pgvector BigInt gotcha
docs(claude): add phase 2 gate completion note
refactor(core): extract persona weight constants
```

---

## When to commit

- **Commit after every passing AC** — not at end of day, not after multiple ACs.
  One AC passing = one commit. Keep history granular and bisectable.

- **Commit after every passing test** in TDD cycle:
  - Red (failing test) → commit with `test(core): add failing test for X`
  - Green (passing) → commit with `feat(core): implement X`
  - Refactor → commit with `refactor(core): clean up X`

- **Commit before switching context** — never leave uncommitted changes when
  moving between features, phases, or debugging sessions.

---

## NEVER

- NEVER force-push to `main`.
- NEVER commit `.env.local`, secrets, or API keys.
- NEVER commit with a message like "fix", "update", "wip", or "changes".
  Every commit message must describe what changed and why it matters.
- NEVER batch multiple ACs into one commit.
- NEVER commit broken TypeScript (`npx tsc --noEmit` must pass before committing).

---

## Pre-commit checklist

Before every commit, verify:
1. `npx tsc --noEmit` passes in `apps/api`
2. `npm test` passes (or the specific test file for this AC)
3. No `console.log` introduced
4. No secrets or `.env.local` staged
5. Commit message follows Conventional Commits format with correct scope
