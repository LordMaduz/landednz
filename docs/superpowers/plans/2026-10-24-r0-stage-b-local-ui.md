# R0 Stage B — Local UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Every approved page board built in `apps/web` against the real local API, with the additive API changes those boards need, and every §9 gate passing locally and in CI.

**Architecture:** First the five additive API changes (spec §4.3 amendment), each with its typed client in `lib/api.ts`. Then the design tokens and shared parts (header, footer, route rail, route strip, task copy, legs) that every page uses, mirroring `docs/design/r0-boards/ui_parts.py`. Then the pages in journey order, each a thin route file over pure view-model functions that carry the logic and the unit tests. Gates (axe, journey e2e, Lighthouse, budgets) close the stage.

**Tech Stack:** Next 16.4, React 19.3, Tailwind 4.3 (`@theme` tokens), shadcn 4 (restyled), sonner, lucide-react, Zustand 5, `@supabase/ssr` 0.12, Vitest 5 + Testing Library, Playwright 1.64 + `@axe-core/playwright`, `@lhci/cli`; API: Fastify 5, Prisma 7, Vitest 5.

**Spec:** `docs/superpowers/specs/2026-10-24-r0-foundation-design.md` (read §4.3 amendment, §6, §7, §9 before any task). **Boards:** `docs/design/r0-boards/` (README maps boards to routes). Every built page matches its board (CW02′).

## Global Constraints

- Branch `feat/r0-stage-b` cut from `docs/r0-design-system` at `4b759d4`. Do not push without the owner's go-ahead.
- Node 24; commands are `make` targets (`make test`, `make check`, `make test-e2e`); prepend `/opt/homebrew/opt/node@24/bin` to `PATH`.
- API changes are **additive only** (spec §4.3 amendment): no existing route, field or SSE event changes meaning. Migrations are expand-only.
- Constitution holds: C03 (`@anthropic-ai/sdk` only in `shared/ai/claude.client.ts`), CW01 (no raw hex, px or arbitrary Tailwind values in `apps/web/src` outside `globals.css`), CW03 (reduced motion), CW04 (contract types from `@landednz/types`), CW06 (no localStorage for auth or app state), CW08 (light only).
- Auth is never mocked in API integration tests; web e2e uses the admin-created test user (`e2e/global-setup.ts`). Tests and CI run `AI_MODE=mock`.
- Tokens (exact, from `ui_parts.py`): ink `#0F2A3A`, muted `#4B6170`, control `#7A8F99`, border `#D5DFE2`, hairline `#E3E8EA`, wash `#F6F8F8`, teal `#0E7C7B`, teal-text `#0A6463`, teal-hover `#074B4A`, ink-hover `#24465A`, avatar `#E8F2F1`; aurora `#3FC79A → #5AAED6 → #8B78F0` on AI replies only. Geist 400/500/600. Sizes hero 48/1.05/-0.03em, title 32/1.15/-0.025em, section 20/1.3/-0.01em, body 15/1.5, small 13/1.45. Spacing 0, 4, 8, 16, 24, 32, 48, 64, 96. Radius control 6, surface 10. One shadow `0 1px 2px rgba(15,42,58,.04), 0 16px 48px rgba(15,42,58,.08)` (landing preview, toasts). Container 1120 px, 24 px side padding. Touch targets ≥ 44 px.
- Motion: CSS only — aurora flow while streaming (3 s linear), stamp in (200 ms), sheet open/close; all off under `prefers-reduced-motion`.
- Dates shown in `en-NZ` with `timeZone: 'Pacific/Auckland'` (e.g. "22 Oct", "21 October 2026"); "day N" counts NZ calendar days with arrival day = day 1.
- Copy: sentence case, no middle-dot separators, no "→" appended to links, errors say what happened and what is safe.
- Commits: Conventional Commits with scope, each ending `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- Every UI task ends with the minimalism validator (`.claude/skills/minimalism-validator`) and `web-design-guidelines` on the built page at 1440 and 390, findings fixed; result line in the ledger.

## Review Focus

1. **A signed-in user with an existing profile goes through onboarding again and saves** → the 409 from `POST /onboarding/profile` is not an error: they land on `/app` with their existing roadmap, the answers cookie is cleared. Test in Task 9.
2. **The answers cookie is tampered with or stale** (unknown visa, bad date, not JSON, older than 1 hour) → it is ignored and cleared; preview redirects to `/onboarding?step=1`; sign-in completes without creating a profile. Test in Task 9.
3. **"Mark as done" then Undo on a task that unblocked another** → the dependent task is blocked again and the Roadmap shows it blocked without a reload. Test in Tasks 1 and 12.
4. **Daily chat cap reached mid-conversation** (`CHAT_DAILY_CAP_REACHED`) → the sheet shows the cap message with when it resets, the input stays disabled, nothing is lost. Test in Task 13.
5. **Day count around midnight NZ and before arrival** → at 23:30 NZ on arrival day it is day 1, at 00:05 the next day it is day 2; before arrival Home says how many days until landing. Test in Task 6.

## File Structure (end of Stage B)

```
apps/api/
├── prisma/migrations/<ts>_task_last_verified/   expand-only: Task.lastVerifiedAt
├── scripts/seed-knowledge-base.ts               T21 couples-only; lastVerifiedAt from LAST_VERIFIED
└── src/features/
    ├── roadmap/   roadmap.service.ts (+ reopenTask, completedAt, blockingTaskIds), roadmap.route.ts (+ /reopen)
    ├── onboarding/ onboarding.preview.ts (+ test), onboarding.route.ts (+ /onboarding/preview)
    └── account/   account.service.ts, account.route.ts (+ tests)
