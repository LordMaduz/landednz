# LandedNZ
# Stack: React Native CLI · Next.js 14 · Node.js/Fastify · PostgreSQL/pgvector · Claude API
# Environment: macOS · Node.js 22 LTS · Claude Code

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

**Three clients — one API:**

| Client | Stack | Status |
|---|---|---|
| Mobile | React Native CLI (iOS + Android) | Paused — web first |
| Web | Next.js 14 App Router | Active build — see apps/web/CLAUDE.md |
| API | Node.js + Fastify | Complete through Phase 5 (development) |

## Monorepo Structure

    landednz/
    ├── CLAUDE.md                    ← this file (project-level memory)
    ├── IMPLEMENT.md                 ← execution state tracker (AC pass/fail per phase + web stage)
    ├── docs/                        ← external setup guides (Google OAuth, etc.)
    ├── mockup-screens/              ← interactive React mockups — visual truth for web UI
    │   ├── MOCKUP-REFERENCE-INDEX.md ← file map, design decisions, tokens, component inventory
    │   ├── landednz-screen-landing-page.jsx
    │   ├── landednz-screen-onboarding.jsx
    │   ├── landednz-screen-roadmap-dashboard.jsx
    │   ├── landednz-screen-chat-interface.jsx
    │   ├── landednz-screen-premium-gate.jsx
    │   ├── landednz-screen-settings.jsx
    │   └── landednz-screen-auth.jsx
    ├── .claude/                     ← all Claude Code config
    │   ├── constitution.md          ← architectural non-negotiables (C01-C16 backend + CW01-CW06 web)
    │   ├── agents/                  ← specialised subagents
    │   ├── commands/                ← slash commands (rpi:research/plan/implement/gate/status)
    │   ├── hooks/                   ← pre/post tool use hooks (backend + web guards)
    │   ├── rules/                   ← coding standards, git workflow, planning discipline
    │   └── skills/                  ← domain knowledge
    │       ├── priority-engine/     ← scoring formula, persona weights, dep graph, golden examples
    │       ├── knowledge-base-schema/ ← T01-T21 list, chunk construction, RAG pipeline
    │       ├── ai-guardrails/       ← Level 1 patterns, Level 2 flags, SSE pipeline position
    │       ├── chat-system-prompt/  ← all 5 components, persona anchors, opening messages
    │       ├── web-design-system/   ← Tailwind tokens, component APIs, a11y requirements
    │       ├── web-component-patterns/ ← 7-state task card, optimistic updates, premium gate
    │       ├── web-responsive-layout/ ← breakpoints, sidebar collapse, panel transitions
    │       └── web-chat-streaming/  ← SSE consumption, token rendering, citations
    ├── apps/
    │   ├── api/                     ← Fastify backend — see apps/api/CLAUDE.md
    │   ├── mobile/                  ← React Native CLI — see apps/mobile/CLAUDE.md (paused)
    │   └── web/                     ← Next.js 14 web app — see apps/web/CLAUDE.md
    ├── packages/types/              ← Shared TypeScript types (mobile + api + web)
    ├── emails/                      ← React Email templates
    ├── rpi/                         ← RPI build execution folders (backend phases + web stages)
    │   ├── phase1-foundation/
    │   ├── phase2-roadmap-engine/
    │   ├── phase3-monetisation/
    │   ├── phase4-ai-chat-basic/
    │   ├── phase5-rag-launch/
    │   ├── web-stage1-design-system/
    │   ├── web-stage2-layout-shell/
    │   ├── web-stage3-static-screens/
    │   ├── web-stage4-api-integration/
    │   ├── web-stage5-interactive-polish/
    │   └── web-stage6-deployment/
    └── docker-compose.yml

## Key Files

- `12-build-specification.md` — Backend phase specs, AC, schema (source of truth — never modify)
- `15-web-build-specification.md` — Web stage specs, AC, architecture (source of truth — never modify)
- `13-ui-ux-research.md` — Reference app analysis, design patterns, visual direction
- `14-ui-ux-design.md` — Screen-by-screen design spec, design tokens, component states (overridden by mockups on 6 decisions — see index)
- `16-web-layout-analysis.md` — Layout rules from Linear/Notion/Intercom Fin analysis
- `mockup-screens/MOCKUP-REFERENCE-INDEX.md` — Visual source of truth for web UI. Maps mockup files to screens, documents 6 design decisions that override doc 14, lists all design tokens, component inventory, and animation specs. **Read this before implementing any web UI.**
- `apps/api/prisma/schema.prisma` — Single source of truth for all data types
- `.claude/settings.json` — Claude Code permissions and model config

