# R0 "New LandedNZ" — Foundation Release Design

**Date:** 2026-10-24 · **Status:** Draft, awaiting review · **Branch:** `docs/r0-foundation-spec`

## 1. Purpose

LandedNZ helps skilled migrants through their first 90 days in New Zealand with a personalised, dependency-aware roadmap and an AI settlement assistant. The v1 app (built 2026-03 → 2026-04) is outdated in stack and design, and its production backend no longer exists.

R0 is the first of five agile releases (R0 → R4) that turn LandedNZ into a portfolio- and investor-demo-quality, AI-native product. **R0 ships no new features.** It delivers:

1. A new stack, a new design system, and every existing screen redesigned (light-only, minimalist).
2. One monorepo as the single source of truth.
3. A stable, monitored deployment that every later release builds on.

### Later releases (context only, not in R0 scope)

| Release | Ships |
|---|---|
| R1 Trusted answers | Cited answers with source links and "last verified" dates; multilingual answers |
| R2 Settlement agent | Assistant calls tools on the roadmap and replies with interactive task cards |
| R3 60-second onboarding | Conversational profile intake replacing the form |
| R4 Document intelligence | Upload visa/offer/tenancy docs → profile autofill and flagged issues; "draft it for me" if time allows |

R0 must not block these: the workspace layout reserves the assistant panel for R2, and the design system includes AI-reply components R1/R2 extend.

### Success criteria (R0 definition of done)

1. Every design board in §7 is approved and the built pages match them.
2. All quality gates in §9 pass.
3. Production is live on `landednz.co.nz` / `api.landednz.co.nz` with sign-in, onboarding, roadmap, assistant chat and settings working end to end.
4. `landednz-be` is archived; the repo matches §3; README and CLAUDE.md are rewritten.
5. Health monitoring and Sentry have been green for 24 hours after the release.

### Non-goals

Payments (Stripe/RevenueCat), mobile app, dark mode, new AI features, email magic-link sign-in, switching ORM or embeddings provider, API contract changes.

## 2. Current state (verified 2026-10-23)

| Piece | Status |
|---|---|
| Web `https://landednz.vercel.app` | Up, serving commit `ccd48bd` (Next 14) |
| API `landednz-be-production.up.railway.app` | Gone — Railway returns "Application not found" |
| Supabase `tmuezhiobfirphfncmbe` (auth + DB) | Gone — hostname no longer resolves |

No user data existed, so nothing is lost. The database is rebuilt from the 4 Prisma migrations, `seed-knowledge-base.ts`, `generate-embeddings.ts` and the KB master document.

Two backend copies exist: `landednz/apps/api` (CommonJS) and `landednz-be` (newer: ESM, working Alpine Dockerfile, `/config` endpoint with beta mode). Shared types are identical; Prisma schema differs only in `binaryTargets`.

## 3. Repository

### Decision

`landednz` (monorepo) is the only repo. `landednz-be` is ported in, then archived read-only on GitHub **after** the monorepo API is live on staging.

### Target structure

```
landednz/
├── apps/
│   ├── web/                    fresh Next 16 app
│   └── api/                    Fastify (ported from landednz-be, ESM)
│       ├── src/  prisma/  golden-examples/
│       ├── scripts/            seed-knowledge-base, generate-embeddings,
│       │                       validate-seed-content, end-to-end-validation
│       ├── content/kb-master.md   (moved from root landednz_kb_master_COMPLETE_v1.md)
│       └── Dockerfile
├── packages/types/
├── supabase/                   config.toml + seed config for the local stack
├── docs/
│   ├── superpowers/specs/  superpowers/plans/
│   └── setup/                  google-oauth.md, deploy-runbook.md
├── .claude/                    trimmed constitution, new skills, cleaned settings
├── .github/workflows/          ci.yml, health.yml
├── CLAUDE.md  README.md        rewritten
└── package.json  tsconfig.base.json  .nvmrc (24)
```

### Deleted (git history is the backup)

