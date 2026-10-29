⚠️ DEGRADED: single-context (the controller's brief for task S4 forbids dispatching subagents; Assessment A was written from the committed shots before the detector ran)

# Final critique: all final screens (S4 gate)

Target: `apps/web` (slug `apps-web`). Pages: Landing, Sign in, Save your roadmap, Build my roadmap (question and date),
Your roadmap is ready, Home, Roadmap, Task details, Settings, at 1440 × 900 and 390 × 844.
Shots: `docs/design/r1-final/gate/*-1440.png`, `*-390.png`. They come from a production build (`next start -p 3100`) against the API
on 3101 (`AI_MODE=mock`), with a test user on day 1 (arrival 29 Oct 2026, 0 of 19 done). The Next.js dev badge is absent
(`nextjs-portal` not in the DOM on any page).

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 4 | Road, "You're here", Today line, "n of N done · day d" on every workspace page; Save chip states what is being saved |
| 2 | Match System / Real World | 3 | "Before you fly" on the preview while Home and Roadmap say "Before you flew" for the same day-1 user |
| 3 | User Control and Freedom | 4 | Change on every answer, Back on the date step, undo on done, Cancel in Settings |
| 4 | Consistency and Standards | 3 | Blocked meta reads "Waits on …" in the app but "After you choose where to live" on the preview and "Needs your IRD number" in the landing figure |
| 5 | Error Prevention | 3 | Save and rebuild is disabled until an answer changes; no confirmation is needed beyond that, rebuild keeps done tasks |
| 6 | Recognition Rather Than Recall | 4 | Answers always visible in the rail and Settings; stage names on the road |
| 7 | Flexibility and Efficiency | 3 | Ask has a `/` shortcut; phone keeps Mark as done and Ask fixed above the tab bar |
| 8 | Aesthetic and Minimalist Design | 3 | Calm and consistent; day-1 empty states make Home's lower half sparse |
| 9 | Error Recovery | 3 | Save-failed and ApiDown states exist (not shot in this run) |
| 10 | Help and Documentation | 3 | Sources with checked dates and Ask on every task; no separate help |
| **Total** | | **33/40** | **Good** |

## Design Specificity Verdict

**LLM assessment.** Authored for this product. The curvy road with date-spaced flags, the ink answers rail shared by Build my
roadmap, the preview and Settings, and the numbered citations tied to the Sources card could not be lifted onto another product
unchanged. The workspace pages read as one system: same 120 px edge, same card radius and hairlines, same teal used only for
state and links.

**Deterministic scan.** `impeccable detect --json src/components src/app` returned `[]` (exit 0): no findings, so no false
positives to discount.

**Visual overlays.** Not injected (single-context run; the browser was driven by Playwright for measurements only). No overlay
is visible to the user.

## Overall Impression

The screens match their boards and hold together at both widths. Nothing blocks a migrant from building, saving and working
through the roadmap. What is left is wording consistency between the pre-sign-in pages and the workspace, and phone pill overlap.

## What's Working

- **The road carries the plan.** Five labelled stages with counts and dates ("Arrival · now / 4 tasks · 29–30 Oct") make the
  90 days readable at a glance on Home and Roadmap.
- **Trust is visible.** The task page puts a numbered citation on every step and a Sources card with "checked 25 Oct 2026" and
  domains beside the steps.
- **One next action per page.** Home and Roadmap each lead with the next task and a single ink **Start task**.

## Priority Issues

- **[P2] Stage name differs between the preview and the workspace on arrival day.**
  Why: the preview says "Before you fly · 7 tasks" for a user landing today, Home says "Before you flew". The same user sees both minutes apart.
  Fix: give the preview the same `legName(id, beforeArrival)` rule the route uses. This is copy only; owner call since the spec §4.4 names the row "Before you fly".
  Suggested command: $impeccable clarify
- **[P3] Blocked-task wording has three forms.** "Waits on …" (Home, Roadmap), "After you choose where to live" (preview), "Needs your IRD number" (landing figure).
  Fix: use "Waits on …" in the preview row and the landing figure.
  Suggested command: $impeccable clarify
- **[P3] Phone "You're here" pill covers the start of the road** (known since S3, P3-8). At 390 the pill sits over the first flag and dots.
  Fix: anchor the pill above the ring and clamp it inside the card, or drop the tag on phones and keep the ring.
  Suggested command: $impeccable adapt
- **[P3] "Before you flew · still open" and "Arrival · now" crowd the first two stage labels at 1440** (stage 0 is 150 of 1000 wide).
  Fix: none needed at this size (they fit on one line each); watch it if the copy grows.

P0: none. P1: none.

## Persona Red Flags

**Busy one-minute check-in (phone):** Home at 390 shows the next task, Start task (44 px) and two week rows above the fold. The
fixed tab bar and Mark as done bar hide part of the task text while scrolling; content scrolls clear of them, so no task is unreachable.

**Planner at a desk (1440):** Roadmap lists each stage with Show buttons; on day 1 the Arrival section mixes in six tasks
carried from Before you flew, tagged "Before you flew · 1–2 hours", which is clear but long. No red flag.

**First-timer:** Landing to preview needs five answers and no account; the Save screen's chip repeats what is being saved. No red flag.

## Minor Observations

- At 390 the public footer wraps its disclaimer to two lines (70.7 px tall); the signed-in footer is one row ("Not legal or tax advice · Privacy · Terms", 37 px, no overflow).
- Task phone shot is full-page, so the fixed bars sit mid-image; the live page is correct.
- Settings desktop "Save and rebuild" is disabled until a change is made; the quiet disabled style reads correctly.

## Measurements (production build, from the committed shots' run)

| Page | 1440 content edge / width | 390 gutter / width | Overflow (scrollWidth) |
|---|---|---|---|
| Landing | full-bleed hero; footer edge 160 | full-bleed | 1440 / 390 |
| Sign in, Save | 160 / 1120 | 16 / 358 | 1440 / 390 |
| Build my roadmap (question, date), preview | rail 440 at x 0 (padding 48), content x 560 (as board `padding:32px 120px`), header/footer edge 160 | 16 / 358 | 1440 / 390 |
| Home, Roadmap, Task, Settings | 120 / 1200 | 16 / 358 | 1440 / 390 |

- Footer: 1440 height 65 on every page; 390 signed-in 37 (one row: the disclaimer, Privacy and Terms share one line; scrollWidth − clientWidth 0); 390 public 70.7. Task at 390 hides the footer behind its fixed bars.
- Font sizes in use: 48, 24, 22, 18, 15, 13, 12 px only (12 = citation numbers and tab bar labels); the e2e type-scale check passes on every page at both sizes.

## Questions to Consider

- Should the preview switch to "Before you flew" on and after arrival, like the workspace?
- Does the phone road need the "You're here" tag at all, given the ring and the "Arrival · now" label under it?

## Run Notes

- Target slug: `apps-web`. Ignore list: none (`.impeccable/critique/ignore.md` absent).
- Assessment independence: degraded, single context (brief forbids subagents).
- CLI detector: ran, `[]`.
- Browser: Playwright (production build on 3100) for shots and measurements; overlay injection not attempted; no live server started.
- Snapshot persistence: not written (this file is the gate record).
- Questions skipped: the owner reviews this file at the gate; the controller runs the final review.
