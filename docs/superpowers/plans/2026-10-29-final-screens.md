# Final Screens (R1–R7, P7) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the built signed-in app, Build my roadmap and the pre-sign-in pages match the 18 final boards, then run the whole-app design gate (P7).

**Architecture:** Pure view logic stays in `apps/web/src/lib/*` (route geometry, Home view, Roadmap itinerary, calendar maths) with vitest unit tests; components in `apps/web/src/components/*` only draw it. The API gains one computed field, `bestBy`, from content urgency rules. No new dependencies, tokens, fonts or colours.

**Tech Stack:** Next 16.4, React 19.3, Tailwind 4 `@theme`, Base UI (`@base-ui/react` Menu, Tabs), zustand, Vitest 5, Playwright + axe; Fastify 5, Prisma 7.

**Spec:** `docs/superpowers/specs/2026-10-29-final-screens-design.md` (parents: `2026-10-28-r0-polish-and-stage-c-design.md` §3.1, §4, §5; `2026-10-24-r0-foundation-design.md`)

## Global Constraints

- **Sessions as in the "Sessions" table** (subagent-driven: up to 4 tasks per session, each in a fresh subagent with its own review). At the end of a session, stop and print the resume prompt from "Sessions".
- **Board first (CW02′):** every UI task opens its boards in `docs/design/r1-final/` (Step 0) and matches them at 1440×900 and 390×844. Board task names and short names are illustration; the app uses `taskTitle()` and `TASK_COPY[id].topic` (spec §2.7).
- **Type set:** every rendered font size is in {48, 24, 22, 18, 15, 13, 12}, only through `text-hero`, `text-title`, `text-section`, `text-body`, `text-small`, `text-citation`. The Google button keeps Roboto 15.
- **Tokens only (CW01):** raw values only in `globals.css` `@theme`; the road geometry and terrain stay in `route-progress.ts`.
- **Breakpoints:** phone = `max-narrow:` (under 561 px); two columns drop to one under `split` (861 px).
- **Cards:** every section is `Card` (radius 12, padding 20 / 16 on phones, hairline, `shadow-lift`). Wash blocks are `Card` with `bg-wash` + teal-tint border, a class, not a component.
- Light only (CW08). Reduced motion respected (CW03). No content (YAML) changes. No database changes.
- Dev servers for checks and e2e: ports **3100/3101 only**. Never stop the servers on 3000/3001.
- Never commit, overwrite or recreate `.env.local` or `supabase/.env`; edit keys in place.
- Conventional Commits with a scope (`feat(web):`, `feat(roadmap):`, `test(web):`, `docs:`). **No Co-Authored-By trailer.**
- Work in worktree `/Users/ruchira/Development/NZ_Project/landednz-r0p`, branch `feat/r0-polish`. Leave the untracked `apps/web/PRODUCT.md` alone.
- Before each UI task: run `impeccable context` once (skill `impeccable`), read its `craft-floor.md`, then build. After: `impeccable critique` on the page; fix every P0/P1 before the commit.

## Review Focus

1. **Nothing done yet, or everything done.** You sits at x 0 when nothing is done (no NaN for a 0-task stage) and at 1000 when all are done; Home shows the existing empty states; Recently done hides. Tests in Task R1 (`youX`) and R2 (`buildHomeView` empty cases).
2. **Before arrival (arrival date in the future).** Today line hidden, pill reads "You · n days to go", `bestBy` still computed from the future date, Roadmap Today block still shows the first task. Tests in R1 (`todayX` returns `null`) and R3 (`buildItinerary` before arrival).
3. **The next task unlocks nothing / is blocked by several tasks.** No arcs, no note, no "Unlocks" line; a task with two blockers counts once in each blocker's Unlocks. Tests in R1 (`unlocksOf`).
4. **Keyboard-only calendar across month and year edges.** Arrow left on 1 Jan moves to 31 Dec of the previous year, and the month label is announced. Test in R5 (`moveDate`).
5. **Settings `?edit=` with an unknown key, or a direct load of `/settings?edit=arrivalDate` on a phone.** Unknown key falls back to the first answer; Back returns to `/settings`. Test in R6.

---

## Step 0: before Task R1

