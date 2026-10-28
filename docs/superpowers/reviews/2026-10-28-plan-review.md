# Plan review: R0 polish and Stage C (2026-10-28)

Reviewed: plan `docs/superpowers/plans/2026-10-28-r0-polish-and-stage-c.md` at f513d7d. Checked against the spec, the parent spec §5/§8/§10, the runbook, `docs/design/r0-polish/build.py` and its boards, the current code, and the owner's messages in the transcript (user turns and AskUserQuestion answers).

**Verdict: not ready to execute as written.** The plan follows the owner's decisions closely, and the track maths checks out. But 1 blocker and 14 major findings would either break `make check`/e2e, ship behaviour the owner did not agree to, or leave decided items unbuilt. Every one has a small fix in the plan text.

Counts: Blocker 1 · Major 14 · Minor 14 · Unverified 2

---

## Blocker

### B1. Boards are still "pending", so P1 breaks CW02′ on its first step
- **Where:** spec `2026-10-28-r0-polish-and-stage-c-design.md:188` ("pending owner review of this spec"); plan P1–P6 (no approval step before UI work); `.claude/constitution.md:89-92` CW02′.
- **What is wrong:** CW02′ and the plan's own Global Constraint (plan:16) say a UI change needs an approved board. The transcript has the owner choosing ("Go with B, and continue rest of /superpowers:brainstorming…", 06:41) but never saying "approved" for version `1793169870-b87a`. P7 Step 3 records approval only of the *built* app, after P1–P6 have run.
- **Fix:** add a step 0 to Session 1, before P1: the owner approves the boards (canvas version 1793169870-b87a), and the agent records it in spec §7 and R0 spec §7.4. P1 starts only after that.

## Major

### M1. Worktree "from origin/main" has no plan, spec or boards
- **Where:** plan:21 ("Work in a worktree from `origin/main`"); plan:55 resume prompt.
- **What is wrong:** the plan, spec, boards and runbook exist only on the unpushed branch `docs/r0-polish-stage-c` (f513d7d, 1 ahead of origin/main). A fresh worktree from origin/main has none of them, and the resume prompt names no worktree or branch. The resume prompt from the end of brainstorming (transcript summary) did name both.
- **Fix:** add a step: push the docs branch and merge it (or branch Track P from it). Put the worktree path and branch into the resume prompt template.

### M2. Stage index taken from `route.legs` is wrong when a leg has no tasks
- **Where:** plan:101 ("The current stage index `i` is the leg with `state === "current"`… `x = … i*200`").
- **Evidence:** `apps/web/src/lib/route-view.ts:51-53` drops empty legs (`.filter(l => l.tasks.length > 0)`). So for a profile with no Later tasks, `route.legs` has 4 entries and the indexes stop matching the 5 fixed flags (`TRACK_FLAGS`), the stage day ranges, and `passed[]`.
- **Fix:** take `i` from `LEGS.findIndex(l => l.id === leg.id)`, not from the position in `route.legs`. Build `passed` over the 5 LEGS. Add a test with an empty leg.

### M3. Pin goes backwards when the traveller is ahead of schedule
- **Where:** plan:101 (`f = min(1, (day - stageStartDay + 1) / stageDays)`).
- **Evidence:** on day 3 with Week 1 already done, `i` = Month 1 (starts day 9): f = (3-9+1)/23 = -0.22, so x = 556.5. That is behind the Week 1 flag at 600, even though `passed[2]` should be true. Recomputed with python.
- **Fix:** `f = clamp((day - stageStart + 1)/stageDays, 0.2, 1)`, matching the pre-arrival floor. Add a test: "ahead of schedule stays past the previous flag".

### M4. "Before you fly" only reaches the stage labels; summary, Home, Roadmap and task page still say "flew"
- **Where:** plan:86 (`legName(id, beforeArrival)`), plan:101 (summary uses `${leg.name}`), plan:104 ("The stage labels use `legName`").
- **Evidence:** `RouteLeg.name` comes from `LEGS` (`route-view.ts:72`), which is "Before you flew" (`legs.ts:8`, asserted in `legs.test.ts:6`). The board's pre-arrival summary is "Before you fly · 0 of 10 · by 1 Mar" (build.py EARLY `now_left`, `stage_sum`). Spec §3.3: "The first stage reads 'Before you fly' until the arrival date".
- **Fix:** have `buildRouteView` set `name: legName(leg.id, journeyDay(arrivalDate, now) < 1)`, so every consumer (summary, `nextMeta`, StageList "Show … tasks", task-page nav, preview) gets it. Update `legs.test.ts`, and give `buildRouteView` a `now` argument.

