# Size roles + desktop density: impeccable critique (2026-11-01)

Method: dual-agent (A: design review sub-agent · B: detector + browser sub-agent), isolated, run in parallel.
Target: feat/desktop-density uncommitted diff (apps/web/src/app/globals.css size roles + ~28 components).
Evidence: 79 full-page shots of every page/state at 390/1024/1440 (pass2 harness), detector CLI + URL scans, overlay on 5 pages at 1440/390, axe on 5 pages.

## Synthesis

Nielsen total 29/40 (Good). Detector: changed .tsx clean (0 findings); live pages only `overused-font` (Geist, token-fixed, false positive) and /privacy `line-length` (pre-existing, out of scope).

| ID | Sev | Finding | Source | Status |
|---|---|---|---|---|
| C1 | P1 | Desktop sizes keyed on width only: touch iPads / touch laptops at 1024+ got 32–36 px targets | A P1-1, audit P2-1 (agree) | FIXED: control/bar sizes moved to `@media (width >= 1024px) and (pointer: fine)`; type, containers and columns stay width-only. Verified: 1180 touch → control 40 / header 56; 1440 and 1180 mouse unchanged (36/44). |
| C2 | P1 (A) | Desktop `--text-ui` 13 sits 1 px above small 12; home "why" line 13 px muted (home-view.tsx:75) while empty state is 15 | A P1-2 | KEPT by owner 2026-11-01 (macOS HIG Body 13); revisit in the whole-app UI review phase. |
| C3 | P2 | 360 side columns wrap Settings visa name, task source title orphans ↗, guide chip truncates | A P2-1 | Logged (known, owner left as-is 2026-11-01) |
| C4 | P2 | Sign-in fields 36 (target role) next to 44 px buttons; were all 44 on main | A P2-2 | Logged |
| C5 | P2 | Ask bar `#guide-ask` outside every landmark at 1440 (axe `region`, best-practice, not WCAG) | B | Logged; pre-existing (guide-shell.tsx renders AskBar after `<main>`, unchanged here) |
| C6 | P3 | Raw `size-8`/`size-8.5`/`h-8` escape the roles: ask-bar.tsx:78,167, guide-pane.tsx:25, app-header.tsx:108, composer.tsx:122, sign-in-form.tsx:119 | A P3-1, audit P2-4 (agree) | Logged |
| C7 | — | Task guide column shots caught mid fade-in (looks faded) | A | Not a defect; same on main |

Detector false positives: `overused-font` (Geist is the chosen font), overlay-induced axe `region`/`scrollable-region-focusable` on `.impeccable-overlay` (discarded, axe re-run first).

Not checked: real iPad hardware; tablet widths 561–1023 visually (no shots); 13 px contrast measured; /onboarding and /privacy with overlay/axe; .impeccable/critique snapshot not written (gate file is the record).

---

# Assessment A (full output)

# Assessment A: design review of "component size roles + desktop density" (feat/desktop-density, uncommitted)

Scope: whole-app density change. Evidence: shots in `scratchpad/shots/now-<w>-<state>.png` and `now-pass2-<w>.json`; source in `apps/web/src`. All line numbers are from the working tree.

## Design-specificity verdict

**Specific, and mostly coherent.** The size roles are a real system, not a one-off shrink. There is one table in `globals.css:148-175` and three tiers. `size-roles.test.ts` guards it, and the pass-2 census shows it holds. At 1440 the interactive heights fall into five values (32/36/44/52/60), with no stray 40s or 48s. The header and footer measure 45 (44 plus a 1 px border) on every page. The 1072 column with ~184 px margins at 1440 calms the screen, and the "too big at 100%" complaint is answered (`now-1440-in_app.png`, `now-1440-out_.png`).

