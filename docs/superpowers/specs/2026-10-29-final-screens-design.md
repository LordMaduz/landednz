# Final screens (R1–R7): design

Date: 2026-10-29 · Parent specs: `2026-10-24-r0-foundation-design.md`, `2026-10-28-r0-polish-and-stage-c-design.md` ·
Boards: final canvas https://claude.ai/artifact/NT4cny6G32STB7xzYjwgEc, Version 4 (`1793192677-60bb`), 18 boards

## 1. Purpose

Polish tasks P1–P6 are built on `feat/r0-polish`. After that, the owner redesigned the signed-in app with impeccable
and picked final boards. This spec makes the built app match those boards.

- **P1 (tokens, Card, control sizes, footer) and the shared states from P6 stay as the base.**
- **P2–P5 and the Settings half of P6 are reworked, not rebuilt.** The code stays and changes to the final look.
  This spec replaces §3.2–§3.6 of the 2026-10-28 spec. That spec's §3.1 sizing, Track C (§4) and testing (§5) still apply.
- **New pieces:**
  - Build my roadmap A (route rail), with its preview;
  - an inline calendar;
  - the phone tab bar;
  - a `bestBy` field on roadmap tasks.
- **P7 (whole-app design gate and owner sign-off)** stays held and runs once, after R1–R7.

### Success criteria

- Every page matches its final board at 1440×900 and 390×844 (table in §8).
- Every rendered font size is in {48, 24, 22, 18, 15, 13, 12}. No hard-coded sizes outside the tokens.
- `lint`, `typecheck`, `test` and `test:e2e` pass. axe reports nothing on every page at 1440 and 390.
- The owner signs off in P7.

### Non-goals

- No new tokens, fonts or colours, and no dark mode.
- No new layout for Landing, Sign in or Save beyond the type scale. No redesign of the Ask answer panel.
- No content changes.
- `bestBy` for month-based urgency rules (T16) is out of scope; it stays `null`.
- No new dependencies.

## 2. Decisions (owner, 2026-10-28/29)

1. **The final boards win.** They are Home C + Recently done, Roadmap D fitted, Task details C, Settings C, and Build my roadmap A.
   Roadmap D fitted differs from D in four ways:
   - Week 1 shows 3 tasks, then "Show 4 more";
   - Before you flew and Arrival merge into one "Done so far" row;
   - it uses the curvy road;
   - the main buttons are ink.
2. **The road stays curvy** (the live hill), with task dots, a Today line and stage spacing by date. The owner rejected the
   straight line with flags.
3. **Every section sits in a card.**
4. **The type scale in code is the source of truth** (§3.3). The boards were brought into line with it.
5. **"Best done by" is real data (option A).** The API adds `bestBy`, computed from the task's urgency window and the arrival date.
6. **"Your plan" leaves Home.** Plan changes live in Settings, and the avatar menu links there.

## 3. Shared parts

### 3.1 The road (`components/route/route-track.tsx`, `lib/route-progress.ts`)

**What stays:**
- `terrainY`;
- the two contour lines;
- the teal gradient on the walked part, and the solid teal walked line;
- the dashed `track` line for the road ahead;
- outline flags that fill teal once passed;
- the stage row under the road;
- the SVG stays `aria-hidden`, and progress is also written out as text.

**What changes:**

