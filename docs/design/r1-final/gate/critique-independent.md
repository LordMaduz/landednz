# Independent design review: final screens gate

Method: an isolated reviewer ran the impeccable `critique` design-review assessment (Assessment A) and the `audit` dimensions. The reviewer did not build these screens. Run date 2026-10-29, branch feat/r0-polish.

Inputs: all 40 gate screenshots in this folder (app and board, 1440 and 390, 10 pages), `apps/web/PRODUCT.md`, `.claude/constitution.md` (CW01–CW08). Where a screenshot could not settle a question, the reviewer read the source: `question-step.tsx`, `roadmap-itinerary.ts`, `roadmap-view.tsx`, `task-sheet.tsx`, `calendar.tsx`, `globals.css` and the board HTML. The detector (Assessment B) was not re-run; its result comes from the implementer's record. The implementer's `critique.md` was read only after this review was formed.

Ignored: test-data differences (task names, dates, counts, avatar initials), the Next.js dev badge, and fixed bars that sit mid-image in full-page phone captures.

## Known items: the owner decides (not re-argued)

- The signed-in column is 1072 px against the board's 1200 px. The same `container-page` (1120 px minus 24 px padding) also makes the **public pages** 1072 px against their board's 1120 px (landing, sign in, save; app content starts at x=184, board at x=160). One owner decision covers both.
- The phone gutter is 24 px against the board's 16 px. This applies to every page.
- Already fixed: 24 px targets for the Home "Roadmap" link and the roadmap rows.

## Per-page differences, board vs app

### Landing
- **1440:** The hero preview card is a different component. The board shows divided rows (hairline between rows) with state icons: a filled teal check, a teal ring, a dashed circle, a hollow circle. Name text is 15 and meta sits right-aligned. The app draws a vertical rail with small dots, no dividers and 13 px row text (`landing-1440.png` vs `-board`).
- **1440:** The preview callout body is 13 in the app and 15 on the board.
- **1440:** The "Build my roadmap" CTA has no trailing chevron; the board has one.
- **1440:** On the board the topographic lines run behind the left of the hero too; in the app they are on the right only.
- **1440:** The footer sits lower, with extra empty space below the feature row.
- **390:** The CTA is auto-width; the board's is full-width with a chevron. "You see it before you sign up" is left-aligned; the board centres it.
- **390:** The intro paragraph renders larger than the board's 15 (about 18).
- **390:** The preview rows stack the meta under the name. The board keeps one row with the meta on the right, plus check icons and dividers.
- **390:** The footer stacks Privacy/Terms on their own line; the board puts them right-aligned on one line.

### Sign in
- **1440 and 390:** The form is **not in a Card**. The board puts the whole form in a raised Card.
- **1440 and 390:** There is no "or use email" divider; the app uses a plain hairline.
- **1440 and 390:** The intro is missing "New here? Continue with Google to create your account."
- **1440 and 390:** The consent text ("LandedNZ gets your name…") sits under the Google button. On the board it is centred under the submit button.
- **1440 and 390:** The **Sign in submit is a small outline (quiet) button**. On the board it is a full-width primary ink button.
- **1440 and 390:** The input borders are darker and heavier than the board's hairline inputs.
- The gate README's note "Type scale only, as specced" is wrong for this page.

### Save your roadmap
- **1440:** The layout is different. The app is two columns: the form on the left and a grey, borderless "What you're saving" panel on the right with a rail list. The board is **one centred Card** with a compact teal "Saving your roadmap · 24 tasks / visa · city · who · lands" chip above the heading.
- **1440 and 390:** The **submit says "Sign in" and is an outline button**. The board says "Save and sign in" and is full-width primary.
- **1440 and 390:** As on Sign in, the "or use email" divider and the "New here?…" line are missing, and the consent text is in the wrong place.
- **390:** The "What you're saving" summary is pushed below the whole form, so a phone user only sees what they are saving after the fields. The board shows it first.
- The README's "Type scale only, as specced" is wrong here too.