- [ ] Copy the 18 final boards and `canvas.json` from the artifact https://claude.ai/artifact/NT4cny6G32STB7xzYjwgEc (version `1793219900-a569`, boards byte-identical to Version 4) into `docs/design/r1-final/` with the Artifact tool's `read` (`paths: project/*.dc.html, project/canvas.json`, `out_dir` a scratch folder), then `cp` them in.
- [ ] Add one line under the title of `docs/superpowers/plans/2026-10-28-r0-polish-and-stage-c.md` (done when this plan was written; skip if present).
- [ ] Commit: `git add docs/design/r1-final && git commit -m "docs(design): final screen boards (R1–R7)"`.

## Sessions

| Session | Tasks |
|---|---|
| 1 | Step 0, R1, R2, R3, R4 (the signed-in app; R2–R4 build on R1) |
| 2 | R5, R6, R7, P7 (P7 needs the owner for sign-off) |

After R4, stop so the owner can look at Home, Roadmap and Task in the browser before session 2.

Track C (C1–C4 in the 2026-10-28 plan) follows P7, unchanged.

Resume prompt: `Continue docs/superpowers/plans/2026-10-29-final-screens.md from Task <X> (session <N>) in worktree /Users/ruchira/Development/NZ_Project/landednz-r0p, branch feat/r0-polish. Use superpowers:subagent-driven-development; run every task in that session's row of the Sessions table, then stop.`

Test commands used below: web unit/component `npm test -w apps/web -- <pattern>`; API `npm test -w apps/api -- <pattern>` (local Supabase running, `AI_MODE=mock`); all checks `make check`; e2e `npm run test:e2e -w apps/web` (ports 3100/3101).

---

### Task R1: The road and `bestBy`

Spec §3.1, §6.1. Boards: Home, HomePhone, Roadmap, RoadmapPhone.

**Files:**
- Modify: `apps/api/src/features/roadmap/roadmap.types.ts` (`RoadmapTask`), `roadmap.build.ts`, `roadmap.service.ts:66-81`
- Test: `apps/api/src/features/roadmap/roadmap.build.test.ts` (create), `roadmap.service.test.ts`
- Modify: `apps/web/src/lib/api.ts:131` (`RoadmapApiTask`), `lib/route-view.ts`, `lib/route-progress.ts`, `lib/nz-date.ts`, `components/route/route-track.tsx`, `app/globals.css` (track block)
- Test: `lib/route-progress.test.ts`, `lib/route-view.test.ts`, `lib/nz-date.test.ts`, `components/route/route-track.test.tsx`

**Interfaces:**
- Produces (API): `bestByDate(urgency: ResolvedTask['urgency'], arrivalDate: Date | null): string | null` in `roadmap.build.ts`; `RoadmapTask.bestBy: string | null`; `RoadmapApiTask.bestBy: string | null`.
- Produces (web):
  - `RouteTask` gains `blockedBy: string[]` (all `blockingTaskIds`) and `bestBy: string | null`.
  - `unlocksOf(route: RouteView, taskId: string): RouteTask[]` in `route-view.ts` — tasks whose `blockedBy` includes `taskId`, in leg order then route order.
  - `TRACK_FLAGS = [150, 270, 530, 820, 1000]`; `stageSpan(i: number): [number, number]`.
  - `youX(route: RouteView): number`, `todayX(arrivalDate: string, now: Date): number | null`, `taskDots(route: RouteView): { taskId: string; x: number; state: 'done' | 'blocked' | 'open' }[]` in `route-progress.ts`.
  - `routeProgress(...)` returns `{ x, todayX, label, summary, passed }` (x = `youX`).
  - `stageLabels(...)` keeps its shape; `state` becomes `"{d} of {t} done · {when}"` or `"{t} tasks · {when}"`.
  - `phoneStages(route, arrivalDate, now): { prev: { name: string; state: string } | null; cur: { name: string; daysLeft: number | null }; next: string | null }` (`prev.state` is `"3 of 4"` or `"✓"`). `daysLeft` = the stage's last `STAGE_DAYS` day − today, not counting today (day 5 in Week 1 → 3, as the boards show); `null` before arrival or when 0, and then no "n days left" text is shown. `routeProgress`'s summary uses the same count.
  - `weekdayDay(date: string): string` → `"Sun 15 Nov"`; `weekdayDayNZ(instant: string | Date): string` → `"Wed 4 Nov"` in `nz-date.ts`.
  - `<RouteTrack route arrivalDate now variant="compact" | "tall" />` (replaces `height`).

- [ ] **Step 1: Write the failing API test** in `roadmap.build.test.ts`:

```ts
const nov2 = new Date('2026-11-02T00:00:00Z')
it('day window gives arrival + toDay − 1', () => expect(bestByDate([{ fromDay: 4, toDay: 14, by: 25 }], nov2)).toBe('2026-11-15'))
it('several day windows take the earliest', () =>
  expect(bestByDate([{ fromDay: 4, toDay: 14, by: 25 }, { fromDay: 1, toDay: 10, by: 5 }], nov2)).toBe('2026-11-11'))
it('no rule gives null', () => expect(bestByDate([], nov2)).toBeNull())
it('a month rule gives null', () => expect(bestByDate([{ months: [2, 3], afterFirstYear: true, by: 25 }], nov2)).toBeNull())
it('no arrival date gives null', () => expect(bestByDate([{ fromDay: 4, toDay: 14, by: 25 }], null)).toBeNull())
```

And in `roadmap.service.test.ts`, inside the existing `getRoadmap` happy path: `expect(tasks.find(t => t.taskId === 'T08')?.bestBy).toBe(<arrival + 13 days, ISO>)` and a task with no urgency has `bestBy: null`.

- [ ] **Step 2: Run** `npm test -w apps/api -- roadmap.build roadmap.service` — expect FAIL (`bestByDate` not exported).
- [ ] **Step 3: Implement** `bestByDate` (UTC day arithmetic, `toISOString().slice(0, 10)`), add `bestBy` to `RoadmapTask`, and set `bestBy: bestByDate(task.urgency, profile.arrivalDate)` in `getRoadmap`. Other builders of `RoadmapTask` (grep `consequenceLine:` in `features/roadmap`) set it the same way.
- [ ] **Step 4: Run** the same command — PASS. Then `npm run typecheck -w apps/api`.
- [ ] **Step 5: Commit** `feat(roadmap): bestBy from the task's day window`.

- [ ] **Step 6: Write the failing web unit tests** (use the route fixture builder already in `route-progress.test.ts`; arrival `2026-11-02`):
  - `nz-date.test.ts`: `weekdayDay('2026-11-15') === 'Sun 15 Nov'`; `weekdayDayNZ('2026-11-03T20:00:00Z') === 'Wed 4 Nov'` (NZ calendar).
  - `route-progress.test.ts`:
    - `TRACK_FLAGS` equals `[150, 270, 530, 820, 1000]`; `stageSpan(0)` is `[0, 150]`, `stageSpan(2)` is `[270, 530]`.
    - `youX`: Arrival current with 3 of 4 done → `240`; Before current with 2 of 6 → `50`; nothing done anywhere → `0`; all done → `1000`.
    - `todayX`: day 0 (`now` 1 Nov) → `null`; day 1 → `210` (Arrival 1–2: 150 + 120 × 1/2); day 5 → `400` (Week 1 3–8: 270 + 260 × 3/6); day 200 → `1000`.
    - `taskDots`: 6 Before tasks spread at `150 × k/7`, k = 1…6; states map done → `'done'`, `isBlocked` → `'blocked'`, else `'open'`.
    - `stageLabels`: Before 6/6 → `'6 of 6 done · by 2 Nov'`; Week 1 0/7 → `'7 tasks · to 9 Nov'`; Arrival 3/4 → `'3 of 4 done · 2–3 Nov'`.
    - `phoneStages` on day 5 with Arrival 3/4 → `{ prev: { name: 'Arrival', state: '3 of 4' }, cur: { name: 'Week 1', daysLeft: 3 }, next: 'Month 1' }`; when Arrival is complete, `prev.state === '✓'`.
  - `route-view.test.ts`: with T09 (Week 1) and T10 (Month 1) listing T08 in `blockingTaskIds`, `unlocksOf(route, 'T08')` maps to `['T09', 'T10']`; a task blocked by T07 and T08 appears in both results; a task nothing depends on gives `[]`. `RouteTask.bestBy` passes through.
- [ ] **Step 7: Run** `npm test -w apps/web -- route-progress route-view nz-date` — FAIL.
- [ ] **Step 8: Implement** the Interfaces above. `youX`: current stage `i` from `current(route)`, `start + (end − start) × done/total` (0 when `total` is 0), `1000` when all done. `todayX`: `null` for day < 1; stage by `STAGE_DAYS`, past day 61 → 1000. Delete the old date-mixed `x`.
- [ ] **Step 9: Run** — PASS.
- [ ] **Step 10: Write the failing component test** `route-track.test.tsx`:
  - `variant="tall"` with next task T08 renders the text "Dotted lines: unlocked by your IRD number" and one `path.track-arc` per unlocked task; with a next task that unlocks nothing, neither.
  - `variant="compact"` never renders arcs.
  - The Today label "Today · Fri 6 Nov" renders on day 5 and not before arrival.
  - One `.track-dot` per task, with `data-state` done/blocked/open.
  - The phone row (`.track-phone`) holds "Arrival", "3 of 4", "Week 1 · now" and a `Roadmap` link for compact; "Week 1 · 3 days left" and "Month 1" for tall.
  - The SVG stays `aria-hidden`; the summary text is still rendered.
