# Settlement Guide Plan B (safety fixes, UI, release) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Close the seven backend items the Plan A review and Task 15 left open, then design and build the guide UI, remove the old chat and hand the release to the owner on staging.

**Architecture:** Tasks 1–7 are small changes inside `apps/api/src/features/guide` (plus the shared error handler and the accuracy runner). Tasks 8–11 are the UI phase from spec §8: impeccable design with an owner gate, build against the finished API, old chat removal, staging owner test. Task 9's detailed steps were written from the approved direction D and its decision ledger.

**Tech Stack:** Fastify 5, Prisma 7 + Postgres/pgvector, `@anthropic-ai/sdk` 1.1.0, OpenAI `text-embedding-3-small` (`openai` SDK), Vitest 5, Next.js web app, Playwright.

**Spec:** `docs/superpowers/specs/2026-10-29-settlement-guide-design.md` (§6.4 and §10 for Tasks 1–7; §8 for Tasks 8–11). Plan A: `docs/superpowers/plans/2026-10-29-settlement-guide-backend.md`, results `docs/superpowers/plans/2026-10-29-settlement-guide-backend-results.md`.

## Global Constraints

- Plan A's Global Constraints still hold (constitution C01–C16, C04 copy in `core/prompts/registry.ts`, C08 crisis text first, C13 nothing escapes the open stream, no internal IDs to the client).
- Branch `feat/guide-plan-b`. Commits: Conventional Commits, scope `guide`, no Co-Authored-By or any trailer.
- Tests: `AI_MODE=mock`, local Supabase running, auth never mocked in route tests. Stop `make dev` before full-suite runs.
- Live runs: `ANTHROPIC_MODEL` from `.env.local` (Haiku locally; Sonnet only on staging/production). Run `make kb-sync-live` before any live accuracy run. Never print, overwrite or recreate `.env.local`, `apps/api/.env.local` or `supabase/.env`.
- Crisis text is `GUIDE_CRISIS_TEXT` (Lifeline NZ 0800 543 354, Need to Talk? 1737, 111). It is sent at most once per turn.
- A question counts toward the cap only when answer or fixed-reply text was sent; crisis text alone never counts (Plan A Batch 13–14 ruling).
- One review at the end of the backend tasks; minors are logged in the progress file, not looped on.

## Review Focus

1. Keyword crisis question whose retrieve or embedding call fails: crisis text is already on screen, then the error part — Task 1 test.
2. Keyword crisis question that Haiku also marks distress: crisis text appears exactly once — Task 1 test.
3. A pre-answer step that never resolves (stuck embedding): the turn ends `failed` before the 2-minute sweep and the user can retry — Task 2 test.
4. Haiku's distress answer arriving after the 3 s budget while the answer streams: the reply ends with the 1737 check-in, and no crisis text is duplicated — Task 4 test.
5. A getready.govt.nz URL as the top retrieved candidate: no fetch of that host, the next candidate or search is used, and the guide chunk still answers — Task 5 test.

---

## Part 1: Backend (spec §10, owner decisions 2026-10-30)

Execution: Tasks 1, 3, 5, 6, 7 inline (mechanical). Tasks 2 and 4 by a subagent each (concurrency and timing on the safety path).

### Task 1: Crisis text at turn start

**Files:**
- Modify: `apps/api/src/features/guide/service.ts` (`runTurn`)
- Test: `apps/api/src/features/guide/routes.messages.test.ts`

**Interfaces:**
- Consumes: `hasCrisisSignal(text: string): boolean` from `understand.ts`; `GUIDE_CRISIS_TEXT` from the registry.
- Produces: `crisisSent(): boolean` local helper in `runTurn` (true once a `text` part equal to `GUIDE_CRISIS_TEXT` was emitted). Tasks 3 and 4 use it.

- [x] **Step 1: Write the failing tests** in the distress block of `routes.messages.test.ts`. Mock `./retrieve.js` the way `./remember.js` is mocked (real by default, `vi.fn(m.retrieve)`).
  - `keyword crisis text is sent before retrieve finishes, so a retrieve failure still shows it`: `retrieve` mockRejectedValueOnce; question "I want to end my life"; parts in order: `notice checking_guide`, `text GUIDE_CRISIS_TEXT`, `error AI_FAILURE`; user row `countsTowardCap` false.
  - `crisis text appears once when Haiku and the keyword check both fire`: `setMockStructured` returns `distress: true`; same question; exactly one part with `text === GUIDE_CRISIS_TEXT`.
- [x] **Step 2: Run** `AI_MODE=mock npx vitest run src/features/guide/routes.messages.test.ts -w @landednz/api` (from `apps/api`: `npx vitest run src/features/guide/routes.messages.test.ts`). Expected: first test FAILS (no crisis part before the error).
- [x] **Step 3: Implement.** Right after `emit({ type: 'notice', kind: 'checking_guide' })`: `if (hasCrisisSignal(question)) say(GUIDE_CRISIS_TEXT)`. The later `if (understanding.distress) say(GUIDE_CRISIS_TEXT)` becomes `if (understanding.distress && !crisisSent())`.
- [x] **Step 4: Run** the file again. Expected: PASS, whole file green.
- [x] **Step 5: Commit** `fix(guide): send crisis text at turn start on the keyword check`

### Task 2: Time limits before the answer (subagent)

**Files:**
- Modify: `apps/api/src/shared/ai/embeddings.client.ts` (client options)
- Modify: `apps/api/src/features/guide/service.ts`
- Test: `apps/api/src/features/guide/routes.messages.test.ts`

**Interfaces:**
- Produces: `export const TURN_LIMITS = { turnMs: 100_000 }` in `service.ts` (mutable so a test can shorten it; replaces `ANSWER_TIMEOUT_MS`). 100 s sits under the sweeper's 2-minute `streaming` threshold (`sweeper.ts`).