packages/types/index.ts                           + OnboardingPreviewRequest/Response, RoadmapTask fields
apps/web/src/
├── app/
│   ├── globals.css                 @theme tokens (only place raw values live)
│   ├── layout.tsx                  Geist, Toaster
│   ├── page.tsx                    Landing        ├── opengraph-image.tsx  sitemap.ts  robots.ts
│   ├── onboarding/page.tsx  onboarding/preview/page.tsx
│   ├── api/onboarding-answers/route.ts            sets/clears the answers cookie
│   ├── auth/callback/route.ts  auth/complete/route.ts
│   ├── signin/page.tsx
│   ├── app/page.tsx (Home)  app/roadmap/page.tsx  app/error.tsx  app/loading.tsx
│   ├── settings/page.tsx  privacy/page.tsx  terms/page.tsx
├── components/
│   ├── ui/          button.tsx field.tsx select.tsx option-row.tsx alert-dialog.tsx toaster.tsx
│   ├── chrome/      app-header.tsx public-header.tsx public-footer.tsx logo.tsx
│   ├── route/       waypoint.tsx route-rail.tsx route-strip.tsx stamp.tsx
│   ├── marketing/   landing-hero.tsx roadmap-preview-figure.tsx
│   ├── onboarding/  question-step.tsx preview-route.tsx
│   ├── workspace/   home-view.tsx roadmap-view.tsx next-task-card.tsx task-sheet.tsx
│   ├── assistant/   ask-panel.tsx ai-reply.tsx
│   └── settings/    plan-form.tsx account-section.tsx delete-account.tsx
├── lib/
│   ├── api.ts (+ previewRoadmap, reopenTask, deleteAccount, streamChat signal + error code)
│   ├── task-copy.ts  legs.ts  journey-day.ts  answers.ts  route-view.ts  home-view.ts  suggestions.ts  trace.ts
└── content/legal/privacy.md  terms.md
apps/web/lighthouserc.json   .claude/skills/landednz-design-system/SKILL.md
```

---

## API: additive changes

### Task 1: Roadmap `completedAt`, `blockingTaskIds` and reopen

**Files:**
- Modify: `apps/api/src/features/roadmap/roadmap.types.ts`, `roadmap.service.ts`, `roadmap.route.ts`; `packages/types/index.ts`; `apps/web/src/lib/api.ts`
- Test: `apps/api/src/features/roadmap/roadmap.reopen.service.test.ts` (new), `roadmap.service.test.ts`, `roadmap.route.test.ts` (or the file holding route tests)

**Interfaces:**
- Produces: `RoadmapTask.completedAt: string | null` (ISO), `RoadmapTask.blockingTaskIds: string[]` (same order as `blockingTaskNames`); `reopenTask(userId: string, taskId: string): Promise<TaskReopenResponse>` with `TaskReopenResponse { taskId: string; status: 'NOT_STARTED'; newTopThree: RoadmapTask[]; reblockedTasks: string[] }`; route `POST /roadmap/tasks/:taskId/reopen` (auth); web `reopenTask(taskId: string, token: string): Promise<void>`. Mirror `RoadmapApiTask` fields in `@landednz/types` and `lib/api.ts`.

- [ ] **Step 1: Write the failing tests** (pattern: `roadmap.complete.service.test.ts`, real DB, canonical T06/T07/T08)
  - `getRoadmap` returns `completedAt: null` for open tasks and an ISO string equal to the stored value for completed ones; T07 (HARD on T06) returns `blockingTaskIds: ['T06']` while T06 is open.
  - `reopenTask` on completed T06 → entry `status 'NOT_STARTED'`, `completedAt null`, `completionMethod null`; T07 `isBlocked true` again; response `reblockedTasks` contains `'T07'`.
  - `reopenTask` on a task already not done → returns the same shape, changes nothing (idempotent).
  - `reopenTask` for a task not in the user's roadmap → `AppError` 404 `TASK_NOT_FOUND` (reuse the code `completeTask` uses).
  - Route: unauthenticated `POST /roadmap/tasks/T06/reopen` → 401.
- [ ] **Step 2: Run** `npm run test:run -w @landednz/api -- roadmap` — Expected: FAIL (`reopenTask` not exported; fields undefined).
- [ ] **Step 3: Implement** — add the two fields where `RoadmapTask` is built in `getRoadmap`/`completeTask`/`bulkOverride` (blocker ids come from the same dependency lookup that yields the names); `reopenTask` mirrors `completeTask`'s targeted recomputation (`getAffectedTasks`) in reverse; register the route beside `/complete`.
- [ ] **Step 4: Run** `make test` — Expected: API and web suites pass.
- [ ] **Step 5: Commit** `feat(roadmap): add completedAt, blockingTaskIds and task reopen`

### Task 2: KB seed — T21 couples-only, `lastVerified`, public preview

**Files:**
- Modify: `apps/api/scripts/seed-knowledge-base.ts`, `apps/api/prisma/schema.prisma` (+ migration), `roadmap.service.ts` (`getTaskDetail`), `roadmap.types.ts`, `onboarding.route.ts`, `packages/types/index.ts`, `apps/web/src/lib/api.ts`
- Create: `apps/api/src/features/onboarding/onboarding.preview.ts`
- Test: `apps/api/scripts/seed-knowledge-base.test.ts` (or the existing seed test file), `apps/api/src/features/onboarding/onboarding.preview.test.ts`, `roadmap.detail.service.test.ts`

**Interfaces:**
- Consumes: `filterApplicableTasks({ tasks, profile })` (`core/priority/filter.ts`).
- Produces: `Task.lastVerifiedAt DateTime?`; `TaskDetailResponse.lastVerified: string | null` (`YYYY-MM-DD`); `previewRoadmap(answers: OnboardingPreviewRequest): Promise<OnboardingPreviewResponse>`; `OnboardingPreviewRequest { visaType: VisaType; city: City; familySituation: FamilySituation; occupation: Occupation; arrivalDate: string }`; `OnboardingPreviewResponse { tasks: { taskId: string; name: string; estimatedDuration: string; phase: number }[] }` ordered by task id; route `POST /onboarding/preview` (no auth, global per-IP limit applies); web `getRoadmapPreview(answers: OnboardingPreviewRequest): Promise<OnboardingPreviewResponse>`.

- [ ] **Step 1: Write the failing tests**
  - Seed: after `db:bootstrap`, `T21.applicableFamilySituations` parses to exactly `['COUPLE_DUAL_WORK','COUPLE_CONSTRAINED','FAMILY_WITH_CHILDREN']`; every other task still lists all four; `T08.lastVerifiedAt` is `2026-03-03`.
  - `createProfile` with `familySituation 'SOLO'` → 20 roadmap entries, none `T21`; with `'COUPLE_DUAL_WORK'` → 21.
  - `previewRoadmap` SOLO → 20 tasks, `tasks[0].taskId === 'T01'`, no `T21`; FAMILY_WITH_CHILDREN → 21.
  - Route: `POST /onboarding/preview` without a token and valid body → 200; `visaType: 'NOPE'` → 400 `VALIDATION_ERROR`; `arrivalDate: '2026-13-40'` → 400.
  - `getTaskDetail('T08')` → `lastVerified: '2026-03-03'`.
- [ ] **Step 2: Run** `npm run test:run -w @landednz/api -- onboarding seed roadmap.detail` — Expected: FAIL.
- [ ] **Step 3: Implement** — `ensureCompleteFamilySituations` keeps an explicit couples-only list (`COUPLE_ONLY_TASKS = ['T21']`) instead of widening it; parse `LAST_VERIFIED` into `lastVerifiedAt` (upsert `update` branch too, so re-running bootstrap fixes existing rows); migration `ALTER TABLE ... ADD COLUMN "lastVerifiedAt" TIMESTAMP(3)` only; validate preview body with the same enum lists `createProfile` uses.
- [ ] **Step 4: Run** `make db-reset && make test` — Expected: pass; `make db-bootstrap` a second time exits 0 (idempotent).
- [ ] **Step 5: Commit** `feat(onboarding): public roadmap preview; KB T21 couples-only and lastVerified`

### Task 3: `DELETE /account`

**Files:**
- Create: `apps/api/src/features/account/account.service.ts`, `account.route.ts`, `account.service.test.ts`
- Modify: `apps/api/src/shared/config.ts` (+ `supabaseSecretKey: requireEnv(env, 'SUPABASE_SECRET_KEY')`), the app's route registration (`buildApp`), `apps/web/src/lib/api.ts`
- Test: `account.service.test.ts`, config test file

**Interfaces:**
- Consumes: `apps/api/src/test-utils/supabase-user.ts` (real local user).
- Produces: `deleteAccount(userId: string): Promise<void>`; route `DELETE /account` (auth) → 204; web `deleteAccount(token: string): Promise<void>`.

- [ ] **Step 1: Write the failing tests**
  - With a real local Supabase user who has a profile, roadmap and chat session: `deleteAccount` → no `user`, `userProfile`, `userRoadmapEntry`, `chatSession` rows remain for that id; `auth.admin.getUserById` returns no user.
  - Route without a token → 401; with a token → 204, and a second call with the same (now invalid) token → 401.
  - `loadConfig` without `SUPABASE_SECRET_KEY` throws naming the variable.
- [ ] **Step 2: Run** `npm run test:run -w @landednz/api -- account config` — Expected: FAIL.
- [ ] **Step 3: Implement** — delete the DB user (cascades exist), then `createClient(supabaseUrl, supabaseSecretKey).auth.admin.deleteUser(userId)`; if the Supabase call fails after the DB delete, log and rethrow (the user can retry; DB rows are already gone, and the next verify recreates an empty user).
- [ ] **Step 4: Run** `make test` — Expected: pass.
- [ ] **Step 5: Commit** `feat(account): delete account endpoint`

## Web: foundation

### Task 4: Tokens, Geist, restyled primitives, design-system skill

**Files:**
- Modify: `apps/web/src/app/globals.css`, `apps/web/src/app/layout.tsx`, `apps/web/src/components/ui/button.tsx`
- Create: `components/ui/field.tsx`, `select.tsx`, `option-row.tsx`, `alert-dialog.tsx` (shadcn add, restyled), `toaster.tsx`; `apps/web/src/cw01.test.ts`; `.claude/skills/landednz-design-system/SKILL.md`
- Test: `apps/web/src/cw01.test.ts`, `components/ui/button.test.tsx`

**Interfaces:**
- Produces: Tailwind tokens usable as classes — colours `ink muted control border hairline wash teal teal-text teal-hover ink-hover avatar`; text sizes `text-hero text-title text-section text-body text-small` (each with its line height and tracking); radii `rounded-control` (6) `rounded-surface` (10); `shadow-lift`; utility classes `.ai` (aurora hairline wrapper) and `.ai-streaming` (flow, off under reduced motion), `.sr-only`. `Button` variants `primary | quiet | ghost`, sizes `default` (min-h 44, px 16) `lg` (min-h 48, px 24); `Field` (input, min-h 44, control border), `Select` (native select with inline chevron SVG), `OptionRow` (label + radio; selected = teal border + inset 1 px teal + wash), `Toaster` (sonner bottom-center, 4 s, hairline + shadow-lift).

- [ ] **Step 1: Write the failing tests**
  - `cw01.test.ts`: walks `apps/web/src/**/*.{ts,tsx}` (excluding tests) and fails on `/#[0-9a-fA-F]{3,8}\b/`, `/\[\d+(px|rem)\]/`, `style={{` containing a colour; reports file:line.
  - `button.test.tsx`: `<Button>Start</Button>` has class `bg-ink`; `variant="quiet"` has `border-border`; `disabled` primary has `bg-wash` and `text-muted`; size `lg` has `min-h-12`.
