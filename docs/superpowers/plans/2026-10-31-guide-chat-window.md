# Guide Chat Window Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Typeable ask bar on Home/Roadmap/Task; Enter opens the full view on Home/Roadmap and the chat in Task's right column, with the task card never moving.

**Architecture:** The guide store gains a one-time `prime()` (opening + "has conversation") and `askFromBar()`. `GuideShell` stops placing a pane beside the page: Home/Roadmap always open full; Task renders the chat inside its own grid column through a new `GuideColumn`. `GuidePane` gets a column mode (strip + "‹ Back to task").

**Tech Stack:** Next 16.4, React 19.3, Tailwind 4 (tokens in `apps/web/src/app/globals.css`), Zustand, Vitest 5 + Testing Library, Playwright.

**Spec:** `docs/superpowers/specs/2026-10-31-guide-chat-window-design.md` (board: `NZ_Project/images/guide-chat-window-2026-10-31/board.html`, frames + `capture.board.ts` there).

## Global Constraints

- Desktop rules apply from 1024 px (`(width >= 1024px)`, `useWide` in `guide-shell.tsx`). Below 1024 nothing changes (sheet, bar as a button).
- No API, store-logic or quota changes. Store actions used: `openPane`, `ask`, `close`, `toggleExpanded`, `setDraft`, `draft`, `opening`, `banner`, `turns`.
- Tokens only (CW01), no new colours, light only. Reduced motion respected (CW03).
- Copy, verbatim: "Type a question to start chatting." · "No questions left today. You can ask again after midnight, NZ time." · "Open conversation" · "Back to task" · "Try asking" · "You can undo this." · "Guide opened".
- Task grid: `--grid-template-columns-task: minmax(0, 1fr) 400px`, same open or closed. Task with the guide open shows two surfaces only (card + chat); the strip is flat with a hairline, never a box.
- Typed text in the bar: `text-body` (16 px).
- Commits: Conventional Commits with scope (`feat(guide):`, `test(web):`), no co-author trailer.

## Review Focus

- Enter while an IME is composing (Chinese, Japanese, Korean input) must not send: check `e.nativeEvent.isComposing`. Test in Task 2.
- Enter in the bar while an answer is still streaming: the guide opens and the question stays in the composer (store `ask` returns early; `draft` must not be cleared). Test in Task 1.
- Text typed in the bar, then the user goes to another page: the draft is kept (store `draft`), and the next page's bar shows it. Test in Task 2.
- Window resized across 1024 with the chat open on Task: it moves between column and sheet without rendering twice, and the conversation is kept. Test in Task 4.
- Mark as done from the strip: the strip switches to the done state ("Mark as not done"), the chat stays open. Test in Task 4.

---

### Task 1: Store — prime and askFromBar

**Files:**
- Modify: `apps/web/src/lib/stores/guideStore.ts`
- Test: `apps/web/src/lib/stores/guideStore.test.ts`

**Interfaces:**
- Produces:
  - state `hasConversation: boolean` (default `false`), `primed: boolean` (default `false`)
  - `prime(): Promise<void>`: once per store life (no-op when `primed`): with a token, loads `getGuideOpening(page ?? HOME)` into `opening` and `getGuideConversation(token)`; sets `hasConversation = messages.length > 0`. Errors are swallowed (bar stays usable). Also set `hasConversation = true` when `ask` adds a turn.
  - `askFromBar(text: string): Promise<void>`: `await openPane()` then `await ask(text.trim())`. If `ask` returns early (streaming or banner), `draft` keeps `text`.

- [ ] **Step 1: Write the failing tests** in `guideStore.test.ts`:
  - `prime loads the opening and knows a conversation exists`: mock conversation `{ messages: [oneAssistantRow], nextBefore: null }`, opening `leftToday: 0` → after `prime()`: `opening.leftToday === 0`, `hasConversation === true`, `open === false`.
  - `prime runs once`: two calls → `getGuideOpening` called once.
  - `askFromBar opens and asks`: → `open === true`, `askGuide` called with `{ text: 'Q', screen: { kind: 'home' } }`.
  - `askFromBar while streaming keeps the text`: set `streaming: true` → after `askFromBar('Q')`: `open === true`, `draft === 'Q'`, `askGuide` not called.
