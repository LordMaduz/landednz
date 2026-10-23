# R0 Stage A — Local Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** One clean monorepo with the upgraded backend and a fresh Next 16 app, fully runnable, tested and buildable on the owner's Mac and in CI, with working local sign-in — plus the minimalism validator and design boards moving through approval in parallel.

**Architecture:** Port `landednz-be` into `apps/api`, make Supabase's local stack the only local database and auth, add an `AI_MODE` switch so tests are free and deterministic, upgrade dependencies one step at a time behind the existing 167-test suite, then scaffold `apps/web` fresh and carry over its non-UI logic. Design work (Tasks D1–D3) runs in parallel and gates Stage B, not Stage A.

**Tech Stack:** Node 24, npm workspaces, Fastify 5.12, Prisma 7.10 (pinned), Anthropic SDK 1.1, OpenAI SDK 7, zod 4, Vitest 5, Next 16.4, React 19.3, Tailwind 4.3, shadcn 4, Playwright 1.64, Supabase CLI (local), Docker, GitHub Actions.

**Spec:** `docs/superpowers/specs/2026-10-24-r0-foundation-design.md` (read it before any task).

## Global Constraints

- Node 24 LTS everywhere (`.nvmrc` = `24`, `engines.node` = `>=24`).
- Prisma pinned to 7.x: `prisma@7`, `@prisma/client@7` — never `latest` (that is an 8.0 RC).
- Embeddings stay `text-embedding-3-small`, 1536 dimensions.
- API routes, payloads and the SSE event format do not change in R0.
- Constitution rules C02–C08, C10, C12–C16 and C01 hold throughout; `@anthropic-ai/sdk` imported only in `shared/ai/claude.client.ts` (C03); `openai` only in `shared/ai/embeddings.client.ts`.
- Auth is never mocked in API integration tests; use real local Supabase users.
- `AI_MODE` is required (`live` | `mock`), no default. Tests and CI use `mock`.
- Light theme only; minimalism validator applies to every design board and UI change.
- Commit format: Conventional Commits with scope (`feat(shared):`, `chore(deps):`, `chore(repo):` …), each ending with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Never commit `.env.local`.
- Work on branch `chore/r0-stage-a` cut from `docs/r0-foundation-spec`. Do not push without the owner's go-ahead.

## Review Focus

1. **Missing or misspelled env var** (e.g. `AI_MODE=Mock`, no `CHAT_DAILY_CAP`) → the API exits at startup naming the variable; it never starts in a half-configured state. Test in Task 4.
2. **Daily chat cap at the day boundary** → the cap resets at midnight **Pacific/Auckland**, not UTC; a user at 11:30 pm NZ who hit the cap is still blocked, at 12:05 am they are not. Test in Task 6.
3. **Re-running `db:bootstrap` on a populated database** → no duplicate tasks or chunks, no second vector index, exit code 0. Test in Task 3.
4. **RAG golden examples under `AI_MODE=mock`** → mock embeddings carry no meaning, so semantic golden examples would fail spuriously; they must be skipped (not deleted) in mock mode and run in live mode. Test in Task 4.
5. **Signed-out user opening `/app` or `/settings`, signed-in user opening `/signin`, and old URLs (`/roadmap`, `/chat`, `/auth/signin`)** → redirect to `/signin?redirect=<path>`, to `/app`, and to the new routes respectively. Test in Task 10.

## File Structure (end of Stage A)

