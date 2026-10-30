# impeccable critique — Guide direction D (assistant pane), design stage

Date: 2026-10-30. Target: `docs/design/guide/direction-d.html` (artifact https://claude.ai/artifact/M2JkS6ebyZ6BrGzwishjYN).
Method: dual-agent (A: design review sub-agent · B: detector + browser sub-agent), isolated. Browser: Playwright on file:// (no Chrome). Overlay injected and live-server stopped.

## Synthesis

Score (A): 29/40. Design specificity: authored for this product (origin label, citation previews with checked date, "What I can't tell you" with the agency number, task card, context chip). Template tells: aurora composer edge (taste, P3), three identical favicon monograms (fixed).

Detector (B): 198 CLI findings, mostly board artefacts (nested-cards 70, cramped frame padding 20, skipped headings 6, Geist overused-font 1 — false positives for a board of app frames). Real: `--control` #7A8F99 text at 3.2–3.4:1 (agrees with A), 9 px favicon text, board sideways overflow below 1248 px.

### P0/P1 and what was done
| # | Finding | Source | Action |
|---|---|---|---|
| P1 | Width rules hold at 1280–1679 only; break at 1024–1279 (floating pane covered Mark as done), untested Settings, non-monotonic 300/380 step at 1000 px, px vs rem, checks only at the widths that already work | A | Fixed on board: pane always pushes from 1024; actions column 34% clamped 300–380 (monotonic, flagged as the one new layout for owner OK); Settings rows added at 1024/1280/1440/1680; widths in rem; test matrix widened (see Task 9 requirements) |
| P1 | `--control` text fails AA ("14 left today", "Asked on…", placeholder) | A + B | Fixed: those use `--muted` |
| P2 | Missing states: cut short + "Want the rest?", Stop before/after text, refusal | A | Fixed: four state cards added |
| P2 | Quick-ask overlay covers the page; "/" collides with typing and screen-reader keys | A | Fixed: overlay removed; "/" opens the pane and focuses the composer only when focus is not in a field |
| P2 | Cap copy contradicted its frame; removable chip on a disabled composer | A | Fixed: answer above, "That's the 20 questions for today. You can ask again after midnight."; no chip when disabled |
| P2 | Board scrolls sideways below 1248 | B | Fixed: frames and table scroll inside their own strips; 0 overflow at 1320 and 1024 |
| — | Favicon stack duplicated "3 sources", 9 px text | A + B | Fixed: "ird.govt.nz · 3 sources" |

### Safety item (flag once, distress frozen)
Distress plus daily cap: a 429 makes no model calls, so a distressed user at the cap sees no crisis numbers. Owner decision; copy/layout-only options exist (e.g. a permanent "Need to talk? 1737" link in the cap note). Not changed.

### Logged minors (no fix cycle)
Aurora edge could be quieter (P3); jargon gloss for "earners' levy", "IR997"; header Ask needs `aria-expanded` + pressed state; Settings delete undo toast; in-pane "not legal or tax advice" line; header/page left edges diverge while the pane is open; long task titles in the context chip (truncate with full title in tooltip); empty task-history state; short-height (1366×768) conversation area; sheet at 600–1023 not drawn; counter shown under a crisis reply.

### Task 9 requirements from this critique
- Page area becomes an inline-size `@container`; convert `max-split:` at task-sheet.tsx:307, home-view.tsx:64, settings-screen.tsx:44, plan-form.tsx:152, app/app/loading.tsx:12 to container variants (no visual change with the pane closed).
- Task two-column at container ≥ 720 with actions `clamp(300px, 34%, 380px)`; Home and Settings two-column at ≥ 900; below 561 the task actions bar sticks to the page area (not the viewport).
- Pane widths 25 / 28.75 / 32.5 rem by band; sheet below 1024; never floats over the page.
- Focus moves to the composer on open and back to the trigger on close; streaming in a polite live region; citation previews keyboard-reachable, Escape closes.
- Playwright matrix with the pane open on Task, Home, Roadmap, Settings at 1024, 1180, 1280, 1366, 1440, 1536, 1600, 1680, 1920, plus 1366×768, 20 px root font, 125% and 200% zoom. Assert: no horizontal scroll, no clipped text, Mark as done / Delete / Save never intersect the pane, task steps ≥ 45 characters a line.
- Build-stage `impeccable critique` + `audit` + `detect` on the real app; full output to `gate/critique.md`.

---

## Assessment A (full)
# Assessment A: design review of docs/design/guide/direction-d.html ("Guide · assistant pane")

Rendered with Playwright (1320 wide, reduced motion). Screenshots are in this folder: board0-6.png, wr0-9.png, st*.png, mem*.png. I also checked host code: task-sheet.tsx:307, home-view.tsx:64, settings-screen.tsx:44, plan-form.tsx:152, app/app/loading.tsx:12, app-header.tsx:56 and the globals.css tokens.

## 1. Design-specificity verdict
This board is built for this product. It is not a generic chat template. These parts are specific to LandedNZ:
- the question set as the heading
- the origin label ("LandedNZ's checked guide")
- numbered inline citations with a source preview that shows the checked date
- "What I can't tell you" with the agency's phone number
- the task card linking by real title
- the context chip in the composer

It reads as part of the r1-final family: same header, cards, ink/teal tokens and Geist. One element is generic: the "aurora" composer edge (an animated teal, blue and violet gradient, `.cmp.writing::before`). An animated gradient for "AI is thinking" is the most common AI-product look of 2025-26, and it is the only element that does not come from the product's calm "checked expert" voice. The colours are tokens (they exist in globals.css), so this is a taste problem, not a rules break. The triple "ird ird ird" favicon stack is a small template tell too, because all three favicons are identical.

## 2. Nielsen heuristics (0–4)
| # | Heuristic | Score | Key issue |
|---|---|---|---|
| 1 | Visibility of system status | 3 | Strong: "Checking ird.govt.nz", "Writing the answer…", Send becomes Stop, "14 left today". Gap: the header Ask shows no open/pressed state while the pane is open. "14 left today" is set in `--control` grey (#7A8F99, about 3.4:1), so it is hard to read. |
| 2 | Match with the real world | 3 | Plain, short copy. Content words like "earners' levy" and "customer due diligence form (IR997)" are not explained. The "/" shortcut and the "Quick ask" idea are unfamiliar to many users. |
| 3 | User control and freedom | 2 | Stop, Undo on "Remembered", close, collapse and remove-chip are all there. But at 1024–1279 the floating pane covers the task's whole actions column (Mark as done, Open the IRD application, Sources; frame "1180 window · pane 400, over the page"). The user must close the guide to act on the task, which defeats "stay in the task". Settings → Memory Delete is "immediate and permanent", with no undo or confirm. |
| 4 | Consistency and standards | 3 | One pane design across states. But there are four surfaces: pane, quick-ask overlay with scrim, focused view, and sheet. The 1280–1679 task layout with a 300 px actions column is a new layout, not the "approved r1-final narrow layout" that the board's own rule 2 promises. With the pane open, the header's left edge (120 px edge from container-app) no longer lines up with the content's left edge (about 56 px). |
| 5 | Error prevention | 3 | The daily count is visible. Stop before any text gives the question back. Permanent delete has no guard. |
| 6 | Recognition rather than recall | 3 | Starters and the context chip carry the context. The task card names the task. A long task title in the chip will truncate (no frame shows this), and then the chip loses the context it is there to carry. |
| 7 | Flexibility and efficiency | 3 | "/" quick ask, expand to focused view, history, conversation grouped by task. Good for experts and invisible to everyone else. |
| 8 | Aesthetic and minimalist design | 3 | Calm and well spaced. Noise: three identical favicons next to "3 sources"; the "Copy · 3 sources" footer row; "Back at midnight NZ time" said twice in the cap state. The distress card is the darkest block on the board, which is deliberate and fair. |
| 9 | Recognise and recover from errors | 3 | Failed, interrupted and busy states are honest and say whether the question was counted. The daily-cap copy says "Everything above stays readable", but the frame shows a fresh greeting and no history above it. |
| 10 | Help and documentation | 3 | "What I can't tell you" with Inland Revenue's number, and "Nothing found" names the agency. There is no in-pane "General information, not legal or tax advice" line (it exists only in public-footer.tsx). |
| | **Total** | **29/40** | Good. Solid base; the gaps are at the edges (width bands, a11y contrast, missing states). |

## 3. Cognitive load
- **Answer density.** One answer can stack up to 12 parts: question heading, origin label, favicons, source count, answer text with citations, "What to do", "What I can't tell you", task card, Remembered pill, Copy/sources row, follow-up and check note. The hierarchy holds at 460 px. At 400 px (1280 band) and 390 px (phone), the task card, Remembered pill and footer row push the follow-up below the composer fold (see the phone "An answer" frame: Copy and sources are clipped under the composer). Order the parts by what the user acts on: the answer, then the task card. Merge the favicons and the "3 sources" link.
- **Four surfaces to learn** (pane, quick ask, focused view, sheet). Three entry points: header Ask, "/", and "Ask about this". For a first-time user, the quick-ask overlay is a second thing that looks like the guide, and it covers the page with a blurred scrim. That breaks "nothing is covered".
- **Starters: 3, and they hide once the conversation starts.** This is within limits and good.
- **Composer row.** Context chip, remove ×, "N left today" and Send share one row. At 400 px with a long title ("Check your public health eligibility and cover") this row is crowded, and no frame shows it.
- **Working memory.** "Show all 14 messages" plus "This conversation, by task" in the focused view means two ways to see history. That is acceptable, but explain why both exist.

## 4. Emotional journey
- **Opening (Home, 1440).** "Day 1 in Auckland." plus one line and three starters. Warm, oriented, low pressure. This is a high point.
- **Asking on a task.** Earlier task questions appear first, so the user feels continuity ("it remembers what I asked here"). The origin label right under the question builds trust before the answer appears. High.
- **Waiting.** "Checking ird.govt.nz" is reassuring. The aurora adds energy where the brand promises calm. It is neutral to slightly off.
- **Something breaks.** "This question wasn't counted" removes the cost anxiety. This is very good.
- **Cap reached.** Flat and slightly cold. "You've used today's 20 questions." uses "used", a billing word. Saying "midnight NZ time" twice reads like a gate. The context chip stays removable on a disabled composer, which is a dead control.
- **Distress ("I'm not coping…").** The crisis card comes first, is large and dark, has three big tappable rows (1737, 0800 543 354, 111), and is never animated away. That matches spec §6.4. The warm line after it is right. Three problems:
  1. The turn still shows "14 left today" and the "Apply for your IRD number" chip, which makes a crisis moment feel transactional.
  2. Nothing invites the user back ("When you're ready, I can help with one small step.").
  3. If a distressed user has reached the daily cap, the composer is disabled. The spec's 429 path makes no model calls, so the keyword check never runs and no crisis text appears.

  Distress mechanisms are frozen for now, so I flag the cap case once and do not propose new mechanisms.
- **Memory.** The "Remembered" pill with Undo is a trust peak. Settings delete with no undo is a small sour note.

## 5. Strengths
1. **Trust is built into the layout.** The origin label sits under the question. Citations are numbered, with a hover/tap preview that shows domain and checked date. The check note sits under the answer, never in place of it (the "Sources open, with a check note" frame). This is the product's main differentiator, and the board makes it visible.
2. **Honest state copy.** Failed, interrupted, busy and nothing-found each say what happened, whether the question counted, and who to ask. It matches the voice ("You can undo this.").
3. **Pane on the task keeps the work visible.** At 1440 and above the page is pushed, not covered. Task-scoped history comes first. Ask moves out of the actions column. The width-rules section is unusually concrete, with real pixel numbers per band.

## 6. Priority issues

### [P1] Width rules: will they hold when built? Verdict: they hold in the 1280–1679 push bands only if the build plan adds the items below. As drawn, they break in five places.
The arithmetic checks out: content = window − pane − 112 (1280 → 768, 1440 → 868, 1680 → 1048). At 1280, the main card is 452 px, text column about 372 px minus the step gutter, about 48 characters, which meets the 45-character floor. Home at 868 stacks via a new 900 threshold, so it is not squeezed. Browser zoom is safe: 125% zoom at 1440 is 1152 CSS px, which lands in the float band, and 200% is 720 CSS px, which gets the sheet. Media and container queries follow CSS px. The rules break here:
1. **1024–1279 float covers the task's controls.** At 1180 the pane sits on the whole actions column. This band is common: 1536 CSS px at 125% zoom ≈ 1229, 1366 laptops with the bookmarks bar at 110% zoom, and half-screen windows on wide monitors. The page is "intact underneath", but Mark as done is unreachable. The float band exists only because the board does not trust its own container-query rule. The approved narrow layouts already work down to about 560 px (they serve tablets). Fix: push here too. Content becomes window − 400 − padding (about 520–760 px), and Task, Home and Settings use their approved single-column layouts. Keep float only below about 1024, or drop it.
2. **The 1280 Task layout is new, not "approved".** Rule 2 says pages switch to the approved r1-final narrow layouts. But Task at 768–999 keeps two columns with a 300 px actions column, which is a third layout r1-final never approved. The approved narrow layout (<861, `max-split:grid-cols-1`) would put Mark as done below six steps. Either get owner sign-off on "actions 300" as a new approved layout, or state the exception in the rule.
3. **Settings is missing.** Settings has the header Ask, so the pane opens there. `grid-cols-settings` is 440 px + 1fr. At 1280 the content is 768 px, so the memory list gets about 312 px for "fact + Edit + Delete" and for the edit row "input + Cancel + Save". That is exactly the squeezed look the owner fears. `settings-screen.tsx:44`, `plan-form.tsx:152` and `app/app/loading.tsx:12` all use viewport `max-split:`. Add a Settings row to the table and convert those three to container queries.
4. **Non-monotonic task widths at the 1000 px container threshold.** At content 999 the actions column is 300 and the main card about 683. At 1001 the actions column jumps to 380 and the main card drops to about 605. Making the window wider makes the reading column narrower. Use `minmax(300px, 380px)` or a fluid clamp instead of a step.
5. **Large default font size (rem) against px widths.** Tailwind 4 text and spacing are in rem, but `grid-cols-task` (380px), the 300 px actions column, the 400/460/520 pane widths and the 720 floor are in px. A user with the browser's "large" font setting (20 px root) gets about 38 characters per line in the 452 card, about 36 in the 400 pane, and an actions column where "Best done by Wed 11 Nov" and the buttons wrap or overflow. Express the pane widths, the 720 floor and the container thresholds in rem so they scale with the text.

Other untested conditions to add:
- **Short height.** 1366×768 laptops give about 630 CSS px of height. The pane then has about 420 px for conversation, and the answer, task card and follow-up all fall below the composer.
- **Sheet at 600–1023.** Only 390 is drawn, so it is not shown whether the sheet is full width at 900.
- **Long task titles** in the chip, the breadcrumb and the actions column at 300.
- **Header seam.** With the pane open, the header stays on container-app (logo at the 120 px edge) while the content starts at about 56 px.
- **Band crossing.** Resizing across 1280 switches between push and float mid-session.

**What the build plan must add to guarantee it:**
1. Make the page area (the sibling of the pane) a `@container` (inline-size). Convert exactly these viewport variants to container variants: task-sheet.tsx:307, home-view.tsx:64, settings-screen.tsx:44, plan-form.tsx:152, loading.tsx:12. Set the thresholds: task two-column ≥ 720 (actions 300→380 fluid), home two-column ≥ 900, settings two-column ≥ 900 (else stacked).
2. One source of truth for the push/float cutoff: page room ≥ 720 px, in rem.
3. Decide 1024–1279: push with the approved narrow layouts (recommended), or float with the actions column kept visible.
4. Header inner edge follows the page area when the pane is open, or document why it does not.
5. Truncation rules for the chip (ellipsis plus a full-title tooltip/aria-label) and wrap rules for titles.
6. A Playwright matrix with the pane open on Task, Home, Roadmap and Settings at 1024, 1180, 1280, 1366, 1440, 1536, 1600, 1680 and 1920 wide. Also run 1366×768 (short), a 20 px root font, and 1440 at 125% and 200% zoom. Assert three things on each: no horizontal scroll (`scrollWidth ≤ clientWidth`), no element clipped by the pane (bounding boxes of Mark as done, Delete and Save do not intersect the pane in push mode), and the steps measure is ≥ 45 characters.

Today the board's rule 4 promises checks only at 1280, 1440 and 1680, which is exactly where the design already works. Suggested command: `/impeccable adapt`.

### [P1] Meaningful small text below AA contrast
"14 left today", "Asked on this task · 29 Oct", source-row meta, the composer placeholder and "0 left today" use `--control` #7A8F99 on white, about 3.4:1, at 12–15 px. PRODUCT.md commits to WCAG 2.2 AA, and the cap count is real status information. In the app, `--color-control` is a border colour. Fix: use `--muted` (#4B6170) for any text that carries meaning. Citation superscripts are 11 px; make them at least 12 px with the larger hit area kept. Suggested command: `/impeccable audit` (then `polish`).

### [P2] Required states missing from the board
PRODUCT.md and spec §7/§8.2 list: truncated answer with the "Want the rest?" follow-up, Stop before text (question given back, Stop becomes Send), Stop after text (shown text stays, marked cancelled), refusal ("I can't help with that one" plus agency), and the empty first visit on a task with no history. None of these is drawn. The focused-view caption says "sources open", but its frame shows sources closed. Suggested command: `/impeccable harden`.

### [P2] Distress and daily cap
The crisis turn shows "14 left today" and the task chip. There is no gentle way back. A distressed user who has reached the cap gets a disabled composer with no crisis numbers, because the 429 path makes no model calls. Distress is frozen at the Plan B state, so the smallest in-scope fix is copy and layout only:
- hide the count and the chip on a distress turn
- add one line inviting the user back
- show the cap state with the same fixed 1737 line under it (static text, no new mechanism)

Owner decision needed. Suggested command: `/impeccable clarify`.

### [P2] The quick-ask overlay contradicts "stay in the task"
"/" opens a centred field over a blurred, scrimmed page. Sending it moves the conversation into the pane anyway. This is a fourth surface and it covers the work. "/" must also be ignored while focus is in a text field, and it collides with screen-reader quick keys. Fix: make "/" open the pane and focus its composer. Suggested command: `/impeccable distill`.

### [P3] The aurora composer edge
A violet-blue gradient running on the edge reads as a generic "AI is thinking" signal, against "calm checked expert". It is already off under reduced motion. Fix: a static teal edge with a slow, quiet sweep, or nothing beyond "Checking…" and "Writing the answer…". Suggested command: `/impeccable quieter`.

## 7. Persona red flags

**Newly arrived migrant, English as a second language, 1280 laptop (1280×720 CSS, Windows at 150% on a 1920 panel)**
- Pane at 400 px and about 630 px tall. The answer to "Can I start work before my IRD number arrives?" fills the pane. "What to do" step 3, the task card and the follow-up are below the composer, and the reader must scroll inside a narrow column, rereading slowly.
- "earners' levy", "customer due diligence form (IR997)" and "tax code declaration" appear unexplained in the answer's first sentences. The guide should gloss terms the first time it uses them.
- The "/" shortcut and "Quick ask" are invisible to this user. Fine, but the Ask button must be enough.
- If they press browser zoom to 110% to read comfortably, the window becomes 1164 CSS px, which lands in the float band. The pane now covers Mark as done and Sources, so they close the guide to act and lose the answer they were reading.
- "Back at midnight NZ time" is fine, but "in 5 hours" is easier to act on.

**Tired, stressed user on a phone at night (390, project persona from PRODUCT.md)**
- The half-height sheet greeting is calm. On asking, the sheet goes full height and the home page disappears. Expected on a phone.
- "Remembered: you start work on 9 November" wraps to two lines next to Undo, and the Copy/sources row hides under the composer. The answer's end is unclear.
- In distress, the crisis card is excellent: big tappable numbers, first on screen. The "14 left today" counter and the IRD chip under it feel cold.

**Keyboard and screen-reader user (Sam)**
- The pane push does not say where focus goes on open (composer?) or on close (back to the Ask that opened it?).
- Streaming sentence by sentence needs a polite live region. "Checking…" notices should not flood it.
- Source previews open on "hover or tap". The keyboard path (focus to show) and Escape to dismiss are not specified.
- The "/" global shortcut collides with NVDA/JAWS quick navigation and with typing in fields.
- Low-contrast meta text (P1 above) hurts low-vision users first.

## 8. Minor observations
- The favicon bubbles show clipped "irc" text at 9 px. Three identical favicons add nothing; show one favicon per distinct domain.
- Daily-cap frame: "Everything above stays readable" sits above an empty area. Show history or change the copy. Remove the chip's × when the composer is disabled.
- The header Ask needs `aria-expanded` and a visible pressed state while the pane is open.
- "Ask about this task" appears only when the pane is closed. Good, but the layout shift of the actions card on open/close should be checked.
- Settings → Memory: Delete is permanent with no undo, while the in-chat pill has Undo. A 5-second "Deleted. Undo" toast before the hard delete keeps the spec (hard delete after the window) and matches "You can undo this."
- There is no in-pane "General information, not legal or tax advice." line, even though answers about tax deductions appear in the pane. Confirm this is intended.
- The "Honest risk" note says the focused view covers narrow-main-column reading. But the focused view hides the task, which is a trade-off, not a cover.

## Provocative questions
1. If container queries make every page lay out by its own width, why does the 1024–1279 band float at all? Doesn't pushing with the approved single-column layouts give a better result than covering Mark as done?
2. Does a skilled migrant with one concrete question need four surfaces (quick ask, pane, focused view, sheet), or would one pane plus expand do the whole job?
3. Should the guide show any running count ("14 left today") on every turn, given that it frames a calm expert as a metered service, and appears even under a crisis reply?

---

## Assessment B (full)
# Assessment B: detector and browser evidence for docs/design/guide/direction-d.html

Scratch dir: /private/tmp/claude-501/-Users-ruchira-Development-NZ-Project/149c9188-2ab6-45b3-b50c-a28847ffbfbc/scratchpad/critB/
Files: detect.json (raw CLI), browser.json (raw Playwright output), width-rules.png, states-real-size.png, assessment-b.md

## 1. CLI detector (`impeccable detect --json`): exit 2, 198 findings
The detector gives line 0 for every finding, so it reports no source line numbers. Locations below come from the snippets and the CSS.

| Rule | Count | What and where |
|---|---|---|
| nested-cards | 70 | "Card inside card (div)". These are .card elements inside the scaled app frames (.wf / .frame), which have a border and background. |
| undersized-ui-text | 69 | All say `9px functional text "ird"`. This is `.favs i` (`font:600 9px`), the 3-letter favicon monogram in source rows. Inside zoomed frames it renders at about 6.3 to 8.3 px. |
| cramped-padding | 39 | 19 × `.hdr` with children flush on border-bottom, 10 × `.wf` flush top/bottom, 10 × `.frame` flush (top/bottom, bottom only, or all sides). |
| low-contrast | 12 | 8 × `#7a8f99 on #ffffff` 3.4:1, and 4 × `#7a8f99 on #f6f8f8` 3.2:1 (the muted token). |
| skipped-heading | 6 | Board h2 or h3 followed by in-frame h5 or h6: "The pane on a task"→h5 "What to do"; "Writing, and the focused view"→h6 "This conversation, by task"; h3 "Day 1 in Auckland."→h5; "States, at real size"→h5; h3 "Task with the pane open"→h5; h3 "1024–1279: the pane floats"→h5. |
| pulsing-dot | 1 | `.dot` 6×6, `animation:pulse 1.2s infinite`. It is disabled under `prefers-reduced-motion:reduce`. |
| overused-font | 1 | Primary font: Geist. |

## 2. Overlay (live-server + detect.js)
- `live-server --background` started on port 8400. `page.addScriptTag({url:'http://localhost:8400/detect.js'})` on the file:// page worked; file:// did not block it.
- Console: `[impeccable] 156 anti-patterns found`, and 311 overlay DOM nodes were injected.
- The overlay found two rule types the CLI did not report:
  - `line-length`: "~90 chars on 2 of 3 rendered lines" and "~104 chars on 2 of 2 rendered lines" (aim for under 80).
  - `straggler`: `"date."` alone on the last of 2 lines (7% of the measure).
- Most of the rest were the same low-contrast and undersized "ird" findings. I captured only the first 40 console lines, so I have no per-rule totals for the 156.
- Server stopped with `live-server stop --keep-inject`. Port 8400 shows as stopped.

## 3. Mechanical checks at 1320×1000, reducedMotion 'reduce'
- Sideways overflow: none (scrollWidth 1320 = innerWidth 1320).
- Clipped text: 0 elements. No overflow-hidden element with text has scrollWidth > clientWidth + 1. This includes `.stage>.wrap`, `.wf` and `.frame`.
- Contrast in `.pane` (text under 18px, below 4.5:1). Every failure is the muted colour rgb(122,143,153), #7a8f99:

| Element | Background | Size | Ratio | Count | Example |
|---|---|---|---|---|---|
| `span.txt` (composer placeholder) | #fff | 15px | 3.38:1 | 22 | "Ask anything about settling in" |
| `span.left` (daily count) | #fff | 12px | 3.38:1 | 22 | "14 left today" |
| `small` | #fff | 12px | 3.38:1 | 5 | "Asked on this task · 29 Oct" |
| `span.txt` | #f6f8f8 | 15px | 3.17:1 | 2 | "Waiting for the other window" |
| `span.left` | #f6f8f8 | 12px | 3.17:1 | 2 | "14 left today" |

  The placeholder text arguably falls under the WCAG placeholder leniency. "14 left today" and the "Asked on…" metadata are real information and fail.

## 4. #width-rules frames
CSS px values are rect ÷ zoom. offsetWidth agrees with them.

| Row | Frame width | Zoom | .stage columns (CSS px) | .taskmain CSS px | Pane | Composer bottom inside frame |
|---|---|---|---|---|---|---|
| Task with the pane open | 1280 | .922 | 853.8 / 424.0 | 450 | 400 | yes, 10.1 px gap |
| Task with the pane open | 1440 | .819 | 953.6 / 484.0 | 550 | 460 | yes, 8.8 |
| Task with the pane open | 1680 | .702 | 1133.2 / 544.0 | 649 | 520 | yes, 7.4 |
| Home with the pane open | 1280 / 1440 / 1680 | same | same | no .taskmain | 400 / 460 / 520 | yes, 10.1 / 8.8 / 7.4 |
| Roadmap with the pane open | 1280 / 1440 / 1680 | same | same | no .taskmain | 400 / 460 / 520 | yes, 10.1 / 8.8 / 7.4 |
| 1024–1279: the pane floats | 1180 (height 760) | 1 | no .stage (overlay `.ovl` layout) | 782 | 400 | yes, 13.0 |

- Every frame renders at about 1180 px on screen, because zoom normalises them.
- The pane column is the pane width + 24 (12 px margin on each side).
- The main task card is 450, 550 and 649 CSS px wide at 1280, 1440 and 1680.
- The gaps above are measured on screen. In CSS px they are about 11 px in every frame.
- No composer is clipped.

## 5. Sideways overflow per viewport
| Viewport | scrollWidth | Overflow | Offenders |
|---|---|---|---|
| 1320 | 1320 | no | none |
| 1280 | 1280 | no | none |
| 1024 | 1248 | yes, +224 px | `figure.hero-fig` > `div.scrollx` (right edge 1248), plus a later `figure` |
| 390 | 1248 | yes | hero-fig and scrollx (1248), figcaptions (884, 664), `div.pane.paneonly` (484), other figures (414 to 484) |

Cause: `.scrollx{overflow-x:auto;max-width:100%}` does not contain its content. The parent `figure` grows to the content's min-content width, so the page scrolls sideways instead of the inner strip. This is a fault in the board's own layout, not in the designed product. It only matters when the board is viewed below about 1250 px.

## 6. Likely false positives (intrinsic to a design board)
- **nested-cards (70):** the outer "card" is the board's device frame (`.wf`, `.frame`), which draws a screen. The product cards sit inside it. These are not real nested cards.
- **cramped-padding on `.wf` and `.frame` (20):** a device frame is meant to sit flush against the screen it contains.
  - The 19 `.hdr` findings are the app header's bottom border with its content flush. This is probably by design for a top bar, but a design reviewer should confirm.
- **skipped-heading (6):** board headings (h2, h3) are followed by headings inside the app frames (h5, h6). The two heading outlines are mixed on purpose. This is not a product a11y defect, but the real app should start its own outline correctly.
- **zoom:** frames use `zoom` (.62 to 1) to show 1280 to 1680 px layouts. This is intrinsic to the board. It means detector font-size readings are pre-zoom.
- **undersized-ui-text "ird" (69):** this is a placeholder favicon monogram, which the real product would replace with an image. It is low value, but in the zoomed frames it is about 6 to 8 px, so even as a stand-in it is too small to read.
- **pulsing-dot:** it is a live "writing" indicator and reduced motion turns it off. This one is minor.
- **overused-font (Geist):** a product brand choice. It is a judgement call, not a defect.

### Real findings
- **Muted #7a8f99 fails AA for small text** (3.2 to 3.4:1). It is used for "N left today", timestamps and the composer placeholder. The CLI and Playwright agree on this.
- **Board overflows sideways below about 1248 px** (the `.scrollx` / figure min-content issue).
- **line-length** (about 90 to 104 chars) and one **straggler**, from the overlay only.

## 7. Steps skipped or limited
- Focus-style check: out of scope, as briefed.
- Overlay findings: only the first 40 of 156 were captured, so there is no per-rule breakdown.
- CLI line numbers: not available, because the detector emits line 0 for all findings.
- No repo files were edited. The temporary .mjs was deleted and the live server is stopped.
