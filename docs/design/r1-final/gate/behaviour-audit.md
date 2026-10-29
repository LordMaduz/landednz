# Behaviour audit: feat/r1-public-screens against main

Range: `d37e292` (main, merge base) to `64ec7c3`. Paths: `apps/api/**`, `packages/types/**`, `apps/web/src/lib/**`,
`apps/web/src/app/**/route.ts`, `apps/web/src/proxy.ts`.

The branch carries 100 commits: the content platform and verification work (2026-10-25), R0 polish (2026-10-28) and the
final screens (2026-10-29). Each change is matched to the spec that asked for it. Spec short names:

- **CP**: `docs/superpowers/specs/2026-10-24-content-platform-design.md`
- **R0**: `docs/superpowers/specs/2026-10-24-r0-foundation-design.md`
- **PS**: `docs/superpowers/specs/2026-10-28-r0-polish-and-stage-c-design.md`
- **FS**: `docs/superpowers/specs/2026-10-29-final-screens-design.md`

`apps/web/src/app/**/route.ts` and `apps/web/src/proxy.ts`: **no diff**. Test-only files that follow a change
below (fixtures renamed for the new enum values, new tests) are not listed.

## Summary

| Result | Count |
|---|---|
| Spec-backed | 33 |
| Reverted | 0 |
| Owner decision | 2 |

## apps/api and packages/types