```
landednz/
├── package.json              workspaces: apps/api, apps/web, packages/types; root scripts dev:all, test, build, docker:api
├── .nvmrc                    24
├── tsconfig.base.json        shared compiler options
├── scripts/dev-all.sh        starts Supabase → bootstrap if empty → API → web
├── supabase/config.toml      local stack (existing, edited)
├── .github/workflows/ci.yml
├── apps/api/
│   ├── package.json  tsconfig.json  tsconfig.build.json  vitest.config.ts  Dockerfile  .dockerignore  .env.example
│   ├── content/kb-master.md
│   ├── prisma/schema.prisma  prisma.config.ts  migrations/
│   ├── scripts/ bootstrap.ts  seed-knowledge-base.ts  generate-embeddings.ts  create-vector-index.ts  validate-seed-content.ts  end-to-end-validation.ts
│   ├── golden-examples/
│   └── src/  (ported from landednz-be)
│       ├── shared/ai/mock.ts              new: deterministic AI for AI_MODE=mock
│       ├── shared/rate-limit.ts           new: per-IP limit registration
│       ├── features/chat/daily-cap.ts     new: per-user daily cap check
│       └── test-utils/supabase-user.ts    new: shared real-auth test user helper
├── apps/web/                 fresh Next 16 app (Task 10)
└── packages/types/
```

---

## Design track (parallel; gates Stage B)

### Task D1: Minimalism validator skill

**Files:**
- Create: `.claude/skills/minimalism-validator/SKILL.md`
- Create: `.claude/skills/minimalism-validator/examples/pass.dc.html`, `examples/fail.dc.html`

**Interfaces:**
- Produces: a skill invoked as `minimalism-validator` that, given a design board or UI diff, returns one line per check: `PASS|FAIL <check name> — <reason>`, then an overall `PASS|FAIL`.

- [ ] **Step 1:** Invoke `superpowers:writing-skills`. Use its TDD-for-skills flow: write the baseline scenario first — ask a fresh subagent to review `examples/fail.dc.html` for minimalism without the skill and record what it misses.
- [ ] **Step 2:** Write `examples/fail.dc.html` (a board breaking checks 1, 2, 3 and 6 from spec §7.1: a second accent colour, a decorative eyebrow label, 7 type sizes, a duplicated "Get started" button) and `examples/pass.dc.html` (the approved `Chosen.dc.html` direction board, copied).
- [ ] **Step 3:** Write `SKILL.md` with the 8 checks from spec §7.1 verbatim, each with a one-line "how to check" (e.g. check 3: list every distinct `font-size`; FAIL if > 5 or any size not in the scale) and the output format above.
- [ ] **Step 4:** Verify: a fresh subagent using the skill reports FAIL on `fail.dc.html` naming exactly checks 1, 2, 3, 6, and PASS on `pass.dc.html`.
- [ ] **Step 5:** Commit: `feat(claude): add minimalism-validator skill`.

### Task D2: Design-system board

**Files:** new Design canvas "LandedNZ R0 Design" (Artifact tool, `Artifact action: quickstart intent: design`, then create from the Design type). Board file: `DesignSystem.dc.html`.

- [ ] **Step 1:** Build the board with the contents of spec §7.3 item 1, using tokens from spec §7.2. Skills: `frontend-design`, `artifact-design`, `review-animations` (motion notes), `dataviz` (progress indicator).
- [ ] **Step 2:** Run `minimalism-validator`, `web-design-guidelines`, `accessibility` (contrast ≥ 4.5:1 for all text pairs) and `copywriting`; fix every FAIL.
- [ ] **Step 3:** Owner review; revise until the owner says "approved".
- [ ] **Step 4:** Record the artifact version id and date in spec §7.4; commit `docs(spec): record design-system approval`.

### Task D3: Page boards and journey prototype

Same canvas. One board per page from spec §7.3 item 2 (desktop 1440 + mobile 390, all listed states), then the clickable journey (item 3, `is_interactive: true`). Real task content from `apps/api/content/kb-master.md` (T01–T21).

- [ ] **Step 1:** Landing board → gate (validator + `web-design-guidelines` + `copywriting` + `seo-audit` for headings/meta copy) → owner approval → record in §7.4.
- [ ] **Step 2:** Onboarding board → same gate → record.
- [ ] **Step 3:** Sign-in board → same gate → record.
- [ ] **Step 4:** Workspace board (6 states) → same gate → record.
- [ ] **Step 5:** Settings board → same gate → record.
- [ ] **Step 6:** Legal template board → same gate → record.
- [ ] **Step 7:** Journey prototype → owner approval → record. Commit `docs(spec): record page approvals`.