- [ ] **Step 11: Run** `npm test -w apps/web -- route-track` — FAIL.
- [ ] **Step 12: Implement** `RouteTrack` against the Home and Roadmap boards: dots (done = teal fill; blocked = white fill, `control` stroke, dashed; open = small `track` dot), dashed vertical Today line with its label, You ring + ink "You're here" pill (before arrival: today's "You · n days to go"), arcs from You to each `unlocksOf(route, route.current.taskId)` dot (tall only, hidden under 561 px). `.track-stages` hidden and `.track-phone` shown under the existing 560 px container query; the phone road heights are 56 (compact) / 64 (tall). Update every `height={…}` call site to `variant`.
- [ ] **Step 13: Run** `npm test -w apps/web` and `npm run typecheck -w apps/web` — PASS.
- [ ] **Step 14: Commit** `feat(web): curvy road with task dots, Today line and unlock arcs`.

---

### Task R2: Home C and the tab bar

Spec §5.1, §3.4. Boards: Home, HomePhone.

**Files:**
- Modify: `apps/web/src/lib/home-view.ts`, `components/workspace/home-view.tsx`, `components/chrome/app-header.tsx`, `components/chrome/public-footer.tsx`, `app/globals.css` (tab bar padding only if a utility can't do it)
- Test: `lib/home-view.test.ts`, `components/workspace/home-view.test.tsx`, `components/chrome/app-header.test.tsx`

**Interfaces:**
- Consumes: R1 `unlocksOf`, `weekdayDayNZ`, `weekdayDay`, `RouteTrack variant`, `RouteTask.blockedBy`.
- Produces:
  - `homeSubline(route: RouteView, arrivalDate: string, now: Date, short: boolean): string` in `home-view.ts` (full: "9 of 22 done · day 5 since you landed on Mon 2 Nov"; short drops " on Mon 2 Nov"; before arrival both keep today's count-down text). `buildHomeView` sets `subline`/`sublineShort` from it.
  - `HomeView` loses `plan` and `nextMeta`'s old form; gains `subline` (with "on {Mon 2 Nov}"), `sublineShort` (without), `nextMeta: string` ("Your next move · Arrival · 20–30 min"), `nextMetaShort` ("Your next move · 20–30 min"), `unlocks: string[]` (titles), `weekAside: string` ("Week 1 · 3 days left"), `week: { task: RouteTask; meta: string }[]` (meta "Waits on {topic}" or the task's time), `weekFoot: string | null` ("4 more in Week 1"), `weekTotal: number`, `recent: { taskId: string; title: string; when: string; weekday: string }[]` (at most 4, newest first; `when` "Done Wed 4 Nov · Arrival", `weekday` "Wed"), `recentTotal: number`.
  - `waitsOn(task: RouteTask): string` in `route-view.ts` → `"Waits on {topic}"` (replaces `blockedMeta`'s "Needs {topic} first"; R3 reuses it).
  - `AppHeader` props: `active: "home" | "roadmap" | "settings" | null`, new optional `back?: { href: string; label: string }` (phone only, replaces the logo; R4 uses it). Renders the desktop nav Home / Roadmap / Settings and, under 561 px, `nav[aria-label="Main"]` fixed at the bottom with the three tabs (icon + 12 px label, `aria-current="page"` on the active one).
  - `PublicFooter({ app }: { app?: boolean })`: with `app`, under 561 px the text reads "Not legal or tax advice", the row is 36 px, and it sits above the tab bar.

- [ ] **Step 1: Write the failing unit tests** in `home-view.test.ts` (fixture: arrival 2 Nov, now 6 Nov, 9 of 22 done):
  - `subline === '9 of 22 done · day 5 since you landed on Mon 2 Nov'`, `sublineShort` without " on Mon 2 Nov"; before arrival the existing count-down text is unchanged.
  - `nextMeta === 'Your next move · Arrival · 20–30 min'`; `unlocks` lists the T08-blocked titles in leg order; `[]` when none.
  - `weekAside === 'Week 1 · 3 days left'`; a blocked row's meta is `'Waits on your IRD number'`; `weekFoot === '4 more in Week 1'`, `null` when nothing more.
  - `recent` has 4 items newest first, `when === 'Done Wed 4 Nov · Arrival'`, `weekday === 'Wed'`; `recentTotal === 9`; with 0 done `recent` is `[]`.
  - `plan` is gone (`'plan' in view === false`).
- [ ] **Step 2: Run** `npm test -w apps/web -- lib/home-view` — FAIL.
- [ ] **Step 3: Implement** in `home-view.ts` and `route-view.ts`.
- [ ] **Step 4: Run** — PASS.
- [ ] **Step 5: Write the failing component tests:**
  - `app-header.test.tsx`: desktop nav has links Home, Roadmap, Settings; `active="settings"` puts `aria-current="page"` on Settings in both navs; the `Main` nav has three links; with `back`, a link "Roadmap" replaces the brand on phones (assert it renders; visibility is CSS).
  - `home-view.test.tsx` (rewrite to the new structure): h1 "Welcome to Auckland"; cards "Your 90 days" (with an "Open roadmap" link to `/app/roadmap`), "Your next move" (h3 task name, "Unlocks:" line, "Start task", "Ask about this" linking with `ask=1`), "Then this week" (aside, ≤3 rows, footer link), "Recently done" ("9 tasks done", "Show all" → `/app/roadmap?done=1`, 4 tiles); no "Your plan"; existing empty states still render.
- [ ] **Step 6: Run** `npm test -w apps/web -- home-view app-header` — FAIL.
- [ ] **Step 7: Implement** against the Home boards: columns `1fr 440px` (one column under `split`), Recently done grid 4 columns (2 under 561 px; phone shows 2 rows with `weekday`), phone variants per spec §5.1 Phone. App pages get bottom padding equal to the tab bar under 561 px. Home, Roadmap and Settings pass `app` to `PublicFooter`.
- [ ] **Step 8: Run** `npm test -w apps/web`, `npm run typecheck -w apps/web`, `npm run lint -w apps/web` — PASS.
- [ ] **Step 9: Look:** run web on 3100 / API on 3101, screenshot `/app` at 1440×900 and 390×844 beside `Home` / `HomePhone`; fix differences; `impeccable critique` — no P0/P1.
- [ ] **Step 10: Commit** `feat(web): Home C, header Settings link and phone tab bar`.

---

### Task R3: Roadmap D fitted

Spec §5.2. Boards: Roadmap, RoadmapPhone.

**Files:**
- Create: `apps/web/src/lib/roadmap-itinerary.ts`, `lib/roadmap-itinerary.test.ts`
- Modify: `components/workspace/roadmap-view.tsx`; delete `components/route/stage-list.tsx` + its test if nothing else imports them (grep first)
- Test: `components/workspace/roadmap-view.test.tsx`

**Interfaces:**
- Consumes: R1 `unlocksOf`, `RouteTrack variant="tall"`, `weekdayDayNZ`; R2 `waitsOn`, `homeSubline`.
- Produces: `buildItinerary(route: RouteView, arrivalDate: string, now: Date): Itinerary`:

```ts
interface Itinerary {
  done: { when: string; summary: string; topics: string; count: number; tasks: RouteTask[] } | null
  //   when "by 2 Nov · 2–3 Nov", summary "Before you flew 6 of 6 · Arrival 3 of 4", topics "SIM cards, bank accounts, your visa conditions" (≤3)
  today: { date: string; day: number | null; meta: string; task: RouteTask; unlocks: { title: string; stage: string; topic: string }[] } | null
  //   date "Fri 6 Nov", meta "You're here · up next · 20–30 min"
  current: { name: string; count: number; when: string; daysLeft: number | null; rows: { task: RouteTask; meta: string }[]; more: RouteTask[] } | null
  later: { name: string; count: number; wait: string | null; when: string; tasks: RouteTask[] }[]
  //   wait ", 2 wait on your IRD number"
}
```

- [ ] **Step 1: Write the failing tests** `roadmap-itinerary.test.ts` (board fixture, day 5): `done.when === 'by 2 Nov · 2–3 Nov'`, `done.summary === 'Before you flew 6 of 6 · Arrival 3 of 4'`, `done.count === 9`; `today.meta === "You're here · up next · 20–30 min"`, 3 unlocks with stages `Week 1`, `Month 1`, `Month 1`; `current.name === 'Week 1'`, `count === 7`, `when === 'to 9 Nov'`, `daysLeft === 3`, 3 rows and 4 in `more`; `later[0]` is Month 1 with `wait === ', 2 wait on your IRD number'`, Later with `wait === null`. Nothing done → `done === null`. Before arrival → `today.day === null` and `today.task` is the first open task. All done → `today === null`, `current === null`.
- [ ] **Step 2: Run** `npm test -w apps/web -- roadmap-itinerary` — FAIL.
- [ ] **Step 3: Implement** `buildItinerary`.
- [ ] **Step 4: Run** — PASS.
- [ ] **Step 5: Write the failing component test** (rewrite `roadmap-view.test.tsx`): h1 "Your roadmap" and subline; no "Up next", "Key dates", "Other stages" headings; road card with tall track; itinerary rows in order Done so far → Today → Week 1 → Month 1 → Later; every Show is a `button` with `aria-expanded` that toggles its list in place; "Show 4 more" reveals 4 rows; `?done=1` renders Done so far expanded; done tasks link to `/app/roadmap?task=…`; Start task links to the task, Ask about this keeps `ask=1`; existing `?task=` and `?ask=1` tests stay green.
- [ ] **Step 6: Run** `npm test -w apps/web -- roadmap-view` — FAIL.
- [ ] **Step 7: Implement** against the Roadmap boards: grid `128px 24px 1fr auto`; Today row is a wash `Card` (`bg-wash`, teal-tint border); main buttons ink; phone per spec §5.2 Phone (Today card without why line, Unlocks as topics).
- [ ] **Step 8: Run** `npm test -w apps/web`, typecheck, lint — PASS.
- [ ] **Step 9: Look** at `/app/roadmap` and `/app/roadmap?done=1` at both sizes beside the boards; `impeccable critique` — no P0/P1.
- [ ] **Step 10: Commit** `feat(web): Roadmap D itinerary`.

---

### Task R4: Task details C

Spec §6.2. Boards: Task, TaskPhone.

**Files:**
- Modify: `apps/web/src/components/workspace/task-sheet.tsx`
- Test: `components/workspace/task-sheet.test.tsx`

**Interfaces:**
- Consumes: R1 `RouteTask.bestBy`, `weekdayDay`; R2 `AppHeader back`.
- Produces: nothing new for later tasks.

- [ ] **Step 1: Write the failing tests** (rewrite structure, keep behaviour tests for mark/undo, blocked "Do this first", government button, Previous/Next):
  - With `bestBy: '2026-11-15'` the status card reads "Best done by Sun 15 Nov"; with `null` no "Best done by".
  - Status card copy "You can undo this."; heading "Have ready" (not "What you'll need").
  - Only one Previous/Next pair (the top bar); no bottom nav.
  - Sources card: "Sources checked {date}", 5 numbered sources, a button "4 more sources" with `aria-expanded` that reveals the rest; with ≤5 sources no button.
  - Phone: a Base UI `Tabs` with tabs "Steps", "Good to know", "Sources 9"; Have ready sits in the Steps panel; meta line ends "· best done by Sun 15 Nov"; the action bar holds "Mark as done" and "Ask".
- [ ] **Step 2: Run** `npm test -w apps/web -- task-sheet` — FAIL.
- [ ] **Step 3: Implement** against the Task boards: columns `1fr 380px` (one under `split`); side cards Status, Ask (existing `AskPanel` in its `Card`), Sources; phone h1 `text-section`, action bar fixed above the tab bar, `AppHeader back={{ href: '/app/roadmap', label: 'Roadmap' }}`, no footer on phone. Render desktop and phone layouts from the same data; hide one with `max-narrow:`/`narrow:` so tests see both.
- [ ] **Step 4: Run** `npm test -w apps/web`, typecheck, lint — PASS.
- [ ] **Step 5: Look** at `/app/roadmap?task=T08` at both sizes beside the boards; `impeccable critique` — no P0/P1.
- [ ] **Step 6: Commit** `feat(web): Task details C with best-done-by and phone tabs`.

---

### Task R5: Build my roadmap A, calendar and preview

Spec §4.2–§4.4. Boards: StRail, StRailDate, StRailPhone, StRailPreview.

**Files:**
- Create: `apps/web/src/lib/calendar.ts`, `lib/calendar.test.ts`, `components/ui/calendar.tsx`, `components/ui/calendar.test.tsx`, `components/onboarding/answer-rail.tsx`
- Modify: `components/onboarding/question-step.tsx`, `components/onboarding/preview-route.tsx`
- Test: `components/onboarding/question-step.test.tsx`, `preview-route.test.tsx`

**Interfaces:**
- Produces (R6 uses the calendar):
  - `monthGrid(month: string /* YYYY-MM */): string[]` — whole Monday-first weeks covering the month (Oct 2026 → 35 days, 28 Sep … 1 Nov).
  - `moveDate(date: string, key: 'ArrowLeft' | 'ArrowRight' | 'ArrowUp' | 'ArrowDown' | 'PageUp' | 'PageDown' | 'Home' | 'End'): string`.
  - `landChip(value: string, today: string): string` → "Today", "Tomorrow", "Yesterday", "In n days", "n days ago".
  - `<Calendar value: string | null onChange(v: string) today: string labelledBy: string />`; renders the month heading, prev/next buttons, `role="grid"`, and the "You land on {Friday 30 October 2026}" row with the chip.
  - `<AnswerRail title: string intro: string answers: Answers current: number | null />` (desktop ink rail; `current: null` on the preview) and its phone band.

- [ ] **Step 1: Write the failing tests** `calendar.test.ts`: `monthGrid('2026-10')` length 35, first `'2026-09-28'`, last `'2026-11-01'`; `moveDate('2027-01-01', 'ArrowLeft') === '2026-12-31'`; `ArrowDown` +7; `PageUp` from `'2026-03-31'` → `'2026-02-28'`; `Home` from Fri 30 Oct → Mon 26 Oct, `End` → Sun 1 Nov; `landChip` cases for 0, +1, −1, +5, −5.
- [ ] **Step 2: Run** `npm test -w apps/web -- lib/calendar` — FAIL.
- [ ] **Step 3: Implement** `calendar.ts` (UTC date arithmetic via `addDays`; PageUp/Down clamp to month end).
- [ ] **Step 4: Run** — PASS.
- [ ] **Step 5: Write the failing component tests:**
  - `calendar.test.tsx`: one `gridcell` has `tabIndex 0`; ArrowRight moves focus and the roving tabindex; Enter selects and calls `onChange('2026-10-31')`; the chosen cell has `aria-selected="true"`; the next-month button changes the heading and the polite live region text; out-of-month days carry `data-outside`; no cell is disabled.
  - `question-step.test.tsx` (rewrite structure, keep reload jump-back, POST and error tests): the rail `ol` lists 5 questions; answered ones show the answer and a `Change` link to `?step=n`; the current one has `aria-current="step"` and "Answering now"; "Question 2 of 5"; help line "You can change any answer later in Settings." on 1–4 and "Already here? Pick the day you arrived." on 5; step 5 shows the calendar (no `input[type=date]`) and "See my roadmap"; no "Step n of 5" text.
  - `preview-route.test.tsx`: rail titled "Your answers" with the all-answered line; "Before you fly · n tasks", the Start here block with the first task and "The next task waits on this one." when it has dependants; 3 next tasks then "Show n more"; folded Arrival / Week 1 / "Month 1 and later" with counts, up to 3 topics, Show buttons with `aria-expanded`; the Save card's "Save my roadmap" links to `/auth/complete?redirect=%2Fapp`; no sticky bar; save-failed alert, `ApiDown` retry and loading line still render.
- [ ] **Step 6: Run** `npm test -w apps/web -- calendar question-step preview-route` — FAIL.
- [ ] **Step 7: Implement** against the boards: desktop rail 440 px + question 600 px (preview column 680 px); chosen day ink with white text, today thin grey outline, hover wash; phone band per spec §4.2 Phone (previous answer + Change, full-width Continue). `StepBar` and its file go if nothing else imports them.
- [ ] **Step 8: Run** `npm test -w apps/web`, typecheck, lint — PASS.
- [ ] **Step 9: Look** at `/onboarding?step=2`, `?step=5`, `/onboarding/preview` at both sizes beside the boards; `impeccable critique` — no P0/P1.
- [ ] **Step 10: Commit** `feat(web): Build my roadmap route rail, calendar and preview`.

---

### Task R6: Settings C

Spec §6.3. Boards: Settings, SettingsPhone.

**Files:**
- Modify: `apps/web/src/components/settings/settings-screen.tsx`, `plan-form.tsx` (becomes the answers list + editor), `account-section.tsx`
- Test: `components/settings/settings.test.tsx`

**Interfaces:**
- Consumes: R5 `Calendar`, `OptionRow`; R2 `AppHeader active="settings"`, `PublicFooter app`.
- Produces: `/settings?edit={key}` where `key` ∈ `visaType | city | familySituation | occupation | arrivalDate`.

- [ ] **Step 1: Write the failing tests** (rewrite structure; keep save-and-rebuild, error, `ApiDown`, delete-account and sign-out tests):
  - h1 "Settings" and "Your answers build your roadmap. Change one and it's rebuilt; done tasks stay done."
  - An `ol` with Visa, City, Who's moving, Work, Arrival date, each with its label value and a `Change` button; the edited one shows "· changing" instead.
  - With no `edit` param the editor shows Visa; `?edit=city` shows label "City", h2 "Where do you live?", the rebuild line, 4 `OptionRow`s, Cancel and "Save and rebuild"; `?edit=arrivalDate` shows the calendar; `?edit=nonsense` shows Visa.
  - Save calls `updateProfileAndRegenerateRoadmap` with only the changed answer merged into the profile; Cancel restores the saved value and, on phone, navigates to `/settings`.
  - No `select` elements remain.
  - The account section shows the email and "signs in with Google" for a Google user.
- [ ] **Step 2: Run** `npm test -w apps/web -- settings` — FAIL.
- [ ] **Step 3: Implement** against the boards: columns `440px 1fr`; phone shows answers + account cards, `Change` pushes `?edit=key` and the editor renders full-screen; shortened phone subline and "Delete account…".
- [ ] **Step 4: Run** `npm test -w apps/web`, typecheck, lint — PASS.
- [ ] **Step 5: Look** at `/settings` and `/settings?edit=arrivalDate` at both sizes; `impeccable critique` — no P0/P1.
- [ ] **Step 6: Commit** `feat(web): Settings C answer editor`.

---

### Task R7: Type scale before sign-in

Spec §4.1, §3.3. Boards: PsLanding(Phone), PsSignIn(Phone), PsSave(Phone).

**Files:**
- Create: `apps/web/e2e/type-scale.spec.ts`
- Modify: whichever of `app/page.tsx`, `components/marketing/*`, `app/signin/*`, `app/auth/*` the test flags

**Interfaces:** Produces `e2e/type-scale.spec.ts`, reused by P7.

- [ ] **Step 1: Write the failing e2e test** `type-scale.spec.ts`: for each page in a list (`/`, `/signin`, the Save screen, `/onboarding?step=1`, `/onboarding/preview`; signed-in pages are added in P7) at 1440×900 and 390×844, collect `getComputedStyle(el).fontSize` of every element with a text node, and expect each in `['48px','24px','22px','18px','15px','13px','12px']`; the Google button may be `15px` Roboto. Also assert the landing h1 is 48 px at 1440 and 22 px at 390.
- [ ] **Step 2: Run** `npm run test:e2e -w apps/web -- type-scale` (3100/3101) — expect FAIL listing offending selectors (if it passes, record that and still keep the test).
- [ ] **Step 3: Fix** each offender by switching to the §3.3 token; no layout or copy changes.
- [ ] **Step 4: Run** — PASS; `make check` — PASS.
- [ ] **Step 5: Commit** `fix(web): pre-sign-in pages use the type scale`.

---

### Task P7: Whole-app design gate and owner sign-off

Spec §8. All 18 boards.

**Files:**
- Modify: `apps/web/e2e/type-scale.spec.ts` (add `/app`, `/app/roadmap`, `/app/roadmap?task=T08`, `/settings`), `e2e/a11y.spec.ts` (every page at 1440 and 390), `e2e/journey.spec.ts`, `e2e/change-answers.spec.ts` (new structure: rail, calendar, Settings editor)
- Create: `docs/design/r1-final/gate/` screenshots

- [ ] **Step 1: Update** the e2e specs as listed; run `npm run test:e2e -w apps/web` — PASS (0 axe violations everywhere).
- [ ] **Step 2: Run** `make check` — PASS (`lint`, `typecheck`, `test`).
- [ ] **Step 3: Screenshot** every page in the spec §8 table at 1440×900 and 390×844 into `docs/design/r1-final/gate/`, each beside its board.
- [ ] **Step 4: Run** `impeccable critique` and `impeccable audit` over the app; fix every P0/P1 and re-run until none.
- [ ] **Step 5: Present** the side-by-side screenshots to the owner (judgement only: does each page match its board). Record sign-off and date in spec §9.
- [ ] **Step 6: Commit** `docs: final screens design gate passed`, then update the `landednz-upgrade-plan` memory: R1–R7 + P7 done, Track C next.