### M5. P4 deletes RouteRail and RouteStrip but not their test file
- **Where:** plan:131.
- **Evidence:** `apps/web/src/components/route/route-rail.test.tsx` imports both `./route-rail` and `./route-strip`. With them gone, `make check` fails in P4.
- **Fix:** add "Delete: `route-rail.test.tsx`" (or move the tests that still apply to `stage-list.test.tsx`). Also check `waypoint.tsx` and the `.route-legs`/`.route-step` CSS: keep both, because `onboarding/preview-route.tsx` still uses them.

### M6. Button and fields stay 44 px on desktop; there is no 32 px small size
- **Where:** plan:65 ("radius token picks up 8; add `min-h-11` under `narrow` for every size").
- **Evidence:** `button.tsx` default is already `min-h-11` (44) at every width, and has no `sm` size. The locked sizing (owner decision; spec §3.1 rows "Controls" and "Small button"; build.py `.btn` 40, `.btn-sm` 32, `.field` 40, phone 44) needs 40 on desktop, 44 under 561, and a 32 small button for header Ask, task nav and "Show". Following the plan literally changes nothing.
- **Fix:** P1: default `min-h-10 max-narrow:min-h-11`; add `size: "sm"` = `min-h-8 px-3 text-small max-narrow:min-h-11`; apply the same 40/44 rule to `field.tsx` and `select.tsx`. Update `button.test.tsx`.

### M7. Footer is missing on onboarding, preview and sign-in
- **Where:** plan:64 (adds `<PublicFooter />` to three signed-in screens only).
- **Evidence:** owner: "Issues, allcpages including Home We need to keep a Footer" (06:06). Spec §3.2: "`PublicFooter` renders on every page". Spec §3.7 also lists "the shared footer" for onboarding and sign-in. `grep PublicFooter` finds it only in `app/page.tsx` and `legal-page.tsx`, not in `app/onboarding/**` or `app/signin/**`.
- **Fix:** add the onboarding step, preview and sign-in pages to P1's Modify list. Include the loading and API-down branches of the signed-in screens.

### M8. Task page: the bottom previous/next cards are never built, and the test already passes
- **Where:** plan:157-158 (P5).
- **Evidence:** spec §3.5 "The bottom of the article has previous and next task cards ('← Previous task / {title}')". The TaskPage board has both the header nav (`Previous`/`Next`) and the bottom `.pn` cards. `task-sheet.tsx:158-176` already has header links named `Previous task: {title}`, so the P5 "failing" test passes before any change. Adding cards with the same name would make `getByRole` ambiguous. Step 3 never mentions the cards.
- **Fix:** P5 Step 3: add the bottom card nav (`<nav aria-label="Previous and next task">`, one column on phones). Give the header links the board's short labels ("Previous"/"Next" with the title in `aria-label`), or test the cards with `within(nav)`. Write the test so it fails today.

### M9. Home "Also this week": the test numbers contradict the board, and "week" is undefined
- **Where:** plan:115, plan:120.
- **Evidence:** the plan says "With 5 open tasks left in Week 1 after the current one, `week.length === 3` and `weekMore === 1`". 5 after the current one gives 3 shown and 2 more. The board (build.py LATER) has Week 1 = 5 tasks including the current one, so 4 after it: header "4 more tasks", 3 rows, then "1 more this week · Open roadmap". Today `week` is the next 2 open tasks across the whole route (`home-view.ts:49-52`), and the plan never says whether it becomes "rest of the current leg". The pre-arrival board shows only 2 of 9 remaining Before-you-fly tasks, plus the "After you land: …" line. The header count (`week_count`) and foot copy are not in the plan.
- **Fix:** state the rule, e.g. `week` = open tasks after `current` in the current leg, capped at 3, `weekMore = rest - 3`, plus a count label "{n} more tasks"; and say what pre-arrival shows. Fix the test to "4 after the current one → 3 and 1".

### M10. Several decided states have no task: task done in place, empty "Also this week", "Saving…"
- **Where:** plan P6 (plan:161-179).
- **Evidence:** spec §3.2 and the States board (build.py `STATES`) list 12 states. P6 covers loading, API down, field error, saved toast, Ask thinking/failed, delete dialog and disabled. Nothing implements:
  - "Task done": "The row stays in place with a tick and Undo for 6 seconds, then moves to Recently done";
  - "Empty: nothing this week": "Nothing else this week. Next week starts on 9 March.";
  - "Saving": "The button keeps its width… No spinner icon";
  - Ask over the daily limit: "says when Ask opens again";
  - the focus ring, checked on every control.