When D2 is approved, write the Stage B plan (`docs/superpowers/plans/…-r0-stage-b-local-ui.md`) from the approved boards.

---

## Build track

### Task 1: Repository cleanup

**Files:** deletions and edits listed in spec §3 "Deleted" and "`.claude/` after R0", **except** `apps/web/` and `apps/api/` (Tasks 2 and 10 handle those).

- [ ] **Step 1:** `git switch -c chore/r0-stage-a`.
- [ ] **Step 2:** `git rm -r` every root file and folder in spec §3 "Deleted" (root docs, `rpi/`, `mockup-screens/`, `apps/mobile/`, `docker-compose.yml`, `docker/`, root `railway.toml`, `vercel.json`, `.vercelignore`, `test-structured.sh`); `git mv docs/google-oauth-setup.md docs/setup/google-oauth.md`; `git rm` the other `docs/*.md`.
- [ ] **Step 3:** `git mv landednz_kb_master_COMPLETE_v1.md apps/api/content/kb-master.md`.
- [ ] **Step 4:** `.claude/`: `git rm -r agents commands hooks rules skills/web-design-system skills/web-component-patterns skills/web-responsive-layout`. Edit `constitution.md`: delete C09 and C11; replace CW02 with the CW02′ text from spec §3; add CW07 ("Every UI change passes the minimalism-validator skill") and CW08 ("Light theme only; no dark mode or theme switching"); add a note under C01 "Holds for R0; to be rewritten in R2". Edit `settings.json`: remove `"model"` and the `react-native`, `pod install`, `xcodebuild` permissions; change the hook's `cwd` stays `apps/api`.
- [ ] **Step 5:** Root `package.json`: `workspaces` = `["apps/api", "apps/web", "packages/types"]`, `engines.node` = `">=24"`, remove `overrides`; `.nvmrc` = `24`.
- [ ] **Step 6:** Verify: `git ls-files | grep -E '^(rpi|mockup-screens|apps/mobile|docker)/|^[0-9]{2}-'` prints nothing; `test -f apps/api/content/kb-master.md`.
- [ ] **Step 7:** Commit `chore(repo): remove v1 RPI docs, mobile app and stale config`.

### Task 2: Port `landednz-be` into `apps/api`

**Files:**
- Replace: `apps/api/src/**`, `apps/api/prisma/schema.prisma`, `apps/api/golden-examples/**` with `../landednz-be` copies
- Replace: `apps/api/scripts/{seed-knowledge-base,generate-embeddings,validate-seed-content,end-to-end-validation}.ts`
- Delete: `apps/api/dist/`, `apps/api/scripts/{check-ac-2-15-urls,generate-ac-2-15-template,test-sse-streaming,test-structured-response}.ts`, `apps/api/CLAUDE.md`
- Modify: `apps/api/package.json`, `apps/api/tsconfig.json`, `apps/api/tsconfig.build.json`, `apps/api/vitest.config.ts`
- Create: `tsconfig.base.json`

**Interfaces:**
- Produces: workspace package `@landednz/api` (ESM, `"type": "module"`), scripts `dev`, `build`, `start`, `test`, `test:run`, `typecheck` (`tsc --noEmit`). `@landednz/types` resolved through the workspace, not `paths`.