The weakness is that the system is calibrated to the wrong reference for two things. First, the type steps come from **native macOS** (body 13, comment at `globals.css:249-251`), not from apple.com. The brief states apple.com's web steps as 17/14/12. This is a reading-heavy product for ESL users, and it ends up with 13 px UI text and 13 px key explanations. Second, the density switch is keyed on **width only** (`@media (width >= 1024px)`, `globals.css:251`). So "desktop" also means iPad landscape and touch laptops.

## Nielsen heuristics (0-4)

| # | Heuristic | Score | Key issue |
|---|---|---|---|
| 1 | Visibility of system status | 3 | Clear status throughout: "0 of 19 done · day 1", "Not started / Best done by", "18 left today". The 12 px small role carries much of it ("You can undo this.", "Best done by Sat 14 Nov") and is now only 1 px under the 13 ui text, so status meta and body chrome blur together. |
| 2 | Match with real world | 3 | Plain, official-source language. "Before you flew · still open" wraps to two lines in the 1072 track at 1440 and 1024 (`now-1440-in_app.png`, `now-1024-in_app.png`) and reads awkwardly. |
| 3 | User control and freedom | 3 | Back/Previous/Next/Cancel are everywhere. On desktop, Previous/Next shrank to `size: "sm"` (32 px, 13 px label, `task-sheet.tsx:296,306`) beside a 15 px breadcrumb, so the main way to move between tasks is now the smallest control on the page. |
| 4 | Consistency and standards | 2 | Sign-in mixes 36 px inputs with 44 px buttons in one stack (`now-1440-out_signin.png`; `sign-in-form.tsx:71,75` use the `target` role on inputs, which should be `control`). In the same form, the primary "Sign in" label is a different size from the GSI "Continue with Google" label (fixed 15 px). Several hard-coded sizes escape the roles: `size-8` send/close/avatar (`ask-bar.tsx:78,167`, `guide-pane.tsx:25`, `app-header.tsx:108`) and `size-8.5` send (`composer.tsx:122`). |
| 5 | Error prevention | 3 | The "Save and rebuild" / Cancel pair and the delete confirmation are intact. Density did not touch these paths. |
| 6 | Recognition rather than recall | 3 | The answer rail, breadcrumbs and "Changing" tags are good. In the 360 settings column, values wrap ("Accredited Employer Work / Visa (AEWV)", "0 things the guide / remembers"), so rows are uneven and harder to scan (`now-1440-in_settings_edit_occupation.png`). |
| 7 | Flexibility and efficiency | 3 | The "/" shortcut on the ask bar and Expand on the guide column are good. Desktop gains density but loses target comfort for touch-capable desktops (see P1-1). |
| 8 | Aesthetic and minimalist design | 3 | Calmer and more premium at 1440. On a 44 px header, the bordered 36 px "Sign in" button leaves 4 px above and below and looks jammed (`now-1440-out_.png`). The 22 px app title against the 48 px landing hero is a big jump between marketing and product (probably intended). |
| 9 | Error recovery | 3 | No change. The error/alert copy uses `text-small` (12 px, `task-sheet.tsx:254`), which is small for an error a stressed user must read. |
| 10 | Help and documentation | 3 | Guide is always reachable and "What I can't tell you" is honest. In the 360 task column, the guide's context chip truncates to "Apply for your IRD nu…" (`now-1440-in_task_guide_column.png`, `now-1024-in_task_guide_column.png`). |
| | **Total** | **29/40** | A solid product. Density lands well on the big picture and introduces small consistency and readability costs. |

## Cognitive load

- **Onboarding Q1 shows 8 visa options** (`now-1440-out_onboarding_step_1.png`). That is over the 4-option threshold, but it is a single radio list with a "Another visa" escape, so the load is acceptable. Pre-existing.
- **Settings work editor shows 5 options**, plus two actions, plus 6 rows still visible in the left column (`now-1440-in_settings_edit_occupation.png`). Acceptable because the edited row is highlighted ("Changing").
- **Task page desktop**: breadcrumb, Previous, Next, Mark as done, Open the IRD application, 5 sources + "5 more sources", the ask bar and 10 inline citation numbers. That is a lot of targets, but they are grouped well. The new 360 side column pushes the source titles to wrap ("New arrival to New Zealand: IRD number application ↗" wraps with an orphaned icon, `now-1440-in_app_roadmap_task_T08.png`).
- **Account menu**: 5 items in 3 groups, so fine (`now-1024-in_account_menu.png`).