- [ ] **Step 2: Run** `npm run test -w @landednz/web` — Expected: FAIL.
- [ ] **Step 3: Implement** — values exactly as Global Constraints; `next/font/google` Geist with `variable: '--font-sans'`; focus ring `outline 2px teal, offset 2px` on `:focus-visible` globally; body `text-body text-ink bg-white antialiased`, `font-feature-settings: 'tnum'`. Skill: tokens table, the five type roles, button rules (one primary per screen), route waypoint states, aurora rule, CW01 test reference; written with `superpowers:writing-skills` (test: a subagent asked to build a "settings row" uses only listed tokens).
- [ ] **Step 4: Run** `make check` — Expected: pass.
- [ ] **Step 5: Commit** `feat(web): Precise design tokens, Geist and restyled primitives`

### Task 5: Task copy and legs

**Files:**
- Create: `apps/web/src/lib/task-copy.ts`, `lib/legs.ts` (+ tests)

**Interfaces:**
- Produces: `TASK_COPY: Record<string, { title: string; topic: string; brief: string; actionLabel?: string }>`; `taskTitle(id: string, fallback: string): string`; `type LegId = 'before' | 'arrival' | 'week1' | 'month1' | 'later'`; `LEGS: { id: LegId; name: string; taskIds: string[] }[]`; `legForTask(taskId: string): LegId` (unknown id → `'later'`); `legWhen(leg: LegId, arrivalDate: string): string`.

