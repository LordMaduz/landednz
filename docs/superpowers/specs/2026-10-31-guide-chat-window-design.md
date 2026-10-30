# Guide chat window (desktop ≥1024) — design

Date: 2026-10-31 · Status: board approved by owner 2026-10-31

Board: `NZ_Project/images/guide-chat-window-2026-10-31/board.html` (artifact https://claude.ai/artifact/XWxzYJnq2cGrJYjY6LYVhm). Frames are real screenshots with the layout injected by `capture.board.ts` (same folder), which also holds the measurements. Critique: `gate/critique.md` there (no P0; P1s fixed, rejected with evidence, or settled by the owner).

Builds on the fixed app frame (a3ad836): 64 px header and footer stay on screen from 1024 px.

## Goal

Ask a question without losing your place. Two problems go away:

1. Task Details slides left when the guide opens (`guide-shell.tsx` centres page and pane as one group, so the page re-centres).
2. Task @1280 steps run at 42 characters a line with the guide open (guide-widths e2e fails, needs ≥45).

## Decisions (owner, 2026-10-31)

| # | Decision |
|---|---|
| D1 | One ask bar you type into on Home, Roadmap and Task. Enter sends. Shift+Enter adds a line. |
| D2 | Enter on an empty bar never opens the guide. A note above the bar says "Type a question to start chatting." |
| D3 | Home and Roadmap: Enter opens the full view (between header and footer), already answering. No side panel on these pages. |
| D4 | Task keeps the same 1200 px content as Home and Roadmap, split 784 card + 400 right column (was `minmax(0,1fr) 380px`), the same open or closed. |
| D5 | Task: Enter swaps the right column's contents (Not started + Sources) for the chat. The task card never moves or reflows. Two surfaces only: the card and the chat. |
| D6 | The chat on Task carries a flat strip at its top (hairline under it, no box): status, Best done by, Mark as done, the task's action link, "You can undo this." |
| D7 | "‹ Back to task" and Esc restore the column; the conversation is kept. Expand opens the full view. |
| D8 | Full view: "Try asking" with 3 starter questions in the left column, under "This conversation, by task". A click sends one. The bar itself is never prefilled. |
| D9 | "Open conversation": the bar's Guide mark becomes a labelled button when a conversation exists, so answers can be reread without asking (also when the daily limit is reached). |
| D10 | "Ask about this" buttons (Home next move, Roadmap) keep their behaviour; they now open the guide in the full view, because those pages lose the side panel. |
| D11 | Phones and tablets (<1024): unchanged. Tapping the bar opens the sheet with the cursor in the composer (already the case). |

Measured on the board (card left edge closed → open; longest step, characters a line): 1024: 24 → 24, 53 · 1280: 40 → 40, 70 · 1512: 156 → 156, 70.

## Behaviour

No API changes. Everything uses the guide store's existing actions (`openPane`, `ask`, `close`, `toggleExpanded`, `draft`/`setDraft`).

### Ask bar (`components/guide/ask-bar.tsx`), from 1024 px

- A labelled multi-line text box (label = today's `askLabel(page)`, e.g. "Ask about your IRD number"), typed text 16 px (`text-body`: the type roles name body as the form-field size). Placeholder shows the same label.
- Value is the store's `draft`, so text typed in the bar is what the composer holds after opening.
- Enter with text: Home/Roadmap → open expanded and `ask(text)`. Task → open in the column and `ask(text)`.
- Enter with only spaces: nothing opens; show the note in a `role="status"` region above the bar; it clears on the next input.
- Shift+Enter: new line. The box grows to 3 lines, then scrolls inside.
- Send button: grey and disabled while empty; ink when there is text. Same action as Enter.
- Focus ring: the composer's teal focus ring.
- "/" (outside other fields) moves focus into the bar (today it opens the pane).
- Daily limit reached: the box is disabled and reads "No questions left today. You can ask again after midnight, NZ time." Source: the store's `banner` of kind `cap` (with `resetAt`), which is set when the server refuses an ask and lifts at `resetAt`. Until the store knows (fresh page load at the cap), Enter opens the guide and the existing cap banner shows there; plan step 1 checks whether the opening/context response already carries the count so the bar can disable up front.
- Unseen answer: the teal dot on the mark stays, with its screen-reader text.
- D9: when a conversation exists, the mark is a button "Open conversation" (opens the full view on Home/Roadmap, the column on Task). Plan step 1 confirms how the store knows a conversation exists before building (contract check; no API change expected).
- Below 1024 the bar stays today's button that opens the sheet.
- The bar is hidden while the guide is open (as today).

### Home and Roadmap (≥1024)

- `openPane` on these pages opens straight into the expanded (full) view; the beside-the-page pane is not used here any more.
- Full view (`focused-view.tsx`): add "Try asking" under the conversation list: `opening.starters` (from the API, at most 3, as `opening.tsx` uses them), minus any question already shown as the latest follow-up. A click calls `ask`. The section stays after the conversation starts (PRODUCT.md "Opening" line updated to say so).
- Collapse is hidden on Home and Roadmap (there is no side panel to collapse to). "Back to Home/Roadmap" and Close remain.

### Task Details (≥1024)

- Grid: `--grid-template-columns-task: minmax(0, 1fr) 400px`; the `task-pane` grid and the `guide-open` grid variant on Task are removed.
- `GuideShell` no longer places the pane beside `<main>` on Task; `<main>` keeps its normal centred position whether the guide is open or not.
- When open, the chat renders in the right grid column in place of the "Task actions" aside. Sticky 24 px under the header, height = the window between header and footer minus 24 px top and bottom (the existing `--spacing-guide-pane`), so it holds still while the steps scroll.
- Chat header: "‹ Back to task" (closes the guide; same style as the page's "‹ Roadmap" breadcrumb) and Expand. The "Guide" title and × are not shown here.
- Strip (D6): reuses the task page's own status, Best-by, `doneControls`, `actionLink` and undo note — same handlers, no logic change. Status 14 px semibold, Best-by 12 px teal, buttons side by side (Mark as done primary, action link outline), undo note 12 px muted, hairline under it.
- Swap: the column's contents fade (opacity, ~200 ms); nothing else moves. Reduced motion: no animation.
- Focus: Enter moves focus to the composer; a polite live region says "Guide opened". Back/Esc returns focus to the bar.
- Blocked or done tasks: the strip shows what the column shows today for that state.
- Full view from Task is unchanged.

### Tokens

- Change `--grid-template-columns-task` to `minmax(0, 1fr) 400px`.
- Remove `--grid-template-columns-task-pane`, `--container-pane-md`, `--container-pane-lg`, `--breakpoint-pane-md`, `--breakpoint-pane-lg` once nothing uses them (the side pane now exists only on Task, at 400 px).
- No new colours. The bar's focus ring and states reuse the composer's values.

## Accessibility (WCAG 2.2 AA)

- The bar is a labelled textarea; the empty-Enter note and "Guide opened" are announced (polite).
- `scroll-padding-bottom` equals the bar's height + gap, so keyboard focus is never hidden under the sticky bar (SC 2.4.11).
- "Open conversation" and "Back to task" are real buttons with visible labels; "/" has an accessible hint ("Press / to type").
- Targets ≥24 px (SC 2.5.8); the strip buttons are 36 px tall.

## Tests

Update (they click the bar as a button or assume the side pane on Home/Roadmap):
- e2e: `guide-widths.spec.ts` (Task: right column 400 at every width, card left edge identical closed vs open, steps ≥45; Home/Roadmap: full view, no pane), `guide.spec.ts`, `a11y.spec.ts`, `app-frame.spec.ts`, `journey.spec.ts`, `board-compare.spec.ts`.
- unit: `guide-shell.test.tsx`, `conversation.test.tsx`, `home-view.test.tsx`, `roadmap-view.test.tsx`, `preview-route.test.tsx`.

New:
- Ask bar: Enter sends; empty Enter shows the note and does not open; Shift+Enter keeps a newline; "/" focuses; limit disables; "Open conversation" only with a conversation.
- Task: chat in the column, strip actions call the same handlers as the column; Esc and "Back to task" restore and keep the conversation.
- Full view: "Try asking" sends; follow-up duplicate excluded; Collapse hidden on Home/Roadmap.

The Task @1280 characters-a-line failure must pass after this change.

## Non-goals

- Phone and tablet sheet (D11), answer design, citations, crisis card, memory.
- API, store logic, quota rules.
- Pre-existing, unrelated: a11y @390 target size on Roadmap "Show N more" (`roadmap-view.tsx:157`), lint unused var in `src/types/web.ts`.