## Emotional journey

- **Landing → onboarding → preview** is calm and confident. The 44 px "Build my roadmap" is the clear primary, and the preview's "Save my roadmap" card is a good peak moment (`now-1440-out_preview.png`).
- **First home visit**: "Welcome to Auckland" plus the track is warm. But in the "next move" card, the one sentence that tells a nervous user *why* this task matters is the smallest text in the card. It is `text-ui` at 13 px (`home-view.tsx:75`), while the empty-state line "Nothing yet. Tasks you finish show up here" is 15 px (`home-view.tsx:179`). So the reassurance copy shouts and the guidance whispers. This ratio existed before (14 vs 16), but at 13 px it now crosses into strain for ESL readers at a desk.
- **Task page** is still the trust anchor: big readable steps at 15, sources visible. Good.
- **Low point**: the Settings column at 360 makes "Your plan" look cramped and wrappy. That undercuts the "calm, checked expert" feel exactly where a stressed user is changing their visa or arrival date.

## Strengths

1. **A real role system with a guard.** One table, three tiers and a test. The pass-2 census at 1440 shows only intended heights (`now-pass2-1440.json`: buttons 32/36/44, inputs 36, header/footer 45 everywhere). This is the right way to make a one-place "look swap".
2. **The crisis `touch` role never shrinks** (`crisis-card.tsx`, `--spacing-touch: 44px` in all tiers). It is the correct exception, documented in place.
3. **Phone looks preserved**: the home, guide sheet and task shots at 390 match the established premium phone look (`now-390-in_app.png`, `now-390-in_guide_sheet.png`). Tablet values equal the old min-h-10/8/14 classes, so 561-1023 is effectively unchanged.

## Priority issues

### P1-1: Desktop density is keyed on width, so iPad landscape and touch laptops get 32-36 px touch targets
- **What:** `@media (width >= 1024px)` (`globals.css:251`) sets control 36, target 36 and row 36, and control-sm stays 32. That covers iPad Air/Pro landscape (1180/1366) and iPad Pro 12.9 portrait (1024), plus touchscreen Windows laptops. Source chips are 32×31 and the guide Close is 32×32 (`now-pass2-1440.json`).
- **Why it matters:** It passes WCAG 2.5.8 (24 px), but the project's own rule is "phones keep 44 px (Apple HIG)". A migrant who plans on an iPad, the "planning ahead" half of the users, gets a desktop-mouse UI. Apple's own 36 px buttons on apple.com assume a pointer.
- **Fix:** Keep the type and container steps on width. Move the size steps into `@media (width >= 1024px) and (pointer: fine)`, or add `@media (pointer: coarse) { :root { --spacing-control: 44px; --spacing-control-sm: 44px; --spacing-target: 44px; --spacing-row: 44px; } }` after the desktop block in `globals.css`. Add one Playwright case with `hasTouch: true` at 1180×820.
- **Evidence:** `now-1440-in_app_roadmap_task_T08.png` (source chips, Previous/Next), `now-1440-in_guide_full_view.png` (Close 32).