- [ ] **Step 1: Write the failing tests**
  - Every id `T01`–`T21` has a `TASK_COPY` entry; `TASK_COPY.T08` equals `{ title: 'Apply for your IRD number', topic: 'your IRD number', brief: 'your IRD number', actionLabel: 'Open the IRD application' }`; `taskTitle('T99', 'Raw name')` → `'Raw name'`.
  - `LEGS.map(l => l.name)` → `['Before you flew','Arrival','Week 1','Month 1','Later']`; task ids T01–T05, T06–T07, T08–T10, T11–T14, T15–T21; `legForTask('T99')` → `'later'`.
  - `legWhen` with arrival `2026-10-21` → before `'before 21 Oct'`, arrival `'21 to 22 Oct'`, week1 `'to 28 Oct'`, month1 `'to 20 Nov'`, later `'from month 2'`.
- [ ] **Step 2: Run** `npm run test -w @landednz/web -- task-copy legs` — Expected: FAIL.
- [ ] **Step 3: Implement** — titles and topics exactly as `docs/design/r0-boards/build_roadmap.py` `tasks()` (`name`, `topic`); action labels: T08 'Open the IRD application', T09 'Open the IR330 form', T12 'Find a GP near you'; briefs for Month 1: 'a rental', 'a GP', 'ACC', 'your rights as a tenant' (others: short noun phrases from the title, same style). `legWhen`: week 1 ends arrival + 7 days, month 1 ends arrival + 30 days, dates via the NZ formatter.
- [ ] **Step 4: Run** the same command — Expected: PASS.
- [ ] **Step 5: Commit** `feat(web): task copy and journey legs`

### Task 6: Journey day and route view model

**Files:**
- Create: `apps/web/src/lib/journey-day.ts`, `lib/route-view.ts` (+ tests)

**Interfaces:**
- Consumes: `RoadmapApiResponse` (Task 1 fields), `TASK_COPY`, `LEGS`, `legWhen`.
- Produces: `journeyDay(arrivalDate: string, now: Date): number` (arrival day = 1; negative/zero before arrival → `daysUntil = 1 - day`); `type WaypointState = 'done' | 'current' | 'available' | 'blocked' | 'locked'`; `buildRouteView(roadmap: RoadmapApiResponse, arrivalDate: string): RouteView` where `RouteView { total: number; doneCount: number; current: RouteTask | null; legs: RouteLeg[] }`, `RouteLeg { id: LegId; name: string; when: string; done: number; total: number; state: 'done' | 'current' | 'open' | 'locked'; tasks: RouteTask[] }`, `RouteTask { taskId: string; title: string; topic: string; state: WaypointState; meta: string; time: string; completedAt: string | null }`.

- [ ] **Step 1: Write the failing tests** (fixtures shaped as `RoadmapApiResponse`)
  - Review Focus 5: `journeyDay('2026-10-21', new Date('2026-10-21T10:30:00Z'))` (23:30 NZ) → 1; `new Date('2026-10-21T11:05:00Z')` (00:05 NZ, 22 Oct) → 2; `journeyDay('2026-11-01', new Date('2026-10-24T00:00:00Z'))` → −7.
  - Priya fixture (T01–T07 complete, T09 blocked on T08): `current.taskId === 'T08'`; T08 state `current`, meta `'Next'`; T09 `blocked`, meta `'Needs your IRD number first'`; T10 `available`, meta = its duration; T06 `done`, meta `'Done 21 Oct'`; legs before/arrival `done`, week1 `current`, month1 `open`, later `locked`; `total 20`, `doneCount 7`.
  - Order inside a leg is task id order; `current` is the first task in id order that is neither done nor blocked.
  - All done → `current null`, every leg `done`.
- [ ] **Step 2: Run** `npm run test -w @landednz/web -- journey-day route-view` — Expected: FAIL.
- [ ] **Step 3: Implement** — NZ calendar day via `Intl.DateTimeFormat('en-CA', { timeZone: 'Pacific/Auckland' })`; leg `locked` when its index > current leg index + 1 (D2 ruling: later phases lock); blocked meta `Needs ${TASK_COPY[blockingTaskIds[0]].topic} first`.
- [ ] **Step 4: Run** the same command — Expected: PASS.
- [ ] **Step 5: Commit** `feat(web): journey day and route view model`

### Task 7: Chrome, route components, proxy

