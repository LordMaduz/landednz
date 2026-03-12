# LandedNZ
# Stack: React Native (Expo) · Node.js/Fastify · PostgreSQL/pgvector · Claude API
# Environment: macOS · Node.js · Claude Code

## Architecture Overview

LandedNZ helps skilled migrants navigate NZ settlement tasks.
Generates a personalised priority roadmap and provides AI chat advisory.

**Two AI jobs — architecturally separate, always:**

| Job | Name | What | When |
|---|---|---|---|
| Job A | Roadmap engine | Personalised consequence lines for top 3 tasks | Once, onboarding |
| Job B | Chat advisor | Settlement questions via streaming chat | On demand |

These share no code, no state, no service functions. This is an invariant.
See `.claude/constitution.md` for all non-negotiable architectural constraints.

## Monorepo Structure

    landednz/
    ├── CLAUDE.md                    ← this file (project-level memory)
    ├── IMPLEMENT.md                 ← execution state tracker (AC pass/fail per phase)
    ├── .claude/                     ← all Claude Code config
    │   ├── constitution.md          ← architectural non-negotiables
    │   ├── agents/                  ← specialised subagents
    │   ├── commands/                ← slash commands (rpi:research/plan/implement/gate/status)
    │   ├── hooks/                   ← pre/post tool use hooks
    │   ├── rules/                   ← coding standards, git workflow, planning discipline
    │   └── skills/                  ← domain knowledge (priority-engine, kb-schema, guardrails, chat-prompt)
    ├── apps/
    │   ├── api/                     ← Fastify backend — see apps/api/CLAUDE.md
    │   └── mobile/                  ← Expo React Native — see apps/mobile/CLAUDE.md
    ├── packages/types/              ← Shared TypeScript types (mobile + api)
    ├── emails/                      ← React Email templates
    ├── rpi/                         ← RPI build execution folders (one per phase)
    └── docker-compose.yml

## Key Files

- `12-build-specification.md` — Full phase specs, AC, schema (source of truth — never modify)
- `apps/api/prisma/schema.prisma` — Single source of truth for all data types
- `.claude/settings.json` — Claude Code permissions and model config

## RPI Execution Workflow

**Read IMPLEMENT.md first on every session start.**

Commands:
- `/rpi:research [phase] [ac-id]` — Research an AC before planning
- `/rpi:plan [phase] [ac-id]` — Produce implementation plan (runs constitutional-validator)
- `/rpi:implement [phase] [ac-id]` — Execute approved plan (runs code-reviewer after)
- `/rpi:gate [phase]` — Phase gate (runs documentation-analyst-writer to update CLAUDE.md)
- `/rpi:status` — Current phase status

Phase sequence: 1 (Foundation) → 2 (Roadmap Engine) → 3 (Monetisation) → 4 (AI Chat) → 5 (RAG + Launch)

## Phase Reference

| Phase | Focus | Hours | AC Count |
|---|---|---|---|
| 1 | Foundation — monorepo, schema, auth | ~60h | 14 |
| 2 | Roadmap Engine — priority scoring, tasks | ~100h | 15 |
| 3 | Monetisation — RevenueCat, premium gate | ~55h | 12 |
| 4 | AI Chat Basic — SSE, system prompt, guardrails | ~40h | 15 |
| 5 | RAG + Launch — embeddings, app store | ~60h | 13 |

## Git Workflow

- Branch naming: `feat/description`, `fix/description`, `chore/description`
- Commit format: `feat(roadmap):`, `fix(chat):`, `test(core):`, `docs(claude):`
- Commit after every passing AC — not at end of day
- NEVER force-push to `main` or commit `.env.local`

Full conventions: `.claude/rules/git-workflow.md`

## Known Gotchas

### Claude Code Agent System

- **Agent files need proper frontmatter to be recognized.**
  Files in `.claude/agents/` must have YAML frontmatter with `name`, `model`, `description`, `tools`, and `color` fields. Without this, the agent exists as a file but isn't registered with the system. Always fix missing frontmatter rather than working around with different agents.

- **Agent file changes require session restart.**
  The agent registry loads at session startup, not dynamically. After fixing agent frontmatter or making changes to `.claude/agents/` files, restart the session for changes to be recognized.

### Supabase Auth — JWT Signing (CLI v2+)

- **Supabase CLI v2 uses ES256 (ECDSA P-256), not HS256.**
  There is no `SUPABASE_JWT_SECRET`. The "JWT secret from supabase status" gotcha is stale for CLI v2+.
- **AC-1-08 JWT verification must use JWKS endpoint discovery.**
  Local: `http://127.0.0.1:54321/auth/v1/.well-known/jwks.json`
  Use the `jose` library (ESM-native, supports ES256).
  Do NOT use symmetric `jsonwebtoken.verify(token, secret)` — it will fail.

## Compounding Engineering

After every correction: `/learn [what was learned]` to update relevant CLAUDE.md.
After every phase gate: documentation-analyst-writer updates CLAUDE.md automatically.
A stale CLAUDE.md is worse than no CLAUDE.md.