### P1-2: 13 px `text-ui` now carries primary explanatory content on desktop, and the type ladder has collapsed
- **What:** Desktop steps are title 22 / featured 17 / section 15 / body 15 / ui 13 / small 12 (`globals.css:252-258`). Section equals body (weight is the only difference), and ui is only 1 px above small. The home "why" sentence (`home-view.tsx:75`), settings labels (`settings-row.ts:5`) and status text (`task-sheet.tsx:265`) sit at 13. Meta, status, errors and "You can undo this." sit at 12.
- **Why it matters:** The users are often ESL and stressed, and the desk is where they plan. HIG Body 13 is a native-macOS size viewed with system font rendering. The brief's own reference, apple.com, uses 17/14/12 on the web. 13 px muted grey (`text-fg-muted`) for the sentence that explains *why* the next task matters is the riskiest choice in the change.
- **Fix:** Keep body and reading at 15 and raise `--text-ui` to 14 at desktop (`globals.css`, desktop block). That restores a 15/14/12 ladder and matches apple.com's 14 nav/UI. Separately, promote `top.why` on Home to `text-body` (`home-view.tsx:75`) so it outranks the empty-state line. Alert copy (`task-sheet.tsx:254`) should be `text-ui` or larger, not `text-small`.
- **Evidence:** `now-1440-in_app.png` (why line vs "Nothing yet." line), `now-1440-in_app_roadmap_task_T08.png` ("You can undo this.", "Best done by"), `now-1440-in_settings.png`.

### P2-1: The 360 side columns are too narrow for real content (settings, task, guide column)
- **What:** Settings went from 440 to 360 (`globals.css:271`), and task and home from 400/440 to 360 (`:270,272`). With a 104 px label (`settings-row.ts:5`, `w-26`) plus 20 px padding, the value field is ~190 px. "Accredited Employer Work Visa (AEWV)", "Another job or profession" and "0 things the guide remembers" all wrap, so 48 px rows grow to ~72 px and row rhythm is lost. The delete card copy wraps to 4 lines. In the task column, a source title wraps and orphans its ↗ icon. The guide chip truncates the task name, and Mark as done and Open the IRD application are squeezed side by side.
- **Why it matters:** The density goal was calmer. Ragged two-line rows read as cramped, not calm, and truncating the task name hides context exactly when the user asks about it.
- **Fix:** Use 400 for settings and task at desktop (the 1024 content still leaves 624/664 for the main column), or make the settings label column `w-22` at desktop. Alternatively, keep 360 and stack label over value at desktop the way phone does (`ROW_PHONE_LABEL`). Files: `globals.css:270-272`, `settings-row.ts`.
- **Evidence:** `now-1440-in_settings_edit_occupation.png`, `now-1440-in_settings.png`, `now-1440-in_task_guide_column.png`, `now-1024-in_task_guide_column.png`, `now-1440-in_app_roadmap_task_T08.png`.

### P2-2: Form control heights disagree on sign-in (36 inputs, 44 buttons)
- **What:** Email and password use `min-h-target` (`sign-in-form.tsx:71,75`), so they are 36 at desktop. Both buttons are `control-lg`, so they are 44. Before this change all four were 44 (`min-h-11`).
- **Why it matters:** Sign-in is the first form a new user meets. The mismatched stack looks unfinished, and inputs are the things people must click precisely. `target` is also the wrong role: per the table, inputs are `control`.
- **Fix:** On sign-in, use `min-h-control-lg` for both fields so the stack is uniformly 44. Or, at minimum, use `min-h-control` so the role is right.
- **Evidence:** `now-1440-out_signin.png`, `now-1440-out_signin_with_answers.png`, `now-pass2-1440.json` (input 36, button 44).

### P3-1: Hard-coded sizes escape the role system
- `size-8` on ask-bar send/brand (`ask-bar.tsx:78,167`), guide Close (`guide-pane.tsx:25`) and the header avatar (`app-header.tsx:108`), and `size-8.5` on composer send (`composer.tsx:122`). They work (the ::after expands some of them), but they will not follow a future "one-place swap". Either extend `size-roles.test.ts` to catch `size-N` on interactive elements, or map them to `control-sm`.

## Persona red flags