| Part | Rule |
|---|---|
| Stage flags | `TRACK_FLAGS` move from even 20% steps to the date-spaced ends `[150, 270, 530, 820, 1000]` (viewBox 0–1000). Stage `i` covers `[flag[i-1], flag[i]]`, and stage 0 starts at 0. |
| **You** (ring + ink "You're here" pill) | Placed by tasks done: `x = start_i + (end_i − start_i) × done_i / total_i` for the current stage `i`. When everything is done, it sits at 1000. Before arrival the pill keeps today's "You · n days to go" text. |
| **Today** (dashed vertical line, "Today · Fri 6 Nov" label) | Placed by date, using `STAGE_DAYS`: in stage `i`, `x = start_i + (end_i − start_i) × (day − startDay_i + 1) / (endDay_i − startDay_i + 1)`, kept between 0 and 1000. It is hidden before arrival (day < 1). |
| Task dots | One per task, spread evenly inside its stage. Done = filled teal. Waiting (`isBlocked`) = hollow, with a `control` stroke. Anything else = a small `track`-coloured dot. |
| Arcs (Roadmap only) | Dotted curves from You to the dot of each task the next task unlocks (tasks whose `blockingTaskIds` include it). Below them, the small muted note "Dotted lines: unlocked by your {task name}". There are no arcs when the next task unlocks nothing. |
| Sizes | `variant="compact"` (Home) and `variant="tall"` (Roadmap, with arcs) replace `height: 96 | 120`. |

- **The boards' You and Today positions are only illustrations.** The formulas above decide where the markers go.
- **On phones,** the road becomes a 3-stage strip: the previous stage, the current one with "· now" or "n days left", and the next one. Each stage name is a link to the Roadmap.

### 3.2 Cards (`components/ui/card.tsx`, unchanged)

- Every section uses `Card`: radius 12, padding 20 (16 on phones), hairline border, `shadow-lift`.
- The Today block on Roadmap and the "Start here" block on the preview are a `Card` with `bg-wash` and a teal-tint border.
  They are a class on `Card`, not a new component.

### 3.3 Type (tokens unchanged)

| Use | Token |
|---|---|
| Landing hero | `text-hero` 48 (22 on phones) |
| Page h1 | `text-title` 24 (22 under 561 px). Task h1 on phones: `text-section` 18. |
| Card h2, task-name h3/h2 | `text-section` 18 |
| Body, labels, buttons, Back link | `text-body` 15 |
| Meta, footer, kbd, avatar | `text-small` 13 |
| Citation numbers, phone tab labels | `text-citation` 12 |

- The Google button keeps Roboto 15 (the CW01 exception).

### 3.4 Phone tab bar (`components/chrome/app-header.tsx`)

- **Under 561 px:**
  - The header's Home and Roadmap links are hidden.
  - A bottom bar appears: `nav aria-label="Main"`, with **Home, Roadmap, Settings**, each an icon plus a 12 px label.
  - The current tab is teal with `aria-current="page"`.
  - The phone header keeps the logo, Ask and the avatar menu.
- **Same source as the desktop nav:** the bar uses the same `active` prop and links. `AppHeader` gains `"settings"` as a value of `active`.
- **Content is never covered:** app pages get bottom padding so the bar never hides anything. On the Task page, the action bar sits above the tab bar.
- **No tab bar** on the pages before sign-in or on Build my roadmap.

## 4. Before sign-in and Build my roadmap

### 4.1 Landing, Sign in, Save (R7)

- Same layout, copy and flow. Only the hard-coded sizes move to §3.3.

### 4.2 Build my roadmap A (`components/onboarding/question-step.tsx`)

**Desktop:** two columns.

- **Left: the ink rail** (440 px). It shows the logo, the title "Build my roadmap" and the line "Five questions. You see your roadmap before you sign up.", then an `ol` of the 5 questions. Each question is in one of three states:
  - **Answered:** a teal tick, the question name, the answer, and a **Change** link to `?step=n`.
  - **Current:** a ringed dot and "Answering now". It has `aria-current="step"`.
  - **Still to come:** a hollow dot.
- **Right: the question** (600 px):
  - "Question n of 5" and the h1 (`text-title`);
  - the help line: "You can change any answer later in Settings." on questions 1–4, and "Already here? Pick the day you arrived." on question 5;
  - the existing `OptionRow` options;
  - **Back** (quiet) and **Continue**, or **See my roadmap** on the last step.
- **What goes:** the thin `StepBar` and the "Step n of 5" header. The rail replaces both.

**Phone:** an ink band at the top. It shows the logo, "n of 5" and 5 dots joined by a line (done = teal, current = ring, still to come = hollow). The question follows below it.

