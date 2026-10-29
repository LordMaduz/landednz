# Settlement Guide Plan B (safety fixes, UI, release) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Close the seven backend items the Plan A review and Task 15 left open, then design and build the guide UI, remove the old chat and hand the release to the owner on staging.

**Architecture:** Tasks 1–7 are small changes inside `apps/api/src/features/guide` (plus the shared error handler and the accuracy runner). Tasks 8–11 are the UI phase from spec §8: impeccable design with an owner gate, build against the finished API, old chat removal, staging owner test. Task 9 gets its own detailed plan section after the owner approves a direction in Task 8; the design decides its files.

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

- [ ] Load `frontend-design` and `impeccable`; read the neighbouring screens (home, roadmap, task) and the design system before shaping.
- [ ] Produce 2–3 directions as claude.ai artifacts (redesigned screens only), covering every item in spec §8.2: placement on home/roadmap/task at 1440 and 390 (push-aside panel, full screen, docked panel), conversation states, opening, memory (in-chat + Settings → Memory), edge states, task screen columns.
- [ ] Owner picks a direction; iterate to approval. Then write Task 9's detailed steps into this plan (files, components, tests) from the approved boards.

### Task 9: UI build (detailed after Task 8)

- [ ] Build against the API; API types from `@landednz/types` (`ReplyPart`, `GuideSseEvent`, `GuideCapError`); design tokens only, light theme, reduced motion respected. UI never parses reply text (spec §4.1).
- [ ] Playwright (spec §9.4): ask from a task; streamed answer shows sources and a task link; edit and delete a memory; cap message; axe at 1440 and 390.
- [ ] impeccable critique + audit, full output saved to `gate/critique.md`; fix every P0/P1; owner review.

### Task 10: Remove the old chat (same release)

- [ ] API: `apps/api/src/features/chat/` (all files and tests), its route registration, the chat prompt functions in `core/prompts/registry.ts` (`buildChatOpeningMessage`, `buildChatSystemPrompt`, `buildResponseStructuringPrompt`), unused `generateText`, the old chat tables (new migration).
- [ ] Web: `components/assistant/ask-panel.tsx`, `ask-panel.test.tsx`, `ai-reply.tsx`, `lib/trace.ts`, the chat stream helper in `lib/api.ts` (and `api.stream.test.ts` if it only covers it), `chat-parser.ts` + test if nothing else imports it; the Ask aside in `components/workspace/task-sheet.tsx`.
- [ ] `grep -rn "chat" apps/*/src` shows nothing old left; full suites, typecheck and lint green.

### Task 11: Staging owner test

- [ ] Deploy to staging (from `main` after the PR merges; migrations, `GUIDE_*` env).
- [ ] Plan A Task 15 Step 6: Sonnet accuracy run on staging, `BASE_URL=<staging> make guide-accuracy` with the staging `DATABASE_URL`/`SUPABASE_URL` for the runner (owner supplies them; never written to a committed file). Record release bar, §5.2 speed, `between_tools` vs `adaptive`.
- [ ] Owner tests on staging; their judgement calls only.