- **Jordan (first-timer):** Moves landing → onboarding → preview with no friction. Red flag: on the 1440 landing, "Sign in" is a bordered 36 px button jammed in a 44 px header, and on sign-in the field/button heights mismatch. Both make the first impression feel slightly unfinished (`now-1440-out_.png`, `now-1440-out_signin.png`).
- **Casey (mobile):** At 390, nothing regressed visibly. Pre-existing on phone: the "Your roadmap preview" back link is `h-8` (32 px, `sign-in-form.tsx:119`), and the source chips are 32×31 on the task page at 390 (`now-pass2-390.json`). Both are below the project's own 44 phone rule. Not introduced by this change. Casey on an iPad in landscape hits P1-1.
- **Sam (accessibility):** Still meets 2.5.8 everywhere (smallest effective target is about 31 wide on source chips). Concerns: (a) 12 px muted text carries status and errors, (b) at 13 px, ui text in `fg-muted` grey needs its contrast re-checked at the smaller size (the AA ratio is unchanged, but legibility at 13 is lower), (c) keyboard-focus clearance under the ask bar was correctly re-derived from the role (`--spacing-ask-bar-clear: calc(var(--spacing-ask-bar-height) + 28px)`). Good.
- **Project persona: Priya, stressed ESL migrant on a 13" laptop at 100%, day 3, trying to work out IRD.** She now gets a calmer page, which is the win. But the sentence on Home that tells her why the task matters is 13 px grey. The "Best done by" deadline is 12 px. In Settings, her visa name breaks across two lines. Browser zoom is her only lever, and she may not know it. She would not contact support, but she would trust the page a little less and read more slowly.

## Minor observations

- The home subline "0 of 19 done · day 1 since you landed on Sun 1 Nov" at body 15 sits on the 22 px title baseline and reads almost as loud as the title at 1440 (`now-1440-in_app.png`). Consider `text-ui`.
- On the preview page at 1440, the footer's left edge (~184 px) aligns with neither the dark rail's content (48) nor the main column (~560). The footer runs under the rail (`now-1440-out_preview.png`). Pre-existing layout; it is more noticeable now that the container narrowed.
- In the guide full view at 1440, the rail's "Back to Home" and the page's 44 header are fine. Rail question cards are 52-54 px against 36 px rows elsewhere, an intentional rich-row exception that should be written into the role table (`now-pass2-1440.json`, `min-h-control-sm h-auto`).
- `now-1440-in_task_guide_column.png` and `now-1024-in_task_guide_column.png` captured the guide column mid fade-in (`motion-safe:animate-in`), so it looks disabled. This is a screenshot timing artefact, not a bug. Re-shoot after the animation for the owner review.
- No tablet (561-1023) shots exist. The token math says it is unchanged from main, but there is no rendered proof (for example at 768 or 820).
- The `public-footer.tsx:10` comment still talks about "44 in the 36 px line" with the `footer` role. It is accurate but now mixes two roles. Fine.

## Provocative questions

1. You cited apple.com for the sizes but macOS HIG for the type. Which one is LandedNZ? A website people read, or a native utility people operate? If it is a website, why is UI text 13 and not apple.com's 14?
2. Is "desktop" a width or an input method? Would the owner accept 36 px targets for a user planning on an iPad on the couch?
3. 360 px side columns came from "apple.com ~980". Apple's side panels hold short labels, but yours hold visa names and source titles. Should content length set the column width, not a reference site?
4. Section and body are both 15 at desktop. Is weight alone enough to carry "Steps / Have ready / Good to know" for a skimming ESL reader, or should section be 17 (the featured step) on the task page?
5. If phone is the premium surface, does a denser desktop risk making the desk session (the "planning ahead" half of the usage) feel like the lesser product?

---
Not checked: live tablet widths (no shots), contrast measurement at the new 13 px size, and a byte-for-byte phone diff against main (taken on trust from the brief and visual match).

---

# Assessment B (full output)

# Assessment B: detector and browser evidence (feat/desktop-density, 2026-11-01)

