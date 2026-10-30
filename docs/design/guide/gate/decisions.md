# Guide UI: decision ledger (Plan B Task 8)

Date: 2026-10-30. Approved board: direction D, `docs/design/guide/direction-d.html` (artifact https://claude.ai/artifact/M2JkS6ebyZ6BrGzwishjYN). Board source: `docs/design/guide/src/gen2.py` (imports `gen.py`); rebuild with `python3 docs/design/guide/src/gen2.py docs/design/guide`.
Status: owner called the design finalized on 2026-10-30 ("now the design is finalized"). Validated 2026-10-30 (Task 9 Step 0) against the conversation, the board, shape.md and critique-d.md; gaps fixed in this file and on the board (approved-layout wording, "Opened from the ask bar").

Where a later decision replaces an earlier one, the later one wins and the earlier line says **superseded**.

## Owner words (verbatim, in order)
1. "What do you think of scoping impeccle on chat revamp only. will it backfire ?"
2. "yes, add the guardrails and start Task 8 I think perhaps impeccable need full context about the existing app to design how to design to match with existing and plug it accordingly."
3. "but this include how we present the chat interfacr right" (placement is part of the design)
4. "as per 3 I think we should re think as per impeccable design" (entry and aurora may be rethought)
5. "wait did we run impeccable skill ?" → "continue"
6. "still I don't feel content design wise not very premium look, plus the placement A is kinda the old approach how about modern approach to it, a modern premium chat bot kida approach ? but this might even backfire as it's common on every page"
7. "forget about exitsing designsg and redesin with this angle"
8. "yes this looks premium, one questionn, panel specification when it opens as a pane on Task or RoadMap, will it have enough width ... the left side Panel now showing RoadMap or Home should not look ugly or cropped"
9. "yes add the width rules section and validate this with impeccable that this will work once implemented as well ... this should not impact user experience or look like a broken half baked product."
10. "We don't show ASK Inside settings ... showing ASK button on Top Nav is also kida old fashioned, how about we show it only in Home, RoadMap and TaskDetails in some modern way like floating bar ... I don't think we should show it in Settings window."
11. "now the design is finalized ... first step should be validate the design decisions with what we discussed and see it holds 100%"
12. "remeber our mobile UI should also look very premium polished ... Who ever uses this in Mobile I think should feel the most premium feeling ... this is not just for chat revamp I mean for entire app"

## Scope and guardrails (words 1–2)
- S1. impeccable designs the chat only; the whole app is read-only context.
- S2. r1-final tokens fixed (globals.css `@theme`); no new colours. **Amended (owner, 2026-10-30, Task 9):** the board's approved non-colour values (radii 18/16, reading text 16/17 px, pane widths, layout breakpoints, pane shadow) are added as one labelled guide token block (CW01).
- S3. Shared components unchanged, **except** the header Ask removal (D20, owner-approved) and the host-page container queries (D13, no visual change with the pane closed).
- S4. Boards show composite screens: host page + guide, at 1440 and 390.
- S5. `apps/web/PRODUCT.md` holds the guide's facts, audience, voice (calm checked expert) and first proof (answers are checked).

## Direction (words 6–8)
- D1. A, B, C retired. D "assistant pane" approved as premium.
- D2. Inset floating pane, radius 18, layered shadow, pushes the page aside (never overlays it, D11).
- D3. Each turn: the question as the heading, the answer as 16 px reading text (17 px in the focused view).
- D4. Inline numbered citation chips with a preview (domain + checked date); keyboard-reachable, Escape closes.
- D5. Provenance line under the question: origin label + domain + count, e.g. "LandedNZ's checked guide · ird.govt.nz · 3 sources" (single domain shown, not a favicon stack).
- D6. Composer: context chip (long titles truncate, full title on hover), "N left today" in `--muted`, round Send that becomes Stop. No chip when the composer is disabled.
- D7. Aurora only on the composer edge while writing; sentences settle in from a soft blur. Both off under reduced motion. (Minor logged: could be quieter.)
- D8. Expand to a focused view: 280 side rail ("This conversation, by task") + 720 reading column.
- D9. Phone (390): the same pane as a sheet, half height for the greeting, full height once you ask. The phone composer shows the context chip but not the "N left today" count (as drawn).
- D10. Crisis card: ink background, first in the reply, never animated, three tappable rows 1737 / 0800 543 354 / 111.

## Width rules (words 8–9; validated by dual impeccable critique, `critique-d.md`)
- D11. The pane never floats over the page from 1024 up; below 1024 it is a sheet.
- D12. Pane width by window: ≥1680 → 32.5rem; 1440–1679 → 28.75rem; 1024–1439 → 25rem. Page area = window − (pane + 24) − 88.
- D13. Page area becomes an inline-size `@container`. Convert `max-split:` at task-sheet.tsx:307, home-view.tsx:64, plan-form.tsx:152, app/app/loading.tsx:12 to container variants. settings-screen.tsx:44: **superseded** for the pane (no pane on Settings, D21); convert only if it shares the wrapper.
- D14. Task: two columns at container ≥720, actions `clamp(300px, 34%, 380px)` (the one new layout; accepted with "design finalized"); one column below 720; below a 561 container the actions bar sticks to the page area, not the viewport.
- D15. Home: two columns at container ≥900, stacked below. Settings ≥900 rule: **superseded** (D21).
- D16. Reading floor: task steps ≥45 characters a line.
- D17. Widths in rem; the actions column is monotonic (no 300/380 jump).

## Entry (word 10, replaces the header Ask and quick ask)
- D18. Floating ask bar on Home, Roadmap and Task only: bottom centre of the page area, 440×52, radius 16; guide mark, contextual text ("Ask about your first 90 days" / "Ask about your roadmap" / "Ask about your IRD number"), `/` kbd hint, ink go button. Home's next-move card keeps its "Ask about this" button, which opens the pane with that task as the context chip (board: Opening).
- D19. The bar grows into the pane on open and settles back on close; a teal dot shows when an answer finished while closed; pages reserve bottom space so it never covers the last item.
- D20. Header "Ask /" button removed everywhere. Quick-ask overlay removed (critique P2). **Superseded:** "header Ask needs `aria-expanded`" → applies to the ask bar instead.
- D21. Settings: no entry, no pane. Navigating to Settings closes the pane; the conversation is kept. Settings → Memory stays.
- D22. `/` opens the pane and focuses the composer only when focus is not in a field.
- D23. Phone: bar above the tabs on Home and Roadmap; Task keeps the approved bottom bar (Mark as done + Ask), no second bar.

## Conversation, states, memory (spec §8.2; board sections)
- D24. Opening: one "where you are" line + at most 3 starters, hidden once the conversation starts. Opened from a task, that task's messages show first ("Show all N messages").
- D25. State cards drawn (14): streaming with Stop, source preview, sources open with a check note (unverified claim, added under the answer, never instead of it), interrupted (what arrived stays + Retry), failed + Retry ("This question wasn't counted"), busy in another window, daily cap ("That's the 20 questions for today. You can ask again after midnight." with the answer above), nothing found (names the agency), official sites unavailable, cut short + "Want the rest?", Stopped before text (question given back, not counted), Stopped after text (counts), can't help (refusal, names who can), distress. The empty first visit is the Opening section (D24).
- D26. "What I can't tell you" with the agency's number; task card links by real title; at most one follow-up.
- D27. Memory: in-chat "Remembered: …" pill with Undo; Settings → Memory list with edit and delete (hard delete), max 50, footer "N of 50 kept. Health and immigration problems are only kept if you ask." (spec §8 remember rules).
- D28. Copy: unsourced claims removed (IR330 "no-notification rate", partner advice). Text uses `--muted`, never `--control`.

## Phone (word 12)
- D29. Phone (390) is a first-class Task 9 target, held to the same premium bar as 1440 (plan Task 9 checklist). A whole-app UI quality phase (web resolutions, then strict mobile) runs after Task 11 and before the production release, with its own brainstorm, spec and plan (plan, last section).

## Build requirements carried to Task 9
- B1. Focus to the composer on open, back to the ask bar on close; streaming in a polite live region; ask bar `aria-expanded`.
- B2. Playwright matrix, pane open on Task, Home, Roadmap (not Settings, D21) at 1024, 1180, 1280, 1366, 1440, 1536, 1600, 1680, 1920, plus 1366×768, 20 px root font, 125% and 200% zoom. Assert: no horizontal scroll, no clipped text, Mark as done never under the pane or the bar, steps ≥45 characters. Plus: ask bar present on Home/Roadmap/Task only, absent on Settings, zero header Ask buttons.
- B3. Build-stage `impeccable critique` + `audit` + `detect` on the real app; full output to `docs/design/guide/gate/critique.md`; fix every P0/P1.

## Open
- O1. **Decided (owner 2026-10-30): add the line.** Safety (flagged once; distress frozen): at the daily cap a distressed user sees no crisis numbers (429 makes no model call). Copy-only option: a permanent "Need to talk? Free call or text 1737" line in the cap message. Owner has not decided; unchanged on the board.
- O2. Logged minors, no fix cycle: jargon gloss ("earners' levy", "IR997"); Settings delete undo toast; in-pane "not legal or tax advice" line; header/page left edges while the pane is open; empty task-history state; short heights (1366×768); sheet at 600–1023 not drawn; counter under a crisis reply.