- Root: `00-…16-*.md`, `landednz-complete-plan-v2.md`, `IMPLEMENT.md`, `PROJECT-HIERARCHY.md`, `ARCHITECTURE.md`, `landednz_kb_schema_proposal.md`, `test-structured.sh`, root `railway.toml`, `vercel.json`, `.vercelignore`, `docker-compose.yml`, `docker/` (Supabase local replaces it, §5.4).
- `rpi/`, `mockup-screens/`, `docs/*.md` (except `google-oauth-setup.md` → `docs/setup/google-oauth.md`).
- `apps/mobile/` entirely.
- `apps/web/` entirely, after the carried files (§6.4) are copied into the new app — includes `storybook-static/` (3.2 MB), `.storybook/`, stories, 25 old screenshot baselines, DM fonts, duplicate `next.config.*`, `test-chat-responses.md`.
- `apps/api/dist/` (229 committed build files), `scripts/check-ac-2-15-urls.ts`, `scripts/generate-ac-2-15-template.ts`, `scripts/test-sse-streaming.ts`, `scripts/test-structured-response.ts`.
- `.claude/`: all 7 agents, 9 `/rpi:*` commands, hook docs, `rules/`, skills `web-design-system`, `web-component-patterns`, `web-responsive-layout`.
- `landednz-be` scratch files (`debug-*.ts`, `validate-*.ts`, `test-*.ts`) are not ported.

### `.claude/` after R0

- **Constitution** keeps C02–C08, C10, C12–C16 unchanged; keeps C01 (Job A/B separation) for R0 only — R2 rewrites it; removes C09, C11 (RevenueCat). Web rules keep CW01, CW03–CW06 (updated for Tailwind 4); CW02 (Storybook) is replaced by **CW02′: every UI change matches its approved artifact and passes the minimalism validator**; adds **CW07 minimalism** and **CW08 light theme only**.
- **Skills** keep `priority-engine`, `knowledge-base-schema`, `ai-guardrails`, `chat-system-prompt`, `web-chat-streaming` (refreshed); add `minimalism-validator` (§7.1) and `landednz-design-system` (generated from the approved design-system board).
- **settings.json**: remove the `claude-sonnet-4` model pin and React Native/Xcode permissions; keep the golden-examples PostToolUse hook (path updated).

## 4. Backend

### 4.1 Port

Copy `landednz-be/src`, `scripts` (kept ones), `prisma/schema.prisma` over `apps/api`; replace local `types/` imports with `@landednz/types`; run the full suite (167 tests + golden examples). The port is done when all pass.

### 4.2 Upgrade order (tests green after every step)

1. Node 24 LTS, ESM baseline, TypeScript (see §6.1 for the TS 7 check).
2. Fastify 5.12; add `@fastify/rate-limit`.
3. Prisma 5.22 → **7.10, pinned with `prisma@7` / `@prisma/client@7`** (npm `latest` is an 8.0 RC). Use the `prisma-upgrade-v7` skill. pgvector column and raw-SQL search unchanged.
4. Anthropic SDK 0.79 → 1.1. Model from env: `ANTHROPIC_MODEL` = Claude Sonnet 5.5 (`claude-sonnet-5-5`). A separate fast model is not added: `generateText` has no callers in R0. `max_tokens` cap unchanged. Use the `claude-api` skill.
5. OpenAI SDK 7 (embeddings stay `text-embedding-3-small`, 1536 dims — no re-embedding), Vitest 5, zod 4 for config validation now; route request schemas move to zod in R2 when agent tools need them.

### 4.3 Unchanged in R0

API routes and payloads, SSE event format, RAG pipeline order (C07), guardrails, prompts registry.

### 4.4 Changes

