# LandedNZ — Definitive Project Directory Hierarchy
# Every file, in its correct location.
# Claude Code accesses all files by exact path from repo root.
# Do not move any file without updating all references to it.

---

## Key rules before reading the hierarchy

1. `12-build-specification.md` lives at REPO ROOT — referenced as bare filename in CLAUDE.md,
   REQUEST.md files, agents, and commands. Do NOT move to docs/.
2. `CLAUDE.md` and `IMPLEMENT.md` live at REPO ROOT — Claude Code loads CLAUDE.md automatically.
3. All design docs (00–12 + KB files) live at REPO ROOT — they are reference documents,
   not source code. Keeping them at root means no path updates needed anywhere.
4. `00-master-context.md` is a human reference doc — NOT read by Claude Code during build.
   Used only for restoring chat context in planning sessions.
5. `03-candidate3-deep-dive.md` — rename the uploaded file (currently `03-candidate3-deep-dive_md.`)
   to `03-candidate3-deep-dive.md` before committing.

---

## Complete directory tree

```
landednz/                                          ← repo root
│
│  ── DESIGN & RESEARCH DOCS (human reference — not read by Claude Code during build) ──
│
├── 00-master-context.md                           ← session restore doc (paste into claude.ai)
├── 01-problem-landscape.md                        ← sector research, candidate shortlist
├── 02-candidate-analysis.md                       ← 4-candidate scoring, final selection
├── 03-candidate3-deep-dive.md                     ← LandedNZ deep dive (rename from _md.)
├── 04-user-personas-v2.md                         ← Priya, Arjun, Mei persona definitions
├── 05-problem-mapping.md                          ← root cause analysis, consequence mapping
├── 06-product-vision.md                           ← positioning, value prop, moat, monetisation
├── 07-feature-definition.md                       ← feature specs, scope boundaries
├── 08-user-flows.md                               ← onboarding, roadmap, chat, payment flows
├── 09-ai-design.md                                ← system prompt components, guardrails, RAG pipeline
├── 10-tech-stack.md                               ← stack decisions and rationale
├── 11-mvp-scope.md                                ← MVP boundary, what's deferred to v2
├── landednz_kb_schema_proposal.md                 ← KB schema design (reference)
├── landednz_kb_master_COMPLETE_v1.md              ← full KB content for T01–T21 (reference)
│
│  ── BUILD EXECUTION DOCS (read by Claude Code during build) ──
│
├── 12-build-specification.md                      ← CRITICAL: phase specs, ACs, Prisma schema
│                                                     Referenced by: CLAUDE.md, all REQUEST.md,
│                                                     planner agent, planning-discipline rule,
│                                                     plan command
├── CLAUDE.md                                      ← Claude Code project memory (auto-loaded)
├── IMPLEMENT.md                                   ← build tracker: phase status, AC status, session notes
│
│  ── CLAUDE CODE CONFIGURATION ──
│
├── .claude/
│   ├── settings.json                              ← model, permissions, tool allowlist
│   ├── constitution.md                            ← 16 non-negotiable architectural constraints
│   │
│   ├── rules/                                     ← auto-loaded by Claude Code
│   │   ├── code-quality.md                        ← MUST/SHOULD/NEVER, C01–C04 boundaries
│   │   ├── git-workflow.md                        ← branch naming, Conventional Commits
│   │   └── planning-discipline.md                 ← plan-before-code, RPI sequence, phase gates
│   │
│   ├── agents/                                    ← sub-agents invoked by Task() tool
│   │   ├── planner.md                             ← produces implementation plans
│   │   ├── code-reviewer.md                       ← standard + domain-specific review
│   │   ├── senior-software-engineer.md            ← primary build agent (all 4 skills preloaded)
│   │   ├── constitutional-validator.md            ← validates plans against constitution.md
│   │   ├── documentation-analyst-writer.md        ← updates CLAUDE.md files post-gate
│   │   └── technical-cto-advisor.md               ← architectural decisions (unexpected blockers only)
│   │
│   ├── commands/                                  ← slash commands (/rpi:research, /plan, etc.)
│   │   ├── rpi-research.md                        ← /rpi:research [phase] [ac-id]
│   │   ├── rpi-plan.md                            ← /rpi:plan [phase] [ac-id]
│   │   ├── rpi-implement.md                       ← /rpi:implement [phase] [ac-id]
│   │   ├── rpi-gate.md                            ← /rpi:gate [phase]
│   │   ├── rpi-status.md                          ← /rpi:status
│   │   ├── plan.md                                ← /plan [feature] (ad-hoc planning)
│   │   ├── review.md                              ← /review (code review)
│   │   └── learn.md                               ← /learn [finding] (update CLAUDE.md)
│   │
│   ├── hooks/                                     ← auto-run before/after tool use
│   │   ├── pre-tool-use.md                        ← TDD guard, secret detection, arch boundary guard
│   │   └── post-tool-use.md                       ← test reminder, pgvector index, commit reminder
│   │
│   └── skills/                                    ← domain knowledge preloaded by senior-software-engineer
│       ├── priority-engine/
│       │   └── SKILL.md                           ← scoring formula, persona weights, dep graph, golden examples
│       ├── knowledge-base-schema/
│       │   └── SKILL.md                           ← T01–T21 list, chunk construction, RAG pipeline
│       ├── ai-guardrails/
│       │   └── SKILL.md                           ← Level 1 patterns, Level 2 flags, SSE pipeline position
│       └── chat-system-prompt/
│           └── SKILL.md                           ← all 5 components, persona anchors, opening messages
│
│  ── RPI WORKFLOW (research/plan/implement per AC) ──
│
├── rpi/
│   ├── phase1-foundation/
│   │   ├── REQUEST.md                             ← phase scope, 14 ACs, failure points, gate scenario
│   │   ├── research/
│   │   │   └── .gitkeep                           ← /rpi:research writes AC-1-01.md etc. here
│   │   └── plans/
│   │       └── .gitkeep                           ← /rpi:plan writes AC-1-01.md etc. here
│   │
│   ├── phase2-roadmap-engine/
│   │   ├── REQUEST.md                             ← phase scope, 15 ACs, golden examples, Priya scenario
│   │   ├── research/
│   │   │   └── .gitkeep
│   │   └── plans/
│   │       └── .gitkeep
│   │
│   ├── phase3-monetisation/
│   │   ├── REQUEST.md                             ← phase scope, 12 ACs, HMAC + RevenueCat rules
│   │   ├── research/
│   │   │   └── .gitkeep
│   │   └── plans/
│   │       └── .gitkeep
│   │
│   ├── phase4-ai-chat-basic/
│   │   ├── REQUEST.md                             ← phase scope, 15 ACs, 10-step SSE pipeline
│   │   ├── research/
│   │   │   └── .gitkeep
│   │   └── plans/
│   │       └── .gitkeep
│   │
│   └── phase5-rag-launch/
│       ├── REQUEST.md                             ← phase scope, 13 ACs, RAG pipeline, launch checklist
│       ├── research/
│       │   └── .gitkeep
│       └── plans/
│           └── .gitkeep
│
│  ── APPLICATION SOURCE CODE ──
│
├── apps/
│   ├── api/                                       ← Node.js + Fastify backend
│   │   ├── CLAUDE.md                              ← api-specific gotchas: Fastify, Prisma, pgvector,
│   │   │                                            SSE, Supabase, RevenueCat, Claude API (~150 lines)
│   │   ├── prisma/
│   │   │   ├── schema.prisma                      ← single source of truth for all data types
│   │   │   └── migrations/                        ← never use db push — always migrate dev
│   │   ├── scripts/
│   │   │   ├── seed-knowledge-base.ts             ← T01–T21 tasks + content variants
│   │   │   └── generate-embeddings.ts             ← Phase 5: embeddings for KnowledgeBaseChunk
│   │   ├── src/
│   │   │   ├── features/
│   │   │   │   ├── roadmap/                       ← Job A: engine, routes, types
│   │   │   │   │   ├── routes.ts
│   │   │   │   │   ├── service.ts
│   │   │   │   │   └── types.ts
│   │   │   │   ├── chat/                          ← Job B: RAG, prompt, routes, types
│   │   │   │   │   ├── routes.ts
│   │   │   │   │   ├── service.ts
│   │   │   │   │   ├── guardrails/
│   │   │   │   │   │   ├── level1.ts
│   │   │   │   │   │   └── level2.ts
│   │   │   │   │   └── rag/
│   │   │   │   │       └── retrieval.ts
│   │   │   │   ├── onboarding/
│   │   │   │   │   ├── routes.ts
│   │   │   │   │   └── service.ts
│   │   │   │   ├── reminders/
│   │   │   │   │   ├── routes.ts
│   │   │   │   │   └── service.ts
│   │   │   │   └── auth/
│   │   │   │       └── middleware.ts
│   │   │   ├── core/                              ← pure functions — zero framework deps
│   │   │   │   ├── priority/
│   │   │   │   │   ├── scoring.ts
│   │   │   │   │   ├── scoring.test.ts
│   │   │   │   │   ├── filter.ts
│   │   │   │   │   └── filter.test.ts
│   │   │   │   ├── dependencies/
│   │   │   │   │   ├── resolver.ts
│   │   │   │   │   └── resolver.test.ts
│   │   │   │   └── prompts/
│   │   │   │       ├── registry.ts                ← ALL prompt construction lives here
│   │   │   │       └── registry.test.ts
│   │   │   └── shared/
│   │   │       ├── db.ts                          ← Prisma client singleton
│   │   │       ├── errors.ts                      ← AppError, AIFailureError
│   │   │       ├── logger.ts                      ← structured logger
│   │   │       ├── config.ts                      ← env var access
│   │   │       ├── ai/
│   │   │       │   └── claude.client.ts           ← ONLY file that imports @anthropic-ai/sdk
│   │   │       └── plugins/
│   │   │           └── error-handler.ts           ← Fastify global error handler
│   │   ├── golden-examples/
│   │   │   ├── priority-scoring.ts                ← 4 golden examples (Phase 2, load-bearing)
│   │   │   └── rag-retrieval.ts                   ← 4 golden examples (Phase 5, load-bearing)
│   │   ├── tsconfig.json
│   │   ├── jest.config.ts
│   │   └── package.json
│   │
│   └── mobile/                                    ← React Native CLI — iOS + Android
│       ├── CLAUDE.md                              ← mobile-specific gotchas: Xcode, CocoaPods,
│       │                                            RevenueCat SDK, Apple Sign-In, SSE streaming (~90 lines)
│       ├── react-native.config.js                 ← React Native CLI configuration
│       ├── src/
│       │   ├── screens/
│       │   │   ├── OnboardingScreen.tsx
│       │   │   ├── RoadmapScreen.tsx
│       │   │   ├── TaskCardScreen.tsx
│       │   │   └── ChatScreen.tsx
│       │   ├── components/
│       │   ├── hooks/
│       │   └── services/
│       │       └── api.ts
│       ├── tsconfig.json
│       └── package.json
│
│  ── SHARED PACKAGES ──
│
├── packages/
│   └── types/
│       ├── index.ts                               ← shared TypeScript types (mobile + api boundary)
│       └── package.json
│
│  ── EMAIL TEMPLATES ──
│
├── emails/
│   ├── SmartReminder.tsx                          ← React Email template
│   ├── GateDefer.tsx
│   └── LapsedReEntry.tsx
│
│  ── REPO ROOT CONFIG ──
│
├── docker-compose.yml                             ← PostgreSQL 16 + pgvector on :5432
├── package.json                                   ← npm workspaces: apps/api, apps/mobile, packages/types
├── .env.example                                   ← all required env vars documented
├── .env.local                                     ← NEVER commit (in .gitignore)
├── .gitignore
└── tsconfig.base.json                             ← shared TypeScript config

```