### Build my roadmap, question step (rail)
- **1440:** The question block starts at the top (y≈48). On the board it is centred vertically in the white pane.
- **1440:** Option rows are about 48 px tall with about 16 px radios; the board's are 60 px tall with 20 px radios.
- **1440:** The upcoming rail labels ("Where you'll live", "Who's moving"…) are 13; the board's are 15.
- **390:** **There is no Back button on phones** (`max-narrow:hidden` in `question-step.tsx`), and **Continue is inline in the page, not in a fixed bottom bar**. The board's phone has a fixed bar with a back chevron button and a full-width Continue.
- **390:** The board's header shows the previous answer and "Change" from step 2 on. The app does this only from the date step's shot (step 1 shot, so it can't be compared directly).

### Build my roadmap, date step
- **1440:** Matches in structure. Days outside the month (28–30 Sep, 1 Nov) are only slightly muted, and "1" renders teal. The board fades outside days much further.
- **1440:** The "You land on … / Tomorrow" summary is not shown because no day is picked (expected).
- **390:** The same phone issue: **no Back**, and "See my roadmap" is inline rather than in a fixed bar.

### Your roadmap is ready (preview)
- **1440:** The subtitle lists the profile ("Accredited Employer Work Visa (AEWV), Auckland, …") and leaves out the board's leading task count ("24 tasks for a working holiday visa in …"). The count is the payoff line.
- **1440:** The leg markers are hollow grey and the current marker is ink. The board uses teal leg rings and a filled teal current marker.
- **1440:** The **"Start here" card is grey wash with no border**. The board's is teal-tinted with a teal hairline border.
- **1440:** The waiting task ("Book temporary accommodation") uses the same solid hollow dot as available tasks. The board uses a dashed circle for waiting.
- **390:** There is no phone board (the 1440 board is reused). The app phone looks coherent; the same marker and colour notes apply.

### Home
- **1440:** The "You're here" pill sits at the very start of the track (before-you-fly), but the Today line sits at Arrival. On day 1 after landing, the stage label reads "**Before you flew · now**". The reader sees "now" on a stage they have already passed, with the pill and the Today line apart.
- **1440:** The stage labels under the track are **centred**; the board's are left-aligned under each segment. The "now" stage label is ink; on the board it is teal.
- **1440:** The title appends the user's first name ("Welcome to Auckland, e2e-auth"); the board has no name. Email-only users get their email local part, e.g. "john.smith83".
- **1440:** The "Then this week" row markers are small (about 12 px) hollow dots; the board's are 20 px circles.
- **1440:** The Start task / Ask about this buttons are about 40 px tall (board about 44 px).
- **390:** The "You're here" pill covers the track's start and nearly touches the card edge. The track is very small, and the label row is "Before you flew · now" plus "Roadmap" (board: "Arrival 3 of 4 / Week 1 · now / Roadmap").
- **390:** The next-move body text renders larger than the board's (4 lines vs 2 for similar copy).
- **390:** The bottom-nav icons differ: a route glyph and a cog in the app; a curve and sliders on the board.

### Roadmap
- **1440:** The current-stage group reads "**Arrival · 10 tasks**" ("Show 7 more") while the track above says "Arrival · 4 tasks". `roadmap-itinerary.ts` folds the 6 open "Before you flew" tasks into the current stage under the Arrival name, so "Book temporary accommodation" and "Gather and carry your key documents" appear as Arrival tasks.
- **1440:** The subtitle "Done some already? Open a task and mark it done." is not on the board (the implementer noted it).
- **1440:** The same pill vs Today-line split and centred stage labels as Home.
- **1440:** There are no dependency arcs or "Dotted lines: unlocked by …" note in this state. The preview says "The next task waits on this one" for the same top task, yet neither Home nor Roadmap shows an "Unlocks" line for it. Check whether the dependency is lost after sign-in or is meant to drop.
- **390:** The label under the track is "Before you flew · now" (board "Week 1 · 3 days left"). The phone Today card has no body text (matches the board).

### Task details
- **1440:** The breadcrumb is "Roadmap   Arrival, task 3 of 4" with no slash separator and a comma. The board has "Roadmap / Arrival · task 4 of 4".
- **1440:** Previous and Next are small (about 32 px tall), and the label is "Next" not "Next task". The board's are larger.
- **1440:** The steps use a plain ordered list ("1.") in ink. The board uses **teal bold numerals in a hanging column**.
- **1440:** Citation markers sit on the baseline (`align-middle`) and wrap alone onto a new line ("45%." / "5"; "online.10" has no space). The board uses teal superscripts.
- **1440:** The side card titles ("Not started", "Ask about your IRD number", "Sources") are 15 semibold. The board's are 18 (section). The Ask card title also differs: board "Ask about this task".
- **1440:** The sources list adds domain lines. The number column and row dividers are gone, and **"5 more sources" is an ink ghost button**; the board has a teal link.
- **1440:** The app adds an "Open the IRD application" button (the implementer noted it). The page scrolls as a whole (noted).
- **1440:** The main column is about 676 px; the board's is about 803 px (follows from the width decision).
- **390:** **The card butts against the header**, with no gap under the 56 px bar. The board leaves 16 px.
- **390:** The back link is a text "‹" glyph rather than the chevron icon, and the plain "1." numerals and baseline citations repeat here.
- **390:** The "why" paragraph shows on phones; the board omits it.

### Settings
- **1440:** The option radios are about 13 px; the board's are 20 px. The editor's option column is narrower (about 500 px vs 630 px) because the Card's padding is 56 px on each side (`px-14`).
- **1440:** The board shows "City · changing" and the app shows "Visa · changing" (test state, ignored).
- **390:** The first row label "Visa" renders **teal** when nothing is being edited; the board's labels are all grey.
- **390:** The rest matches (the account card, Delete account in red, the footer).

## Findings ranked

### P0
None. Nothing is broken or blocks a task.

### P1
1. **Sign in: form structure and primary action don't match the board.**
   - *Page/shot:* signin-1440 and -390.
   - *Why:* The board's single Card, its "or use email" divider and its full-width primary "Sign in" make the email path obvious and finished. The app has no Card, a quiet auto-width submit and no divider. The main action looks secondary, and it breaks the "every section a Card" rule.
   - *Fix:* Wrap the form in `Card` (radius 12, padding 20/16). Add the "or use email" labelled divider. Make the submit `Button` default (ink) at `w-full`. Move the consent text under the submit, centred, at 13. Add "New here? Continue with Google to create your account." Use hairline input borders as on the board.
2. **Save your roadmap: wrong layout and wrong submit label.**
   - *Page/shot:* save-1440 and -390.
   - *Why:* The board is one centred Card with a compact "Saving your roadmap · N tasks" chip, so the user knows what they are saving before they act. The app's two-column grey panel puts that summary after the form on phones. Its submit says "Sign in" (outline), which hides that submitting saves the roadmap.
   - *Fix:* Rebuild it as the PsSave Card: back link, teal chip (count + visa · city · who · lands date), title, intro with "New here?", Google, divider, fields, full-width primary "Save and sign in", consent. Drop the side panel.
3. **Landing: the hero preview figure is a different design.**
   - *Page/shot:* landing-1440 and -390.
   - *Why:* It is the main visual on the main Persuade page. The board's divided checklist with check, ring, dashed and hollow icons reads at a glance as "your tasks, in order, with status". The app's rail with tiny dots and 13 px text is quieter and doesn't match the approved board.
   - *Fix:* Render `roadmap-preview-figure.tsx` as the board does: hairline-divided rows at 15, 20 px state icons (filled check / teal ring / dashed / hollow) and right-aligned meta on phones too. Set the callout body to 15. Add the chevron to the CTA. On phones make the CTA full-width, centre the helper line, and put the footer links on one line.
4. **Roadmap: the stage count contradicts the track.**
   - *Page/shot:* roadmap-1440 ("Arrival · 10 tasks" under a track saying "Arrival 4 tasks").
   - *Why:* Trust comes first (PRODUCT.md principle 1). A planner who sees two different counts for the same stage, and before-you-fly tasks listed as Arrival tasks, starts doubting the roadmap.
   - *Fix:* In `buildItinerary`, keep the open tasks carried over from earlier stages, but label them honestly. Either give them their own group ("Still open from Before you flew · 6 tasks") above the current stage, or title the group "Arrival · 4 tasks + 6 still open from Before you flew". Show the stage name in each carried row's meta.
5. **Onboarding on phones: no Back button and no fixed action bar.**
   - *Page/shot:* rail-390, rail-date-390 vs StRailPhone board.
   - *Why:* The board's fixed bar holds a back chevron and a full-width Continue. The app hides Back (`max-narrow:hidden`) and leaves the action inline, so on a phone the only way back is browser back or the header "Change" for one answer. This is a clear board mismatch on the one-minute phone flow.
   - *Fix:* On phones (under 561 px) render the action row as a fixed bottom bar: a white bar with a hairline top and 16 px padding, a 44 px square back button with a chevron (Home on step 1), and a full-width primary Continue. Add bottom padding to `main` equal to the bar's height. Respect `env(safe-area-inset-bottom)`.

### P2
6. **Preview:** the Start-here card is grey with no border, and the leg markers are grey/ink. *Why:* The board uses teal to mark the starting point; grey makes it look disabled. *Fix:* Give the start card the teal wash with a teal hairline (`border-avatar`/teal token as on the board). Make the leg rings teal and the current marker filled teal. Use a dashed marker for the waiting task. Put the "N tasks for a …" count first in the subtitle.
7. **Home and Roadmap tracks:** the "You're here" pill and the Today line disagree, and "Before you flew · now" shows after landing. *Why:* The one-minute check-in reader can't tell where they are. *Fix:* After arrival, label the stage holding overdue tasks "Before you flew · still open" and place "now" on the calendar stage (as the board does with "Week 1 · now"). Or move the pill to the Today line and mark the carried-over tasks separately. Make the "now" stage label teal and left-align the stage labels under their segments.
8. **Task page type and number styling.** *Why:* It drifts from the board and is harder to scan. Baseline citations wrap alone onto lines and read as stray digits. *Fix:* Style step numbers as teal semibold in a hanging column. Make citations superscript (`align-super`, keep the 24 px hit area with negative margins). Make the side card titles `text-section` (18). Use teal link styling for "N more sources". Restore the number column and dividers in Sources. Label the buttons "Next task"/"Previous" at the default size. Format the breadcrumb as "Roadmap / Arrival · task n of m".
9. **Task page on phones:** the card touches the header. *Fix:* Add 16 px top margin (`mt-4`) under the header at phone width.
10. **Question steps at 1440:** the content is top-aligned, rows are 48 px with small radios, and upcoming rail labels are 13. *Fix:* Centre the question block vertically in the pane (as on the board). Make option rows `min-h-15` with 20 px radios (shared `option-row.tsx`, which fixes Settings too). Set the upcoming rail labels to 15.
11. **Settings:** the radios are 13 px, and the phone's "Visa" label is teal when idle. *Fix:* 20 px radios via `option-row.tsx`. Apply the teal label only in the `changing` state.
12. **Home greeting adds the first name** (the board has none). Email-only users get their email local part. *Fix:* Follow the board ("Welcome to Auckland"), or use the name only when `full_name` exists, never the email local part.
13. **Home on phones:** the track is cramped, the "You're here" pill covers the track start, and the next-move body is larger than the board's. *Fix:* Increase the phone track height as on the board. Clamp the pill inside the card padding. Set the next-move body to 15 (board size).
14. **Unlocks are missing after sign-in:** the preview says "The next task waits on this one", but Home and Roadmap show no "Unlocks" line or arcs for the same task. *Fix:* Check `unlocksOf` with the signed-in route. If the dependency is real, show it; if it drops after arrival, change the preview copy.

### P3
15. **Calendar:** days outside the month are not faded as much as on the board, and "1" renders teal. *Fix:* Use a lighter token for `data-outside` and check the teal state on the trailing day.
16. **Bottom-nav icons** differ from the board (route glyph and cog vs curve and sliders). *Fix:* Use the board's icons.
17. **Roadmap subtitle** "Done some already?…" is not on the board (the owner keeps it or drops it).
18. **Card padding rule vs board:** the rule says padding 20 (16 on phones), but the Settings dark card (`p-8`), the Settings editor (`p-10 px-14`) and the Task card (`px-10 py-9`) follow the boards' 28–56 px padding instead. *Fix:* The owner says which wins; then align the code or the rule.
19. **Landing:** the topographic lines don't extend behind the hero copy as they do on the board.
20. **Task (phone):** the back link uses a "‹" text glyph rather than the chevron icon.

## Where I agree and disagree with the implementer's critique.md

- **Agree:** no P0. The width and gutter decision goes to the owner, and the target-size fixes are correct. Reduced motion is respected: `motion-safe:animate-pulse` and the reduce media queries cover aurora, skeleton and stamp. Light only. The type tokens are in @theme. Design specificity is strong (track, pill, unlock arcs, dark answers rail).
- **Disagree: "P1: none."** Five clear board mismatches are missing from it. The Sign in and Save structures (no Card, wrong submit style and label, missing divider) are wrong. The landing hero preview is a different component. Phone onboarding has no Back button or fixed bar. The Roadmap stage count contradicts the track. The gate README calls landing, sign in and save "Type scale only, as specced", which the screenshots disprove.
- **Disagree: consistency 3, user control 4, Responsive 3, Implementation integrity 4.** The board-fidelity gaps and the phone onboarding missing Back pull these down (scores below). A clean detector with 0 findings shows the code has no anti-patterns; it does not show the screens match the boards.
- **Not covered by it:** the Preview colour states, the pill vs Today-line disagreement, the task-page typography drift, the phone card butting the header, the Settings radio size, and the greeting falling back to the email local part.
- **Unverified here:** the axe and type-scale e2e results (0 violations, 0 offenders). They were not re-run. Nothing in the shots contradicts them, except that the landing phone intro and the Home phone body look larger than the board (still in-scale sizes, so not a rule breach).

## Scores

### Nielsen heuristics (0–4)
| # | Heuristic | Score | Key issue |
|---|---|---|---|
| 1 | Visibility of system status | 3 | Pill vs Today line vs "now" label disagree on day 1 |
| 2 | Match with the real world | 3 | "Before you flew · now" after landing |
| 3 | User control and freedom | 2 | No Back on phone onboarding |
| 4 | Consistency and standards | 2 | Public pages diverge from boards; stage counts disagree |
| 5 | Error prevention | 3 | "Sign in" on Save hides that submitting saves |
| 6 | Recognition rather than recall | 3 | Save summary below the form on phones |
| 7 | Flexibility and efficiency | 3 | Ask `/` shortcut; Prev/Next on tasks |
| 8 | Aesthetic and minimalist design | 3 | Calm; drifts from the board's teal state language |
| 9 | Error recovery | 3 | ApiDown retry; not exercised in shots |
| 10 | Help and documentation | 3 | Cited sources beside steps; citations hard to read |
| **Total** | | **28/40** | Good, with board-fidelity work needed |

### Audit dimensions (0–4)
| # | Dimension | Score | Key finding |
|---|---|---|---|
| 1 | Accessibility | 3 | axe clean (reported); 24 px targets fixed; small 13–16 px radios rely on whole-row targets |
| 2 | Performance | 3 | Not profiled; no heavy media |
| 3 | Theming | 3 | Tokens in @theme, light only; `.gsi` raw values are a documented exception; card padding off the stated rule |
| 4 | Responsive design | 2 | Phone onboarding has no fixed bar or Back; the phone task card touches the header; the phone Save summary comes after the form |
| 5 | Implementation integrity | 2 | Signed-in pages are faithful; three public pages and the onboarding phone diverge from the approved boards (CW02′) |
| **Total** | | **13/20** | Acceptable: fix the P1s before the gate passes |

P0: 0, P1: 5

## Fix round 2

DEGRADED: single-context (the brief forbids sub-agents, so Assessments A and B ran in one context). Assessment A: impeccable `critique` on the re-shot home, roadmap, task and settings shots (1440 and 390) against their boards. Assessment B: `impeccable detect --json` over `components/workspace`, `components/route`, `components/settings` returned `[]`. Axe (wcag2a/aa/21aa/22aa, including target size) passes on every page at 1440 and 390 in e2e. Landing, Sign in, Save and the onboarding phone Back stay as the controller ruled (spec non-goals), so they are not re-listed.

Fixed in this round: #4 (group title counts the stage's own tasks, carried rows named by stage), #7 labels (left-aligned under the segment, current "now" label teal), #8 (breadcrumb "Roadmap / Arrival · task n of N", "Next task", teal superscript citations with a space before, teal hanging step numbers), #9 (16 px gap), #11 phone label teal only when editing, #12 greeting, #13 body size. #14 is not a signed-in bug (see report).

### P0
None.

### P1
None.

### P2
1. **Home and Roadmap: "now" and "You're here" still sit on the "Before you flew" stage while the Today line sits at Arrival (day 1).** The place markers still disagree (#7, the part the brief excluded: You/Today formulas untouched). *Fix, if the owner wants it:* label the stage holding only overdue tasks "still open" and put "now" on the calendar stage.
2. **Task page Sources card (1440):** the card title "Sources" is 15 (board 18), the number column and row dividers are gone, domain lines are added, and "5 more sources" is an ink ghost button (board: teal link). The "Ask about your IRD number" title also differs from the board's "Ask about this task". Not in this round's list.
3. **Settings editor (1440):** radios are about 13 px (board 20) and the option column is narrower (Card `px-14`). Same `option-row.tsx` fix as the Build my roadmap rows.

### P3
4. **Stage row under the road (1440):** with equal-to-segment columns, the short Arrival segment's "4 tasks · 29–30 Oct" ends about 6 px before "Week 1" begins. It wraps at the dot when narrower, but at 1440 it reads tight. The board has more air because its labels carry fewer words.
5. **Roadmap phone, carried title:** "Arrival · 4 tasks" at 18 with ", 6 still open from Before you flew" at 13 wraps over two lines with an uneven baseline. A second line of 13 muted text under the title would read cleaner.
6. **Task page:** raised citations add a little uneven line spacing in step lists (superscript on a 1.5 line-height). Acceptable; `leading-none` on the link limits it.
7. **Home (1440):** "Then this week" markers are 12 px hollow dots (board 20 px circles); Start task and Ask about this are about 40 px tall (board 44). Recently done shows the empty state (board: 4 tiles) because of the day-1 test data.
8. **Home and Roadmap phone:** the "You're here" pill is inside the card padding but still covers the start of the road; the phone track is small next to the board.
9. **Still open from the first critique, unchanged:** bottom-nav icons (#16), Roadmap subtitle "Done some already?" (#17), card padding rule vs board (#18), task page scrolls as a whole, task main column about 676 px vs 803 (width decision), calendar fade (#15), and the known width and gutter decisions.