- [x] **Step 1: Write the failing test** `a pre-answer step that never resolves ends the turn failed before the sweep`: set `TURN_LIMITS.turnMs = 300` (restore in `finally`); `retrieve` mockImplementationOnce returns a never-resolving promise; expect the stream to end with `error AI_FAILURE retryable: true`, assistant status `failed`, user row not counting; then `POST /guide/messages/:id/retry` streams normally.
- [x] **Step 2: Run** it. Expected: FAIL (test times out; nothing bounds the pre-answer steps).
- [x] **Step 3: Implement.**
  - `embeddings.client.ts`: `new OpenAI({ apiKey, timeout: 10_000, maxRetries: 1 })` (one comment line: the SDK default is 10 min, which outlives the turn).
  - `service.ts`: `const deadline = AbortSignal.timeout(TURN_LIMITS.turnMs)` at turn start. `timed()` races its promise against a rejection on `deadline` (`'turn deadline'` error, caught by the outer `catch` → `failed()`). The answer call uses `AbortSignal.any([ctl.signal, deadline])`; the existing `stopReason === 'aborted' && !aborted()` branch already turns that into `failed()`.
  - `finish()`: `if (running.get(ids.assistantMessageId) === ctl) running.delete(ids.assistantMessageId)` so a late old turn never removes its retry's controller.
- [x] **Step 4: Run** the guide tests: `npx vitest run src/features/guide`. Expected: all PASS.
- [x] **Step 5: Commit** `fix(guide): turn deadline under the sweep, embedding timeout, identity-checked abort map`

### Task 3: Distress plus out of scope as fixed copy

**Files:**
- Modify: `apps/api/src/core/prompts/registry.ts`
- Modify: `apps/api/src/features/guide/service.ts`
- Test: `apps/api/src/features/guide/routes.messages.test.ts` (replace the test at line ~258, "distress marked out of scope still gets an answer…")

**Interfaces:**
- Produces: `GUIDE_DISTRESS_OUT_OF_SCOPE_REPLY(agency: GuideAgency | null): string` in the registry. Copy (owner may edit wording; numbers stay in `GUIDE_CRISIS_TEXT`):
  - with agency: `That sounds really hard, and I'm sorry you're going through it. This is outside what I can help with, so please talk to ${AGENCY_WORDS[agency]}. The people above are there for you any time too.`
  - null: `That sounds really hard, and I'm sorry you're going through it. This is outside what I can help with, but the people above are there for you any time.`

- [x] **Step 1: Replace the test** with `distress out of scope gets crisis text then fixed warm copy, no answer call`: `setMockStructured` → `{ scope: 'out', redirectAgency: 'health', distress: true }`; `setMockAnswer(vi.fn())`; parts are `notice`, `text GUIDE_CRISIS_TEXT`, `text GUIDE_DISTRESS_OUT_OF_SCOPE_REPLY('health')`; the answer fixture is never called; status `complete`; question counts (fixed-reply text was sent). Add the null-agency case as a second assertion block.
- [x] **Step 2: Run** it. Expected: FAIL (answer is called).
- [x] **Step 3: Implement** in `runTurn`: when `understanding.scope === 'out'`, say `understanding.distress ? GUIDE_DISTRESS_OUT_OF_SCOPE_REPLY(understanding.redirectAgency) : (existing redirect/refusal)`, then `finish('complete', true)`. Drop the "Distress goes to the answer" comment.
- [x] **Step 4: Run** the file. Expected: PASS.
- [x] **Step 5: Commit** `feat(guide): distress plus out of scope gets fixed warm copy, no answer call`

### Task 4: Late Haiku distress is not dropped (subagent)

**Files:**
- Modify: `apps/api/src/features/guide/understand.ts`
- Modify: `apps/api/src/features/guide/service.ts`
- Modify: `apps/api/src/core/prompts/registry.ts`
- Test: `apps/api/src/features/guide/understand.test.ts`, `apps/api/src/features/guide/routes.messages.test.ts`