---

## Files that MUST stay at repo root (path references locked)

These files are referenced by exact bare filename in CLAUDE.md, REQUEST.md files,
agents, commands, and rules. Moving them will break Claude Code's ability to find them.

| File | Referenced in |
|------|---------------|
| `12-build-specification.md` | CLAUDE.md, all 5 REQUEST.md, planner.md, planning-discipline.md, plan.md |
| `CLAUDE.md` | Auto-loaded by Claude Code; referenced in all agents and commands |
| `IMPLEMENT.md` | All RPI commands, all REQUEST.md, all agents |

---

## File you need to rename before committing

| Current filename | Correct filename |
|-----------------|-----------------|
| `03-candidate3-deep-dive_md.` | `03-candidate3-deep-dive.md` |

---

## What Claude Code reads vs. what is human-only reference

| File | Read by Claude Code | Read by human |
|------|--------------------|----|
| `12-build-specification.md` | ✅ Yes — every session | ✅ Yes |
| `CLAUDE.md` | ✅ Yes — auto-loaded | ✅ Yes |
| `IMPLEMENT.md` | ✅ Yes — every session | ✅ Yes |
| `09-ai-design.md` | Only if explicitly asked | ✅ Yes — reference |
| `00-master-context.md` | ❌ No | ✅ Yes — paste into claude.ai |
| `01–08, 10–11` design docs | ❌ No | ✅ Yes — reference |
| `landednz_kb_*.md` | ❌ No (content seeded into DB) | ✅ Yes — reference |
| All `.claude/` files | ✅ Yes — auto-loaded | ✅ Yes |
| All `rpi/*/REQUEST.md` | ✅ Yes — per phase session | ✅ Yes |
| `apps/api/CLAUDE.md` | ✅ Yes — when in api/ context | ✅ Yes |
| `apps/mobile/CLAUDE.md` | ✅ Yes — when in mobile/ context | ✅ Yes |