- **pgvector**: enabled today only by `docker/init.sql`. Add `CREATE EXTENSION IF NOT EXISTS vector;` at the top of the init migration (safe: no existing databases).
- **`/health`** runs `SELECT 1` against the database and returns 503 on failure. This also keeps free Supabase projects from pausing.
- **`AI_MODE`** env: `live` (real Claude + OpenAI) or `mock` (deterministic scripted replies and fixed embeddings, implemented inside `shared/ai/` so C03 still holds). Required; no default.
- **Rate limits**: global per-IP limit, plus a per-user daily chat-message cap from env (`CHAT_DAILY_CAP`), returning a typed error the web app renders.
- **CORS** restricted to the environment's web origins.
- **Sentry** on the API, tagged with the release.

### 4.5 Docker

One `apps/api/Dockerfile`, build context = repo root, copying only `apps/api`, `packages/types` and root manifests. Node 24 Alpine + OpenSSL. Pre-deploy command: `npx prisma migrate deploy`. The same image runs locally, on Render (staging) and on Railway (production). Railway watch paths: `apps/api/**`, `packages/types/**`.

### 4.6 Database bootstrap

`npm run db:bootstrap` (idempotent): migrate deploy → seed KB → generate embeddings → create ivfflat index (after embeddings, C05). Run once per environment and on first local start.

## 5. Infrastructure and environments

### 5.1 Branches and releases

- PRs → Vercel preview (web) using staging API and staging Supabase.
- Merge to `main` → deploys **staging**.
- A release fast-forwards `production` to a `main` commit already verified on staging, tagged `r0`, `r1`, …
- Production deploys only from `production`.

### 5.2 Environments

| | Local | Staging ($0 hosting) | Production |
|---|---|---|---|
| Web | `next dev` / `vercel build` | Vercel Hobby, `staging.landednz.co.nz` + PR previews | Vercel Hobby, `landednz.co.nz` |
| API | `npm run dev` / `npm run docker:api` | Render free web service (same Dockerfile), `api-staging.landednz.co.nz` | Railway Hobby (~US$5/mo), `api.landednz.co.nz` |
| DB + auth | Supabase CLI local stack | Supabase free project `landednz-staging` (Sydney) | Supabase free project `landednz-prod` (Sydney) |
| Sign-in | Email + password (Google optional) | Google + email/password (test user only) | Google only |
| `AI_MODE` | `mock` for tests, `live` on demand | `live` | `live` |
| Anthropic workspace | developer's key | `landednz-staging`, own monthly spend limit, lower `CHAT_DAILY_CAP` | `landednz-prod`, own monthly spend limit |

Regions: Supabase Sydney, Vercel functions `syd1`, Railway nearest Asia-Pacific region, Render Singapore.

**Known limits**: Render free sleeps after 15 idle minutes (30–60 s cold start) — acceptable for staging only. Vercel Hobby forbids commercial use: fine for portfolio/demo, move to Pro (~US$20/mo) before charging money or running ads. If Render's free tier cannot attach a custom domain, staging uses its `onrender.com` URL.

### 5.3 Database connections

The API and migrations use Supabase's Supavisor **session-mode pooler** (IPv4). The direct connection is IPv6-only on the free tier, and Railway/Render IPv6 egress is not relied on.

### 5.4 Local stack — everything verifiable on the developer's Mac

- `npm run dev:all`: `supabase start` → `db:bootstrap` if the DB is empty → API with hot reload → `next dev`.
- `npm run docker:api`: runs the exact production container against local Supabase.
- `vercel build`: reproduces Vercel's build locally (free CLI).
- Supabase local provides Postgres + pgvector, auth, Studio and the email-capture inbox; it replaces docker-compose.
- The Playwright suite runs unchanged against local, staging and production via `BASE_URL`.

### 5.5 Monitoring

- `.github/workflows/health.yml`: every 6 hours, GET `/health` on staging and production; on failure open a GitHub issue (emails the owner).
- Sentry: one project for web, one for API, release-tagged.
- PostHog: page views and feature flags (later releases ship behind flags).

### 5.6 Owner prerequisites (checklist in `docs/setup/deploy-runbook.md`)