- **Fix:** add these to P6 (or P3 for the Home ones), each with a test, or list them as deliberately deferred in spec §1 Non-goals.

### M11. `staging.yml` and the staging e2e run cannot target staging: Playwright has no BASE_URL
- **Where:** plan:216, plan:230; parent spec §5.4 ("The Playwright suite runs unchanged against local, staging and production via `BASE_URL`").
- **Evidence:** `apps/web/playwright.config.ts` hard-codes `baseURL: 'http://localhost:3000'` and always starts local `webServer`s. `e2e/test-user.ts` needs `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SECRET_KEY` and `NEXT_PUBLIC_API_URL` for the staging project. No task changes this.
- **Fix:** C1 or C2: `baseURL: process.env.BASE_URL ?? 'http://localhost:3000'`, and `webServer` only when `BASE_URL` is unset. List the three staging e2e secrets and variables in `env-staging.md` and the runbook's GitHub item.

### M12. The journey e2e expects mock-only text, so it fails on live staging
- **Where:** plan:230 (C3 Step 5: "Run the full e2e journey against staging… Expect it to pass"); spec §1 success criterion.
- **Evidence:** `journey.spec.ts` expects `'Answered from the LandedNZ knowledge base'`. `lib/trace.ts:7` shows that text only when a reply cites no domains. With `AI_MODE=live` the answer cites sources and the trace reads "Checked …".
- **Fix:** relax the assertion to `/^(Answered from the LandedNZ knowledge base|Checked )/`, in the C1/C2 Playwright change.

### M13. Branch wiring missing: Vercel and Railway could deploy `main` to production
- **Where:** plan C2/C3/C4 (plan:212-238); parent spec §5.1 ("Production deploys only from `production`"; "Merge to `main` → deploys staging").
- **What is wrong:** no step sets Vercel's Production Branch to `production`, assigns `staging.landednz.co.nz` to the `main` branch, or splits the Preview and Production env scopes. No step sets Railway's deploy branch to `production` or its watch paths (`apps/api/**`, `packages/types/**`, parent §4.5). `render.yaml` has no `branch: main`. With Vercel's default (production = `main`), every merge would go live on `landednz.co.nz` and bypass `release.sh`.
- **Fix:**
  - C3 Step 3: set the Vercel production branch to `production`, add the staging domain on branch `main`, and set Preview env = staging values.
  - C4 Step 2: set the Railway source branch to `production` and its watch paths.
  - Add `branch: main` to `render.yaml`.
  - Verify each with the CLIs.

### M14. Docs and skills that still teach the old rules are not all updated
- **Where:** plan:66-67, plan:76.
- **Evidence:**
  - `.claude/skills/landednz-design-system/SKILL.md:39,43` still says title 32, section 20, radius 6/10, "shadow-lift only on the landing preview and toasts; everything else is a hairline", spacing 0,4,8,16,24…, and "Button… already have min-h-11". Its description triggers on every web UI change, so P3–P6 implementers will load contradicting values.
  - CW02′ text itself (`constitution.md:90-91`) says "passes the minimalism validator", outside the CW07 block the plan deletes.
  - R0 spec §3 line 92 (skills list) and §12 line 338 also name `minimalism-validator`.
- **Fix:** add to P1:
  - rewrite the design-system skill's type, radius, spacing, shadow and control lines to §3.1;
  - edit CW02′ to "…and has no P0/P1 impeccable findings";
  - edit R0 spec lines 92 and 338.

## Minor