- [ ] **Step 1:** Copy the files above from `landednz-be`; do not copy `landednz-be/types/`, `debug-*.ts`, `validate-*.ts`, `test-*.ts`, `package.deploy.json`, `railway.toml`.
- [ ] **Step 2:** `apps/api/package.json` = `landednz-be/package.json` with `name` `@landednz/api`, dependency `"@landednz/types": "*"`, plus `"typecheck": "tsc --noEmit"`. Leave versions unchanged in this task.
- [ ] **Step 3:** `tsconfig.base.json` holds the compiler options from `landednz-be/tsconfig.json` minus `paths`/`outDir`; `apps/api/tsconfig.json` extends it with `outDir: ./dist`, includes `src`, `scripts`, `golden-examples`. Update the `@landednz/types` package so NodeNext resolves it (`"exports": "./index.ts"`, `"type": "module"`).
- [ ] **Step 4:** In `scripts/seed-knowledge-base.ts` change `kbPath` to `path.join(import.meta.dirname, '../content/kb-master.md')`; in `scripts/generate-embeddings.ts` use `.js` import suffixes like the rest of the ESM code.
- [ ] **Step 5:** Verify: `npm install` at root succeeds; `npm run typecheck -w @landednz/api` exits 0.
- [ ] **Step 6:** Commit `refactor(shared): port ESM backend from landednz-be into apps/api`.

### Task 3: Local stack and green baseline

**Files:**
- Modify: `prisma/migrations/20260310083911_init/migration.sql` (prepend `CREATE EXTENSION IF NOT EXISTS vector;`)
- Create: `apps/api/src/test-utils/supabase-user.ts`
- Modify: the 5 chat test files and any other test with a hard-coded `127.0.0.1:54321` URL or `sb_publishable_…` key
- Create: `apps/api/scripts/create-vector-index.ts`, `apps/api/scripts/bootstrap.ts`
- Create: `apps/api/.env.example` (local values)
- Test: `apps/api/scripts/bootstrap.test.ts`

**Interfaces:**
- Produces: `createTestUser(prefix: string): Promise<{ userId: string; jwt: string; email: string }>` and `deleteTestUser(userId: string): Promise<void>`, reading `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY` from env.
- Produces: `npm run db:bootstrap -w @landednz/api` → `bootstrap(): Promise<{ tasksSeeded: number; chunksEmbedded: number; indexCreated: boolean }>`; steps in order: `prisma migrate deploy` → seed (skips existing rows) → embeddings for rows with `embedding IS NULL` → `CREATE INDEX IF NOT EXISTS kb_chunk_embedding_ivfflat ON "KnowledgeBaseChunk" USING ivfflat (embedding vector_cosine_ops)` only when no row has a NULL embedding (C05).

- [ ] **Step 1:** `supabase start` (upgrade the CLI first if older than 2.100: `brew upgrade supabase`). `.env.example` lists every variable `config.ts` reads plus `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY`, `AI_MODE`, `CHAT_DAILY_CAP`, with local values from `supabase status` (DB `postgresql://postgres:postgres@127.0.0.1:54322/postgres`) and `PORT=3001` (the web app owns 3000; `CORS_ORIGIN=http://localhost:3000`). Copy to `.env.local`.
- [ ] **Step 2:** Write the failing test `bootstrap is idempotent`: run `bootstrap()` twice against the local DB; assert the second run returns `tasksSeeded: 0`, `chunksEmbedded: 0`, and that `SELECT count(*) FROM pg_indexes WHERE indexname = 'kb_chunk_embedding_ivfflat'` is 1 and task count is unchanged.
- [ ] **Step 3:** Run it — FAIL (bootstrap does not exist).
- [ ] **Step 4:** Implement `create-vector-index.ts` and `bootstrap.ts`; make the seed skip existing rows by `taskId`/`chunkKey`.
- [ ] **Step 5:** Run it — PASS.
- [ ] **Step 6:** Implement `createTestUser`/`deleteTestUser` (sign-up via `/auth/v1/signup` with the publishable key, delete via `/auth/v1/admin/users/:id` with the secret key) and replace every hard-coded URL/key in tests with it.
- [ ] **Step 7:** Baseline: `npm run test:run -w @landednz/api` with `AI_MODE` unset is not yet possible — temporarily run with the live keys in `.env.local` (cost: cents). Expected: all 167 tests + golden examples PASS. Record the count in the commit message. Any failure here is a porting bug: fix before continuing.
- [ ] **Step 8:** Commit `test(shared): run API suite against Supabase local stack`.