Register `landednz.co.nz`; Railway Hobby account; Render account; 2 Supabase projects; Sentry; PostHog; Google OAuth client with both Supabase callback URLs; Anthropic workspaces + keys + spend limits; OpenAI key + spend limit; DNS records (runbook lists them exactly). Logins for `railway` and `supabase` CLIs have expired and must be redone.

## 6. Web app

### 6.1 Stack

Next 16.4 (App Router), React 19.3, Tailwind 4.3 (tokens in CSS `@theme`), shadcn/ui 4 on Radix restyled with LandedNZ tokens, motion 14 (only for the moments in §7.2), lucide icons, sonner, react-markdown, Zustand 5, `@supabase/ssr` 0.12, Vitest 5, Playwright 1.64. Storybook is dropped.

TypeScript: try 7.0 in a half-day check at the start of R0 (Next build, Vitest, Prisma generate, typecheck). If any fails, use the latest 5.x. Decision recorded in the plan.

### 6.2 Journey (unchanged — already conversion-friendly)

Landing → onboarding questions **without an account** → roadmap preview → Google sign-in to save → workspace.

### 6.3 Routes

| Route | Screen | Access |
|---|---|---|
| `/` | Landing | public |
| `/onboarding` | Questions + roadmap preview | public |
| `/signin`, `/auth/callback` | Sign-in | public |
| `/app` | Workspace: roadmap (main), assistant panel (side; bottom sheet on phones), task detail in place | signed in |
| `/settings` | Profile and account | signed in |
| `/privacy`, `/terms` | Legal (one template) | public |

Redirects: `/roadmap`, `/chat` → `/app`; `/auth/signin` → `/signin`. Dropped: `/contact` (footer mailto), `/resources` (superseded by R1), landing pricing section.

The auth guard moves from `middleware.ts` to `proxy.ts` (Next 16 naming), protecting `/app` and `/settings`.

### 6.4 Carried over from the old app (with tests)

`lib/api.ts`, `lib/chat-parser.ts` + test, `lib/roadmap-mapper.ts` + test, `lib/stores/*`, `lib/supabase/*`, `lib/utils/*`, `lib/hooks/useReducedMotion.ts`, the auth guard logic. Everything visual is new.

### 6.5 Structure

```
apps/web/src/
├── app/          routes; error.tsx + loading.tsx per segment; sitemap.ts, robots.ts, opengraph-image.tsx
├── components/
│   ├── ui/       shadcn primitives, restyled
│   ├── marketing/  onboarding/  workspace/  assistant/  settings/
├── lib/          carried files + analytics.ts
└── proxy.ts
```

Data stays client-fetched through `lib/api.ts` with the Supabase token; no new data library. Fonts via `next/font` (Bricolage Grotesque, Figtree). Sentry and PostHog initialised once in the root layout.

## 7. Design

### 7.1 Minimalism validator (built first)

Project skill `.claude/skills/minimalism-validator/`, written with `superpowers:writing-skills` and tested against pass/fail example designs before use. It returns pass/fail per check with a reason, and runs on every design board and every UI PR. Checks:

1. One accent colour (teal). Aurora appears only on AI-generated elements.
2. Every visual element carries information; no decorative cards, eyebrows, dividers or icons.
3. At most 5 type sizes per screen; only the scale's sizes.
4. One primary action and one dominant element per screen.
5. Spacing only from the 8 px scale.
6. No duplicated actions or repeated information on one screen.
7. Copy says each thing once, in plain words.
8. Light theme only.

### 7.2 Chosen direction: "Topo Minimal" (approved 2026-10-23)

Reference board: `Chosen.dc.html` on https://claude.ai/artifact/515pzxGLq8z371DbXf9gVc

Approved interaction model (2026-10-24, boards `DesignSystem`, `AppMap`, `JourneyHome` prototype, `JourneyPhone`): the workspace opens on the next task as a large card on the route; a task opens in a sheet that docks beside the route at ≥ 1100 px and slides over it below that; the assistant lives inside the task sheet with 2–3 suggested questions; task names are actions; progress is a bar plus count; every view has a URL, browser Back returns to the previous view, Close and the logo return home. Type scale 56/32/17/15/13; spacing 4, 8, 16, 24, 32, 48, 64.