## 1. CLI scan (26 changed markup files)
Command: `impeccable detect --json <26 files>` from the repo root.
Result: exit 0, raw JSON `[]`. No findings in any file (0 rules, 0 locations).

## 2. Rendered scan
### 2a. CLI given URLs (it accepts URLs)
| URL | exit | findings |
|---|---|---|
| / | 2 | 1: overused-font (warning, slop) on body, "Primary font: geist sans (100% of text)" |
| /signin | 0 | none |
| /onboarding | 2 | 1: overused-font (same) |
| /privacy | 2 | 3: line-length x2 (warning, quality): `p:nth-of-type(2)` ~90 chars on 3 of 3 lines, `p:nth-of-type(3)` ~92 chars on 2 of 3 lines; overused-font x1 |

### 2b. Overlay (live-server on port 8400, detect.js injected through Playwright, 3 s wait)
Pages checked at 1440x820 and 390x844: /, /signin, /app, /app/roadmap?task=T08, /settings. The signed-in pages used the e2e test user (resetTestUser, holdAnswers, signIn).
| page | 1440 | 390 |
|---|---|---|
| / | 1 anti-pattern: overused-font (Geist Sans, 100%) | same |
| /signin | "No anti-patterns found." | same |
| /app | overused-font | same |
| /app/roadmap?task=T08 | overused-font | same |
| /settings | overused-font | same |
No other console messages (no errors) were captured after injection.

## 3. axe (@axe-core/playwright ^4.13.0), run before the overlay was injected
| page | 1440 | 390 |
|---|---|---|
| / | 0 | 0 |
| /signin | 0 | 0 |
| /app | region (moderate), target `#guide-ask` | 0 |
| /app/roadmap?task=T08 | region (moderate), target `#guide-ask` | 0 |
| /settings | 0 | 0 |
On desktop the ask-bar textarea (apps/web/src/components/guide/ask-bar.tsx:129, rendered from guide-shell.tsx:142) sits outside every landmark. At 390 it is inside one.

In the first run axe ran after the overlay was injected. That added `region` and `scrollable-region-focusable` (serious, 390 only) violations on `.impeccable-overlay > div:nth-child(2)`. These come from the detector overlay, not the app, so they are discarded. The second run avoided them by running axe first.

## Which findings I judge false positives
- **overused-font (Geist Sans):** this is a style judgement, not a defect. Geist is the chosen, token-fixed project font (memory: "tokens fixed" guardrail), and this branch did not change it. Treat it as noise for this critique unless the owner wants to revisit the typeface. It also does not appear in the CLI file scan; it only shows up on rendered pages. /signin gets no flag, probably because it has too little text to measure.
- **line-length on /privacy:** this is likely a real issue (lines of about 90 characters), but /privacy is not in the changed-file list. It is pre-existing and out of scope for this branch.
- **axe region on #guide-ask (desktop):** this is a real moderate a11y finding and is in scope, because ask-bar.tsx was changed. Wrapping the desktop ask bar in a landmark (for example `<section aria-label>` / `<search>`, or placing it inside `<main>`) would clear it. I did not check whether it is new on this branch or already existed.
- **Overlay-caused axe hits:** false positives, as described above.

## Skipped or failed steps
- /onboarding and /privacy were scanned by the CLI URL mode only, not by the overlay or axe. The brief asked for 3-5 representative pages and I covered 5.
- The 1024 width was not covered (not requested).
- The impeccable console lines inside the group are logged as `%c<rule>%c <detail>` plus a JSHandle node. The first run filtered on "impeccable" and dropped them. The rerun captured them in full.

## Cleanup
- `impeccable live-server stop --keep-inject` printed "Stopped live server on port 8400." Afterwards pid 65990 was not running and `curl :8400/detect.js` failed to connect.
- The temp directory scratchpad/b (spec, config, results) and scratchpad/cli.json have been deleted. No project files were edited.