### Task 4: `AI_MODE` switch

**Files:**
- Modify: `apps/api/src/shared/config.ts`, `shared/ai/claude.client.ts`, `shared/ai/embeddings.client.ts`
- Create: `apps/api/src/shared/ai/mock.ts`
- Modify: `apps/api/golden-examples/rag-retrieval.ts`
- Test: `apps/api/src/shared/ai/mock.test.ts`, `apps/api/src/shared/config.test.ts`

**Interfaces:**
- Produces: `config.aiMode: 'live' | 'mock'`; `config.chatDailyCap: number` (also used by Task 6).
- Produces in `mock.ts`: `mockStream(messages: ChatMessage[], onChunk: (t: string) => void): Promise<void>` (emits the fixed reply `"This is a mock reply from LandedNZ."` in 3 chunks) and `mockEmbedding(text: string): number[]` (1536 numbers, unit length, derived from a hash of `text`). `mock.ts` imports no SDK.
- `streamMessage` and `generateEmbedding` keep their signatures and delegate to `mock.ts` when `config.aiMode === 'mock'`.

- [ ] **Step 1:** Write failing tests: `mockEmbedding returns 1536 unit-length numbers`; `mockEmbedding is deterministic` (same text → identical array; different text → different array); `mockStream emits the fixed reply across 3 chunks`; `config throws "Missing required environment variable: AI_MODE" when unset`; `config throws "AI_MODE must be live or mock" for "Mock"`; `config throws for CHAT_DAILY_CAP that is not a positive integer`.
- [ ] **Step 2:** Run — FAIL.
- [ ] **Step 3:** Implement. `config.ts` validates with zod 4 (install `zod@4` here) and keeps the existing fail-fast error text for missing vars.
- [ ] **Step 4:** In `golden-examples/rag-retrieval.ts` wrap the suite in `describe.skipIf(process.env.AI_MODE === 'mock')`.
- [ ] **Step 5:** Run the whole suite with `AI_MODE=mock` — PASS, with the RAG golden example reported as skipped. Run once with `AI_MODE=live` — PASS.
- [ ] **Step 6:** Set `AI_MODE=mock` in `.env.example`, and in `vitest.config.ts` set `test.env.AI_MODE` to `process.env.AI_MODE ?? 'mock'` so `AI_MODE=live npm run test:run` still runs live. Commit `feat(shared): add AI_MODE mock for free deterministic tests`.

### Task 5: Node 24 and TypeScript decision

**Files:** `apps/api/package.json`, `tsconfig.base.json`, `packages/types/package.json`

- [ ] **Step 1:** `nvm install 24 && nvm use`. Run the suite (`AI_MODE=mock`) — PASS.
- [ ] **Step 2:** Try TypeScript 7: `npm i -D typescript@7 -w @landednz/api -w @landednz/types`; run `typecheck` and the suite. If both pass, keep 7; otherwise install the latest 5.x (`npm view typescript@5 version`) and note why. Task 10 re-checks with Next; if Next fails on 7, both workspaces drop to 5.x there.
- [ ] **Step 3:** Commit `chore(deps): Node 24 and TypeScript <version>` stating the decision.

### Task 6: Fastify 5.12, rate limits, daily chat cap

**Files:**
- Modify: `apps/api/package.json`, `src/server.ts`, `src/shared/errors.ts`, `src/features/chat/service.ts`
- Create: `src/shared/rate-limit.ts`, `src/features/chat/daily-cap.ts`
- Test: `src/shared/rate-limit.test.ts`, `src/features/chat/daily-cap.test.ts`

