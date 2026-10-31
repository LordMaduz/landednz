# Guide full view: left rail critique (2026-10-31)

Method: dual-agent (A: design review sub-agent · B: detector + Playwright sub-agent), run in isolation, then combined here.
Target: `apps/web/src/components/guide/focused-view.tsx` (rail column, lines 47-85). Mode: Operate.
Evidence: `before/` screenshots (1440/1280/1024 × Everything, task selected, expanded from a task page). Seeded turns: T09 ×2, T28 ×1, T08 ×2. The brief named T03 and T05, but both are `retired: true` in content, so T28 and T09 stand in. They are the longest live titles for the e2e profile.

## Design health score: 22/40 (Acceptable)

| # | Heuristic | Score | Key issue |
|---|---|---|---|
| 1 | System status | 2 | Selected row is a white fill + #E3E8EA ring on #F6F8F8: hard to see. "Everything 1" when opened from a task (only loaded turns counted). |
| 2 | Real world | 2 | Bare counts with no unit; "Everything" is vague; one task has two names (row vs starters). |
| 3 | User control | 2 | Overlapping exits: Back + pane × + header Guide ×; from a task, Back + Collapse do the same thing. |
| 4 | Consistency | 2 | Two list styles (pills vs hairline rows) and two label styles (600 vs 400) in one column. |
| 5 | Error prevention | 3 | Starter click spends a daily question with no signal; accepted behaviour. |
| 6 | Recognition | 1 | Task titles cropped exactly where they differ ("(IR330)", "eVisa record"); no tooltip. |
| 7 | Efficiency | 2 | No link from a group to its task; one tab stop per row. |
| 8 | Minimalism | 2 | Back is the heaviest object; ~250 px empty wash above a lone footer line. |
| 9 | Error recovery | 3 | No loading cue while Everything loads full history. |
| 10 | Help | 3 | Try asking is good built-in help; sync line placed where nobody reads it. |

## Design specificity verdict