## RPI Execution Workflow

**Read IMPLEMENT.md first on every session start.**

Commands:
- `/rpi:research [phase-or-stage] [ac-id]` — Research an AC before planning
- `/rpi:plan [phase-or-stage] [ac-id]` — Produce implementation plan (runs constitutional-validator)
- `/rpi:implement [phase-or-stage] [ac-id]` — Execute approved plan (runs code-reviewer after)
- `/rpi:gate [phase-or-stage]` — Phase/stage gate (runs documentation-analyst-writer to update CLAUDE.md)
- `/rpi:status` — Current phase/stage status

Backend phase sequence: 1 (Foundation) → 2 (Roadmap Engine) → 3 (Monetisation) → 4 (AI Chat) → 5 (RAG + Launch)
Web stage sequence: W1 (Design System) → W2 (Layout Shell) → W3 (Static Screens) → W4 (API Integration) → W5 (Interactive Polish) → W6 (Deployment)

**Web stages use the same commands as backend phases:**
```
/rpi:research web-stage1 AC-W1-01    ← same command, just different phase name
/rpi:plan web-stage1 AC-W1-01
/rpi:implement web-stage1 AC-W1-01
/rpi:gate web-stage1
```

### RPI Workflow Discipline

- **Follow plan exactly — never improvise, never manipulate tests.** When implementing any AC, execute the plan and test strategy exactly as written. If errors occur: STOP → Plan mode → root cause analysis → proper fix. Never claim PASS without running actual verification steps. Never work around failures or take shortcuts. This discipline is non-negotiable across all ACs in all phases. Violation is not tolerable.

- **Execute all verification steps before code review.** When approved plans specify verification steps (like "Run npm run storybook", "Run npx tsc --noEmit"), execute them exactly as written before proceeding to code reviewer. Never skip verification steps and jump directly to code review — the plan sequence is mandatory.

### RPI Workflow Optimizations

- **AC-2-15 research automation** — `/rpi:research phase2 AC-2-15` auto-generates URL liveness checker and verification report template. Reduces manual URL checking time while preserving sequential task verification approach required for knowledge base content accuracy.

## Phase Reference

| Phase | Status | Focus | Hours | AC Count |
|---|---|---|---|---|
| 1 | COMPLETE | Foundation — monorepo, schema, auth | ~60h | 15 |
| 2 | COMPLETE | Roadmap Engine — priority scoring, tasks | ~100h | 15 |
| 3 | DEFERRED | Monetisation — RevenueCat, premium gate | ~55h | 12 |
| 4 | COMPLETE | AI Chat Basic — SSE, system prompt, guardrails | ~40h | 14 PASS + 1 DEFERRED |
| 5 | COMPLETE (development) | RAG + Launch — embeddings, app store | ~60h | 7 PASS + 6 DEFERRED |

## Web Stage Reference

| Stage | Status | Focus | Hours | AC Count |
|---|---|---|---|---|
| W1 | NOT STARTED | Design System — Tailwind, UI primitives, Storybook | ~20h | 17 |
| W2 | BLOCKED | Layout Shell — sidebar, routes, responsive | ~15h | 11 |
| W3 | BLOCKED | Static Screens — all pages with mock data | ~35h | 15 |
| W4 | BLOCKED | API Integration — real data, auth, streaming, Stripe | ~30h | 16 |
| W5 | BLOCKED | Interactive Polish — animations, a11y, performance | ~20h | 16 |
| W6 | BLOCKED | Deployment — Vercel, production, monitoring | ~10h | 10 |

## Web Architecture

**Framework:** Next.js 14 App Router
**Styling:** Tailwind CSS (design tokens in tailwind.config.ts — never raw values in components)
**State:** Zustand (client) + nuqs (URL) + RSC (server)
**Auth:** Supabase SSR helpers (@supabase/ssr)
**Payments:** Stripe Checkout (redirect mode, not embedded)
**Testing:** Storybook 8 + Playwright (visual regression + E2E) + Vitest (unit)
**Deploy:** Vercel