- **m1. Lighthouse not re-run after adding Sentry and PostHog.** Plan:206 (C1). `lighthouserc.json` enforces landing `resource-summary:script:size` ≤ 276480 and LCP < 2.5 s. C1 adds `@sentry/nextjs` and `posthog-js` to the root layout but runs only `make check`/`docker-api`. **Fix:** add `make build && make lighthouse` to C1 Step 4; lazy-load PostHog if the budget fails.
- **m2. Render start-command path is wrong.** Plan:212 says `node dist/server.js` "from `apps/api`". The image's entry is `apps/api/dist/src/server.js` (Dockerfile CMD; `package.json` start = `dist/src/server.js`). **Fix:** `cd apps/api && npx prisma migrate deploy && node dist/src/server.js` as `dockerCommand`.
- **m3. Runbook GitHub item is circular.** Runbook:37 says "the agent lists the exact names in the plan's Task C2", but the plan says C2 starts only when every box is ticked (plan:39) and lists no names. **Fix:** list the secret and variable names now in the runbook, or move that one item to "after C2 Step 2".
- **m4. Copy in the plan disagrees with the boards.**
  - The board subline is "124 days until you land on 1 March 2027." / "Day 3 in Christchurch · 14 of 25 tasks done."; `home-view.ts` today says "…until you land in {city}" / "…, and the basics are sorted". P3 doesn't mention the subline.
  - The board's Your plan has an "Arriving" row that today's 4-row plan lacks.
  - The board's leg dates are "by 1 Mar", "1–2 Mar" and "from April"; `legWhen` gives "before 1 Mar", "1 to 2 Mar" and "from month 2".
  - The Sources header uses `longDay` ("27 October 2026") where the board says "27 Oct 2026".

  **Fix:** in each task, say board copy or current copy. Spec §6 already says placeholder copy doesn't ship, so state it per string.
- **m5. Spec claims the board pin matches 433; it is 430.** Spec:96 says "day 3… is x 433, which matches the board". build.py LATER `route_x=430`. Harmless (0.3% of width). **Fix:** regenerate the board with 433, or drop "matches the board".
- **m6. Formulas the board needs are unstated.** The "days left" formula is not given (day 3 needs `stageEnd - day + 1` = 6). Nor are the stage-label text ("done ✓" vs "{done} of {total} · {when}", build.py `stage_labels`) or the edge cases (`total === 0` makes `Math.max(0.2, NaN)` NaN). **Fix:** add them to P2 Step 3, with a test for `total 0`.
- **m7. Roadmap details missing from P4's tests and steps.** Spec §3.4's "before arrival: arriving {date}" subline; the "Month 1 ends" key date; the "landed" vs pre-arrival Key-dates label; and the order of "Other stages" (board: remaining first, then done). Spec text also says "one row per remaining stage", but the board lists done stages too. **Fix:** align the spec wording with the board and add the cases to the P4 tests.
- **m8. Spec §5 tests not in the plan.** Card row-height alignment, "source-list helpers", e2e "opening a source in a new tab" and "previous and next links", and the screenshot baseline re-capture. **Fix:** add them to P5 and P7, or trim spec §5.
- **m9. Owner layout asks not encoded.** Transcript 05:41 and 05:49: no empty band at the bottom of Home, rows share a height, fit on one screen where sensible. The spec keeps "no empty band" and "share a height", but no plan step checks them. **Fix:** in the P3 and P6 visual checks, measure the bottom gap and the equal heights per row at 1440×900.
- **m10. Third-party skill rule not encoded.** Decision 8 "read third-party skill source before running it" isn't in the Global Constraints, and impeccable is third-party. **Fix:** add one line.
- **m11. health.yml details.** `gh issue create --label health` fails if the label doesn't exist, and the job needs `permissions: issues: write`. **Fix:** create the label in C2 and declare the permission.
- **m12. Scratchpad env file is never deleted.** C3 Step 1 writes DB secrets to it. **Fix:** say to delete it after bootstrap. The same applies in C4.
- **m13. Lighthouse covers no rebuilt page.** P7 Step 2 relies on `lighthouserc.json`, which checks only `/`, `/onboarding` and `/signin`. **Fix:** say axe covers the signed-in pages, or add them.
- **m14. Title tokens differ from build.py.** `--text-title` line-height stays 1.15 (board `.t-page` 1.25) and section 1.3 (board 1.35). The plan lists only letter-spacing. **Fix:** state the line-heights in P1's token list.

## Unverified

- **U1.** Whether `linkPhones` can be applied to step text without breaking `stepParts` and the inline citation `ref()` (task-sheet.tsx:204-218). It depends on how lead text is split; worth one test with a number next to a citation.
- **U2.** Whether the Vercel monorepo build with root `apps/web` resolves the `@landednz/types` workspace. Not checked; `vercel build` was deferred in the runbook.

## No contradiction found with the transcript

- Owner decisions 1–8 in the brief all appear in the transcript as stated:
  - original request (04:46);
  - white, not cream (06:15 "more cremier mean more bright white");
  - Sources on the right (06:18–06:21);
  - validator dropped (05:50);
  - AskUserQuestion picks: States, Phone fixes, Roadmap board, First-visit wording, plus the roadmap card redesign;
  - sizing delegated to "most recommended" (06:32);
  - "Go with B" (06:41).