**What stays:**
- `?step=` in the URL;
- the zustand store;
- the jump back to the first missing answer after a reload;
- the POST to `/api/onboarding-answers`;
- the error text.

### 4.3 Calendar (`components/ui/calendar.tsx`, new)

**Look:**
- A month grid, with previous and next month buttons.
- Today is outlined, the chosen day is filled teal, and days from the next or previous month are dimmed.
- Under the grid, the row "You land on **Friday 30 October 2026**", with a chip such as "Tomorrow", "Today", "In n days" or "n days ago".

**Accessibility (WAI-ARIA date grid pattern):**
- `role="grid"`, with a roving `tabindex`.
- Keys: arrows move by day or week, Page Up/Down by month, Home/End to the start or end of the week. Enter or Space selects.
- `aria-selected` marks the chosen day.
- A polite live region announces the month.

**Data:**
- Value in and out: an ISO `YYYY-MM-DD` string, the same `arrivalDate` as today.
- No date limits: neither date field has a min or max today, and the calendar adds none.
- It is used on question 5 and in the Settings editor.

### 4.4 Your roadmap is ready (`components/onboarding/preview-route.tsx`)

- **The rail:** the same one, titled "Your answers", with the line "All five answered. Change any of them and the roadmap updates." Every answer has **Change**.
- **Right column (680 px), top to bottom:**
  1. **The title:** the h1 "Your roadmap is ready" and the summary with **Change my answers**, as today.
  2. **The itinerary:**
     - a "Before you fly · n tasks" row;
     - the wash **Start here** block: the when-line from `PREVIEW_META`, the first task at 18 px, and "The next task waits on this one." when another task depends on it;
     - the next 3 tasks, then **Show n more**;
     - folded rows for Arrival, Week 1, and "Month 1 and later", each with a count, up to 3 topics, and a **Show** button.
     - Every Show is a `button` with `aria-expanded` that expands in place.
  3. **The Save card:** "Save it to tick tasks off and ask questions." / "Sign in with Google or email on the next screen.", and **Save my roadmap**. It replaces the sticky bottom bar and keeps the same `/auth/complete?redirect=%2Fapp` link.
- **What stays:** `getRoadmapPreview`, the save-failed alert, `ApiDown` with retry, and the loading line.
- **Phone:** the ink band, then the same column.

## 5. Home and Roadmap

### 5.1 Home C (`components/workspace/home-view.tsx`, `lib/home-view.ts`)

1. **Header:** the h1 greeting ("Welcome to Auckland") and the subline "n of N done · day d since you landed on {date}", or the count-down before arrival.
2. **Your 90 days:** a full-width card with the compact road and **Open roadmap**.
3. **Two columns (`1fr 440px`, one column under the split breakpoint):**
   - **Your next move:**
     - the meta line "Your next move · {stage} · {duration}", then the task name as an h3 (`text-section`) and the why line;
     - **Unlocks:** the names of the tasks whose `blockingTaskIds` include it, in stage order, shown only when there are any;
     - **Start task** (ink) and **Ask about this** (`&ask=1`).
     - The empty state stays as today.
   - **Then this week** (renamed from "Also this week"):
     - the aside "{stage} · n days left";
     - up to 3 rows, each with its meta ("Waits on IRD", a duration);
     - the footer "n more in {stage}", a link to the Roadmap.
4. **Recently done:** full width.
   - The aside "n tasks done · Show all". **Show all** opens `/app/roadmap?done=1`, where Done so far is already expanded.
   - The latest 4 done tasks are tiles in a 4-column grid, 2 columns on phones. Each tile has a tick, the name, and "Done {Wed 4 Nov} · {stage}".
   - The empty state stays as today.
5. **Removed:** the "Your plan" card.

**Phone:**
- the strip road;
- next move with the short why line, **Start task** and **Ask**;
- Then this week with 2 rows;
- Recently done with 2 rows and "Show all n";
- the tab bar.

### 5.2 Roadmap D fitted (`components/workspace/roadmap-view.tsx`)