- Colours: ink `#0F2A3A`, teal `#0E7C7B`, muted `#4B6170`, mist `#F4F7F7`, white surfaces; aurora gradient `#3FC79A → #5AAED6 → #8B78F0` for AI elements only.
- Type: Bricolage Grotesque (headings), Figtree (everything else).
- Signature elements: roadmap drawn as a route with waypoints; completion stamp on done tasks; AI replies with an aurora hairline border and a one-line trace of what the assistant did; topo contour motif only on the landing hero.
- Motion only for: aurora on AI replies while streaming, the stamp on completion, panel open/close. `prefers-reduced-motion` respected.

### 7.3 Artifact workflow

One Design canvas, "LandedNZ R0 Design", built in this order:

1. **Design system board**: tokens (colour, type scale, spacing, radius, shadow); button, input, option card, toast; task waypoint in 5 states (locked, available, current, blocked, done + stamp); AI reply, step trace, source pill, action buttons, assistant panel; empty, loading and error patterns.
2. **Page boards**, desktop 1440 and mobile 390:
   - Landing
   - Onboarding: question step, roadmap preview
   - Sign in
   - Workspace: default, task detail open, assistant streaming, first-use empty, API-down error, mobile with assistant bottom sheet
   - Settings
   - Legal template
3. **Clickable prototype** of the journey: landing → onboarding → preview → sign-in → workspace.