**Interfaces:**
- Produces: `registerRateLimit(app: FastifyInstance): Promise<void>` — `@fastify/rate-limit` global, `max: 120` per `timeWindow: '1 minute'` per IP; `/health` exempt.
- Produces: `assertUnderDailyCap(userId: string, now?: Date): Promise<void>` — counts the user's `ChatMessage` rows with role USER created since the start of the current day in `Pacific/Auckland`; throws `new AppError('CHAT_DAILY_CAP_REACHED', 'Daily message limit reached. It resets at midnight NZ time.', 429)` when count ≥ `config.chatDailyCap`. Called in `sendMessage` before the guardrails step.
- New `ErrorCode`: `'CHAT_DAILY_CAP_REACHED'`.

- [ ] **Step 1:** `npm i fastify@5.12 @fastify/rate-limit -w @landednz/api`; suite PASS.
- [ ] **Step 2:** Write failing tests: `121st request in a minute from one IP returns 429`; `/health is never rate limited`; `user below cap can send`; `user at cap gets 429 CHAT_DAILY_CAP_REACHED`; `cap counts NZ day: messages from 23:30 NZ yesterday do not count at 00:05 NZ today` (use `now` = `2026-10-24T11:05:00Z`, i.e. 00:05 NZDT on 25 Oct, with seeded messages at `2026-10-24T10:30:00Z`, i.e. 23:30 NZDT on 24 Oct); `messages at 23:30 NZ count toward the same NZ day at 23:45`.
- [ ] **Step 3:** Run — FAIL.
- [ ] **Step 4:** Implement; register rate limit in `buildApp()` before routes (make `buildApp` async if the plugin needs awaiting and update callers/tests).
- [ ] **Step 5:** Run whole suite — PASS.
- [ ] **Step 6:** Commit `feat(chat): per-IP rate limit and per-user NZ-day message cap`.

### Task 7: Prisma 7

**Files:** `apps/api/package.json`, `prisma/schema.prisma`, `prisma.config.ts` (new), `src/shared/db.ts`, any file the skill's checklist flags.

**Interfaces:** `db` stays the exported singleton name and type-compatible for all callers.

- [ ] **Step 1:** Invoke the `prisma-upgrade-v7` skill and follow it. Pin: `npm i -E prisma@7 @prisma/client@7 -w @landednz/api` (plus the driver adapter the skill names). Remove `binaryTargets` only if the skill confirms the v7 client no longer uses native engines.
- [ ] **Step 2:** Verify `npx prisma migrate deploy` and `db:bootstrap` work on a fresh local DB (`supabase db reset` first).
- [ ] **Step 3:** Whole suite PASS (`AI_MODE=mock`), golden examples PASS with `AI_MODE=live`.
- [ ] **Step 4:** Commit `chore(deps): upgrade Prisma 5 to 7`.

### Task 8: Anthropic SDK 1.1, OpenAI 7, Vitest 5

**Files:** `apps/api/package.json`, `src/shared/ai/claude.client.ts`, `src/shared/ai/embeddings.client.ts`, `vitest.config.ts`, `.env.example`

- [ ] **Step 1:** Invoke `claude-api`. `npm i @anthropic-ai/sdk@1 openai@7 -w @landednz/api`; adapt the two clients to any changed APIs. `ANTHROPIC_MODEL` in `.env.example` = `claude-sonnet-5-5`. (`generateText` has no callers today, so no separate fast-model variable is added — spec §4.2 item 4 adjusted accordingly.)
- [ ] **Step 2:** `npm i -D vitest@5 -w @landednz/api`; fix config deprecations.
- [ ] **Step 3:** Whole suite PASS in mock mode; one live run of `chat/messages.test.ts` PASS against Claude Sonnet 5.5.
- [ ] **Step 4:** Commit `chore(deps): Anthropic SDK 1.1, OpenAI 7, Vitest 5`.

### Task 9: Production container, locally

**Files:** Create `apps/api/Dockerfile`, `.dockerignore` (repo root); modify root `package.json`.

**Interfaces:** Root script `docker:api` = `docker build -f apps/api/Dockerfile -t landednz-api . && docker run --rm -p 3001:3000 --env-file apps/api/.env.docker landednz-api`. `.env.docker` (gitignored) = `.env.local` with the DB host `host.docker.internal`.