**Files:**
- Create: `components/chrome/logo.tsx`, `app-header.tsx`, `public-header.tsx`, `public-footer.tsx`; `components/route/waypoint.tsx`, `route-rail.tsx`, `route-strip.tsx`, `stamp.tsx`; `app/app/error.tsx`, `app/app/loading.tsx`, `app/settings/error.tsx`
- Modify: `apps/web/src/proxy.ts`, `proxy.test.ts`, `next.config.ts` (redirects)
- Test: `components/chrome/app-header.test.tsx`, `components/route/route-rail.test.tsx`, `proxy.test.ts`

**Interfaces:**
- Consumes: `RouteView`, `RouteLeg`, `WaypointState` (Task 6).
- Produces: `<AppHeader active: 'home' | 'roadmap' | null; onAsk?: () => void; askDisabled?: boolean; user: { name: string; initials: string } />` (Ask button with `aria-keyshortcuts="/"`; "/" opens Ask unless focus is in an input, textarea, select or contenteditable; avatar opens a menu with Settings and Sign out); `<PublicHeader right?: ReactNode />`; `<PublicFooter />`; `<Waypoint state: WaypointState; size?: 'rail' | 'bead' />`; `<RouteRail legs: RouteLeg[]; selectedTaskId?: string; onOpen(taskId: string): void; renderCurrent?: (task: RouteTask) => ReactNode />`; `<RouteStrip legs: RouteLeg[] />`; `<Stamp date: string />`.

- [ ] **Step 1: Write the failing tests**
  - Header: `active="roadmap"` → the Roadmap link has `aria-current="page"`; pressing "/" on the body calls `onAsk`; pressing "/" inside a text input does not; `askDisabled` → Ask is disabled and "/" does nothing.
  - Rail: done and locked legs render folded with a Show button (`aria-expanded="false"`, accessible name includes the leg name); clicking it shows the tasks; each leg has the sr text `"<Leg>: n of m done"`; waypoints are `aria-hidden`.
  - Strip: renders one bead per task (`total` beads), only the current leg's label is visible below 560 px (class check), sr text per leg.
  - Proxy: `config.matcher` does not match `/`, `/onboarding`, `/privacy` (landing LCP, Stage A deferred minor); matches `/app`, `/app/roadmap`, `/settings`, `/signin`; `/roadmap` redirects (308) to `/app/roadmap`; signed-out `/app/roadmap?task=T08` → `/signin?redirect=%2Fapp%2Froadmap%3Ftask%3DT08` (query kept — Stage A deferred minor).