- The earlier AskUserQuestion pick "Tinted canvas, white cards" was correctly overridden by the 06:15 message. The spec and plan use a white page.

## Verified OK

- Track maths:
  - before arrival, 0 done: x = 40;
  - 2026-10-28 → 2027-03-01 = 124 days (`journeyDay` gives -123, and 1 - day = 124);
  - day 3: x = 433.3, rounds to 433;
  - day 3 summary "Week 1 · 0 of 5 · 6 days left";
  - day 3 `passed` = [T,T,F,F,F];
  - all done gives 1000; day > 61 caps at f = 1;
  - terrainY(0) = 48.1 and terrainY(500) = 77.0, same formula as build.py `terrain_y`.
- Stage day ranges match `legWhen`: Week 1 ends at arrival + 7 = day 8, Month 1 at arrival + 30 = day 31. The NZ day boundary is handled by `journeyDay` (Pacific/Auckland calendar). `arrivalDate` is a required string in `@landednz/types`.
- Card values match build.py: `#FFFFFF`, hairline `#E3E8EA`, radius 12, SHADOW = the existing `--shadow-lift`, padding 20/16, gap 14 (`gap-3.5`), grid `minmax(0,1fr) 360px`, gap 16, breakpoint 561 (`--breakpoint-narrow`).
- Type 24/18/15/13 with 22 on phones; citation 12 with a 24 tap area; radius 8/12. These match the spec §3.1 table and the Details board.
- Greeting rule `day < 1 ? "Welcome, {first}" : "Welcome to {city}, {first}"` matches the boards and decision 6. The journey e2e heading assertion (contains the first name) still passes.
- Recently done copy, "See all 14 done", the 3-row caps and "Open roadmap" match the boards.
- Roadmap page structure matches the board: track card at height 120, current-stage card with an ink outline and "Up next" tag, "Other stages" with Show buttons and a hidden "{leg} tasks" label, side Up next and Key dates, "Change your arrival date". `Show Arrival tasks` will exist in the journey e2e: the user arrives today with 0 done, so the current leg is the first one and Arrival sits in Other stages.
- Task page: Sources in the side column under Status and Ask; every source listed, `target="_blank"`, hidden "(opens in a new tab)"; tel test strings match the TaskPage board numbers (0800 184 803, 0800 28 29 26, 0800 825 583).
- Settings: Save disabled with "No unsaved changes"; the field error, toast and dialog copy match the Settings and States boards. `updateOnboardingProfile` exists in `lib/api.ts`.
- Test commands are real: `npm test -w @landednz/web -- <filter>` (vitest run), `make check`, `make test-e2e`, `make docker-api`; `lighthouserc.json` exists. `apps/api/src/server.ts:19` has `Fastify({ logger: false })` for trustProxy, and `shared/config.ts` and `config.test.ts` exist. `journey.spec.ts`'s `'Your route'` locator is updated in P4.
- `prisma` is a runtime dependency of the API, so `npx prisma migrate deploy` works in the runner image (Railway `preDeployCommand`).
- Stage C coverage matches parent §5.5/§5.6/§8/§10:
  - two Supabase projects in Sydney on the session pooler;
  - Render Singapore, free, no `preDeployCommand`;
  - Railway Hobby;
  - Vercel `syd1`;
  - health every 6 h that opens an issue;
  - staging smoke + axe;
  - release that fast-forwards and tags;
  - security-review before release;
  - rollback steps;
  - Google-only in production, password on staging;
  - `claude-sonnet-5-5` on staging and production; lower `CHAT_DAILY_CAP` on staging.
- Runbook: the owner checklist is first in the Cloud section and covers every §5.6 item. CLI logins use `!`. Values go to a private note, never git.
- Secrets: never commit `.env.local`/`supabase/.env`, never recreate them, staging env goes to a scratchpad file outside the repo, and `.env.example` gets names only.
- Process constraints:
  - two tasks per session with a sessions table and resume prompt;
  - no Co-Authored-By;
  - haiku locally, sonnet on staging and production;
  - don't touch the owner's checkout;
  - board first;
  - impeccable replaces the validator.
- No scope creep: every plan task traces to a spec section. C1's `trustProxy` integration test, the PostHog memory persistence and the Sentry `sendDefaultPii: false` are reasonable additions under spec §4.2 and CW06.