- [ ] **Step 1:** Dockerfile: two stages on `node:24-alpine` + `openssl`; build context = repo root; copy root `package.json`/`package-lock.json`, `packages/types`, `apps/api`; `npm ci -w @landednz/api --include-workspace-root`; `prisma generate`; `npm run build -w @landednz/api`; runtime stage installs prod deps only; `CMD ["node", "apps/api/dist/src/server.js"]`; keep the existing `HEALTHCHECK`.
- [ ] **Step 2:** `.dockerignore` excludes `**/node_modules`, `**/.env*`, `apps/web`, `.git`, `docs`.
- [ ] **Step 3:** Verify: `npm run docker:api`, then `curl -s localhost:3001/health` returns `{"status":"ok",…,"dbConnected":true,…}`; stop Supabase and the same call returns HTTP 503.
- [ ] **Step 4:** Commit `build(api): root-context Dockerfile for monorepo API`.

### Task 10: Fresh Next 16 app with working local sign-in

**Files:**
- Carry (copy before deleting old app): `src/lib/{api.ts,chat-parser.ts,chat-parser.test.ts,roadmap-mapper.ts,roadmap-mapper.test.ts}`, `src/lib/{stores,supabase,utils,hooks}/**`, `src/types/{chat,web}.ts`
- Delete: everything else under `apps/web/`
- Create: new app via `npx create-next-app@16 apps/web --ts --tailwind --app --src-dir --eslint --use-npm --import-alias "@/*"`, then `npx shadcn@latest init` (skill: `shadcn`)
- Create: `src/proxy.ts`, `src/app/signin/page.tsx`, `src/app/auth/callback/route.ts`, `src/app/app/page.tsx`, `src/app/settings/page.tsx`, `next.config.ts` redirects, `vitest.config.ts`, `playwright.config.ts`, `e2e/auth.spec.ts`, `.env.example`
- Test: `src/proxy.test.ts`, `e2e/auth.spec.ts`

**Interfaces:**
- Consumes: carried `lib/api.ts` (`getUserProfile` etc.), `lib/supabase/{client,server}.ts`.
- Produces: `proxy(request: NextRequest): Promise<NextResponse>` protecting `/app` and `/settings`; env `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_AUTH_PASSWORD_ENABLED` (`true` locally/staging; `false` in production → only the Google button renders).
- Pages are deliberately unstyled placeholders; Stage B replaces their UI from approved boards.

- [ ] **Step 1:** Copy the carry list to a temp folder, `git rm -r apps/web`, scaffold, restore the carried files, install `zustand @supabase/ssr @supabase/supabase-js sonner react-markdown lucide-react clsx tailwind-merge`, Vitest 5 + jsdom + Testing Library, Playwright 1.64. Use the TypeScript version chosen in Task 5; if `next build` fails on TS 7, set both workspaces to latest 5.x and amend Task 5's note.
- [ ] **Step 2:** Run carried unit tests — PASS (fix import paths only).
- [ ] **Step 3:** Write failing tests in `proxy.test.ts`: signed-out `/app` → 307 to `/signin?redirect=%2Fapp`; signed-out `/settings` → `/signin?redirect=%2Fsettings`; signed-in `/signin` → `/app`; `/` passes through. In `next.config.ts` tests (or e2e): `/roadmap` → `/app`, `/chat` → `/app`, `/auth/signin` → `/signin` (permanent).
- [ ] **Step 4:** Run — FAIL.
- [ ] **Step 5:** Implement `proxy.ts` (port the old `middleware.ts` cookie logic), redirects, `/signin` (email + password form when `NEXT_PUBLIC_AUTH_PASSWORD_ENABLED=true`, Google button always), `/auth/callback`, `/app` showing the signed-in email and the API profile (or "No profile yet" on 404), `/settings` placeholder.
- [ ] **Step 6:** Write `e2e/auth.spec.ts`: create a user via the Supabase admin API in `globalSetup`, sign in with email/password at `/signin`, land on `/app`, see the email; visiting `/roadmap` lands on `/app`; signing out and opening `/app` lands on `/signin?redirect=%2Fapp`.
- [ ] **Step 7:** Verify: `npm run test -w @landednz/web` PASS; with Supabase, API (`AI_MODE=mock`) and `next dev` running, `npx playwright test` PASS; `npm run build -w @landednz/web` PASS; `npx vercel build` in `apps/web` PASS (no Vercel login needed for a local build; if it insists, record and skip until Stage C).
- [ ] **Step 8:** Commit `feat(web): fresh Next 16 app with local sign-in and route guard`.