Content is real (tasks from the KB's T01–T21); no lorem ipsum or invented statistics.

**Gate per board**: minimalism validator + `web-design-guidelines` + `copywriting` pass and their findings are fixed → owner reviews on the canvas, revisions → owner says "approved" → recorded below with the artifact version id. **No implementation of a page before its board is approved. No page implementation at all before the design-system board is approved.**

### 7.4 Design approvals

| Board | Version id | Approved on |
|---|---|---|
| Visual direction (Topo Minimal) | 1792751868-ac3c | 2026-10-23 |
| Design system | 1792792749-975d | 2026-10-24 |
| Workspace interaction model (next step + journey prototype) | 1792792749-975d | 2026-10-24 |
| Landing | — | — |
| Onboarding | — | — |
| Sign in | — | — |
| Workspace | — | — |
| Settings | — | — |
| Legal | — | — |
| Journey prototype | — | — |

## 8. Sequencing — local first, cloud last, design in parallel

R0 is built and verified end to end **locally** before any cloud account is touched (owner decision, 2026-10-24). Local runs the production container (`docker:api`) and Vercel's build (`vercel build`) against the same Postgres/Supabase engine, so most deployment risk is retired locally; only cloud-specific risks remain for Stage C.

| Stage | Track 1: build | Track 2: design |
|---|---|---|
| A. Local foundation | Repo cleanup and restructure; port backend; backend upgrade steps 1–5; Dockerfile; local stack (`dev:all`, `db:bootstrap`); CI running the full local stack; fresh Next 16 app with **working local sign-in** | Minimalism validator skill; design-system board; page boards; owner reviews |
| B. Local UI | Design-system code (tokens, shadcn restyle, `landednz-design-system` skill) once its board is approved; pages built against approved boards; all §9 gates pass locally and in CI | Remaining boards; journey prototype; approvals |
| C. Cloud | Owner prerequisites (§5.6); Supabase ×2, Render staging, Railway production, `db:bootstrap` on both; DNS; health job; Sentry; PostHog; staging verification with `AI_MODE=live`; release `r0` to production | — |

Stage A's build track does not wait for design approval; Stage B does. Stage C starts only when the owner confirms they are happy with R0 locally.

**Local prerequisites** (Stage A): Node 24, Docker, Supabase CLI, an Anthropic API key and an OpenAI API key (embeddings for the real KB; live AI checks). Spend limits and all other §5.6 items wait for Stage C; registering the domain early is recommended but not blocking.

## 9. Quality gates

- **Accessibility**: WCAG 2.2 AA; axe on every page in Playwright; Lighthouse accessibility ≥ 95.
- **Performance**: Lighthouse performance ≥ 90 (mobile) on landing; LCP < 2.5 s; per-route JS budget set in the plan from the first build.
- **SEO** (landing): metadata, OG image, sitemap, robots, structured data; `seo-audit` skill.
- **Design**: minimalism validator and `web-design-guidelines` pass on every UI PR; built pages match approved boards.
- **Tests**:
  - API: existing suite + golden examples green after every upgrade step.
  - Web unit: Vitest on carried and new logic.
  - E2E (Playwright, `AI_MODE=mock` locally and in CI, `live` on staging): landing → onboarding → preview → sign-in (email test user; staging and local only) → workspace → ask the assistant → complete a task and see the stamp.
  - Screenshot baselines captured after the owner signs off the built pages.

## 10. CI/CD

- **PR** (`ci.yml`): install, typecheck, lint, unit tests (both apps), Next build, API Docker build, then E2E against a full stack started inside the job (Supabase CLI + API + web, `AI_MODE=mock`). All required to merge.
- **Merge to `main`**: Vercel and Render deploy staging; Playwright smoke + axe run against staging.
- **Release**: `engineering:deploy-checklist` → fast-forward `production` → tag → Vercel and Railway deploy (Railway runs `prisma migrate deploy` first) → production smoke check.
- **Migrations are backward-compatible** (expand, then contract in a later release), so a rollback never breaks the DB.
- **Rollback**: Vercel instant rollback; Railway redeploy of the previous build. Steps in the runbook.

## 11. Security and cost controls

Secrets only in platform env vars and GitHub secrets; CORS per environment; per-IP rate limit; per-user daily chat cap; separate Anthropic workspaces with monthly spend limits; OpenAI spend limit; no auth or app state in localStorage (CW06); `security-review` before the R0 release.

## 12. Skills per step

| Step | Skills |
|---|---|
| Direction, design-system and page boards | `frontend-design`, `artifact-design`, `minimalism-validator`, `web-design-guidelines`, `accessibility`, `copywriting`, `copy-editing`, `humanizer`, `dataviz` (progress visuals), `review-animations` |
| Repo and backend | `prisma-upgrade-v7`, `claude-api`, `supabase`, `supabase-postgres-best-practices` |
| Web implementation | `shadcn`, `vercel-react-best-practices`, `landednz-design-system`, `review-animations` |
| Testing and verification | `superpowers:test-driven-development`, `playwright-cli`, `run`, `anthropic-skills:chrome-browser`, `web-perf`, `seo-audit`, `superpowers:verification-before-completion` |
| Review and release | `superpowers:requesting-code-review`, `code-review`, `ponytail-review`, `security-review`, `engineering:deploy-checklist`, `superpowers:finishing-a-development-branch`, `readme-optimization` |
| Process | `superpowers:writing-plans`, `superpowers:subagent-driven-development` or `superpowers:executing-plans`, `superpowers:using-git-worktrees` |

## 13. Risks

| Risk | Mitigation |
|---|---|
| Prisma 7 breaking changes | Dedicated upgrade step with full test suite; `prisma-upgrade-v7` skill; pinned versions |
| Monorepo Docker build fails on Railway again (cause of the v1 split) | Root-context Dockerfile proven locally (`docker:api`) and on Render staging before Railway |
| TypeScript 7 tooling gaps | Half-day check, fallback to 5.x |
| Free Supabase projects pause | `/health` DB query every 6 hours on both |
| Design approval takes longer than 3 days | Track 1 continues independently; release date moves, quality bar does not |
| AI cost on public launch | Daily per-user cap, spend limits per Anthropic workspace |
| Domain not yet registered | Owner prerequisite; staging can run on platform URLs until then |
