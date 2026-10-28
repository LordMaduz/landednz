# R0 Polish and Stage C (Cloud) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give the signed-in app the approved premium polish (white cards, locked sizing, the track roadmap card, a new Roadmap page, the task page with sources in the side column, Settings, shared states). Then put R0 on staging and production and tag `r0`.

**Architecture:** Track P changes only `apps/web`: tokens in `globals.css`, one shared `Card`, a pure `route-progress` module drawn by `RouteTrack`, and page components rebuilt against `docs/design/r0-polish/`. Track C adds env-gated Sentry, PostHog and `trustProxy`, platform config files (Render, Railway, Vercel), two GitHub workflows and a release script. After that it runs the deploys the runbook records.

**Tech Stack:** Next 16.4, React 19.3, Tailwind 4 `@theme`, shadcn/ui, sonner, Vitest 5, Playwright; Fastify 5, Prisma 7; Supabase, Render, Railway, Vercel, Sentry, PostHog.

**Spec:** `docs/superpowers/specs/2026-10-28-r0-polish-and-stage-c-design.md` (parent: `2026-10-24-r0-foundation-design.md` §5, §8, §10)

## Global Constraints

- **Two plan tasks per session**, then stop and print the resume prompt from "Sessions" below.
- **Board first (CW02′):** every UI task opens its board in `docs/design/r0-polish/` (render with `python3 -I build.py` or open the canvas https://claude.ai/artifact/778HVTsFG43hyKeJMJ4ENh) and matches it at 1440 and 390.
- **Tokens only (CW01):** raw values live only in `apps/web/src/app/globals.css` `@theme`. Exceptions: the track SVG geometry and the terrain profile, which live in `route-progress.ts`.
- Type 24 / 18 / 15 / 13 (22 for page titles under 561 px). Citation numbers are 12 with a 24 px tap area. Controls are 40, or 44 under 561 px. Radius 8 for controls and 12 for surfaces. Card padding 20, or 16 under 561 px. Gap 16. The side column is 360.
- **Card:** `#FFFFFF`, 1 px hairline `#E3E8EA`, radius 12, `shadow-lift`. No wash or cream card backgrounds.
- Light only (CW08). Respect reduced motion (CW03). API types come from `@landednz/types` (CW04).
- Never touch the owner's uncommitted work in `/Users/ruchira/Development/NZ_Project/landednz`. Work in a worktree from `origin/main` after Step 0 merged this plan, spec and boards (they live only on `docs/r0-polish-stage-c` until then). Track P: worktree `/Users/ruchira/Development/NZ_Project/landednz-r0p`, branch `feat/r0-polish`. Track C: `/Users/ruchira/Development/NZ_Project/landednz-r0cloud`, branch `feat/r0-cloud`.
- Never commit `.env.local` or `supabase/.env`. Edit secrets in place. Never recreate those files.
- Commits use Conventional Commits with a scope, and never a Co-Authored-By trailer.
- Local and test model is `claude-haiku-5-5`. Staging and production use `claude-sonnet-5-5`.
- **Design gate:** the impeccable skill replaces the minimalism validator (CW02′). Run `impeccable critique` and `audit` on each rebuilt page, and fix every P0 and P1 before its PR. Impeccable is third-party: read its skill source once before the first run, and any third-party skill before running it.

## Review Focus

1. **The traveller is past "Later" or has finished every task.** The pin stops at x 1000. Its label still reads "You · day {n}". Nothing overflows. Covered by Task P2.
2. **The arrival date was changed into the past or future in Settings.** The pin label flips between "days to go" and "day {n}" without a reload once Home refetches. Covered by Task P2 (unit) and Task P3 (component).
3. **The 3-row caps on Home.** With 0, 1 and 14 done tasks, Recently done shows the empty text, 1 row, or 3 rows plus "See all 14 done". Covered by Task P3.
4. **The traveller leaves Settings with unsaved changes, or changes a value and then changes it back.** Save is disabled again, because dirty means different from the saved values, not "touched". Covered by Task P6.
5. **A task with no cited sources, only `governmentSourceUrl`.** The Sources card still shows the one link, opening in a new tab. Covered by Task P5.

---

## Step 0: before Task P1

- Boards approved: canvas version `1793169870-b87a`, 2026-10-28, recorded in spec §7 and R0 spec §7.4. The validator retirement docs (constitution CW02′/CW07, CLAUDE.md files, R0 spec refs, the skill folder) landed with the same docs commit.
- Push `docs/r0-polish-stage-c`, open its PR (`docs:`), and the owner merges it. Then `git fetch` and create the Track P worktree from `origin/main` (see Global Constraints).

## Track C, step 0: owner prerequisites (first, in parallel with Track P)

The owner works through the checklist in `docs/setup/deploy-runbook.md` → "Owner prerequisites". The agent does nothing here except answer questions. Tasks C2–C4 start only when every box is ticked.

---

## Sessions

| Session | Tasks |
|---|---|
| 1 | P1, P2 |
| 2 | P3, P4 |
| 3 | P5, P6 |
| 4 | P7, C1 |
| 5 | C2, C3 (needs owner checklist) |
| 6 | C4 |

Resume prompt (the agent fills in X, N, the worktree and the branch):
`Continue docs/superpowers/plans/2026-10-28-r0-polish-and-stage-c.md from Task <X> (session <N>) in worktree <path>, branch <branch>. Use superpowers:subagent-driven-development; two tasks this session.`

---

### Task P1: Tokens, Card, control sizes, footer

**Files:**
- Modify: `apps/web/src/app/globals.css` (`@theme` values, `.wp` sizes untouched)
- Create: `apps/web/src/components/ui/card.tsx`, `apps/web/src/components/ui/card.test.tsx`
- Modify (render `<PublicFooter />` after `</main>`, in every branch including loading and API-down): `apps/web/src/components/settings/settings-screen.tsx`, `apps/web/src/components/workspace/home-view.tsx` and `roadmap-view.tsx`, `app/app/loading.tsx`, the onboarding step page (`app/onboarding/page.tsx`), `app/onboarding/preview/page.tsx`, `app/signin/page.tsx`
- Modify: `apps/web/src/components/ui/button.tsx` + `button.test.tsx` (default `min-h-10 max-narrow:min-h-11`; new `size: "sm"` = `min-h-8 px-3 text-small max-narrow:min-h-11`), `field.tsx` (`min-h-10 max-narrow:min-h-11`; `Select` inherits it)
- Modify: `.claude/skills/landednz-design-system/SKILL.md`: rewrite the Type (24/18/15/13, 22 on phones, citation 12), Space/shape (radius 8/12, card padding 20/16, gap 16, side column 360), elevation (every card is white + hairline + `shadow-lift`) and target lines (40 desktop, 44 under 561, `Button size="sm"` 32) to spec §3.1. Its description triggers on every UI change, so it must change in the same commit as the tokens.

**Interfaces:**
- Produces: `Card({ as?: "section" | "div" | "aside", className?, children, ...aria })`, `CardHead({ title: ReactNode; titleId: string; aside?: ReactNode })`, `CardFoot({ children, className? })` from `@/components/ui/card`. `CardFoot` is `mt-auto`.
- Produces tokens: `--text-title: 24px` (line height 1.25, letter-spacing -0.015em), `--text-section: 18px` (line height 1.35, -0.01em), `--text-citation: 12px`, `--radius-control: 8px`, `--radius-surface: 12px`, `--grid-template-columns-home: minmax(0, 1fr) 360px`, `--grid-template-columns-settings: minmax(0, 1fr) 360px`, `--grid-template-columns-task: minmax(0, 1fr) 360px`. Under 561 px the base layer sets `.text-title` to 22px.

- [ ] **Step 1: Write the failing test** `card.test.tsx`: `it("renders a section with the landing-card classes")` asserts the root has `rounded-surface`, `border-hairline`, `bg-white` and `shadow-lift`. `it("labels the section by its head title")` asserts `getByRole("region", { name: "Your plan" })`.
- [ ] **Step 2: Run** `npm test -w @landednz/web -- card` → FAIL (module not found).
- [ ] **Step 3: Implement `card.tsx`** with padding `p-5 max-narrow:p-4`, `flex flex-col gap-3.5 min-w-0`.
- [ ] **Step 4: Change the tokens** in `globals.css`, the `Button`/`Field` sizes (update `button.test.tsx`: default has `min-h-10` and `max-narrow:min-h-11`; `size="sm"` has `min-h-8`), and the design-system skill. Add `<PublicFooter />` to every page in the Files list.
- [ ] **Step 5: Run** `make check` → green. Fix the snapshot or text assertions that change from the token sizes only.
- [ ] **Step 6: Visual check**: `make dev`, then screenshot `/`, `/onboarding`, `/onboarding/preview`, `/signin`, `/settings` and `/privacy` at 1440 and 390 (`npx playwright screenshot`). Each shows the footer. Landing and legal must still match their old boards except for the type size, radius and control-height changes.
- [ ] **Step 7: Commit** `feat(web): polish tokens, shared card, control sizes and footer`

### Task P2: Route progress and the track

**Files:**
- Create: `apps/web/src/lib/route-progress.ts`, `apps/web/src/lib/route-progress.test.ts`
- Create: `apps/web/src/components/route/route-track.tsx`, `route-track.test.tsx`
- Modify: `apps/web/src/lib/legs.ts` + `legs.test.ts` (`legName(id, beforeArrival)`: "Before you fly" before arrival, else "Before you flew"; `legWhen` board copy: "by 1 Mar", "1–2 Mar", "to 8 Mar", "to 31 Mar", "from April" = month of arrival + 31 days)
- Modify: `apps/web/src/lib/route-view.ts` + test: `buildRouteView(roadmap, arrivalDate, now)` sets `name: legName(leg.id, journeyDay(arrivalDate, now) < 1)`, so the summary, Up next meta, Roadmap and task-page nav all get it. Callers `components/workspace/home-view.tsx` and `roadmap-view.tsx` pass `now`.

**Interfaces:**
- Consumes: `RouteView`, `RouteLeg` (`lib/route-view.ts`), `journeyDay(arrivalDate, now)` (`lib/journey-day.ts`).
- Produces: `routeProgress(route: RouteView, arrivalDate: string, now: Date): { x: number; label: string; summary: string; passed: boolean[] }`. Here `x` is in 0–1000, and `passed[i]` is true when the stage-i flag is behind the pin.
- Produces: `terrainY(x: number): number` and `TRACK_FLAGS = [200, 400, 600, 800, 1000]`.
- Produces: `<RouteTrack route={RouteView} arrivalDate={string} now={Date} height={96 | 120} />`. It renders the SVG (`aria-hidden`), the five stage labels (`<ol>`, hidden under 561 px) and the one-line summary (shown under 561 px).

- [ ] **Step 1: Write the failing tests** in `route-progress.test.ts`, building a `RouteView` with five legs of 10/4/5/5/1 tasks:
  - `it("before arrival, 0 done: x 40, '124 days to go'")`: arrival `2027-03-01`, now `2026-10-28T09:00+13:00`, so `x === 40` and `label === "You · 124 days to go"`.
  - `it("day 3, Week 1 open: x 433")`: arrival `2027-03-01`, now `2027-03-03T10:00+13:00`, legs 10/10 and 4/4 done, so `Math.round(x) === 433`, `label === "You · day 3"` and `passed` is `[true, true, false, false, false]`.
  - `it("summary names the current stage")`: the day-3 case gives `summary === "Week 1 · 0 of 5 · 6 days left"`.
  - `it("caps at the last flag")`: every task done on day 200, so `x === 1000` and `label === "You · day 200"`.
  - `it("a stage with no tasks keeps its flag")`: no Later tasks (so `route.legs` has 4 entries), day 3: `Math.round(x) === 433` and `passed.length === 5`.
  - `it("ahead of schedule stays past the previous flag")`: day 3 with Week 1 also done (current is Month 1): `x === 640` (f floors at 0.2) and `passed[2] === true`.
  - `it("no tasks at all")`: `total === 0` gives a finite `x` and no `NaN` in the label or summary.
  - `it("stage labels")`: a done stage reads "done ✓"; others "{done} of {total} · {when}" (build.py `stage_labels`).
  - `it("terrainY matches the board")`: `terrainY(0).toFixed(1) === "48.1"` and `terrainY(500).toFixed(1) === "77.0"` (same formula as `build.py` `terrain_y`).
- [ ] **Step 2: Run** `npm test -w @landednz/web -- route-progress` → FAIL.
- [ ] **Step 3: Implement** `routeProgress`. The current stage index `i` is `LEGS.findIndex(l => l.id === leg.id)` for the leg with `state === "current"`, else the first not-done leg, else 4; never the position in `route.legs`, which drops empty legs. `passed` is built over the five `LEGS` (an empty leg counts as passed when it is before `i`). Before arrival `f = max(0.2, total ? done/total : 0)`. From arrival `f = clamp((day - stageStartDay + 1) / stageDays, 0.2, 1)`, and days left `= stageEndDay - day + 1`: Arrival is days 1–2 (2 days), Week 1 is days 3–8 (6 days, giving "6 days left" on day 3), Month 1 is days 9–31 (23 days) and Later is days 32–61 (30 days). `x = min(1000, i*200 + 200*f)`, except that when every task is done `x = 1000`. Summary: `${leg.name} · ${done} of ${total} · ${daysLeft} days left`; before arrival it is `· by ${shortDay(arrival)}`.
- [ ] **Step 4: Run** the tests → PASS.
- [ ] **Step 5: Write the failing test** `route-track.test.tsx`: `it("exposes the progress as text, not the drawing")` checks that the svg has `aria-hidden="true"` and that `getByText("Week 1")` and the summary text are both in the document.
- [ ] **Step 6: Implement `RouteTrack`** as a port of `build.py` `route_track` (contours at +12 and +24, the walked fill gradient, the dashed path ahead, flags, and the `you-tag` pin). Put the class names in `globals.css` `@layer components` as `.track-*`, with values from `ROUTE_CSS`. The stage labels use `legName`.
- [ ] **Step 7: Run** `npm test -w @landednz/web` → PASS. **Commit** `feat(web): route progress and the track drawing`

### Task P3: Home

**Files:**
- Modify: `apps/web/src/lib/home-view.ts` (+ `home-view.test.ts`), `apps/web/src/components/workspace/home-view.tsx` (+ test)
- Board: `Main.dc.html` (first visit), `HomeLater.dc.html` (day 3), `HomePhone.dc.html`

**Interfaces:**
- Consumes: `Card*` (P1), `RouteTrack`, `routeProgress` (P2).
- Produces: `HomeView` gains `recentTotal: number`, `weekCount: string` ("4 more tasks"), `weekMore: number`, `weekEmpty: string | null` and `nextMeta: string` ("Week 1 · task 1 of 5"). `greeting` becomes `day < 1 ? "Welcome, {first}" : "Welcome to {city}, {first}"`. `week` = the open tasks after `top` **in the current leg**, capped at 3; `weekCount` counts all of them; `weekMore = max(0, all - 3)`. Before arrival the foot is `nextLine` ("After you land: …", Arrival's briefs); from arrival it is "{weekMore} more this week · Open roadmap" when `weekMore > 0`. With none left, `weekEmpty` = "Nothing else this week. {next leg name} starts on {d Month}." `recent` caps at 3.
- Board copy (spec §6): `subline` = "{n} days until you land on {d Month yyyy}." before arrival, "Day {n} in {city} · {done} of {total} tasks done." after. `plan` gains an "Arriving" row ({d Month yyyy}).

- [ ] **Step 1: Write the failing tests** (`home-view.test.ts`):
  - `greeting` is `"Welcome, Aleksandra"` before arrival and `"Welcome to Christchurch, Aleksandra"` on day 3.
  - With 14 done, `recent.length === 3` and `recentTotal === 14`. With 0 done, `recent` is `[]`.
  - Week 1 with 5 open tasks including the current one (4 after it): `week.length === 3`, `weekCount === "4 more tasks"`, `weekMore === 1`. Open tasks in Month 1 are not in `week`.
  - Week 1 with only the current task open: `week` is `[]` and `weekEmpty === "Nothing else this week. Month 1 starts on 9 March."` (arrival 1 March).
  - Before arrival the foot line starts "After you land:"; `subline === "124 days until you land on 1 March 2027."`; day 3 `subline === "Day 3 in Christchurch · 14 of 25 tasks done."`; `plan` has an "Arriving" row.
- [ ] **Step 2: Run** → FAIL. **Step 3: Implement** the home-view.ts changes. **Step 4: Run** → PASS.
- [ ] **Step 5: Write the failing component tests** (`home-view.test.tsx`): the "Your roadmap" card links "Open roadmap" to `/app/roadmap`. Recently done with 14 shows the link "See all 14 done". With 0 it shows "Nothing yet. Tasks you finish show up here, newest first." and the link "Already done some? Tick them off". The Up next and Your plan sections are in the same grid row (`parentElement` is the same grid).
- [ ] **Step 6: Rebuild `HomeView`** to the board: the greeting, then the track card, then `grid-cols-home gap-4` with the cards in this order: Up next, Your plan, Also this week, Recently done. Rows in "Also this week" use `.row` (40, or 44 under 561 px). The loading state uses card-shaped placeholders (Task P6 owns the shared `Skeleton`; leave the existing `Loading` until then).
- [ ] **Step 7: Run** `make check`. Visual check against `Main` and `HomeLater` at 1440 and 390, and at 1440×900 measure: cards in one grid row have equal heights, and the gap between the last card and the footer is the page gap (no empty band; owner ask). Run `impeccable critique apps/web/src/components/workspace/home-view.tsx`, fix P0 and P1. **Commit** `feat(web): polished Home with the track card`

### Task P4: Roadmap page

**Files:**
- Modify: `apps/web/src/components/workspace/roadmap-view.tsx` (+ test)
- Create: `apps/web/src/components/route/stage-list.tsx` (the current stage card + Other stages card)
- Delete: `apps/web/src/components/route/route-rail.tsx`, `route-rail.test.tsx` (move any case that still applies to `stage-list.test.tsx`), and `route-strip.tsx` if nothing imports it after P3 (`grep -r RouteStrip src` empty). Keep `waypoint.tsx` and the `.route-legs`/`.route-step` CSS: `onboarding/preview-route.tsx` still uses them.
- Modify: `apps/web/e2e/journey.spec.ts` (the route locator)
- Board: `Roadmap.dc.html`, `RoadmapPhone.dc.html`

**Interfaces:**
- Consumes: `RouteView`, `RouteTrack` (height 120), `Card*`, `legWhen`, and `addDays` from `lib/nz-date`.
- Produces: `<StageList legs={RouteLeg[]} onOpen={(taskId) => void} />`. The current stage is `<section aria-labelledby>` titled with the leg name. "Other stages" is a list whose `Show` buttons have `aria-expanded` and the accessible name `Show {leg} tasks`.

- [ ] **Step 1: Write the failing tests** (`roadmap-view.test.tsx`): the heading is "Your roadmap". The current stage card lists every task in the leg, and the current one carries the text "Up next". Clicking `Show Month 1 tasks` reveals that leg's task buttons and sets `aria-expanded="true"`. Key dates shows "You landed" (from arrival) or "Arriving" (before), "Week 1 ends" with `shortDay(arrival + 7)` and "Month 1 ends" with `shortDay(arrival + 30)`. The subline is "N of M done · landed {d Month yyyy}", or "· arriving {date}" before arrival. Other stages lists remaining stages first, then done ones ("10 of 10 done"). "Change your arrival date" links to `/settings`.
- [ ] **Step 2: Run** → FAIL. **Step 3: Implement** to the board. The side column has Up next (title, `why`, Start task → `?task=`) and Key dates. **Step 4: Run** → PASS.
- [ ] **Step 5: Update `journey.spec.ts`**: open the Arrival leg with `getByRole('button', { name: 'Show Arrival tasks' })`, then click the IRD task. Run `make test-e2e` → 1 passed.
- [ ] **Step 6: Visual and impeccable check** as in P3. **Commit** `feat(web): Roadmap page with the track and stage cards`

### Task P5: Task page

**Files:**
- Modify: `apps/web/src/components/workspace/task-sheet.tsx` (+ test), the `.task-*` rules in `globals.css`
- Create: `apps/web/src/lib/tel-links.ts` (+ test)
- Board: `TaskPage.dc.html`, `TaskPhone.dc.html`

**Interfaces:**
- Consumes: `Card*`, `RouteView.legs` (for previous and next), `TaskDetailApiResponse.sources`.
- Produces: `linkPhones(text: string): (string | { tel: string; text: string })[]`. It matches NZ numbers `0800 xxx xxx`, `0800 xx xx xx` and `0508 …`. `tel` is the digits only, with no spaces.

- [ ] **Step 1: Write the failing tests:**
  - `tel-links.test.ts`: `"Call Healthline on 0800 611 116."` gives `["Call Healthline on ", { tel: "0800611116", text: "0800 611 116" }, "."]`. `"0800 28 29 26"` gives `{ tel: "0800282926", text: "0800 28 29 26" }`. A text with no number comes back as `[text]`.
  - `tel-links.test.ts` (U1): a step lead with a number next to a citation (`"Call 0800 184 803 [2]"`) still renders the tel link and the citation `sup a`.
  - `task-sheet.test.tsx`: the Sources card is in the side column (`getByRole("complementary")` contains the region "Sources"). It lists every cited source, each `target="_blank"`, with "(opens in a new tab)" and the domain text. A task with only `governmentSourceUrl` shows one source. The Sources header date is short ("All checked 27 Oct 2026 · open in a new tab"). Bottom navigation: `within(getByRole("navigation", { name: "Previous and next task" }))` has links "Previous task {title}" and "Next task {title}" (the visible card text) pointing to the neighbouring task in route order; the first task has no previous card. This fails today (only the header links exist). The header links keep their `aria-label`s.
- [ ] **Step 2: Run** → FAIL. **Step 3: Implement**: the layout becomes `grid-cols-task gap-4` with white cards, the side is not sticky, and the side order is Status, Ask, Sources (header "All checked {longDay(latest checked)} · open in a new tab"). Citation `sup a` uses `text-citation`, with `min-w-6 min-h-6 -mx-1.5 -my-2` and inline-flex centred. Apply `linkPhones` to step, need and know text (inside `stepParts`' lead and items, before `ref()`). Add the bottom `<nav aria-label="Previous and next task">` with the board's `.pn` cards ("← Previous task / {title}", "Next task → / {title}"), two columns, one on phones. The header nav keeps short visible labels "Previous"/"Next" (`Button size="sm"`). **Step 4: Run** → PASS.
- [ ] **Step 4b: e2e** in `journey.spec.ts`: on the task page, the first source link has `target="_blank"` and opening it fires a `popup` event; the "Next task" card navigates to the next task's title.
- [ ] **Step 5: Visual and impeccable check** at 1440 and 390. On phones the side cards come after the content, and chips and buttons are 44. **Commit** `feat(web): task page with sources beside the steps`

### Task P6: Settings and shared states

**Files:**
- Modify: `apps/web/src/components/settings/settings-screen.tsx`, `plan-form.tsx`, `account-section.tsx`, `delete-account.tsx`, `settings-section.tsx` (delete if unused) (+ `settings.test.tsx`)
- Create: `apps/web/src/components/ui/skeleton.tsx` and use it in `app/app/loading.tsx` and `settings` loading
- Modify: `apps/web/src/components/ui/toaster.tsx` (ink toast, teal-light action, 6 s, pause on hover/focus), `ask-panel.tsx` (thinking line "Checking official sources…", error keeps the question with a "Try again" button), `api-down.tsx` (becomes a `Card` with `role="alert"`)
- Board: `Settings.dc.html`, `SettingsPhone.dc.html`, `States.dc.html`

**Interfaces:**
- Consumes: `Card*`.
- Produces: `Skeleton({ className })`, a `bg-wash` block with `motion-safe:animate-pulse` that only appears after 300 ms (CSS `animation-delay` + `opacity` start 0).

- [ ] **Step 1: Write the failing tests** (`settings.test.tsx`):
  - Save is disabled with "No unsaved changes" on load. Changing City enables it. Changing City back disables it again (Review Focus 4).
  - A past arrival date shows "Pick a date from today onwards." under the field on submit, linked by `aria-describedby`.
  - A successful save shows the toast "Plan saved. Your roadmap was rebuilt." with Undo, and Undo puts the previous answers back (one `updateOnboardingProfile` call with the old values).
  - In the delete dialog, focus starts on "Keep my account".
  - While saving, the button reads "Saving…", has `aria-busy="true"`, keeps its width (same `min-w` class), and shows no spinner.
  - Task done (`home-view.test.tsx` / `stage-list.test.tsx`): ticking a task row keeps it in place with a tick and an "Undo" button for 6 s (fake timers), then it moves to Recently done; Undo reopens it.
- [ ] **Step 2: Run** → FAIL. **Step 3: Implement** to the Settings board (plan card `row-span-2` with a two-column form; Account and Delete beside it) and to the States board. **Step 4: Run** → PASS.
- [ ] **Step 5: Run** `make check` and `make test-e2e`. Visual check Settings and States, with the same equal-height and no-empty-band measurements as P3. **Commit** `feat(web): polished Settings and shared states`

### Task P7: Whole-app design gate and owner sign-off

**Files:**
- Modify: `apps/web/e2e/a11y.spec.ts` (add `/app/roadmap?task=<first>`); re-capture the screenshot baselines after sign-off
- Modify: spec §7 Approvals table (the built app's sign-off, after the owner says "approved")

- [ ] **Step 1:** Run `impeccable audit` and `critique` on Home, Roadmap, task page and Settings at 1440 and 390. Fix every P0 and P1, and list the P2s in the PR body.
- [ ] **Step 2:** Run `make test-e2e` (axe covers every signed-in page: Home, Roadmap, task page, Settings) and the Lighthouse run in `lighthouserc.json` (landing, onboarding, sign-in) → accessibility ≥ 95. Tab through each page once and check the teal focus ring on every control.
- [ ] **Step 3:** Open a PR `feat(web): R0 polish` (P1–P7). Then ask the owner to review the running app (`make dev`) against the canvas. Record their "approved" for the built app in spec §7 (the boards were approved 2026-10-28). Then re-capture the screenshot baselines.
- [ ] **Step 4: Commit** `docs: record polish approval`

### Task C1: Production code for the cloud (no accounts needed)

**Files:**
- Modify: `apps/api/src/shared/config.ts` (+ `config.test.ts`), `apps/api/src/server.ts`
- Create: `apps/api/src/instrument.ts` (Sentry init, imported first by the entry file)
- Create: `apps/web/instrumentation.ts`, `apps/web/sentry.server.config.ts`, `sentry.edge.config.ts`, `instrumentation-client.ts`; modify `next.config.ts` (`withSentryConfig`, no source-map upload when `SENTRY_AUTH_TOKEN` is unset)
- Create: `apps/web/src/lib/analytics.ts` (+ test) and mount `<Analytics />` in `app/layout.tsx`
- Modify: `apps/api/.env.example`, `apps/web/.env.example` (new names, empty values); `docs/setup/deploy-runbook.md` (tick the trustProxy item)
- Modify: `apps/web/playwright.config.ts` (`baseURL: process.env.BASE_URL ?? 'http://localhost:3000'`; `webServer` only when `BASE_URL` is unset), `apps/web/e2e/journey.spec.ts` (trace assertion `/^(Answered from the LandedNZ knowledge base|Checked )/`, since a live reply cites domains)

**Interfaces:**
- Produces config: `trustProxy: boolean` (`TRUST_PROXY=true`), `sentryDsn?: string` (`SENTRY_DSN`), and `release?: string` (`RENDER_GIT_COMMIT ?? RAILWAY_GIT_COMMIT_SHA`).
- Web env: `NEXT_PUBLIC_SENTRY_DSN`, `NEXT_PUBLIC_POSTHOG_KEY` and `NEXT_PUBLIC_POSTHOG_HOST`. Analytics and Sentry are no-ops when unset, which they are locally and in CI.

- [ ] **Step 1: Write the failing tests:** `config.test.ts`: `TRUST_PROXY` unset gives `trustProxy === false`, and `"true"` gives `true`. Add an API integration test: with `trustProxy` on, a request carrying `X-Forwarded-For: 203.0.113.9` is rate-limited by that IP (`req.ip === "203.0.113.9"`). `analytics.test.ts`: no key means `posthog.init` is never called. With a key, it is called with `{ api_host, capture_pageview: "history_change", autocapture: false, persistence: "memory" }` (memory persistence keeps CW06).
- [ ] **Step 2: Run** → FAIL. **Step 3: Implement**: `Fastify({ logger: false, trustProxy: config.trustProxy ? 1 : false })`, plus the Sentry inits with `tracesSampleRate: 0.1` and `sendDefaultPii: false`. Install `@sentry/node`, `@sentry/nextjs` and `posthog-js` with exact versions. **Step 4: Run** `make check` → green, `make test-e2e` → 1 passed (no `BASE_URL`: local servers still start), `make docker-api` → health 200, then `make build && make lighthouse` → the landing script budget (276480 bytes) and LCP < 2.5 s still pass. If the budget fails, load PostHog with a dynamic `import()` after first paint.
- [ ] **Step 5: Commit** `feat: trust proxy, Sentry and PostHog behind env`

### Task C2: Platform config and workflows (needs the owner checklist)

**Files:**
- Create: `render.yaml` (one web service, `runtime: docker`, `dockerfilePath: apps/api/Dockerfile`, `dockerContext: .`, region `singapore`, plan `free`, `branch: main`, `healthCheckPath: /health`; `preDeployCommand` is not available on free, so `dockerCommand` is `sh -c "cd apps/api && npx prisma migrate deploy && node dist/src/server.js"` (the image's entry is `apps/api/dist/src/server.js`); env names from `.env.example` with `sync: false`)
- Create: `railway.json` (builder `DOCKERFILE`, `dockerfilePath` `apps/api/Dockerfile`, `preDeployCommand: ["npx prisma migrate deploy"]`, `healthcheckPath: /health`, restart `ON_FAILURE`)
- Create: `apps/web/vercel.json` (`regions: ["syd1"]`)
- Create: `.github/workflows/health.yml` (cron `0 */6 * * *` + `workflow_dispatch`. It curls `${{ vars.STAGING_API_URL }}/health` and `${{ vars.PROD_API_URL }}/health` with `--retry 3 --retry-delay 30 --max-time 90`. On failure it runs `gh issue create --title "Health check failed: <env>" --label health`, but not if an open `health` issue exists. The job declares `permissions: issues: write`; Step 2 creates the label with `gh label create health`)
- Create: `.github/workflows/staging.yml` (on push to `main`: wait for the API with a 90 s warm-up, then run `npx playwright test e2e/a11y.spec.ts e2e/auth.spec.ts` with `BASE_URL=${{ vars.STAGING_WEB_URL }}`)
- Create: `scripts/release.sh` (refuses unless `main` is clean and equals `origin/main`, and the staging workflow for that SHA succeeded. It then runs `git push origin main:production`, `git tag r$N` and `git push --tags`)
- Create: `docs/setup/env-staging.md` (every env var per platform and environment, names only, and where each value comes from in the owner checklist; includes the staging e2e set from the runbook's GitHub item: `STAGING_SUPABASE_SECRET_KEY` → `SUPABASE_SECRET_KEY`, `STAGING_SUPABASE_URL` → `NEXT_PUBLIC_SUPABASE_URL`, `STAGING_SUPABASE_ANON_KEY` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `STAGING_API_URL` → `NEXT_PUBLIC_API_URL`)

- [ ] **Step 1:** Verify the owner checklist from the CLIs: `supabase projects list` shows both projects, `railway whoami` and `vercel whoami` succeed, and `gh secret list` and `gh variable list` match `env-staging.md`. Check the Vercel project's production branch is `production` (`vercel project inspect`, or ask the owner to confirm the dashboard). Run `cd apps/web && npx vercel build` once to prove the monorepo build resolves `@landednz/types` (U2). Ask the owner for anything missing. Do not guess values.
- [ ] **Step 2:** Write the files. Validate them: `npx @render-oss/cli blueprint validate render.yaml` (or the Render dashboard's validator), `actionlint .github/workflows/*.yml`, `bash -n scripts/release.sh`. `staging.yml` passes the e2e env from the variables and secret above.
- [ ] **Step 3:** Open a PR with CI green, then merge. **Commit** `ci: Render, Railway, Vercel config, health and staging workflows`

### Task C3: Staging up and verified

- [ ] **Step 1:** Bootstrap staging. Write `DATABASE_URL` and the other staging values into a temporary env file in the scratchpad (never into the repo), then run `AI_MODE=live npm run db:bootstrap -w @landednz/api` against `landednz-staging`. Expect the migrations applied, the chunks synced with live embeddings, and the index created. Delete the scratchpad env file when the bootstrap ends.
- [ ] **Step 2:** Create the Render service from the blueprint and set its env (`AI_MODE=live`, `ANTHROPIC_MODEL=claude-sonnet-5-5`, a lower `CHAT_DAILY_CAP=10`, `TRUST_PROXY=true`, `CORS_ORIGIN` the staging web URL and the preview domain pattern, `CONTENT_ALLOW_UNVERIFIED` unset). Expect `/health` → `"dbConnected":true`.
- [ ] **Step 3:** Vercel branch wiring: production branch `production` (verified in C2), `staging.landednz.co.nz` assigned to branch `main`, and the **Preview** env scope holds the staging values (the staging API URL, staging Supabase and `NEXT_PUBLIC_AUTH_PASSWORD_ENABLED=true`); the **Production** scope stays empty until C4. Verify with `vercel env ls` and `vercel domains inspect`. Add the Supabase auth redirect URLs for the staging domain and previews.
- [ ] **Step 4:** If the domain is live, set up DNS: `staging.landednz.co.nz` CNAME to Vercel, and `api-staging` CNAME to Render (if Render free allows custom domains; otherwise use the `onrender.com` URL). Write the exact records into the runbook.
- [ ] **Step 5:** Run the full e2e journey against staging with `BASE_URL` plus the staging `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SECRET_KEY` and `NEXT_PUBLIC_API_URL` (from the scratchpad, deleted afterwards) and the email test user. Expect it to pass. Then sign in with Google by hand (owner) and ask one question, so a live Sonnet answer cites sources.
- [ ] **Step 6:** Write the runbook "Staging" section (deploy, env, DNS, rollback = Render "Rollback" to the previous deploy). **Commit** `docs: staging deploy runbook`

### Task C4: Production and release `r0`

- [ ] **Step 1:** Run `security-review` on `main`, and the deploy checklist from spec §10. Fix the findings in a PR first.
- [ ] **Step 2:** Bootstrap `landednz-prod` as in C3 Step 1. Create the Railway service from `railway.json`, source branch `production` with watch paths `apps/api/**` and `packages/types/**` (verify with `railway status`), with production env (`claude-sonnet-5-5`, `CHAT_DAILY_CAP=50`, `TRUST_PROXY=true`, `CORS_ORIGIN=https://landednz.co.nz`). Set up the Vercel production domain with `NEXT_PUBLIC_AUTH_PASSWORD_ENABLED=false`. In the Supabase prod project, Google is the only provider. Delete the scratchpad env file after the bootstrap.
- [ ] **Step 3:** Set up DNS: apex and `www` to Vercel, and `api` CNAME to Railway. Record it in the runbook.
- [ ] **Step 4:** Run `scripts/release.sh 0`. Expect Railway to deploy `production`, Vercel to promote, and `https://api.landednz.co.nz/health` → 200. Then a production smoke test: the landing page, sign-in with Google (owner), Home loads, and one Ask answer. Sentry shows one test event per project, and PostHog shows page views.
- [ ] **Step 5:** Run `health.yml` by hand (`gh workflow run health.yml`) → green. Write the runbook's "Production" and "Rollback" sections (Vercel instant rollback, Railway redeploy of the previous build). Update the R0 spec §8 to read that Stage C is done. **Commit** `docs: production runbook, r0 released`