- [ ] **Step 2: Run** `npm test -w @landednz/web -- guideStore` → the 4 new tests FAIL.
- [ ] **Step 3: Implement** the state and actions above (set `draft: text` before calling `ask`, so the early-return case keeps it).
- [ ] **Step 4: Run** the same command → all PASS.
- [ ] **Step 5: Commit** `feat(guide): store primes the opening and asks from the bar`.

### Task 2: Typeable ask bar

**Files:**
- Modify: `apps/web/src/components/guide/ask-bar.tsx`, `apps/web/src/components/guide/guide-shell.tsx`
- Create test: `apps/web/src/components/guide/ask-bar.test.tsx`
- Modify test: `apps/web/src/components/guide/guide-shell.test.tsx` (bar is a textbox from 1024; "/" focuses)

**Interfaces:**
- Consumes: `prime`, `askFromBar`, `hasConversation`, `opening.leftToday`, `banner`, `draft`/`setDraft` (Task 1).
- Produces: `AskBar({ page, open, unseen, wide, onOpen, ref })`, where `ref: Ref<HTMLTextAreaElement | HTMLButtonElement>`. With `wide`: a `<textarea id="guide-ask" aria-label={askLabel(page)}>`; without: today's button, unchanged. `GuideShell` calls `prime()` once in an effect when `wide`.

Behaviour (spec "Ask bar"): Enter (no Shift, not `isComposing`) with text → `askFromBar(draft)`; with only spaces → show `<p role="status">Type a question to start chatting.</p>` above the bar, nothing opens; it clears on the next change. Shift+Enter → newline; `field-sizing: content` plus `max-h` of 3 lines (`text-body` line-height 1.5 → 72 px), then scroll. Send button: `aria-label="Send"`, disabled while `draft.trim() === ''`. Limited (`banner?.kind === 'cap' || opening?.leftToday === 0`): textarea `disabled`, placeholder = limit copy. `hasConversation`: the Guide mark is a `<button aria-label="Open conversation">` calling `onOpen`; otherwise the plain mark. "/" in `GuideShell` focuses `#guide-ask` when wide (was `openPane`). The focus ring copies the composer's focus classes. The `/` hint `<kbd>` keeps `aria-hidden`, and the textarea gets `aria-keyshortcuts="/"`. The unseen dot and its sr-only text are unchanged. Hidden while `open` (as today). Add `scroll-padding-bottom` on `html` from 1024 equal to the bar's height plus its bottom offset (a token in `globals.css`), so focused links are never hidden under the sticky bar.

- [ ] **Step 1: Write the failing tests** in `ask-bar.test.tsx` (wide):
  - `Enter sends the typed question` → `askFromBar` called with `'Can I apply?'`.
  - `Enter on an empty bar shows the note and does not open` → status text "Type a question to start chatting."; `openPane` not called; typing a letter removes the note.
  - `Shift+Enter keeps a new line` → value contains `\n`, nothing sent.
  - `Enter while composing does not send` → `fireEvent.keyDown(box, { key: 'Enter', isComposing: true })` → not sent.
  - `limit reached disables the bar` (`opening.leftToday: 0`) → textbox disabled, placeholder is the limit copy.
  - `Open conversation shows only with a conversation` → absent when `hasConversation: false`; present and calls `onOpen` when true.
  - `the draft carries to the next page` → set `draft: 'Q'`, render with another `page` → value `'Q'`.
  - in `guide-shell.test.tsx`: `"/" focuses the bar` → `document.activeElement.id === 'guide-ask'`, `open === false`. Below 1024 (matchMedia false): the bar is still a button and opens the sheet.
- [ ] **Step 2: Run** `npm test -w @landednz/web -- ask-bar guide-shell` → new tests FAIL.
- [ ] **Step 3: Implement** in `ask-bar.tsx` and `guide-shell.tsx` (pass `wide`, call `prime`, change "/").
- [ ] **Step 4: Run** the same → PASS; the existing guide-shell tests that click the bar as a button are updated to type + Enter.
- [ ] **Step 5: Commit** `feat(guide): ask bar you type into from 1024 px`.