- [ ] **Step 2: Run** `npm run test -w @landednz/web -- app-header route proxy` — Expected: FAIL.
- [ ] **Step 3: Implement** — markup and sizes from `ui_parts.py` (`app_header`, `public_header`, `public_footer`, `LOGO`, `ROUTE_CSS`) and `build_home.py` (strip); rail line drawn per leg as a background gradient (teal on done legs, ends at the last leg's dot when folded); on phones the header hides the wordmark and keeps Home/Roadmap; `error.tsx` shows the API-down alert pattern (Task 11 owns its copy).
- [ ] **Step 4: Run** `make check` — Expected: pass.
- [ ] **Step 5: Commit** `feat(web): app and public chrome, route rail and strip`

## Web: pages (journey order)

Every page task's last step before commit: open the page in Chrome (`anthropic-skills:chrome-browser`) at 1440 and 390 against `make dev`, compare with its board, run the minimalism validator and `web-design-guidelines`, fix findings, ledger the result line.

### Task 8: Landing and SEO

**Files:**
- Modify: `apps/web/src/app/page.tsx`
- Create: `components/marketing/landing-hero.tsx`, `roadmap-preview-figure.tsx`; `app/sitemap.ts`, `app/robots.ts`, `app/opengraph-image.tsx`
- Test: `app/landing.test.tsx`, `app/seo.test.ts`

**Interfaces:**
- Consumes: `PublicHeader`, `PublicFooter`, `Waypoint`.

- [ ] **Step 1: Write the failing tests**
  - Landing renders one `h1` "Know what to do next in New Zealand", exactly one primary link "Build my roadmap" → `/onboarding`, a quiet "Sign in" link → `/signin`, three `h2` (In the right order / From official sources / Answers about your roadmap); the preview figure has `aria-label="Example: a roadmap on day 3"` and its contents are `aria-hidden`.
  - `metadata.title` = "LandedNZ: your settling-in roadmap for New Zealand"; description = "Answer five questions and get a step-by-step roadmap for your first months in New Zealand, checked against official sources."; page includes JSON-LD `@type: 'WebApplication'`.
  - `sitemap()` URLs = `/`, `/onboarding`, `/privacy`, `/terms`; `robots()` disallows `/app`, `/settings`, `/api`.
- [ ] **Step 2: Run** `npm run test -w @landednz/web -- landing seo` — Expected: FAIL.
- [ ] **Step 3: Implement** — from `Landing.dc.html`; topo SVG `aria-hidden`, hero only; preview shows "7 of 20 tasks done".
- [ ] **Step 4: Run** `make check` — Expected: pass. Chrome + gates per the page-task rule.
- [ ] **Step 5: Commit** `feat(web): landing page and SEO`

### Task 9: Onboarding, preview, answers cookie, auth completion

**Files:**
- Create: `lib/answers.ts` (+ test), `app/api/onboarding-answers/route.ts` (+ test), `app/onboarding/page.tsx`, `app/onboarding/preview/page.tsx`, `components/onboarding/question-step.tsx`, `preview-route.tsx`, `app/auth/complete/route.ts` (+ test)
- Modify: `app/auth/callback/route.ts` (redirect to `/auth/complete`), `app/signin/sign-in-form.tsx` (password path navigates to `/auth/complete`)

**Interfaces:**
- Consumes: `getRoadmapPreview` (Task 2), `submitOnboardingProfile` (existing), `RouteRail` styling.
- Produces: `type Answers = OnboardingPreviewRequest`; `parseAnswers(raw: unknown): Answers | null`; `encodeAnswers(a: Answers): string` / `decodeAnswers(cookie: string | undefined): Answers | null` (base64url JSON with `savedAt`, null when older than 3600 s); `answersSummary(a: Answers): string`; cookie name `lnz_answers` (httpOnly, sameSite `lax`, path `/`, maxAge 3600, `secure` when `NODE_ENV === 'production'`); `POST /api/onboarding-answers` (body = Answers → 204 + cookie; invalid → 400) and `DELETE` (clears); `GET /auth/complete?redirect=` (reads session + cookie, submits profile, clears cookie, redirects via `safeRedirect`).

- [ ] **Step 1: Write the failing tests**
  - `parseAnswers` rejects unknown enum values, missing fields, `arrivalDate` not `YYYY-MM-DD` or not a real date; accepts the five valid answers.
  - Review Focus 2: `decodeAnswers` → null for not-base64, not-JSON, invalid answers, `savedAt` 3601 s ago.
  - `answersSummary` for AEWV/Auckland/SOLO/TECHNOLOGY/2027-01-14 → `'Accredited Employer Work Visa (AEWV), Auckland, just you, technology, landing 14 January 2027'`.
  - Route handler: valid POST → 204 with `Set-Cookie: lnz_answers=…; HttpOnly; SameSite=Lax; Max-Age=3600`; invalid → 400, no cookie.
  - `/auth/complete`: no session → redirect `/signin`; session + valid cookie → calls `submitOnboardingProfile` once, clears cookie, redirects to `redirect`; Review Focus 1: API answers 409 → still redirects to `/app`, cookie cleared; invalid cookie → no submit, cookie cleared.
  - Question step: Continue disabled until an option is chosen; Back appears from step 2; step lives in `?step=`; the header shows "Step n of 5" and a progress bar `aria-valuenow=n`.
- [ ] **Step 2: Run** `npm run test -w @landednz/web -- answers onboarding auth` — Expected: FAIL.
- [ ] **Step 3: Implement** — boards `Onboarding.dc.html` (questions, preview scenario); question titles and option labels exactly as the board; answers held in a Zustand store until "See my roadmap" POSTs them and navigates to `/onboarding/preview`; preview page reads the cookie server-side (absent/invalid → redirect `/onboarding?step=1`), fetches the preview client-side, groups by `legForTask`, folds Month 1 and Later into one row "Month 1 and later" with the count from the response; sticky save bar "Save my roadmap" → `/signin?redirect=/app`. Buttons use `onClick`, not form submit.
- [ ] **Step 4: Run** `make check` — Expected: pass. Chrome + gates.
- [ ] **Step 5: Commit** `feat(web): onboarding questions, preview and answers carried through sign-in`

### Task 10: Sign in

**Files:**
- Modify: `app/signin/page.tsx`, `app/signin/sign-in-form.tsx`
- Test: `app/signin/sign-in.test.tsx`

**Interfaces:**
- Consumes: `decodeAnswers`, `answersSummary`, `getRoadmapPreview`.

- [ ] **Step 1: Write the failing tests**
  - With a valid answers cookie: back link "Your roadmap preview" → `/onboarding/preview`; aside "What you're saving" shows `answersSummary`, the first two preview tasks on the rail and "`n − 2` more tasks, in the order they unlock".
  - Without a cookie: no back link, no aside, heading "Sign in".
  - Google button text "Continue with Google" (Google branding: Roboto 500, `#747775` border — the documented exception to CW01, kept in `globals.css` as `.gsi`); consent line links to `/terms` and `/privacy`.
  - Password form renders only when `NEXT_PUBLIC_AUTH_PASSWORD_ENABLED === 'true'` (local/staging e2e).
- [ ] **Step 2: Run** `npm run test -w @landednz/web -- sign-in` — Expected: FAIL.
- [ ] **Step 3: Implement** — `SignIn.dc.html`; heading "Save your roadmap" with a cookie, "Sign in" without.
- [ ] **Step 4: Run** `make check` — Expected: pass. Chrome + gates.
- [ ] **Step 5: Commit** `feat(web): sign-in page`

### Task 11: Roadmap page

**Files:**
- Create: `app/app/roadmap/page.tsx`, `components/workspace/roadmap-view.tsx`, `next-task-card.tsx`
- Test: `components/workspace/roadmap-view.test.tsx`

**Interfaces:**
- Consumes: `buildRouteView`, `RouteRail`, `AppHeader`, `getRoadmap`, `getOnboardingProfile`.
- Produces: `<RoadmapView view: RouteView; firstUse: boolean; selectedTaskId?: string; onOpen(taskId): void />`; URL `?task=<id>` opens the sheet (Task 12).

- [ ] **Step 1: Write the failing tests**
  - Title "Your roadmap", "7 of 20 tasks done", progress bar `aria-valuenow=7 aria-valuemax=20`.
  - With no task selected the current task renders as the next-task card (title as `h3`, consequence line, the only primary button "Start" with sr text ": Apply for your IRD number", duration); with a task selected the card collapses to a row.
  - `firstUse` → hint "Done some already? Open a task and mark it done."
  - API failure → alert "Can't reach LandedNZ" / "Your progress is saved. Check your connection, then try again." with primary "Try again" (refetches); header Ask disabled; no route.
  - No profile (404) → redirect to `/onboarding?step=1`.
- [ ] **Step 2: Run** `npm run test -w @landednz/web -- roadmap-view` — Expected: FAIL.
- [ ] **Step 3: Implement** — `JourneyHome.dc.html` (scenarios default, first, error); client fetch with the Supabase token; `loading.tsx` uses still wash bars (no shimmer).
- [ ] **Step 4: Run** `make check` — Expected: pass. Chrome + gates.
- [ ] **Step 5: Commit** `feat(web): roadmap page`

### Task 12: Task sheet, done, undo, stamp

**Files:**
- Create: `components/workspace/task-sheet.tsx` (+ test)
- Modify: `components/workspace/roadmap-view.tsx`

**Interfaces:**
- Consumes: `getTaskDetail` (+ `lastVerified`), `completeTask`, `reopenTask`, `Stamp`, `TASK_COPY`.
- Produces: `<TaskSheet taskId: string; route: RouteView; onClose(): void; onChanged(): void />`; docked 480 px at ≥ 1100 px container width, full page under a wash band below; open/close history: opening pushes `?task=`, switching tasks pushes, Close and Esc push the URL without `task`, Back pops.

- [ ] **Step 1: Write the failing tests**
  - Shows "<Leg>, <duration>", title as `h2`, consequence line, numbered steps, action link (`actionLabel`, opens in a new tab with sr "(opens in a new tab)"), source line "Source: ird.govt.nz, checked 3 March 2026" (domain from `governmentSourceUrl`, omitted date when `lastVerified` is null).
  - Available task: primary "Mark as done" → calls `completeTask`, shows the stamp "Done 24 Oct", toast "Marked as done" with Undo; Undo → `reopenTask`, stamp gone, `onChanged` called (Review Focus 3: the route refetch shows T09 blocked again).
  - Done task: stamp, quiet "Mark as not done", no primary. Blocked task: no Mark button; sub shows the blocked meta.
  - Esc and Close call `onClose`; when opened from another task, a Back button named after the previous task returns to it.
- [ ] **Step 2: Run** `npm run test -w @landednz/web -- task-sheet` — Expected: FAIL.
- [ ] **Step 3: Implement** — `WorkspaceOpen.dc.html`, `JourneyPhone.dc.html`; stamp 64 px, rotate −10°, 200 ms in, static under reduced motion.
- [ ] **Step 4: Run** `make check` — Expected: pass. Chrome + gates.
- [ ] **Step 5: Commit** `feat(web): task sheet with done, undo and stamp`

### Task 13: Assistant in the task sheet

**Files:**
- Create: `lib/suggestions.ts`, `lib/trace.ts` (+ tests), `components/assistant/ask-panel.tsx`, `ai-reply.tsx` (+ test)
- Modify: `lib/api.ts` (`streamChat` gains `signal?: AbortSignal` and reports `{ code, message }` from a non-OK JSON body), `components/workspace/task-sheet.tsx`, `AppHeader` wiring (Ask opens the current task's sheet and focuses the ask input)

**Interfaces:**
- Consumes: `createChatSession('TASK_CARD', token, taskId)`, `streamChat`, `TaskDetailApiResponse`.
- Produces: `suggestionsFor(detail: TaskDetailApiResponse): string[]` (≤ 2: "What documents do I need?" when `documentsRequired` non-empty, "How long does it take?" when `processingTime`, "What do people get wrong?" when `commonMistakes` — first two that apply); `traceFor(replyText: string): string` (`'Checked ' + domains.join(', ')` from `extractSources` logic in `chat-parser.ts`, else `'Answered from the LandedNZ knowledge base'`); `<AskPanel taskId topic detail />`.

- [ ] **Step 1: Write the failing tests**
  - `suggestionsFor` with all three fields → the first two; with none → `[]`.
  - `traceFor('Apply at ird.govt.nz or myir.ird.govt.nz')` → `'Checked ird.govt.nz, myir.ird.govt.nz'`; no domains → knowledge-base line.
  - AskPanel: heading "Ask about your IRD number"; clicking a suggestion creates one session, streams chunks into an `.ai.ai-streaming` reply with trace "Checking sources", input disabled, Stop shown; Stop aborts and the trace ends ", stopped"; done → `.ai` without streaming, trace from `traceFor`, suggestion removed; Enter in the input sends.
  - Review Focus 4: stream fails with `CHAT_DAILY_CAP_REACHED` → message "You've reached today's question limit. You can ask again after midnight.", input stays disabled, earlier replies stay.
- [ ] **Step 2: Run** `npm run test -w @landednz/web -- suggestions trace ask-panel` — Expected: FAIL.
- [ ] **Step 3: Implement** — `WorkspaceStreaming.dc.html`; replies rendered with `react-markdown` (no raw HTML); aurora animation class only while streaming.
- [ ] **Step 4: Run** `make check` — Expected: pass. Chrome + gates (streaming state shot under `AI_MODE=mock`).
- [ ] **Step 5: Commit** `feat(web): task assistant with suggestions, streaming and stop`

### Task 14: Home

**Files:**
- Create: `lib/home-view.ts` (+ test), `components/workspace/home-view.tsx` (+ test)
- Modify: `app/app/page.tsx` (replace the Stage A placeholder)

**Interfaces:**
- Consumes: `buildRouteView`, `journeyDay`, `RouteStrip`, `NextTaskCard` row styles, `answersSummary` labels.
- Produces: `buildHomeView(route: RouteView, profile: GetProfileResponse, user: { firstName: string }, now: Date): HomeView` with `greeting`, `subline`, `weekTitle`, `top`, `week` (next two), `nextLine`, `recent` (last three by `completedAt`), `plan` (Visa, City, Moving, Work).

- [ ] **Step 1: Write the failing tests**
  - Priya fixture at 15:00 NZ day 3: greeting "Good afternoon, Priya"; subline "Day 3 in Auckland, and the basics are sorted."; week title "This week"; top = T08 with "Start"; week = T09 (meta "After your IRD number"), T10; nextLine "Month 1 brings a rental, a GP, ACC and your rights as a tenant."; recent = Open a bank account 22 Oct, Get an NZ SIM card 21 Oct.
  - Greeting by NZ hour: 05:00–11:59 morning, 12:00–17:59 afternoon, else evening.
  - First use (0 done): greeting "Welcome to Auckland, Priya"; subline "Start with the first task below. Each one you finish unlocks the next."; week title "Start here"; recent empty → "Nothing yet. Tasks you finish show up here with the day you did them. Already done some? Tick them off on your Roadmap."
  - Before arrival (day −7): subline "8 days until you land in Auckland." (Review Focus 5).
  - Plan rows link "Edit" → `/settings`; `firstName` from `user_metadata.full_name` first word, else the email's local part.
- [ ] **Step 2: Run** `npm run test -w @landednz/web -- home-view` — Expected: FAIL.
- [ ] **Step 3: Implement** — `Home.dc.html` (default and `firstUse`), `HomePhone.dc.html`.
- [ ] **Step 4: Run** `make check` — Expected: pass. Chrome + gates.
- [ ] **Step 5: Commit** `feat(web): home page`

### Task 15: Settings

**Files:**
- Modify: `app/settings/page.tsx`
- Create: `components/settings/plan-form.tsx`, `account-section.tsx`, `delete-account.tsx` (+ tests)

**Interfaces:**
- Consumes: `getOnboardingProfile`, `updateOnboardingProfile`, `deleteAccount` (Task 3), `AlertDialog`, `Select`, `Field`.

- [ ] **Step 1: Write the failing tests**
  - Plan form prefilled from the profile; "Save changes" is the only primary; saving calls `updateOnboardingProfile` with the five answers and shows toast "Changes saved"; a 403/404 result shows its message inline.
  - Account shows name and email, quiet "Sign out" (signs out, goes to `/`).
  - "Delete my account" opens a dialog "Delete your account?" with "Removes your answers, your roadmap and your questions to the assistant. This can't be undone." and buttons "Delete my account" / "Cancel"; confirming calls `deleteAccount`, signs out, goes to `/`; a non-2xx response keeps the dialog open with "Couldn't delete your account. Try again."
- [ ] **Step 2: Run** `npm run test -w @landednz/web -- settings` — Expected: FAIL.
- [ ] **Step 3: Implement** — `Settings.dc.html`, `SettingsPhone.dc.html`.
- [ ] **Step 4: Run** `make check` — Expected: pass. Chrome + gates.
- [ ] **Step 5: Commit** `feat(web): settings page`

### Task 16: Privacy and Terms

**Files:**
- Create: `content/legal/privacy.md`, `content/legal/terms.md`, `components/marketing/legal-page.tsx`, `app/privacy/page.tsx`, `app/terms/page.tsx` (+ test)

- [ ] **Step 1: Write the failing test** — `/privacy` renders `h1` "Privacy", "Last updated 24 October 2026", the five `h2` from `Legal.dc.html`; `/terms` renders `h1` "Terms" from the same template; bracketed placeholders render in a `.ph` span.
- [ ] **Step 2: Run** `npm run test -w @landednz/web -- legal` — Expected: FAIL.
- [ ] **Step 3: Implement** — Privacy copy exactly as `Legal.dc.html`; Terms: short plain sections (what LandedNZ is, general information not advice, your account, acceptable use, changes, contact) with the same placeholders; render markdown with `react-markdown`. The owner fills the placeholders before Stage C (ledger it).
- [ ] **Step 4: Run** `make check` — Expected: pass. Chrome + gates.
- [ ] **Step 5: Commit** `feat(web): privacy and terms`

## Gates

### Task 17: Journey e2e, axe, Lighthouse, budgets

**Files:**
- Create: `apps/web/e2e/journey.spec.ts`, `apps/web/e2e/a11y.spec.ts`, `apps/web/lighthouserc.json`
- Modify: `apps/web/e2e/auth.spec.ts` (new routes and copy), `.github/workflows/ci.yml` (Lighthouse job), `Makefile` (`make lighthouse`), `apps/web/package.json` (`@axe-core/playwright`, `@lhci/cli` dev deps)

- [ ] **Step 1: Write the journey test** (spec §9): `/` → "Build my roadmap" → five answers (Just me) → preview shows 20 tasks in total ("Month 1 and later" row says 10) → "Save my roadmap" → password sign-in as the e2e user → `/app` greets the user → Roadmap → open "Apply for your IRD number" → ask "What documents do I need?" → a reply with a trace appears (`AI_MODE=mock`) → "Mark as done" → stamp "Done <today>" visible → Undo → stamp gone.
- [ ] **Step 2: Write the axe test** — for `/`, `/onboarding?step=1`, `/onboarding/preview`, `/signin`, `/app`, `/app/roadmap`, `/app/roadmap?task=T08`, `/settings`, `/privacy`, `/terms` at 1440 and 390: `new AxeBuilder({ page }).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze()` → `violations` is `[]`.
- [ ] **Step 3: Run** `make test-e2e` — Expected: both specs pass (fix pages, not tests, on failure).
- [ ] **Step 4: Set the JS budget from the first build** — `make build`, record each route's first-load JS from the build output in the ledger; budget = measured rounded up to the next 10 kB. `lighthouserc.json` (mobile preset, `npm run start`): `/` asserts `categories:performance ≥ 0.9`, `categories:accessibility ≥ 0.95`, `categories:seo ≥ 0.95`, `largest-contentful-paint ≤ 2500`, `resource-summary:script:size ≤ <budget>`; `/onboarding` and `/signin` assert accessibility ≥ 0.95.
- [ ] **Step 5: Run** `make lighthouse` — Expected: all assertions pass.
- [ ] **Step 6: Gate pass** — `seo-audit` on `/`; minimalism validator + `web-design-guidelines` on every page (results already ledgered per task, re-run on the final build); `ponytail-review` on the branch diff.
- [ ] **Step 7: Commit** `test(web): journey e2e, axe on every page, Lighthouse budgets`
- [ ] **Step 8: Owner sign-off, then screenshot baselines** — owner reviews the running app locally (`make dev`); after "approved", add `toHaveScreenshot()` baselines for the pages in Step 2 at 1440 and 390 and commit `test(web): screenshot baselines after owner sign-off`. Stop here and ask; this step waits for the owner.