**Mostly generic (A).** Change the text and any chat app's history sidebar looks like this. The one LandedNZ idea, "your conversation organised by your tasks", is drawn as a list of cropped strings with no link to the roadmap's look (no status, no stage).
**Detector (B):** CLI `impeccable detect` finds 0 issues in focused-view.tsx and guide-pane.tsx. Live overlay (injected via Playwright): 1 page-wide `overused-font` (Geist 100%). That one is a false positive for this pass, because type tokens are fixed. axe (WCAG 2.2 AA, scoped to #guide-pane): 0 violations, 18 passes. The detector caught nothing the review missed. The review's problems are hierarchy and IA, which a rule scan cannot see.

## What's working
1. Grouping by settlement task is the right idea, and the markup is sound: labelled `<nav>`, `aria-pressed` toggles, real buttons, a visible 2 px teal focus ring, and DOM-order tab flow.
2. Tokens only, no decoration. All targets ≥ 32 px (WCAG 2.5.8). Muted text 6.07:1.
3. Starters stay after the first answer, and the current follow-up is removed from them.

## Priority issues

**[P1] Task titles cropped at every width.** The rail is a fixed 280 px (`--grid-template-columns-focus`), which leaves 212 px for the title. Measured: "Give your employer a tax code (IR330)" 243/212 px, "Check your visa conditions in your eVisa record" 301/212 px, the same at 1440, 1280 and 1024. Selecting a row bolds it (500) and crops it earlier. No `title`.
Fix: wrap titles to 2 lines (line-clamp-2 + `title` fallback), show selection without a weight change, and optionally widen the rail at ≥1280 (token change). → adapt, typeset

**[P1] Too many exits; Back is the loudest control.** From Home, three controls close the guide; from a task, Back = Collapse. Back is the only bordered, white-filled element.
Fix: Back becomes a quiet breadcrumb-style link, one exit per kind. The header Guide × stays (app chrome). → distill

**[P2] "Everything" placement and counts.** It sits last as if it were a fourth task. Counts are bare numbers; the screen reader hears "…number 2". From a task page it shows "Everything 1" while the user has 5 questions (B measured this; `turns.length` before `showAll`).
Fix (UI only): put All first, call it "All questions", add sr-only "questions", and hide the All count until `historyLoaded === "all"`. A true total before loading needs an API count, which is a **behaviour change and out of scope**. → clarify

**[P2] Selected state has weak contrast.** White fill + #E3E8EA ring on #F6F8F8 is well under 3:1 (WCAG 1.4.11). Hover uses the same white. axe does not test this.
Fix: give selection an indicator ≥3:1 (e.g. a 2–3 px teal inline-start bar or ink-tinted fill) and make hover distinct from it. → polish

**[P2] Two list styles and two label styles.** Pills vs hairline-divided starters; "This conversation, by task" 600 vs "Try asking" 400 (both h2, 12 px, measured). Starters wrap to 3 lines (62–82 px tall) with nested straight quotes.
Fix: one label style and one row language; starters read as "send" (arrow kept). → polish, layout

**[P3] Empty wash + orphan footer.** ~250 px of empty space, then "One conversation, on every device." on its own line.
Fix: remove it, or move it under the section label as helper text. → distill

## Persona red flags
- **Alex (power user):** cannot tell cropped visa/tax tasks apart without clicking; no way from a group to its task page.
- **Sam (keyboard/SR):** button names end in a bare number; the selected state is barely visible to low-vision keyboard users. Tab order is fine; focus ring fine.
- **Jordan (first-timer):** does not know what the numbers count or that a row filters rather than opens; "Everything" at the bottom looks like a task; several × and Back with no clue which keeps the conversation.
- **Tired migrant, English as second language:** mid-word crops ("in y…") are hard to complete; T28 is "Check your visa conditions in your eVisa record" in the row and chip but "Read your visa conditions on Immigration NZ" in all 3 starters. Verified: starters come from the API (content YAML `name`, `apps/api/src/core/prompts/registry.ts:153`) and the row from web `TASK_COPY`. Changing this is a **backend/content change, out of UI scope**.

## Minor observations
- The count `<small>` baseline sits high against 14 px row text.
- Heading text and `nav` aria-label repeat the same string; use `aria-labelledby`.
- After the rail, Tab goes to the pane's Close, skipping the conversation (DOM order; not a rail fix).
- Composer chip is not cropped (has `truncate` + `title`), so no change is needed.

## Questions to consider
1. Is a count the most useful fact about a group, or should the group show its latest question?
2. Does the full view need its own Back when the header already has Guide ×?
3. Should a group row borrow the roadmap's task look (status ring) so users recognise *their* tasks?

## Not in scope (flag only)
- Starter vs row title mismatch (API content names vs web TASK_COPY): backend/content.
- True "All" total before history loads: API change.
- Pre-existing 390 a11y target-size failure on roadmap "N more" (roadmap-view.tsx:157).

---

# Appendix A: design review (full)


Target: the first grid column of `apps/web/src/components/guide/focused-view.tsx` (lines 47-85). Evidence: Playwright captures at 1440, 1280 and 1024 (Everything, task row, opened from T28), plus rail.html. Mode: Operate.

## Design-specificity verdict

**Mostly generic.** Swap the text and this rail could sit in any chat product's history sidebar: a bordered "Back" pill, a muted label, a list of pill rows with a number, a hairline-divided list of suggestions, a muted tagline at the bottom. Only two things belong to LandedNZ. The rows are grouped by settlement task (a real product idea, Principle 2 "Stay in the task"). The starters quote real task titles. The calm palette and type tokens are right, but nothing in the rail looks like the roadmap or task pages (no task status, no stage, no roadmap order). The one LandedNZ-specific idea, "your conversation is organised by your tasks", is drawn as a cropped list of strings.

## Nielsen's 10 heuristics

| # | Heuristic | Score | Key issue |
|---|-----------|-------|-----------|
| 1 | Visibility of system status | 2 | The selected row is barely visible: white fill plus a `ring-hairline` (#E3E8EA) on the #F6F8F8 wash. In 1440-task.png you have to look hard to see which row is on. "Everything 1" in from-task state is shown as if it were complete, but only the loaded turns are counted. |
| 2 | Match with the real world | 2 | Bare numbers ("2", "1", "5") have no unit. Is it questions, answers or messages? "This conversation, by task" is fine, but "Everything" is a vague word for "all questions". The starters quote "Read your visa conditions on Immigration NZ" while the row and the chip say "Check your visa conditions in your eVisa record", so one task has two names on the same screen. |
| 3 | User control and freedom | 2 | There are too many exits, and they overlap. From Home: "Back to Home", the pane ×, and the header tab "Guide ×" all do the same thing (`close`). From a task: "Back to your task" and the Collapse icon both call `toggleExpanded`, and there are two more × buttons. Four exit controls within about 400 px is not freedom. It is a guessing game. |
| 4 | Consistency and standards | 2 | The rail mixes two list languages. Task rows are rounded pills (`rounded-control`, hover white). Starters are a flush list divided by `border-t` hairlines with arrows. The two section labels also differ: "This conversation, by task" is `font-semibold`, "Try asking" is regular weight. The "All" item sits last instead of first, which breaks the common filter pattern. |
| 5 | Error prevention | 3 | Little can go wrong here. The one risk: a starter click sends a question at once (`ask(s)`) and uses up 1 of the 20 daily questions, with no preview. That is accepted product behaviour, but nothing in the rail signals it. |
| 6 | Recognition over recall | 1 | **The main failure.** The rail is a navigator, and its row labels are cropped. "Give your employer a tax code (…" and "Check your visa conditions in y…" lose the part that tells tasks apart ("IR330", "eVisa record"). No `title` attribute, no tooltip and no wrap, so a mouse user cannot recover the full name. The composer chip at least has `title={label}`. |
| 7 | Flexibility and efficiency | 2 | No keyboard shortcut or arrow-key movement in the task list. Each row is a separate Tab stop, which is acceptable at 3 rows but slow at 10. No way to jump to a task page from its group. |
| 8 | Aesthetic and minimalist design | 2 | About 250 px of empty wash between the last starter (y≈530) and the footer line (y≈782) at 1440×900. The heaviest object in the rail is the "Back" button, with a bordered white fill, which is the least important action. The footer tagline floats alone. |
| 9 | Error recognition and recovery | 3 | Nothing here fails visibly. "Everything" quietly loads the rest of the history with `showAll`, but there is no loading state in the rail while it does. |
| 10 | Help and documentation | 3 | "Try asking" is good built-in help. "One conversation, on every device." is the only orientation line, and it is placed where nobody reads it. |
| | **Total** | **22/40** | **Acceptable (20-27)**. Works, but the core job of the rail, telling tasks apart, is weakened by cropping. |

## Cognitive load checklist (failures only)

- **Visual hierarchy: fail.** Visual weight runs Back button > selected row > everything else. The section label "This conversation, by task" is 12 px semibold muted, smaller and lighter than the 14 px rows it heads. That is acceptable for an overline, but "Try asking" (12 px regular) is weaker still, so the two sections do not read as peers.
- **Grouping: partial fail.** "Everything" is drawn as a sibling of the task rows, but it is their superset. Placed last, it reads as "a fourth task called Everything".
- **Working memory: fail.** Cropped titles force the user to remember which "Check your visa conditions in y…" this is. With several visa or tax tasks on a real roadmap (T08 IRD, T09 IR330, and so on), prefixes collide.
- **≤4 choices: borderline.** From a task: 2 rows, 3 starters, Back, plus Collapse, × and header × in view. That is 6 actionable controls in the rail and 3 more exits nearby. Fine in count, but the exits are redundant.
- Single focus, chunking, one thing at a time and progressive disclosure all pass. The rail has two clear sections.

## Emotional journey

A tired migrant expands the guide to "see everything". The first thing they see is a bordered button telling them how to leave. Next comes a list of task names that each stop mid-word ("…in y…"), which feels slightly broken, like a page that did not load. The starters are long, wrap to 3 lines, and repeat a task name different from the one they are working on, which raises a quiet "is this the same task?" doubt. The calm palette helps. The emptiness under the starters reads as unfinished, not as calm. Net: neutral to slightly uneasy, where the product promise ("checked, precise") wants **confident**.

## Strengths

1. **Task grouping is the right idea.** It turns one long chat into the user's own roadmap vocabulary, and it is semantically sound: `<nav>` labelled, `aria-pressed` toggles, real `<button>`s.
2. **Tokens and restraint.** All colour and type come from tokens (`text-ui` 14, `text-small` 12, `wash`, `hairline`, `rounded-control` 8). No decoration, no badges, in line with the "quiet by default" principle.
3. **Starters stay available after the first answer**, and the current follow-up is removed from them (line 29). That is a thoughtful de-duplication.

## Priority issues

### P1: Task titles are cropped, at every width, with no way to read them

- **What:** The rail is a fixed 280 px (`--grid-template-columns-focus: 280px minmax(0,1fr)`) at 1440, 1280 and 1024. The width budget is 280 − 32 (`px-4`) = 248 px row. Then 248 − 20 (`px-2.5`) − 8 (`gap-2`) − about 7 px count leaves **about 212 px for the title at 14 px**, roughly 30 characters. Results: "Give your employer a tax code (IR330)" (37 chars) shows as "Give your employer a tax code (…", losing **"IR330)"**. When selected, `font-medium` widens the glyphs and it crops earlier to "Give your employer a tax code …", losing "(IR330)". "Check your visa conditions in your eVisa record" (47 chars) shows as "Check your visa conditions in y…", losing **"our eVisa record"**. "Apply for your IRD number" (25) fits. The crop is identical at all three widths because the rail never grows, even at 1440 where the reading column leaves about 100 px of unused gutter each side. No `title` attribute (rail.html has `title` only on the composer chip "Home").
- **Why it matters:** The cropped part is exactly the distinguishing part (form code, record name). It fails recognition-over-recall. For ESL readers a word cut mid-way ("y…") is harder to fill in than for native readers. This is the owner's "text gets cropped" complaint.
- **Fix (UI only):** Let task titles wrap to 2 lines instead of `truncate`. Use `line-clamp-2` with `title` as a fallback for very long titles, and align the count to the top row (`items-start`). Keep 14 px. Do not bold the selected text: show selection with fill and an inline-start marker instead, so the width does not change on select. Optionally widen the rail at ≥1280 (for example a `focus` grid token of 300-320 px at `xl`), which is a token change, not a behaviour change.
- **Command:** `/impeccable adapt` (then `typeset` for the line-clamp/line-height pairing).

### P1: Too many exits, and the Back button is the loudest thing in the rail

- **What:** From Home, "Back to Home" (rail, bordered `quiet` button), the pane × (line 95) and the header tab "Guide ×" all close the guide. From a task, "Back to your task" and the Collapse icon (lines 49 and 91) do the same thing. The Back button has the only border and white fill in the rail, so it outranks the selected task row.
- **Why it matters:** Several controls for one action make the user wonder whether they differ ("does × lose my conversation, does Back?"). That is especially true for first-timers and ESL readers. Visual weight on "leave" also contradicts the view's purpose (read and navigate the conversation).
- **Fix (UI only):** Keep one labelled exit in the rail. Demote Back to `ghost` (no border, muted icon + text, `text-ui`) so it reads as a breadcrumb, not a button. In the pane header, drop the Collapse icon when Back already says "Back to your task", or drop Back and keep the icons. Pick one per kind. The header tab × is app chrome and stays. Removing a control does not change behaviour, since the actions remain reachable.
- **Command:** `/impeccable distill`

### P2: "Everything" is in the wrong place, and the counts mean nothing (and can be wrong)

- **What:** "Everything" sits last, below the tasks, styled as a peer. Counts are bare numbers. Opened from T28, the rail shows "Everything 1" while the user really has 5 questions: `turns.length` counts only the loaded turns until `showAll` runs.
- **Why it matters:** "All" as a superset belongs first and apart (the standard filter pattern). A bare "2" has no unit. A false total ("1") undermines the "checked, precise" brand. A screen reader announces "Give your employer a tax code (IR330) 2, toggle button", and the 2 is unexplained.
- **Fix (UI only):** Move "Everything" to the top, rename it "All questions", and add a hairline or gap before the task group. Give counts a unit for assistive tech (`<span class="sr-only"> questions</span>`), or show "2 questions" in muted 12 px under a wrapped title. Hide the Everything count while `historyLoaded !== "all"`. This reads existing state and does not change behaviour. Showing the *true* total before loading would need an API count, which is a **behaviour/API change** and should be flagged, not done.
- **Command:** `/impeccable clarify`

### P2: Two list languages and two label styles in one 280 px column

- **What:** Task rows are rounded pills with a white hover. Starters are a flush list with `border-t` hairlines and an arrow, at a different padding (`p-2.5` vs `px-2.5 py-2`). Labels: "This conversation, by task" is semibold, "Try asking" is regular, with different bottom spacing (`gap-4.5` vs `pb-2`).
- **Why it matters:** The rail looks assembled, not designed. That is the owner's "overall look isn't great". It also hides the different nature of the two lists (filter vs send-a-question).
- **Fix (UI only):** One label style for both sections (12 px semibold muted, same spacing). Starters as quiet cards or rows that clearly read "send": keep the arrow, but use the same radius and hover as task rows, without hairline rules. Shorten how starters display: the quoted titles wrap to 3 lines ("What's involved in "Check your public health eligibility and cover"?"). The quoted task title could be set in medium weight, without the straight quotes, so the eye finds it.
- **Command:** `/impeccable polish` (then `layout` for the spacing rhythm)

### P3: Empty wash and an orphaned footer line

- **What:** About 250 px of empty space between the starters and "One conversation, on every device." at 1440×900. The line is a muted 12 px tagline pinned by `mt-auto`.
- **Why it matters:** The empty space makes the rail feel unfinished. The tagline is reassurance (sync), but it is where nobody looks and says nothing actionable.
- **Fix (UI only):** Either remove the line, or move it under the section label as helper text ("Your questions, grouped by task. Same on every device."). Let the rail end where its content ends, with the wash sized to content, or keep the full height but put the lists' top spacing on a consistent rhythm.
- **Command:** `/impeccable distill`

## Persona red flags

- **Alex (power user):** Cannot tell "Check your visa conditions in y…" from a future "Check your visa expiry…" without clicking. No arrow-key movement in the list and no shortcut to "All". No link from a task group to the task page itself.
- **Sam (screen reader / keyboard):** Truncation is CSS only, so the full title is announced, which is good. But the button name ends in a bare number ("…number 2"). Both section headings are `h2`, while the right column's "Guide" is not a heading, so the heading outline is uneven. The selected state relies on `aria-pressed`, which is fine. Visually, though, the selected-state indicator (white fill + #E3E8EA ring on #F6F8F8) is far below 3:1 non-text contrast (WCAG 1.4.11). The weight change is the only real cue, which weak-vision keyboard users will miss. Tab order puts Back first, then 3 to 10 rows, then starters: acceptable.
- **Jordan (first-timer):** Does not know what the numbers count, or that clicking a row filters the right column rather than opening the task. "Everything" at the bottom looks like another task. Three × and Back options give no clue which one keeps the conversation.
- **Tired new migrant, ESL:** Mid-word crops ("in y…") are hard to complete in a second language. The starters are long, contain nested quotation marks, wrap to 3 lines, and name the visa task differently from the row and chip ("Read your visa conditions on Immigration NZ" vs "Check your visa conditions in your eVisa record"). They will wonder whether these are two tasks. "Everything" is a vague word, and "All questions" is plainer.

## Minor observations

- The title mismatch between starters and rows looks like a content/data issue (the starters come from `opening.starters`, the rows from `titles`/`TASK_COPY`). Fixing it is **not UI-only**. Flag it to the owner.
- The selected row gets `font-medium`, which re-flows the truncation point (shown above). Any fix should keep the text width the same when the selection changes.
- The composer chip is not cropped in the evidence ("Check your visa conditions in your eVisa record" fits at 1024 in a 648 px column). It already has `truncate` + `title`, so it degrades correctly. It is context only, and no change is needed.
- The count is `<small>` with `text-small`. Its baseline sits slightly high next to 14 px row text (visible in 1440-everything: "2" rides above the title baseline).
- The rail's "This conversation, by task" heading and the `nav` aria-label are identical text. Use `aria-labelledby` instead of repeating the string.
- The hover is white on wash, the same colour as the selected fill, so hover and selected look alike.

## Provocative questions

1. If the rail's job is "find my question about task X", why not show each group's questions (first few, wrapped) instead of a count? The count is the least useful fact about a group.
2. Does the full view need its own Back at all, when the header already has a "Guide ×" tab that means exactly "leave the guide"?
3. Should the rail look like a small slice of the roadmap (task status ring, stage name) so a migrant recognises *their* tasks at a glance, instead of reading strings?

---

# Appendix B: detector + browser evidence (full)


Target: `apps/web/src/components/guide/focused-view.tsx` (rail = first child of `#guide-pane`). The raw measurements are in `/private/tmp/claude-501/-Users-ruchira-Development-NZ-Project/71d8d5b9-05e2-4754-890f-462373ee3e5a/scratchpad/critique-B-measure.json`, from the second run.

## 1. CLI scan (`impeccable detect --json`)

| File | Exit | Findings |
|---|---|---|
| apps/web/src/components/guide/focused-view.tsx | 0 | `[]`, 0 findings |
| apps/web/src/components/guide/guide-pane.tsx | 0 | `[]`, 0 findings |

## 2a. Live overlay (detect.js injected via Playwright, live server on port 8400)

The script injected without trouble: no CSP error.
- Console: `[impeccable] 1 anti-pattern found`, which is `overused-font`: "Primary font: geist (100% of text)".
- The overlay banner showed the same: "OVERUSED FONT · Primary font: geist (100% of text)".
- This applies to the whole page, not the rail. It is a brand/token choice that sits outside rail scope, because tokens are fixed by the seam guardrails. Treat it as not actionable for the rail.

Afterwards I ran `live-server stop --keep-inject`, which printed "Stopped live server on port 8400". `lsof :8400` came back empty.

## 2b. Measurements (seeded turns: T09 x2, T28 x1, T08 x2)

**The rail is a fixed 280px at 1440, 1280 and 1024.** Its background is `rgb(246,248,248)` (wash). The values below are identical at all three widths.

### Task rows + Everything (Everything selected; the first-task-selected state differs only as noted)

| Row | label clientW / scrollW | Cropped | font | line-h | height | aria-pressed | contrast |
|---|---|---|---|---|---|---|---|
| Give your employer a tax code (IR330) · 2 | 212 / 243 | **yes** | 14px / 400 (500 when active) | 20.3px | 36 | false (true when active) | 13.95 (14.87 on white when active) |
| Check your visa conditions in your eVisa record · 1 | 212 / 301 | **yes** | 14px / 400 | 20.3px | 36 | false | 13.95 |
| Apply for your IRD number · 2 | 169 / 169 | no | 14px / 400 | 20.3px | 36 | false | 13.95 |
| Everything · 5 | 247 / 247 | no | 14px / 500 when active | 20.3px | 36 | true (false when a task is active) | 14.87 |

- The active row gets a `rgb(255,255,255)` background, weight 500 and a 1px hairline ring. Inactive rows are transparent.
- The active state is exposed as `aria-pressed` and is mutually exclusive across the rows. No row uses `aria-current`.
- **2 of the 3 task titles are truncated at every width**, because the rail is fixed at 280px. The truncation uses `span.truncate`, so it shows an ellipsis. Neither row has a `title` attribute or a tooltip, so the full name only reaches assistive tech, which reads the button text.

### Try asking

| Starter | cropped | font | height |
|---|---|---|---|
| What's involved in "Book temporary accommodation"? | no (wraps) | 14px / 400 / 20.3px | 62 |
| What's involved in "Check your public health eligibility and cover"? | no (wraps) | 14px / 400 / 20.3px | 82 |

- The starters wrap instead of truncating, so their rows run 62–82px tall against the 36px task rows.
- The Back button ("Back to Home") is 32px tall, 14px, contrast 14.87.

### Target size (WCAG 2.5.8, at least 24px)

Every rail control passes: Back is 32px, the rows are 36px, the starters are 62px and 82px.

### Muted labels (all `rgb(75,97,112)`, 12px)

| Label | bg | weight | contrast | AA (4.5) |
|---|---|---|---|---|
| H2 "This conversation, by task" | wash | 600 | 6.07 | pass |
| counts on inactive rows | wash | 400 | 6.07 | pass |
| count on the active row | white | 500 | 6.48 | pass |
| H2 "Try asking" | wash | 400 | 6.07 | pass |
| footer "One conversation, on every device." | wash | 400 | 6.07 | pass |

The two section headings differ: "This conversation, by task" is weight 600 and "Try asking" is weight 400, though both are H2, 12px and muted. This is an evidence note, not a ruling.

### Headings

- Inside the rail: `H2 This conversation, by task` and `H2 Try asking`.
- On the page (/app with the pane open), the headings run H1 Welcome to Auckland, then the page's H2s and H3, then the rail H2s, then the conversation's question H3s.
- The page's dashboard headings are still in the DOM behind the full view. Their visibility was not checked.

### Tab order from Back

Back to Home → Give your employer a tax code (IR330) | 2 → Check your visa conditions in your eVisa record | 1 → Apply for your IRD number | 2 → Everything | 5 → What's involved in "Book temporary accommodation"? → What's involved in "Check your public health eligibility and cover"? → (leaves the rail) Close.

- The order follows the visual order and there are no traps.
- After the rail, focus skips the conversation and goes to the header's Close button, which is the next DOM element.

### Focus ring on a row

- On a keyboard-focused row, `:focus-visible` is true.
- The ring is a 2px solid teal outline, `rgb(14,124,123)`, with a 2px offset and no box-shadow.

## 2c. Expanded from a task page (/app/roadmap?task=T28)

- The rail is present. Back reads "Back to your task".
- Rows: `Check your visa conditions in your eVisa record | 1` (aria-pressed=true), then `Everything | 1`.
  - **Everything shows 1 here, against 5 when opened from /app with the same seeded user.** On the task page the rail lists only that task's turn. This may be how the task page loads the store, or a scoping issue. It needs a behaviour check before anyone decides it is intended.
- Try asking:
  - What's involved in "Read your visa conditions on Immigration NZ"?
  - What do I need before I start "Read your visa conditions on Immigration NZ"?
  - How long does "Read your visa conditions on Immigration NZ" take?
- **The same task, T28, has two different names in the same rail:** the row says "Check your visa conditions in your eVisa record" and the starters say "Read your visa conditions on Immigration NZ". The row title comes from `titles[key] ?? TASK_COPY[key]?.title` and the starters from another source.

## Axe (@axe-core/playwright, scoped to `#guide-pane`, tags wcag2a/2aa/21aa/22aa)

- 0 violations, 18 passes.
- `color-contrast` came back incomplete on 51 nodes, meaning axe could not resolve the backgrounds. My computed contrast values above cover the rail's text.
- A best-practice axe run on the rail alone, with no tags, also found 0 violations.

## Likely false positives / caveats

- `overused-font` (geist) is a global type-token finding, not a rail issue, and tokens are fixed.
- My contrast values come from computed colours: canvas-converted, with the background taken from the nearest non-transparent ancestor. They do not account for overlays or opacity.
- The Everything count was 6 on the first run and 5 on the second. The first run seems to have included one leftover turn ("Can I apply before I have a bank account?") with no task group: the task rows summed to 5 while Everything showed 6. A turn with no task appears only under Everything, which is expected behaviour. The reset in `beforeAll` cleared it on the second run.

## Skipped

- No screenshots this pass. The "before" screenshots already exist from zz-rail.spec.ts in `/private/tmp/claude-501/-Users-ruchira-Development-NZ-Project/71d8d5b9-05e2-4754-890f-462373ee3e5a/scratchpad/rail-before`.
- Nothing else was skipped.

## Cleanup

- `apps/web/e2e/zz-rail-b.spec.ts` is deleted. The original `zz-rail.spec.ts` was left untouched.
- The live server is stopped.
- No project source files were edited.