### Task 3: Home and Roadmap open the full view

**Files:**
- Modify: `apps/web/src/components/guide/guide-shell.tsx`, `apps/web/src/components/guide/focused-view.tsx`, `apps/web/PRODUCT.md` (Opening line)
- Test: `apps/web/src/components/guide/guide-shell.test.tsx`, `apps/web/src/components/workspace/home-view.test.tsx`, `apps/web/src/components/workspace/roadmap-view.test.tsx`

**Interfaces:**
- Produces: in `GuideShell`, `const full = beside && (expanded || page.kind !== 'task')`, which renders `FocusedView`. No `<aside id="guide-pane">` beside `<main>` on Home or Roadmap. The `expanded` state is not changed by this rule, so Task is unaffected. `FocusedView` gets prop `starters: string[]` (from `opening.starters`, at most 3, minus the latest turn's follow-up text) and renders "Try asking" under the conversation `nav`: a `text-small text-muted` label plus rows styled like `Opening`'s starter buttons; a click calls `ask(text)`. Collapse is rendered only when `page.kind === 'task'`.

- [ ] **Step 1: Write the failing tests**:
  - `Enter on Home opens the full view` → after typing + Enter: the "Back to Home" button is visible; no `#guide-pane` aside with class `w-pane`.
  - `"Ask about this" on Home opens the full view` (home-view test) → `openPane` with the task context; the full view renders.
  - `Try asking sends a starter` → click "What do I need to open a bank account?" → `askGuide` called with it.
  - `Try asking skips the current follow-up` → a turn whose follow-up equals starter 1 → that starter is not listed.
  - `no Collapse on Home and Roadmap` → `queryByRole('button', { name: 'Collapse' })` is null on `kind: 'home'` and `'roadmap'`, present on `'task'` when expanded.
- [ ] **Step 2: Run** `npm test -w @landednz/web -- guide-shell home-view roadmap-view` → FAIL.
- [ ] **Step 3: Implement** as above; in PRODUCT.md change the Opening line to: "Opening: one 'where you are' line and at most 3 starter questions. In the full view the starters stay under 'Try asking' after the conversation starts."
- [ ] **Step 4: Run** → PASS.
- [ ] **Step 5: Commit** `feat(guide): Home and Roadmap open the full view with Try asking`.

### Task 4: Task — chat in the right column

**Files:**
- Create: `apps/web/src/components/guide/guide-column.tsx`
- Modify: `apps/web/src/components/guide/guide-pane.tsx`, `apps/web/src/components/guide/guide-shell.tsx`, `apps/web/src/components/workspace/task-sheet.tsx`, `apps/web/src/app/globals.css`
- Test: create `apps/web/src/components/guide/guide-column.test.tsx`; update `guide-shell.test.tsx`

**Interfaces:**
- Consumes: the `full` rule (Task 3), `useWide`.
- Produces:
  - `export const GuideTitles = createContext<Record<string, string>>({})`, provided by `GuideShell` around its children. Also export `useWide` from `guide-shell.tsx`.
  - `GuideColumn({ strip, children }: { strip: ReactNode; children: ReactNode })`: renders `children` (the Task actions aside) unless `open && wide && !expanded`. In that case it renders `<aside id="guide-pane" aria-label="Guide">`: sticky `top-16`, height `h-guide-pane`, padding-block 24 px, containing `GuidePane` with `strip` and `onBack={close}`. Contents fade (`motion-safe:animate-in fade-in`, 200 ms). Esc inside calls `close`. On open, focus goes to `#guide-composer`, and a polite live region says "Guide opened". On Back/Esc, focus returns to `#guide-ask` (the shell's existing `wasOpen` effect, retargeted to the textarea).
  - `GuidePane({ titles, sheet, strip, onBack })`: when `strip` is set, the header is a "Back to task" button (ChevronLeft 14, `text-ui font-medium`, style of the page's "‹ Roadmap" link) plus Expand. There is no title and no ×. `strip` renders under the header with `border-b border-hairline`.
  - `GuideShell`: no beside pane on Task. `beside && !expanded` renders nothing beside `<main>`, `<main>` stays centred (drop `mx-0!`), and the "centre as one group" wrapper goes.
  - `task-sheet.tsx`: wrap the "Task actions" aside in `<GuideColumn strip={strip}>`. `strip` = row 1: status (`text-ui font-semibold`) + bestBy (`text-small font-semibold text-teal`); row 2: `doneControls` and `actionLink` side by side (`flex-1` each); then `errorNote` and the undo note (same conditions as the column). Same handlers.
  - `globals.css`: `--grid-template-columns-task: minmax(0, 1fr) 400px`. Remove `--grid-template-columns-task-pane`, the `guide-open:@min-guide-task/page:grid-cols-task-pane` class in `task-sheet.tsx`, the `pane-md:`/`pane-lg:` widths in `guide-shell.tsx`, and `--container-pane-md`, `--container-pane-lg`, `--breakpoint-pane-md`, `--breakpoint-pane-lg`, once grep shows no use. Drop the `guide-open` variant if unused.

- [ ] **Step 1: Write the failing tests** in `guide-column.test.tsx` (wide, store `open: true`):
  - `chat replaces the actions` → the "Task actions" aside is absent; the "Guide" aside contains "Mark as done" and "Back to task".
  - `Back to task restores the actions and keeps the conversation` → click → the actions aside is back; `turns.length` unchanged.
  - `Esc restores` → keyDown Escape inside the aside → `open === false`.
  - `Mark as done from the strip keeps the chat open` → click → the `completeTask` mock (`@/lib/api`) is called once; the strip shows "Mark as not done"; the Guide aside is still present.
  - `expanded shows the full view, not the column` → `expanded: true` → no column aside.
  - `below 1024 the column never renders the chat` → matchMedia false → the actions aside stays, and the sheet opens instead (one `#guide-pane` in the document).
- [ ] **Step 2: Run** `npm test -w @landednz/web -- guide-column guide-shell` → FAIL.
- [ ] **Step 3: Implement** per Interfaces.
- [ ] **Step 4: Run** `npm test -w @landednz/web` (whole unit suite) and `npm run typecheck -w @landednz/web` → PASS.
- [ ] **Step 5: Commit** `feat(guide): task chat takes the right column, card never moves`.

### Task 5: End-to-end and the design gate

**Files:**
- Modify: `apps/web/e2e/guide-widths.spec.ts`, `guide.spec.ts`, `a11y.spec.ts`, `app-frame.spec.ts`, `journey.spec.ts`, `board-compare.spec.ts`
- Output: `NZ_Project/images/guide-chat-window-2026-10-31/gate/build-critique.md`

**Interfaces:**
- Consumes: everything above. A shared e2e helper `askFromBar(page, text)` in `e2e/test-user.ts`: fill `#guide-ask`, press Enter.

- [ ] **Step 1: Rewrite `guide-widths.spec.ts` checks** for the same `CASES`:
  - Task: card left edge (`main .grid > div`) is equal closed vs open; `#guide-pane` width = 400 × (rootPx/16); "Mark as done" is inside `#guide-pane` and in view; step characters a line ≥ 45; no sideways scroll; no clipped text.
  - Home/Roadmap: after `askFromBar`, "Back to Home"/"Back to Roadmap" is visible, the composer sits above the footer, and there is no sideways scroll.
- [ ] **Step 2: Update the other specs** that click the bar (`getByRole('button', { name: /^Ask about/ })`) to use `askFromBar`, or `Open conversation` where they only open. In `a11y.spec.ts`, add axe on Task with the guide open and on the empty-Enter note.
- [ ] **Step 3: Run** `make test-e2e` → all pass, including Task @1280 characters a line. The pre-existing failures named in the spec's non-goals stay out of scope; report them if still red.
- [ ] **Step 4: Board vs build:** rerun `capture.board.ts`-style screenshots of the built pages at 1024/1280/1512 (no injection) and compare frame by frame with the board. Every board point must match, and nothing else may change.
- [ ] **Step 5: Gate:** run impeccable `critique` and `audit` on the built guide, plus `impeccable detect --json` on the changed files. Save the full output to `gate/build-critique.md` and fix every P0/P1 before reporting done.
- [ ] **Step 6: Commit** `test(web): guide chat window e2e and gate`.