### Task 11: One-command local stack

**Files:** Create `scripts/dev-all.sh`; modify root `package.json`.

**Interfaces:** root scripts `dev:all` (`bash scripts/dev-all.sh`), `test` (API + web unit), `test:e2e`, `build` (API + web), `typecheck`.

- [ ] **Step 1:** `dev-all.sh`: `supabase start` (no-op if running) → if `SELECT count(*) FROM "Task"` fails or is 0, run `db:bootstrap` → start API (`npm run dev -w @landednz/api`) and web (`npm run dev -w @landednz/web`) in the background, forward Ctrl-C to both (`trap 'kill 0' EXIT`).
- [ ] **Step 2:** Verify from a clean state (`supabase stop --no-backup`): `npm run dev:all` brings up `localhost:3000` (web) and `localhost:3001/health` → ok within 3 minutes; Ctrl-C stops both processes.
- [ ] **Step 3:** Commit `chore(repo): add dev:all one-command local stack`.

### Task 12: CI

**Files:** Create `.github/workflows/ci.yml`.

- [ ] **Step 1:** On `pull_request` and `push` to `main`: checkout → `actions/setup-node` (24, npm cache) → `npm ci` → `supabase/setup-cli` → `supabase start` → write `.env.local` files from `supabase status -o env` with `AI_MODE=mock`, `CHAT_DAILY_CAP=50` → `npm run typecheck` → `npm run db:bootstrap -w @landednz/api` → `npm test` → `npm run build` → `docker build -f apps/api/Dockerfile .` → start API + `next start` → `npx playwright install --with-deps chromium` → `npm run test:e2e`.
- [ ] **Step 2:** Verify locally with `act` if available; otherwise push the branch only after the owner agrees and confirm the run is green.
- [ ] **Step 3:** Commit `ci: typecheck, tests, builds and e2e on full local stack`.

### Task 13: Docs for the new repo

**Files:** Rewrite `README.md`, `CLAUDE.md`; create `apps/web/CLAUDE.md` (short: stack, design gate, CW rules), `docs/setup/deploy-runbook.md` (local section now; cloud section is Stage C).

- [ ] **Step 1:** README via `readme-optimization`: what LandedNZ is, local prerequisites (spec §8), `npm run dev:all`, tests, structure.
- [ ] **Step 2:** CLAUDE.md: stack, structure, workflow = superpowers (spec → design approval → plan), constitution pointer, gotchas still true (Supabase ES256/JWKS, SSE via fetch not EventSource, `app.inject` buffers SSE, real auth in tests, AI_MODE). Drop everything about RPI, mobile, Storybook, DM fonts, mockups.
- [ ] **Step 3:** Verify: every command in README runs as written from a fresh clone (`git clone . /tmp/lnz-check && cd /tmp/lnz-check && npm ci && npm run dev:all`).
- [ ] **Step 4:** Commit `docs: rewrite README and CLAUDE.md for R0`.

### Stage A exit check

- [ ] `npm run typecheck && npm test && npm run build && npm run test:e2e` green locally; CI green.
- [ ] `npm run docker:api` health ok.
- [ ] Owner signs in locally at `localhost:3000/signin` and sees `/app`.
- [ ] D1 merged; D2 approved (D3 may still be in progress).
- [ ] `superpowers:requesting-code-review` on the branch; fix findings.