**Visual source of truth:** `mockup-screens/*.jsx` — interactive React mockups for all 9 web screens.
`mockup-screens/MOCKUP-REFERENCE-INDEX.md` documents design decisions, resolved conflicts with doc 14,
and the complete design token set. When any text spec (docs 13, 14, 16) conflicts with a mockup,
the mockup wins.

**Source hierarchy for web UI (highest → lowest):**
1. `mockup-screens/MOCKUP-REFERENCE-INDEX.md` — design decisions and resolved conflicts
2. `mockup-screens/*.jsx` — pixel-level visual reference
3. `.claude/skills/web-*` — implementation patterns and code structure
4. `14-ui-ux-design.md` — original spec (overridden on 6 decisions)
5. `16-web-layout-analysis.md` — layout rules

**Constitutional constraints:** CW01-CW06 in constitution.md cover web-specific rules
(Tailwind tokens only, Storybook required, reduced motion, shared types, mock data shape, no localStorage for auth).

## Git Workflow

- Branch naming: `feat/description`, `fix/description`, `chore/description`
- Commit format: `feat(roadmap):`, `fix(chat):`, `test(core):`, `docs(claude):`, `feat(web):`
- Commit after every passing AC — not at end of day
- NEVER force-push to `main` or commit `.env.local`

**Git scopes:**

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
| `web` | Next.js web app: pages, components, hooks, stores |
| `deps` | Dependency updates |
| `claude` | CLAUDE.md, `.claude/` config files |

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

### Testing Authentication

- **Never mock authentication in integration tests.**
  Always use real Supabase auth flow: create test users via Supabase, retrieve their actual JWT tokens, use those tokens in Authorization headers for tests, then clean up test users after verification. This approach gives "real confidence" without test manipulation and was successfully used in AC-4-01. Mocking auth leads to 401 errors and doesn't test the actual auth flow.

- **onRoute hooks cannot override preHandlers after route registration.**
  Route registration happens immediately when `registerChatRoutes()` is called. The `onRoute` hook fires during registration but cannot modify the already-set `preHandler`. Use real Supabase auth in tests instead of mock auth hooks.

### SSE Testing

- **app.inject() buffers entire SSE responses.**
  Cannot prove progressive delivery with Fastify's `inject()` method. Use standalone scripts with `fetch()` + `ReadableStream` against real servers to verify streaming. Test both success chunks and error events to prove non-buffering in both scenarios.

### Implementation Verification

- **Never mock away integration failures during critical AC implementation.**
  When core features like RAG integration timeout or fail in tests, investigate the root cause first. Mocking `retrieveChunks()` to "fix" timeouts hides real integration issues and breaks verification integrity. Critical ACs require end-to-end verification with real API calls, real embeddings, and real chunk IDs in the database. Test shortcuts during core feature implementation are unacceptable. Learned during AC-5-06 RAG wiring.

### Web-Specific Gotchas

- **Supabase SSR cookie configuration.**
  `@supabase/ssr` requires specific cookie setup for Next.js App Router middleware.
  Use `createServerClient()` in server components and `createBrowserClient()` in client components.
  Auth state is managed via HTTP-only cookies, not localStorage (CW06).

- **SSE consumption in browser uses fetch, not EventSource.**
  `EventSource` does not support custom headers (Authorization). Use `fetch()` + `ReadableStream`
  + `TextDecoder` for SSE consumption. See web-chat-streaming skill for the pattern.

- **Tailwind arbitrary values are prohibited.**
  `bg-[#1B6B6D]` or `p-[23px]` are violations of CW01. If a token doesn't exist in
  `tailwind.config.ts`, add it there first, then use the class.

- **DM Sans + DM Serif Display fonts must be self-hosted.**
  Do not use `next/font` with Google Fonts CDN. Download DM Sans (variable, woff2) and
  DM Serif Display (400, woff2), place in `public/fonts/`, and use `@font-face` in globals.css
  with `font-display: swap`. The original spec referenced Inter — that was changed during the
  mockup session to DM Sans (body) + DM Serif Display (headings) for warmer tone.

## Compounding Engineering

After every correction: `/learn [what was learned]` to update relevant CLAUDE.md.
After every phase/stage gate: documentation-analyst-writer updates CLAUDE.md automatically.
A stale CLAUDE.md is worse than no CLAUDE.md.