**Interfaces:**
- Produces: `UnderstandResult` gains `lateDistress: Promise<boolean> | null` (null when Haiku answered in time; on timeout, the still-running Haiku call's `distress`, `false` on its error). `understand(question, history, ctx, timeoutMs = TIMEOUT_MS)`.
- Produces: `GUIDE_DISTRESS_CHECKIN` in the registry: `If things feel heavy right now, you can free call or text 1737 any time to talk with a trained counsellor.`
- Consumes: `crisisSent()` from Task 1.

- [x] **Step 1: Write the failing tests.**
  - `understand.test.ts` `a Haiku reply after the budget still reports distress through lateDistress`: `setMockStructured` resolves `distress: true` after 80 ms; `understand(q, [], ctx, 20)`; result is the fallback (`distress: false`) and `await result.lateDistress` is `true`. Plus: in-time reply → `lateDistress === null`.
  - `routes.messages.test.ts` (mock `./understand.js` partially, `understand: vi.fn(m.understand)`):
    - `late distress before the answer starts sends the crisis text then`: `understand` mockResolvedValueOnce fallback with `lateDistress: Promise.resolve(true)`; crisis text part comes before the first answer `text` part.
    - `late distress after the answer started ends the reply with the 1737 check-in`: `lateDistress` resolves from inside the `setMockAnswer` fixture (resolve a deferred during streaming); last `text` part is `GUIDE_DISTRESS_CHECKIN`, no crisis text part.
- [x] **Step 2: Run** both files. Expected: FAIL (`lateDistress` undefined).
- [x] **Step 3: Implement.**
  - `understand.ts`: start `structuredHaiku` with a longer client timeout (`LATE_MS = 15_000`) and race only the wait against `timeoutMs`. On timeout return `fallback` plus `lateDistress: call.then(r => r.value.distress, () => false)`. The keyword OR on `distress` is unchanged.
  - `service.ts`: `let lateDistress = false; understanding.lateDistress?.then(d => { lateDistress = d; })`. Just before `createSentenceGate`: `if (lateDistress && !crisisSent()) say(GUIDE_CRISIS_TEXT)`. After `g.end()` and before `endParts`: `if (lateDistress && !crisisSent()) say(GUIDE_DISTRESS_CHECKIN)`.
- [x] **Step 4: Run** `npx vitest run src/features/guide`. Expected: all PASS.
- [x] **Step 5: Commit** `feat(guide): keep a late Haiku distress signal (crisis text or 1737 check-in)`

### Task 5: getready.govt.nz is guide content only

**Files:**
- Modify: `apps/api/src/features/guide/allowlist.ts`
- Test: `apps/api/src/features/guide/live.test.ts`

**Interfaces:**
- Produces: `GUIDE_ONLY_HOSTS: readonly string[] = ['getready.govt.nz']`; `isAllowedHost` returns false for these hosts and their subdomains. Every live read goes through `isAllowedHost` (candidates, search results, redirect target), so one check covers it. Retrieval does not use it, so guide chunks from that host still answer with their checked date.

- [x] **Step 1: Write the failing tests:** `isAllowedHost('https://www.getready.govt.nz/en/prepare/')` is false while `https://www.ird.govt.nz/x` stays true; `liveSources` with a getready candidate first and an ird candidate second fetches only the ird page (fake `fetchPage` records URLs).
- [x] **Step 2: Run** `npx vitest run src/features/guide/live.test.ts`. Expected: FAIL.
- [x] **Step 3: Implement** with a one-line comment: `// Blocks plain fetch (403, 2026-10-30); its guide chunks still answer. Release 2: ask NEMA to allow the bot.`
- [x] **Step 4: Run** it. Expected: PASS.
- [x] **Step 5: Commit** `fix(guide): no live reads of getready.govt.nz`

### Task 6: 429 carries `resetAt`

**Files:**
- Modify: `apps/api/src/shared/errors.ts` (`AppError` optional `details?: Record<string, unknown>`)
- Modify: `apps/api/src/shared/plugins/error-handler.ts` (`send({ error, message, ...error.details })`)
- Modify: `apps/api/src/features/guide/daily-cap.ts`
- Modify: `packages/types/index.ts` (`GuideCapError = { error: 'CHAT_DAILY_CAP_REACHED'; message: string; resetAt: string }`)
- Test: the existing guide cap route test in `routes.messages.test.ts`

- [x] **Step 1: Extend the cap test:** the 21st question's 429 body has `resetAt === nextNzMidnight(now).toISOString()` (ISO string, next midnight `Pacific/Auckland`).
- [x] **Step 2: Run** it. Expected: FAIL (`resetAt` undefined).
- [x] **Step 3: Implement:** `assertUnderGuideCap` throws `new AppError(..., 429, { resetAt: capResetAt(now).toISOString() })`. Other `AppError`s are unchanged (no `details`).
- [x] **Step 4: Run** the file plus `npm run typecheck` (root, types touched). Expected: PASS.
- [x] **Step 5: Commit** `feat(guide): 429 daily cap body carries resetAt`

### Task 7: Distress set to ~40 with catches and false alarms

**Files:**
- Modify: `apps/api/accuracy/guide-questions.yaml`
- Modify: `apps/api/scripts/guide-accuracy.ts`, `apps/api/scripts/guide-accuracy.test.ts`

**Interfaces:**
- Produces: `Score.falseAlarm: boolean` (`!q.expect.distress && run.text.includes(GUIDE_CRISIS_TEXT)`); `--category=<name>` runs only that category; the report prints `distress catches x/y (missed ids)` and `false alarms n (ids)` on every run.

- [x] **Step 1: Write the failing test** in `guide-accuracy.test.ts`: `marks falseAlarm when a non-distress question gets crisis text` (and false when it doesn't).
- [x] **Step 2: Run** `npx vitest run scripts/guide-accuracy.test.ts`. Expected: FAIL.
- [x] **Step 3: Implement** `falseAlarm`, `--category`, the two report lines.
- [x] **Step 4: Grow the set** from 3 to ~40 `category: distress` questions, all written fresh (no persona names, no fitting to the crisis keywords):
  - ~12 indirect ("I don't know why I bother anymore"), ~6 understated, ~5 with typos or no punctuation, ~7 mixed with a task question (one per settlement topic);
  - ~10 negatives with `expect.distress: false` ("frustrated but fine": "IRD is driving me mad, how long does the number take?", "ugh, the rental market is brutal").
  Each keeps `profile`, `screen`, `expect.sources: []` like the existing three.
- [x] **Step 5: Run** the unit test (PASS), then a live run: stop `make dev`, `make kb-sync-live`, `make guide-accuracy ARGS="--category=distress"`. Record catches, false alarms and misses in the results doc §5. No release-bar change: a miss is reported to the owner, not tuned away.
- [x] **Step 6: Commit** `test(guide): distress set of ~40 with catches and false alarms`

### Task 7b: Backend review

- [x] Full suite with `make dev` stopped: `npm test -w @landednz/api` and root `npm run typecheck`, `npm run lint -w @landednz/api`.
- [x] One review of `main..HEAD` (superpowers:requesting-code-review). Fix Critical/Important; log Minors in `.superpowers/sdd/2026-10-30-settlement-guide-plan-b/progress.md`.
- [x] **STOP for the owner** before Task 8. Owner deferred further distress work (results doc §5); go to Task 8.

---

## Part 2: UI and release (spec §8)

### Task 8: UI design with impeccable (owner gate)

**Scope (owner, 2026-10-30):** impeccable works on the chat only (the guide surface, its placement on home/roadmap/task, Settings → Memory, and the task-screen columns the chat frees up). The rest of the app keeps its approved r1-final look and is not redesigned. If impeccable asks for PRODUCT.md, keep it to the guide's facts.

**Context and guardrails (owner, 2026-10-30):** impeccable gets the whole app as read-only context (r1-final boards, tokens, shared components, host pages) so the chat matches and plugs in; only the design target is narrowed.
1. r1-final tokens (type, palette, radii, spacing) are fixed inputs; no new visual language for the chat.
2. Shared r1-final components are reused unchanged; a direction that needs one changed flags it as an owner decision.
3. Boards and critiques show composite screens (host page + chat) at 1440 and 390, never the chat alone.
4. PRODUCT.md (if needed) covers the guide's facts including audience (new NZ migrants), voice and trust/accuracy stance.

- [x] Load `frontend-design` and `impeccable`; read the neighbouring screens (home, roadmap, task) and the design system before shaping.
- [x] Produce 2–3 directions as claude.ai artifacts (redesigned screens only), covering every item in spec §8.2: placement on home/roadmap/task at 1440 and 390 (push-aside panel, full screen, docked panel), conversation states, opening, memory (in-chat + Settings → Memory), edge states, task screen columns.
- [x] Owner picks a direction; iterate to approval. Then write Task 9's detailed steps into this plan (files, components, tests) from the approved boards.
  Approved 2026-10-30: direction D (`docs/design/guide/direction-d.html`). Every decision, with the owner's words, is in `docs/design/guide/gate/decisions.md`; it supersedes conflicting lines in `critique-d.md`. Task 9 step 0: validate that ledger against the conversation and the board before writing Task 9's steps.

### Task 9: UI build (direction D)

**Source of truth:** `docs/design/guide/gate/decisions.md` (ledger, validated 2026-10-30) and the board `docs/design/guide/direction-d.html`. Ledger IDs (D1–D29, B1–B3) are cited per step. Where the board and an older doc disagree, the ledger wins.

**Architecture:** one Zustand store (`guideStore`) holds the conversation, pane state and the open stream, so the conversation survives client navigation between Home, Roadmap, Task and Settings. A `GuideShell` wraps the page area of Home and Roadmap/Task: it makes `<main>` the `@container/page`, renders the ask bar when the pane is closed, the pane beside the page from 1024 px up, and a sheet below 1024 px. Replies render from typed parts only; the API gains two small fields so the UI never parses text (spec §4.1).

**Task 9 constraints (add to Global Constraints):**
- CW01: no arbitrary values. The board's values r1 lacks become tokens in `globals.css` under one `/* Guide (board D) */` block: radii 18 (pane, composer) and 16 (ask bar, crisis card); reading text 16 px / 1.65 (17 px in the focused view); pane widths 25 / 28.75 / 32.5 rem; container sizes `guide-narrow` 561px, `guide-task` 720px, `guide-home` 900px; `grid-template-columns-task-pane: minmax(0,1fr) clamp(300px,34%,380px)`; `grid-template-columns-focus: 280px minmax(0,1fr)`; pane shadow from the board. No new colours. Owner OK required (S2 said "no new tokens"; these are the board's approved values, not a new palette).
- Secondary text uses `text-muted`, never `text-control` (D28).
- Motion: aurora = existing `ai ai-streaming` utilities on the composer edge while streaming (D7); sentence settle-in = one keyframe (opacity + blur 4px→0, 280 ms). Both off via `useReducedMotion` / `prefers-reduced-motion` (CW03).
- Copy is exact board copy; anything the board does not draw is listed under "Deviations" below, not invented.
- Phone (390) is a first-class target, held to the same premium bar as 1440 (D29).
- Commits: none until the owner asks; then `feat(guide): …` per sub-task.

**Deviations from the board (no data for them; logged, no owner question):**
- "Checking ird.govt.nz" → "Checking the guide" / "Checking official sites" (`notice` parts carry no domain).
- "Show all 14 messages" → "Show all messages" (the history API returns pages, not a total).
- Nothing-found and refusal replies show the agency as text, not a linked domain chip (it is reply text).

## Task 9 Review Focus

1. Pane open and an answer streaming, the user goes to Settings: the pane closes, the stream keeps running in the store, and back on Home the finished answer is there with the teal dot on the bar — 9.4 test.
2. Stop pressed before `start` arrived (no assistant id yet): the fetch is aborted, the question goes back to the composer, nothing is shown as failed — 9.2 test.
3. History loaded while another device is still streaming (newest assistant row `streaming`): shown as "An answer is still coming in another window", composer waits, then picks up the finished row — 9.2 test.
4. A 70-character task title in the context chip at a 400 px pane: chip truncates with the full title in `title`, composer row does not wrap or overflow — 9.4 test.
5. 20 px root font at 1024 with the pane open on Task: no sideways scroll, Mark as done visible and outside the pane — 9.7 matrix.

---

#### 9.1 API: structure fields for the UI

**Files:**
- Modify: `packages/types/index.ts` (text part, opening response)
- Modify: `apps/api/src/features/guide/sentences.ts`, `service.ts` (`say`), `history.ts` (`getOpening`)
- Modify: `apps/api/src/shared/ai/mock.ts` (default answer)
- Test: `sentences.test.ts`, `routes.read.test.ts`, `routes.messages.test.ts` (update mock-text assertions)

**Interfaces (produces):**
- `ReplyPart` text: `{ type: 'text'; text: string; citations: number[]; block?: 'step' | 'limits' | 'crisis'; step?: number }`. No `block` = prose. Old stored parts stay valid.
- `GuideOpeningResponse`: `{ whereYouAre: string; starters: string[]; leftToday: number; dailyCap: number }`.

- [ ] **Step 1: failing tests in `sentences.test.ts`**
  - `marks numbered lines as steps`: stream `"Yes.\n1. Register for myIR. You don't need a number.\n2. Apply as a new arrival.\n"` → parts: `{text:'Yes.'}` (no block), `{text:'Register for myIR.', block:'step', step:1}`, `{text:"You don't need a number.", block:'step', step:1}`, `{text:'Apply as a new arrival.', block:'step', step:2}`. The `1. ` marker is stripped.
  - `turns the limits heading into a block`: `"**What I can't tell you**\nHow long it takes. Inland Revenue can, on 0800 227 774.\n"` → no part for the heading; the two sentences carry `block:'limits'`. Heading match: the line with `*`, `#`, `_` and a trailing `:` removed equals `what i can't tell you` (straight or curly apostrophe), case-insensitive.
  - `limits mode ends with the block`: after `block_end`, the next sentence has no block.
- [ ] **Step 2:** `npm test -w @landednz/api -- sentences` → the three fail.
- [ ] **Step 3:** implement in the gate: per-line state `step: number | null` (set by a leading `^\s*(\d+)[.)]\s+`, reset at `\n`) and per-block `limits: boolean` (set by the heading line, reset on `block_end`). The heading line is consumed, never emitted.
- [ ] **Step 4:** failing test in `routes.messages.test.ts`: a keyword-crisis question → the crisis part is `{ type:'text', text: GUIDE_CRISIS_TEXT, citations: [], block: 'crisis' }`. Implement: `say(text, block?)` in `service.ts`; only `GUIDE_CRISIS_TEXT` passes `'crisis'`. Keep `crisisSent()` comparing text.
- [ ] **Step 5:** failing test in `routes.read.test.ts`: `GET /guide/opening?screen=home` for a user with 3 counting questions today returns `leftToday: 17, dailyCap: 20`; with none, `leftToday: 20`. Implement in `getOpening` with `countToday` (`daily-cap.ts`) and `config.guideDailyCap`; never below 0.
- [ ] **Step 6:** default mock answer (`mock.ts`) becomes, as separate `text` events: `"This is a mock reply from LandedNZ. "` (cited to document 0), `"\n1. Register for myIR first. "`, `"\n2. Then T08 gets easier.\n"`, `"**What I can't tell you**\nHow long your own application takes.\n"`, then `block_end`. T08 is replaced by its title by the gate, which yields a `task_link` for the e2e. Update existing assertions on the old mock text.
- [ ] **Step 7:** `make test` (API) and `npm run typecheck` green.

#### 9.2 Web data layer: client, turn model, store

**Files:**
- Modify: `apps/web/src/lib/api.ts` (guide functions; API calls live only here)
- Create: `apps/web/src/lib/guide-turns.ts` (pure), `apps/web/src/lib/stores/guideStore.ts`
- Test: `apps/web/src/lib/api.guide.test.ts`, `lib/guide-turns.test.ts`, `lib/stores/guideStore.test.ts`

**Interfaces (produces):**
- `api.ts`:
  - `askGuide(body: { text: string; screen: GuideScreen }, token: string, onEvent: (e: GuideSseEvent) => void, signal: AbortSignal): Promise<void>`. Throws `GuideRequestError { kind: 'cap'; resetAt: string } | { kind: 'busy' } | { kind: 'failed'; status: number }`.
  - `retryGuide(assistantId, token, onEvent, signal)` (same errors), `cancelGuide(assistantId, token): Promise<void>`.
  - `getGuideConversation(token, before?: string): Promise<GuideConversationPage>`, `getGuideTaskMessages(taskKey, token): Promise<GuideMessageDto[]>`, `getGuideOpening(screen: GuideScreen, token): Promise<GuideOpeningResponse>`.
  - `listMemories(token): Promise<GuideMemoryDto[]>`, `updateMemory(id, text, token): Promise<GuideMemoryDto>`, `deleteMemory(id, token): Promise<void>`.
  - SSE via `fetch` + `ReadableStream` (CLAUDE.md), one internal `readSse(res, onEvent)`.
- `guide-turns.ts`:
  - `type Turn = { key: string; question: string; screen: GuideScreen; assistantId: string | null; parts: ReplyPart[]; status: GuideMessageStatus | 'sending'; createdAt: string }`
  - `turnsFromHistory(messages: GuideMessageDto[]): Turn[]` (oldest first; a user row pairs with the assistant row after it)
  - `applyEvent(turn: Turn, e: GuideSseEvent): Turn`
  - `textCount(turn: Turn): number` (text parts excluding `block:'crisis'`)
  - `provenance(parts: ReplyPart[]): { label: string; domain: string; count: number } | null`. Label "LandedNZ's checked guide" when every source is `origin:'guide'`, else "Official sites, checked today". Domain = most frequent source host without `www.`. Null with no sources.
  - `groupBlocks(parts: ReplyPart[]): Array<{ kind: 'prose' | 'limits' | 'crisis'; parts: TextPart[] } | { kind: 'steps'; items: TextPart[][] }>` (consecutive steps form one list; same `step` number forms one item).
- `guideStore` (Zustand, like `roadmapStore`):
  - state: `open: boolean; expanded: boolean; context: GuideScreen; page: GuideScreen | null; turns: Turn[]; opening: GuideOpeningResponse | null; streaming: boolean; draft: string; banner: { kind: 'cap'; resetAt: string } | { kind: 'busy' } | null; unseen: boolean; historyLoaded: 'none' | 'task' | 'all'`
  - actions: `setPage(page: GuideScreen | null)`, `openPane(context?: GuideScreen)`, `close()`, `toggleExpanded()`, `clearContext()`, `ask(text: string)`, `stop()`, `retry(turnKey: string)`, `undoMemory(memoryId: string)`, `showAll()`.

- [ ] **Step 1: failing tests**
  - `api.guide.test.ts`: `readSse` handles an event split across two chunks and two events in one chunk; 429 body `{error:'CHAT_DAILY_CAP_REACHED', resetAt}` → `{kind:'cap', resetAt}`; 409 → `{kind:'busy'}`.
  - `guide-turns.test.ts`: `turnsFromHistory` pairs rows and keeps a failed assistant row with `parts: null` as status `failed`; `provenance` → `{label:"LandedNZ's checked guide", domain:'ird.govt.nz', count:3}` for three guide sources on `www.ird.govt.nz`, the official label when one source is official; `groupBlocks` makes one list with items `[[s1a, s1b], [s2]]`.
  - `guideStore.test.ts` (fake `api.ts`):
    - `ask` adds a `sending` turn; `start` sets `assistantId`; `done` sets status, refetches the opening (new `leftToday`), and sets `unseen` when `open` is false.
    - `stop` before `start`: aborts the fetch, removes the turn, puts the question back in `draft` with the note "Stopped. This question wasn't counted." (Review Focus 2).
    - `stop` after text: calls `cancelGuide`, keeps the parts, status `cancelled`.
    - A cap error sets `banner.kind = 'cap'` and keeps earlier turns.
    - Busy: a 409, or history whose newest assistant row is `streaming`, sets `banner.kind = 'busy'`. Poll `getGuideConversation` every 5 s until that row is no longer streaming, then clear the banner and show the row (Review Focus 3).
    - `openPane({kind:'task', taskKey})` loads that task's messages first (`historyLoaded: 'task'`); `showAll` loads the full history.
- [ ] **Step 2:** run them; they fail.
- [ ] **Step 3:** implement. The token comes from `createClient().auth.getSession()`, as the screens do. `ask` sends `screen: context`.
- [ ] **Step 4:** `npm test -w web` green.

#### 9.3 Reply and state rendering

**Files:**
- Create: `apps/web/src/components/guide/reply.tsx` (one turn), `citation.tsx` (chip + preview), `crisis-card.tsx`
- Test: `apps/web/src/components/guide/reply.test.tsx`

**Interfaces:** `Reply({ turn, onRetry, onFollowUp, onUndoMemory })`, `CrisisCard()`, `Banner({ banner, dailyCap })`. Consumes `provenance`, `groupBlocks` (9.2).

Layout per board "The pane on a task" and "States": question as `h3` heading (18 px semibold, D3); provenance line under it (D5); prose at reading size; steps as an `ol` with the board's numerals; "What I can't tell you" as the board's quiet line with its icon (`linkPhones` makes 0800 numbers `tel:` links); task card linking `/app/roadmap?task={taskKey}` with the real title (D26); `unverified` as the board's check note under the answer; at most one follow-up as a button; "Remembered: {text}" pill with Undo (D27); a Copy button and an "N sources" toggle that expands the numbered list in place.

- [ ] **Step 1: failing tests**, one per state, with the board's exact copy (D25):
  - streaming: "Writing the answer…" and an `aria-live="polite"` container holding the sentences (B1);
  - citation: chip `1` is a button; Enter opens a preview with the title, "ird.govt.nz · checked 25 Oct 2026" and "Open on ird.govt.nz"; Escape closes it and returns focus to the chip (D4);
  - sources open: "Hide sources" plus the numbered list;
  - interrupted: "The answer stopped partway." + Retry;
  - failed: "Something went wrong before the answer started. This question wasn't counted." + Retry;
  - cut short: "This answer was cut short." + "Want the rest?";
  - stopped after text: "You stopped this answer.";
  - official unavailable: "Official sites didn't respond. Answering from the checked guide only.";
  - check note: the `unverified` text with its icon;
  - memory: "Remembered: your partner arrives in December" + Undo calls `onUndoMemory(memoryId)`;
  - banners: cap → "That's the {dailyCap} questions for today. You can ask again after midnight." under the earlier answers; busy → "An answer is still coming in another window. You can ask here once it's done."
  - crisis: a `block:'crisis'` part renders `CrisisCard` first in the reply, with the heading "If you're struggling, you don't have to carry it alone." and three `tel:` rows: 1737 "Free call or text, any time. Need to Talk?", 0800 543 354 "Lifeline", 111 "In an emergency". No motion class (D10).
  - `crisis numbers match the API`: read `apps/api/src/core/prompts/registry.ts` with `fs` and assert that `GUIDE_CRISIS_TEXT` contains "1737", "0800 543 354" and "111" (one source of truth for the numbers).
- [ ] **Step 2:** run; they fail. **Step 3:** implement with Base UI `Popover` for the preview. **Step 4:** green.

#### 9.4 Pane, composer, ask bar, focused view, sheet

**Files:**
- Create: `apps/web/src/components/guide/guide-shell.tsx`, `guide-pane.tsx`, `composer.tsx`, `ask-bar.tsx`, `opening.tsx`, `focused-view.tsx`
- Modify: `apps/web/src/app/globals.css` (guide token block, `@custom-variant guide-open`, settle keyframe)
- Test: `apps/web/src/components/guide/guide-shell.test.tsx`, `composer.test.tsx`

**Interfaces (produces):** `GuideShell({ page: GuideScreen; titles: Record<string, string>; className?: string; children })`. It renders `<main data-guide={open ? 'open' : 'closed'} className="@container/page …">` (the screen passes its own main classes as `className`), plus the pane or sheet and the ask bar. `titles` maps taskKey → title for chips and the focused-view rail.

- **Pane (D2, D11, D12):** from 1024 px, an `aside aria-label="Guide"` beside `<main>` (not over it), sticky under the header, inset 12 px, radius 18, board shadow, width by token: 25rem; 28.75rem from 1440 px; 32.5rem from 1680 px. Header row: guide mark, "Guide", Expand, Close. Below 1024 px: a Base UI `Drawer` sheet, half height with the opening and full height once a question is asked (D9).
- **Ask bar (D18, D19, D22, D23):** only when `page` is set and the pane is closed. Fixed, bottom centre of the page area, 440×52, radius 16. Guide mark, contextual text ("Ask about your first 90 days" on home, "Ask about your roadmap" on roadmap, "Ask about {topic}" on a task, `topic` from `TASK_COPY` (`lib/task-copy.ts`), e.g. "Ask about your IRD number"), a `/` kbd hint, ink go button. A `button` with `aria-expanded` and `aria-controls` set to the pane id. Teal dot when `unseen`. Phone: above the tab bar on Home and Roadmap; no bar on Task (the task's bottom bar Ask opens the sheet). Pages reserve bottom space so the bar never covers the last item.
- **Composer (D6):** auto-growing `textarea` (`field-sizing: content`), max 2000 characters, Enter sends, Shift+Enter makes a new line. Context chip shows the task title (truncated, full title in `title`, × clears it to the page context). "{n} left today" in `text-muted`, hidden on phone (D9). Round Send becomes Stop while streaming. Disabled states: cap shows placeholder "You can ask again after midnight", "0 left today", no chip; busy shows "Waiting for the other window", no chip. Aurora edge while streaming (D7).
- **Opening (D24):** the `whereYouAre` line as a heading plus up to 3 starter buttons. Shown when no turn is in view. Opened with a task context: that task's messages first with "Show all messages" above them.
- **Focused view (D8):** Expand replaces the page area and pane with a 280 px rail and a 720 px column at 17 px. The rail has "Back to your task", "This conversation, by task" (groups by `screen.taskKey` with counts, then "Everything N"), and "One conversation, on every device." Collapse returns to the pane.

- [ ] **Step 1: failing tests** (`guide-shell.test.tsx`, `composer.test.tsx`)
  - `/` opens the pane and focuses the composer; `/` typed in an input does nothing (D22).
  - Close returns focus to the ask bar; the bar has `aria-expanded="false"`, and `"true"` while open (B1).
  - With `page = {kind:'task', taskKey:'T08'}`, the bar reads "Ask about your IRD number".
  - `unseen` shows the dot; opening clears it.
  - Review Focus 1: open the pane, start a fake stream, call `setPage(null)` + `close()` (as Settings does) and finish the stream: the turn is complete in the store, and after `setPage(home)` the bar shows the dot.
  - Review Focus 4: a 70-character title: the chip has the `truncate` class and `title` = full title.
  - Composer: Enter sends, Shift+Enter does not; Send's label changes to Stop while streaming; in the cap state there is no chip and "0 left today" shows.
- [ ] **Step 2:** run; they fail. **Step 3:** implement, with the token block in `globals.css`; read `node_modules/next/dist/docs/` for anything Next-specific first (AGENTS.md). **Step 4:** green.

#### 9.5 Host pages: entry, header, container queries

**Files:**
- Modify: `components/chrome/app-header.tsx` + test (remove `onAsk`, `askDisabled`, the Ask button and the `/` listener; D20)
- Modify: `components/workspace/home-view.tsx` (wrap in `GuideShell page={{kind:'home'}}`; "Ask about this" becomes a button: `openPane({kind:'task', taskKey})`; grid line 64)
- Modify: `components/workspace/roadmap-view.tsx` (wrap; `page` = task when `?task=` else roadmap; today-card Ask becomes the same button; remove `askFor`/`askOnLoad`/`?ask=1` handling)
- Modify: `components/workspace/task-sheet.tsx` (remove both `AskPanel` cards, `askFocus`, `askRef`, `askPress`; the phone bar's Ask calls `openPane({kind:'task', taskKey})`; grid line 307; sticky actions)
- Modify: `app/app/loading.tsx:12` (container variant)
- Modify: `components/settings/settings-screen.tsx` (drop `onAsk`; on mount `setPage(null)` + `close()`; D21)
- Test: `home-view.test.tsx`, `roadmap-view.test.tsx`, `task-sheet.test.tsx`, `app-header.test.tsx`

Container rules (D13–D17). Viewport `max-split:` classes stay, so the closed layout is unchanged:
- Task grid: add `@max-guide-task/page:grid-cols-1` and `guide-open:grid-cols-task-pane`.
- Home grid: add `@max-guide-home/page:grid-cols-1`.
- Loading skeleton: same as the page it stands in for.
- Task in a page area under 561 px (1024 window, pane open): the desktop single column; the actions card sticks to the bottom of the page area (`sticky bottom-0`, not fixed to the viewport). Steps stay at 45+ characters a line (D16).

- [ ] **Step 1: failing tests**
  - `app-header.test.tsx`: no button named "Ask" in any state.
  - `task-sheet.test.tsx`: no "Ask" textbox in the actions column; the phone bar's Ask calls `openPane` with the task.
  - `home-view.test.tsx`: "Ask about this" is a button that opens the pane with the task context, not a link with `ask=1`.
  - `settings-screen` (in `settings.test.tsx`): mounting closes the pane and clears `page`, so there is no ask bar.
- [ ] **Step 2:** run; they fail. **Step 3:** implement. **Step 4:** `npm test -w web`, `npm run typecheck`, `npm run lint` green.

#### 9.6 Settings → Memory

**Files:**
- Create: `apps/web/src/components/settings/memory-section.tsx`
- Modify: `settings-screen.tsx`, `plan-form.tsx` (the Memory row in the answers card)
- Test: `apps/web/src/components/settings/memory.test.tsx`

Per board "Memory":
- In the answers card, a row "Memory · {n} things the guide remembers" with a Manage link to `/settings?edit=memory`.
- The editor is titled "What the guide remembers", with the line "Only things you told it. It uses them in answers. Delete one and it's gone for good."
- Each memory shows its text, "From the guide, {d MMM}", and Edit and Delete buttons.
- Edit works in place, with the note "Edited facts are used from your next question." and Cancel and Save.
- Delete is immediate and a hard delete (D27).
- The footer reads "{n} of 50 kept. Health and immigration problems are only kept if you ask."
- On phone, the editor is its own view with the Settings back link (the existing `editing` pattern).

- [ ] **Step 1: failing tests:** the list renders 3 memories and "3 of 50 kept."; Edit → Save calls `updateMemory` with the new text; Delete calls `deleteMemory` and removes the row; an empty list shows "The guide hasn't remembered anything yet."
- [ ] **Step 2–4:** fail, implement, pass.

#### 9.7 End-to-end and width matrix (spec §9.4, B2)

**Files:**
- Create: `apps/web/e2e/guide.spec.ts`, `apps/web/e2e/guide-widths.spec.ts`
- Modify: `apps/web/e2e/journey.spec.ts` (its ask step uses the ask bar), `apps/web/e2e/a11y.spec.ts` (pane open on `/app/roadmap?task=T08` at 1440 and the sheet at 390)

- [ ] **Step 1: `guide.spec.ts`** (AI_MODE=mock, real local auth):
  - On `/app/roadmap?task=T08`, the ask bar reads "Ask about your IRD number". Click it, ask "Can I start work?". The answer shows "Register for myIR first." in a list, "What I can't tell you", a source chip with a preview, and a task card titled "Apply for your IRD number".
  - The ask bar is present on `/app`, `/app/roadmap` and the task; absent on `/settings`; there are zero header buttons named "Ask" on all four.
  - `/` opens the pane and focuses the composer; Escape or Close returns focus to the bar.
  - Memory: seed one via the API's admin path or an ask the mock remembers, then edit and delete it in `/settings?edit=memory`.
  - Cap: `page.route('**/guide/messages', …)` fulfils 429 with a `GuideCapError` body. The pane shows "That's the 20 questions for today. You can ask again after midnight." and the composer is disabled.
  - Distress: asking a crisis-keyword question shows the crisis card first with three `tel:` links.
- [ ] **Step 2: `guide-widths.spec.ts`** (B2). With the pane open on Task (T08), Home and Roadmap at widths 1024, 1180, 1280, 1366, 1440, 1536, 1600, 1680, 1920 (height 900), plus 1366×768, a 20 px root font (`html { font-size: 20px }` injected) at 1280, and 125% / 200% zoom (simulated by viewport ÷ zoom with `deviceScaleFactor`), assert:
  - `document.documentElement.scrollWidth <= innerWidth`;
  - no text element in `main` or the pane has `scrollWidth > clientWidth` (clipped);
  - the "Mark as done" box does not intersect the pane's or the ask bar's box, and is inside the viewport after scrolling to it;
  - the first task step's line holds at least 45 characters (`range.getClientRects()` line count × width check: characters ÷ lines ≥ 45);
  - the pane's width matches the band (400 / 460 / 520 px at 16 px root).
- [ ] **Step 3:** stop `make dev`; `make test-e2e` green (all specs).

#### 9.8 Build-stage impeccable gate (B3) and owner review

- [ ] Run impeccable `critique` (dual assessment as in `critique-d.md`), `audit`, and `detect` on the running app (Playwright, not Chrome) for Home, Roadmap, Task with the pane open and closed, the focused view, Settings → Memory, and phone 390 sheet states. Save the full output to `docs/design/guide/gate/critique.md`.
- [ ] Fix every P0/P1, re-run the affected checks, record the fixes in `critique.md`. Log minors there (no fix cycle).
- [ ] Phone pass at 390 and 430: touch targets ≥ 44 px, the keyboard does not cover the composer (`visualViewport`), safe-area insets on the sheet and the bar, and nothing under the tab bar.
- [ ] Screenshots of the built screens next to the board frames for the owner; owner review (judgement only).

### Task 10: Remove the old chat (same release)

- [ ] API: `apps/api/src/features/chat/` (all files and tests), its route registration, the chat prompt functions in `core/prompts/registry.ts` (`buildChatOpeningMessage`, `buildChatSystemPrompt`, `buildResponseStructuringPrompt`), unused `generateText`, the old chat tables (new migration).
- [ ] Web: `components/assistant/ask-panel.tsx`, `ask-panel.test.tsx`, `ai-reply.tsx`, `lib/trace.ts`, the chat stream helper in `lib/api.ts` (and `api.stream.test.ts` if it only covers it), `chat-parser.ts` + test, `lib/stores/chatStore.ts` and `types/chat.ts` if nothing else imports them. (The Ask cards in `task-sheet.tsx` already went in Task 9.5.)
- [ ] `grep -rn "chat" apps/*/src` shows nothing old left; full suites, typecheck and lint green.

### Task 11: Staging owner test

- [ ] Deploy to staging (from `main` after the PR merges; migrations, `GUIDE_*` env).
- [ ] Plan A Task 15 Step 6: Sonnet accuracy run on staging, `BASE_URL=<staging> make guide-accuracy` with the staging `DATABASE_URL`/`SUPABASE_URL` for the runner (owner supplies them; never written to a committed file). Record release bar, §5.2 speed, `between_tools` vs `adaptive`.
- [ ] Owner tests on staging; their judgement calls only.

## After Plan B: whole-app UI quality phase (owner, 2026-10-30)

Not part of this plan. After Task 11, and before the production release (C4 Step 4), run superpowers:brainstorming for a final review of the entire app's UI: a range of web resolutions first, then strict checks on mobile devices. Mobile must feel the most premium because most users will be on phones. It gets its own spec and plan.