- **Removed:** the Up next, Key dates, current-stage and Other stages cards.
- **The page:** a header (h1 "Your roadmap" and the same subline as Home), then two cards.

1. **The road card:** the tall road with arcs and the stage row.
2. **The itinerary card.** The grid is `128px 24px 1fr auto`: date column, dot column, content, action. Rows in order:
   1. **Done so far:**
      - The date column shows the done stages' windows ("by 2 Nov · 2–3 Nov").
      - The content reads "Before you flew 6 of 6 · Arrival 3 of 4: {up to 3 done topics}".
      - **Show** expands the done tasks. Each one links to its task page, where it can be reopened as today.
      - It opens already expanded with `?done=1`.
   2. **Today:** a wash card.
      - The date column shows "Today / {Fri 6 Nov} / day d", with a ring dot.
      - The content:
        - "You're here · up next · {duration}";
        - the task name as an h2 (`text-section`), then the why line;
        - "**Unlocks n tasks:** {name} ({stage}) · …";
        - **Start task** (ink) and **Ask about this**.
   3. **The current stage**, e.g. "Week 1 · n tasks":
      - The date column shows "to {date} / n days left".
      - Up to 3 rows with meta, then **Show n more**.
   4. **Each later stage:** "{stage} · n tasks", plus ", n wait on your {task}" when some are blocked by the next task. The date column shows its window ("to 2 Dec", "from Dec"). **Show** lists its tasks.

- **Every Show** is a `button` with `aria-expanded`, expanding in place.
- **Unchanged:** Mark and undo stay on the task page. `?task=` and `?ask=1` keep working as today.
- **Phone:**
  - the strip road;
  - a Done so far card with "n tasks" and **Show**;
  - the Today wash card;
  - a card for the current stage with 2 rows;
  - the tab bar.

## 6. Task details and Settings

### 6.1 `bestBy` (API)

- **Rule:** for a task with a `{ fromDay, toDay }` urgency rule, `bestBy = arrivalDate + (toDay − 1) days`, as ISO `YYYY-MM-DD`.
  - With several such rules, use the earliest.
  - With none, or when the arrival date is unknown, it is `null`. Month rules give `null`.
  - **Check:** arrival 2 Nov 2026 with T08's `toDay: 14` gives 15 Nov.
- **Where it's added:**
  - `RoadmapTask.bestBy: string | null` in `apps/api/src/features/roadmap/roadmap.types.ts`;
  - filled in `roadmap.build.ts`, from the same `urgency` rules that `core/priority/scoring.ts` reads;
  - `RoadmapApiTask` in `apps/web/src/lib/api.ts`.
- **What doesn't change:** the database and the content. Today only T06, T07 and T08 have day windows, so most tasks show no date.

### 6.2 Task details C (`components/workspace/task-sheet.tsx`)

**Layout:** two columns (`1fr 380px`), one column under 861 px as today.

- **Top bar** (exists today): "Roadmap / {stage} · task n of N", with **Previous** and **Next task**.
- **Main column:**
  - the meta line "{stage} · {duration}", then the h1 (`text-title`) and the why line with its citation;
  - the **Steps** list, numbered, with a citation on each step;
  - **Have ready:** the existing "What you'll need" list from `documents`, under its new name;
  - **Good to know**, unchanged.
  - **Removed:** the bottom Previous/Next nav, since the top bar has both buttons.
- **Side column:**
  1. **Status card:**
     - the status, then "Best done by {Sun 15 Nov}" when `bestBy` is set;
     - **Mark as done**, and "You can undo this.";
     - kept as today: the done state with undo, "Do this first" for a blocked task, and the button to the government site.
  2. **Ask card:** the existing `AskPanel`, unchanged inside its card. Its footnote reads "Answers cite the same official sources."
  3. **Sources card:** "Sources checked {date}", the first 5 sources with their numbers, then "n more sources" (a button that expands).