| # | File | Change | Spec |
|---|---|---|---|
| 1 | `apps/api/content/**` (tasks, facts, sources, research, dimensions.yaml; `kb-master.md` removed) | Verified task content T01–T36, new facts and sources, research notes; the legacy markdown is gone | CP §5 stages 0–4, §6 steps 5, 7 and 9 |
| 2 | `packages/types/dimensions.ts`, `prisma/schema.prisma`, migration `20261025100000_dimension_changes` | Stage 0 answer values: 8 visas, `SOLE_PARENT`, Technology and Finance folded into Another profession; existing rows mapped in the migration | CP §3.1, §5 stage 0, §6 step 6, §8.2 |
| 3 | `golden-examples/rag-retrieval.ts` | Fixture occupation `TECHNOLOGY` → `OTHER_PROFESSIONAL` (value no longer exists) | follows #2 |
| 4 | `src/content/rules.ts` | Tighter figure, provider and staleness rules; month names case-sensitive | CP §3.6 rules 3 and 6 |
| 5 | `src/content/review.ts`, `scripts/content-review.ts`, `package.json` `content:review` | Per-task review page for the owner | CP §5 stage 4 |
| 6 | `scripts/convert-kb-master.ts` (removed), `src/content/build.ts`, `src/content/index.ts` | Conversion bridge removed; `checkedAt` optional because retired stubs have no items | CP §6 step 9; §4.3 (retired tasks served read-only) |
| 7 | `features/roadmap/roadmap.service.ts` `getTaskDetail` | `lastVerified: checkedAt ?? null` for retired stubs | CP §4.3, §8.3 |
| 8 | `features/roadmap/roadmap.build.ts` `reconcileRoadmap`, `onboarding.service.ts`, `roadmap.recalculate.ts`, `roadmap.types.ts` (`entriesAdded`, `entriesRemoved`) | Changing answers and the content-deploy recalculate both reconcile: add newly applicable tasks, drop open (`NOT_STARTED`) ones that no longer apply, keep every started entry, rescore | CP §4.3 (no user data lost, retired tasks kept read-only), §8.3; plan `2026-10-25-content-verification.md` Task 6 |
| 9 | `features/roadmap/roadmap.build.ts` `bestByDate`, `roadmap.service.ts` `getRoadmap`, `roadmap.types.ts` `RoadmapTask.bestBy` | `bestBy` = arrival + earliest `toDay` − 1 | FS §2 decision 5, §6.1 |
| 10 | `features/chat/service.ts` | SSE CORS header echoes the request origin only when it is in `CORS_ORIGIN` (was hard-coded `http://localhost:3000`) | R0 §4.4 (CORS restricted to the environment's web origins) |
| 11 | `features/roadmap/roadmap.service.ts` `getTaskDetail` | `governmentSourceUrl` (the task's action button) now comes from the first step's source, falling back to the why line's; main used the why line first | **Owner decision**, see below |

## apps/web/src/lib

| # | File | Change | Spec |
|---|---|---|---|
| 12 | `api.ts` | `RoadmapApiTask.bestBy` | FS §6.1 |
| 13 | `answers.ts` | `SOLE_PARENT` wording "you and your children" | CP §8.2 (follows #2) |
| 14 | `answers.ts` `answersShort` | Save chip's short answers line "visa · city · who · lands d Mon" | FS §4.1 (Save your roadmap) |
| 15 | `legs.ts` `legForPhase` (replaces hard-coded `T01–T21` id ranges) | A task's stage comes from its content phase, so T22–T36 land in the right stage | CP §5 stage 1 (phases per task) |
| 16 | `legs.ts` `legName`, `legWhen` copy | "Before you fly" until arrival, "by 1 Mar", "1–2 Mar", "from April" | PS §3.3 (stage names and dates) |
| 17 | `legs.ts` `legStart` | Start date of the next stage for "Nothing else this week. {stage} starts on {d Month}." | PS §3.3 (Also this week empty line) |
| 18 | `nz-date.ts` | New formatters `shortDate`, `dayMonth`, `weekdayDay`, `weekdayDayNZ` | FS §3.1, §5.1, §5.2, §6.2 (date formats) |
| 19 | `calendar.ts` (new) | Month grid, key moves, land chip and titles for the Calendar | FS §4.3 |
| 20 | `route-view.ts` order | Route ordered by phase, then id (was id only) | CP §5 stage 1 (follows #15) |
| 21 | `route-view.ts` `waitsOn` | "Waits on {topic}" replaces "Needs {topic} first" | FS §2 decision 7, §5.1 |
| 22 | `route-view.ts` `blocker`, `blockedBy`, `bestBy`, `unlocksOf` | Data for Unlocks, arcs and Best done by | FS §3.1 (arcs), §5.1, §5.2, §6.2 |
| 23 | `route-view.ts` `buildRouteView(…, now)` | Stage name depends on before/after arrival | PS §3.3 |
| 24 | `route-progress.ts` (new) | Road geometry: flags `[150, 270, 530, 820, 1000]`, You by tasks done, Today by date, dots, stage row | FS §3.1 |
| 25 | `route-progress.ts` marker stage | After arrival the "You're here" pill and "· now" sit on the calendar stage; flags and the walked road stay on the current stage | FS §3.1 and critique-independent.md P2-1 (S3 owner-accepted) |
| 26 | `roadmap-itinerary.ts` (new) | Done so far, Today, current stage and later stages rows | FS §5.2 |
| 27 | `home-view.ts` greeting and subline | "Welcome to {city}" ("Welcome" before arrival); "n of N done · day d since you landed on {date}" | FS §5.1 items 1 |
| 28 | `home-view.ts` next move | `nextMeta`, `unlocks` | FS §5.1 item 3 |
| 29 | `home-view.ts` Then this week | Stage today falls in, up to 3 rows, "n more in {stage}", "n days left" aside, empty line | FS §5.1 item 3, §3.1 (n days left); PS §3.3 |
| 30 | `home-view.ts` Recently done | Latest 4, "Done {Wed 4 Nov} · {stage}", total | FS §5.1 item 4 |
| 31 | `home-view.ts` Your plan card data removed, `firstName` removed | The plan card goes; greeting no longer uses the name | FS §5.1 item 5, item 1 |
| 32 | `tel-links.ts` (new) | NZ freephone numbers become `tel:` links | PS §3.5 |
| 33 | `task-copy.ts` titles T01, T11, T12, T17, T19; new T28 | App titles match the verified tasks; title for the new visa-conditions task | CP §5 stages 1–2 |
| 34 | `suggestions.ts` | Ask's starter questions drop "What documents do I need?" and "What do people get wrong?"; only "How long does it take?" remains | **Owner decision**, see below |
| 35 | `answers.ts`, `legs.ts` comment-only edits | Example strings in comments | none needed (no behaviour) |

## Owner decisions

1. **#11 Action button opens the first step's page** (`656bf0f fix(roadmap): open the first step's page from the task action`).
   No spec section asks for it. The content-verification plan's writing rule (plan `2026-10-25-content-verification.md`, "Write")
   says "`steps[0]` cites the page the user acts on … the task sheet's action link opens it", and all 36 verified tasks were
   written to that rule. Reverting would send every task's government button to the background page behind the why line
   instead of the form or online service. Not reverted: the revert reaches every task's main action and contradicts how the
   verified content was written. Owner to confirm the plan rule stands.
2. **#34 Fewer Ask starter questions** (`699ce15 feat(web): open a task as a full page instead of a side sheet`).
   No spec section names it. FS §6.2 says the Ask card is "the existing `AskPanel`, unchanged", and the panel at the
   spec's date already had this change. The approved Task board (`Task.dc.html`) shows no starter chips at all. Reverting
   would add two chips the board does not show, on a page that already lists "Have ready" and "Good to know".
   Not reverted. Owner to confirm.

## Manual click-through

Run 2026-10-29 with Playwright against the production build on 3100 (`next start`, `NEXT_PUBLIC_API_URL=http://localhost:3101`)
and the API on 3101 (`AI_MODE=mock`, `CORS_ORIGIN=http://localhost:3100`), local Supabase, and the real local user
`e2e-auth@example.com` reset through `e2e/test-user.ts` (`DELETE /account`, then admin create). No page errors were thrown.

| # | Step | Result |
|---|---|---|
| 1 | Onboarding: Landing → Build my roadmap → AEWV, Auckland, Just me, Another job or profession → today on the calendar → See my roadmap | Pass. Lands on `/onboarding/preview`, h1 "Your roadmap is ready" |
| 2 | Preview | Pass. "Before you fly · 7 tasks" and the Start here block shown |
| 3 | Save my roadmap | Pass. `/signin?redirect=%2Fapp`, h1 "Save your roadmap", chip "Saving your roadmap · 19 tasks" |
| 4 | Email sign-in → Home | Pass. `/app`, h1 "Welcome to Auckland" (profile saved from the held answers) |
| 5 | Complete a task (T06 Get an NZ SIM card) | Pass. Mark as done → "Mark as not done"; still done after reload |
| 6 | Reopen it | Pass. Mark as not done → "Mark as done"; still open after reload |
| 7 | Settings: mark T06 done, Change City → Wellington region → Save and rebuild | Pass. Answers list shows "Wellington region"; Home h1 "Welcome to Wellington"; T06 still done after the rebuild |
| 8 | Ask on a task: `/app/roadmap?task=T08&ask=1`, ask "What documents do I need?" | Pass. The Ask input has focus on open; a mock reply streams in with the trace "Answered from the LandedNZ knowledge base" |
| 9 | Sign out (account menu → Sign out) | Pass. Back on `/`; `/app` then redirects to `/signin?redirect=%2Fapp` |
| 10 | Sign in again | Pass. `/app`, h1 "Welcome to Wellington" (answers kept) |

Not run: **Continue with Google.** Local Supabase has no Google OAuth client, so the Google button cannot complete a sign-in here.
The button renders on Sign in and Save (shots), and the shared path after any sign-in (`/auth/complete`) is the one steps 4 and 10 used.

The same flows are covered by the e2e suite (`journey`, `auth`, `change-answers`), which passed on 3100/3101.