- **Phone:**
  - the meta line ends with "· best done by {date}" when it is set;
  - the h1 is `text-section`;
  - **Steps / Good to know / Sources n** are Base UI Tabs (Have ready sits under Steps);
  - **Mark as done** and **Ask** sit in a bar fixed above the tab bar.

### 6.3 Settings C (`components/settings/settings-screen.tsx`, `plan-form.tsx`)

**Desktop:** two columns (`440px 1fr`).

- **Left: the answers card.**
  - The h1 "Settings", then "Your answers build your roadmap. Change one and it's rebuilt; done tasks stay done."
  - An `ol` of Visa, City, Who's moving, Work and Arrival date, each with its value and a **Change** button. The answer being edited shows "· changing" instead.
  - The account section below: the email and sign-in method, **Sign out**, and **Delete account**. The delete flow stays the same.
- **Right: the editor card**, one answer at a time.
  - The answer's label, then the h2 question and one line about what changes when it is rebuilt.
  - `OptionRow` options, or the calendar for the arrival date.
  - **Cancel** and **Save and rebuild**.
  - With nothing chosen, it shows the first answer.
- **What goes:** the grid of selects that shows every answer at once.
- **What stays:** saving uses `updateProfileAndRegenerateRoadmap`, with the same error and `ApiDown` states. `?ask=1` from the header still opens Ask on the Roadmap.

**Phone:**
- The answers card and the account card.
- **Change** opens the editor full-screen at `/settings?edit={key}`, so the browser's Back button works. Cancel or Save goes back to `/settings`.

## 7. Build order

Two tasks per session. Each task leaves the app working and its tests passing.

| Session | Task | Scope |
|---|---|---|
| 1 | R1. Road and `bestBy` | §3.1, §6.1 |
| 1 | R2. Home C and the tab bar | §5.1, §3.4 |
| 2 | R3. Roadmap D | §5.2 |
| 2 | R4. Task C | §6.2 |
| 3 | R5. Build my roadmap A | §4.2, §4.3, §4.4 |
| 3 | R6. Settings C | §6.3 |
| 4 | R7. Type scale before sign-in | §4.1 |
| 4 | P7. Whole-app design gate and owner sign-off | §8 |

- **Track C** (C1–C4) follows P7, unchanged.
- **The 2026-10-28 plan** gets a note saying that R1–R7 replace the look from P2–P6.

## 8. Testing and the design gate

**Unit tests (vitest):**

| Area | Cases |
|---|---|
| `route-progress` | flag positions; You and Today x before arrival, on day 1, mid-stage and with everything done; dot states |
| Unlocks | which tasks, and their order |
| `bestBy` (API) | a day window, several rules, no rule, a month rule, no arrival date |
| Calendar | keyboard moves, selection, the ISO value, month change |

**Component tests:**
- The tests for home-view, roadmap-view, task-sheet, settings, question-step and preview-route are rewritten to the new structure.
- They keep the behaviour tests: mark and undo, save and rebuild, the reload jump-back, `ApiDown` retry, `?ask=1`.

**End-to-end tests (Playwright, ports 3100/3101 only):**
- `journey`, `change-answers` and `a11y` are updated.
- axe runs on every page at 1440 and 390.

**Design gate (P7):**
- Screenshots of every page at 1440×900 and 390×844, side by side with the boards below.
- A check that every rendered font size is in the §3.3 set.
- An impeccable critique with no P0/P1 findings.
- The owner signs off.

| Page | Boards |
|---|---|
| Landing | PsLanding, PsLandingPhone |
| Sign in | PsSignIn, PsSignInPhone |
| Save your roadmap | PsSave, PsSavePhone |
| Build my roadmap | StRail, StRailDate, StRailPhone |
| Your roadmap is ready | StRailPreview |
| Home | Home, HomePhone |
| Roadmap | Roadmap, RoadmapPhone |
| Task details | Task, TaskPhone |
| Settings | Settings, SettingsPhone |

## 9. Approvals

- Design sections 1–5 approved by the owner in chat, 2026-10-29.
- Written spec: awaiting owner review.
