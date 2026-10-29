# Settlement Guide Backend (Plan A) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the new settlement guide API (`features/guide`) with grounded, cited, sentence-streamed answers, alongside the old chat, plus the accuracy set that gates release.

**Architecture:** A fixed pipeline our code controls: Haiku understands the question while hybrid retrieval runs, optional official-page reading, Sonnet answers with citations, a sentence gate releases finished sentences over SSE, then verify/end parts/remember. State lives in four new Prisma tables; the server enforces one streaming answer per user and the daily cap in one transaction.

**Tech Stack:** Fastify 5, Prisma 7 + Postgres/pgvector, `@anthropic-ai/sdk` 1.1.0, OpenAI `text-embedding-3-small`, Vitest 5, zod 4.

**Spec:** `docs/superpowers/specs/2026-10-29-settlement-guide-design.md` (read §3–§7 and §9 before starting any task).

## Global Constraints

- Constitution `.claude/constitution.md` holds, except C06 which Task 15 rewrites for the guide: C01 (guide never imports `features/roadmap` or `features/chat`), C03 (only `shared/ai/claude.client.ts` imports `@anthropic-ai/sdk`), C04 (all prompt text and user-facing guide copy in `core/prompts/registry.ts`), C07 (condition pre-filter in SQL before search), C08 (Lifeline NZ 0800 543 354 first on a crisis signal), C10 (BigInt replacer on every `$queryRaw`), C12 (`<=>`), C13 (`AIFailureError` caught inside the guide service), C14 (`reply.raw`, `setTimeout(0)`), C15/C16 (migrations only, raw SQL for unsupported columns).
- Models: understand and the accuracy judge always `claude-haiku-5-5`; answer and live search use `config.anthropicModel` (`claude-haiku-5-5` locally/tests, `claude-sonnet-5-5` staging/production).
- Answer call: streaming, effort `low`, `max_tokens: 2000`, citations on, thinking from `config.guideAnswerThinking` (`between_tools` default, `adaptive` alternative).
- Daily cap 20 (`GUIDE_DAILY_CAP`, default `20`), midnight `Pacific/Auckland`.
- Never send internal IDs (`T\d{2,3}`, `CHUNK_…`) to the client in any part.
- Allowlist (spec §4.3): `govt.nz`, `ird.govt.nz`, `immigration.govt.nz`, `tenancy.govt.nz`, `acc.co.nz`, `healthnz.govt.nz`, `info.health.nz`, `nzta.govt.nz`, `employment.govt.nz`, `workandincome.govt.nz`, `sorted.org.nz`, `nzqa.govt.nz`, `education.govt.nz`, `kiwisaver.govt.nz`; subdomains covered.
- Tests run with `AI_MODE=mock` by default; auth is never mocked in route tests (`createTestUser`).
- Commits: Conventional Commits, scope `guide` (`feat(guide): …`, `test(guide): …`). No co-author trailer.
- Old chat (`features/chat`, `/chat/*`) keeps working untouched except the shared NZ-day helper extraction (Task 1).

## Review Focus

1. Task IDs split across stream chunks (`"T"` then `"08 is next"`) still become a title, never leak — Task 9 test.
2. Two `POST /guide/messages` at the same moment from one user: exactly one streams, the other gets 409 `GUIDE_BUSY`, cap counts once — Task 12 test.
3. Question text empty, whitespace-only or over 2,000 characters: 400 `VALIDATION_ERROR` before any DB write — Task 13 test.
4. A `screen.taskKey` that is unknown or retired: treated as no current task, not an error — Task 5 test.
5. Live fetch that redirects off the allowlist, returns non-HTML, or is larger than 2 MB: page skipped, no crash — Task 8 test.

---

### Task 1: Shared types, error codes, config, NZ-day helper

**Files:**
- Modify: `packages/types/index.ts` (append guide types)
- Modify: `apps/api/src/shared/errors.ts` (add codes)
- Modify: `apps/api/src/shared/config.ts`, `apps/api/src/shared/config.test.ts`
- Create: `apps/api/src/shared/nz-day.ts`, `apps/api/src/shared/nz-day.test.ts`
- Modify: `apps/api/src/features/chat/daily-cap.ts` (import `startOfNzDay` from `shared/nz-day.ts`, delete its local copy)
- Modify: `apps/api/.env.example`

**Interfaces:**
- Produces in `@landednz/types`:
  - `ReplyPart` exactly as spec §4.1.
  - `GuideScreen = { kind: 'home' | 'roadmap' | 'task'; taskKey?: string }`
  - `GuideSseEvent = { event: 'start'; data: { userMessageId: string; assistantMessageId: string } } | { event: 'part'; data: ReplyPart } | { event: 'done'; data: { assistantMessageId: string; status: GuideMessageStatus } }`
  - `GuideMessageStatus = 'streaming' | 'complete' | 'failed' | 'interrupted' | 'cancelled'`
  - `GuideMessageDto = { id: string; role: 'user' | 'assistant'; text: string; parts: ReplyPart[] | null; status: GuideMessageStatus; screen: GuideScreen; createdAt: string }`
  - `GuideConversationPage = { messages: GuideMessageDto[]; nextBefore: string | null }`
  - `GuideOpeningResponse = { whereYouAre: string; starters: string[] }`
  - `GuideMemoryDto = { id: string; text: string; createdAt: string; updatedAt: string }`
- Produces `ErrorCode` additions: `'GUIDE_BUSY' | 'MESSAGE_NOT_FOUND' | 'MEMORY_NOT_FOUND' | 'NOT_RETRYABLE'`.
- Produces config fields: `guideDailyCap: number` (env `GUIDE_DAILY_CAP`, default `20`), `guideRelevanceFloor: number` (env `GUIDE_RELEVANCE_FLOOR`, default `0.3`, 0–1), `guideAnswerThinking: 'between_tools' | 'adaptive'` (env `GUIDE_ANSWER_THINKING`, default `between_tools`).
- Produces `startOfNzDay(now: Date): Date` and `nextNzMidnight(now: Date): Date` in `shared/nz-day.ts`.

- [x] **Step 1: Write failing tests**
  - `nz-day.test.ts`: `startOfNzDay(new Date('2026-10-24T10:30:00Z'))` equals `new Date('2026-10-23T11:00:00Z')` (NZDT); `nextNzMidnight(new Date('2026-10-24T10:30:00Z'))` equals `new Date('2026-10-24T11:00:00Z')`; a winter date `2026-06-15T05:00:00Z` → start `2026-06-14T12:00:00Z` (NZST).
  - `config.test.ts`: defaults `guideDailyCap === 20`, `guideRelevanceFloor === 0.3`, `guideAnswerThinking === 'between_tools'`; `GUIDE_RELEVANCE_FLOOR: '1.5'` throws `'GUIDE_RELEVANCE_FLOOR must be a number from 0 to 1'`; `GUIDE_ANSWER_THINKING: 'off'` throws `'GUIDE_ANSWER_THINKING must be between_tools or adaptive'`.
- [x] **Step 2: Run** `npm run test:run -w @landednz/api -- src/shared/nz-day.test.ts src/shared/config.test.ts` → FAIL (module/fields missing).
- [x] **Step 3: Implement.** Move `nzParts`, `nzOffset`, `startOfNzDay` from `features/chat/daily-cap.ts` into `shared/nz-day.ts` unchanged; add `nextNzMidnight(now) = startOfNzDay(new Date(startOfNzDay(now).getTime() + 36 * 3600_000))` (36 h lands inside the next NZ day across DST). Optional env vars use the existing `parseEnv({ NAME: default, ...env }, …)` pattern. Add the three vars to `.env.example` with their defaults. Append the types to `packages/types/index.ts`.
- [x] **Step 4: Run** the same tests plus `src/features/chat/daily-cap.test.ts` and `npm run typecheck` → PASS.
- [x] **Step 5: Commit** `feat(guide): shared types, config and NZ-day helper`

---

### Task 2: Schema and migration

**Files:**
- Modify: `apps/api/prisma/schema.prisma`
- Create: `apps/api/prisma/migrations/20261030000000_guide/migration.sql`
- Create: `apps/api/src/features/guide/schema.test.ts`

**Interfaces:**
- Produces Prisma models `GuideConversation`, `GuideMessage`, `GuideMemory`, `LiveSourceCache` exactly as spec §4.4, plus `guideConversation GuideConversation?` and `guideMemories GuideMemory[]` on `User`, and `searchText Unsupported("tsvector")?` on `KnowledgeBaseChunk` with `@@index([searchText], map: "kb_chunk_search_text_gin", type: Gin)` declared so `migrate diff` keeps it.
- Produces DB objects: generated column `"searchText" tsvector GENERATED ALWAYS AS (to_tsvector('english', content)) STORED`, GIN index `kb_chunk_search_text_gin`, partial unique index `guide_message_one_streaming ON "GuideMessage" ("conversationId") WHERE status = 'streaming'`.

- [x] **Step 1: Write failing test** `schema.test.ts`:
  - inserting two `GuideMessage` rows with `status: 'streaming'` in one conversation rejects with Prisma code `P2002`; a second row with `status: 'complete'` is accepted;
  - `SELECT count(*) FROM "KnowledgeBaseChunk" WHERE "searchText" @@ plainto_tsquery('english', 'IRD number')` returns > 0 (BigInt replacer applied);
  - deleting the `User` removes its conversation, messages and memories.
- [x] **Step 2: Run** `npm run test:run -w @landednz/api -- src/features/guide/schema.test.ts` → FAIL.
- [x] **Step 3: Implement.** Edit the schema, run `npx prisma migrate dev --create-only --name guide` in `apps/api`, rename the folder to `20261030000000_guide`, append the raw SQL for the generated column (replace any Prisma-generated `ADD COLUMN "searchText"`), GIN index and partial unique index, then `npx prisma migrate dev` and `npm run prisma:generate -w @landednz/api`.
- [x] **Step 4: Run** the test and `npx prisma migrate diff --from-migrations prisma/migrations --to-schema prisma/schema.prisma --exit-code` (exit 0, no drift) → PASS.
- [x] **Step 5: Commit** `feat(guide): guide tables, keyword search column, one-streaming index`

---

### Task 3: Claude client calls and mocks

**Files:**
- Modify: `apps/api/src/shared/ai/claude.client.ts`
- Modify: `apps/api/src/shared/ai/mock.ts`, `apps/api/src/shared/ai/mock.test.ts`

**Interfaces:**
- Produces in `claude.client.ts` (all wrap SDK errors in `AIFailureError`; mock mode delegates to `mock.ts`):
  - `structuredHaiku<T>(system: string, user: string, schema: z.ZodType<T>, timeoutMs: number): Promise<T>` — `claude-haiku-5-5`, `output_config: { format: zodOutputFormat(schema), effort: 'low' }` (check the SDK's `zodOutputFormat` import path in `node_modules/@anthropic-ai/sdk/helpers`), `max_tokens: 600`, aborts at `timeoutMs`.
  - `streamGuideAnswer(req: GuideAnswerRequest, onEvent: (e: AnswerEvent) => void, signal: AbortSignal): Promise<AnswerResult>`
    - `GuideAnswerRequest = { system: string; history: { role: 'user' | 'assistant'; content: string }[]; aboutUser: string; documents: { title: string; text: string }[]; question: string }`
    - Request: `system` as one text block with `cache_control: { type: 'ephemeral' }`; history; final user turn content = `[{type:'text', text: aboutUser}, ...documents as {type:'document', source:{type:'text', media_type:'text/plain', data}, title, citations:{enabled:true}}, {type:'text', text: question}]`; `thinking: { type: config.guideAnswerThinking }`, `output_config: { effort: 'low' }`, `max_tokens: 2000`.
    - `AnswerEvent = { type: 'text'; text: string } | { type: 'citation'; documentIndex: number; citedText: string } | { type: 'block_end' }` (from `text_delta`, `citations_delta` with `char_location`, and `content_block_stop` of a text block).
    - `AnswerResult = { stopReason: 'end_turn' | 'max_tokens' | 'refusal' | 'aborted'; usage: { input: number; output: number; cacheRead: number } }`; an abort via `signal` resolves with `stopReason: 'aborted'`, never throws.
  - `searchOfficialUrls(query: string, allowedDomains: string[]): Promise<string[]>` — `config.anthropicModel`, `tools: [{ type: 'web_search_20260209', name: 'web_search', allowed_domains, max_uses: 1 }]`, effort `low`, `max_tokens: 400`; returns result URLs from `web_search_tool_result` blocks, max 5.
- Mocks in `mock.ts`: `mockStructured` returns `schema.parse` of a fixture chosen by the caller (export `setMockStructured(fn)` for tests, default throws so understand falls back); `mockAnswerStream` emits `"This is a mock reply from LandedNZ. "` with a citation to document 0 (`citedText` = first 40 chars of document 0, or no citation when there are no documents), then `"It has a second sentence."`, `block_end`, result `end_turn`; `mockSearchUrls` returns `[]`.

- [x] **Step 1: Write failing tests** in `mock.test.ts`: `mockAnswerStream` with one document emits text events joining to `"This is a mock reply from LandedNZ. It has a second sentence."`, one citation `{documentIndex: 0}` before the first `block_end`, and resolves `stopReason: 'end_turn'`; with zero documents emits no citation.
- [x] **Step 2: Run** `npm run test:run -w @landednz/api -- src/shared/ai/mock.test.ts` → FAIL.
- [x] **Step 3: Implement** the three functions and mocks. Confirm event and param names against `node_modules/@anthropic-ai/sdk/resources/messages/messages.d.ts` (`CitationsDelta`, `ThinkingConfigBetweenTools`, `WebSearchTool20260209`, `OutputConfig`).
- [x] **Step 4: Run** the test and `npm run typecheck -w @landednz/api` → PASS.
- [x] **Step 5: Commit** `feat(guide): Claude calls for understand, cited answer stream and official search`

---

### Task 4: Guide prompts and copy in the registry

**Files:**
- Modify: `apps/api/src/core/prompts/registry.ts`
- Create: `apps/api/src/core/prompts/guide.test.ts`

**Interfaces:**
- Produces (pure functions/constants, no I/O):
  - `GUIDE_SYSTEM_PROMPT: string` — spec §5.3 items 1–3; must exceed 512 tokens so it caches (≥ 2,200 characters).
  - `buildGuideAboutUser(ctx: GuideContext): string` — spec §5.3 item 4; family situation in plain words from a map over every `FamilySituation` value (e.g. `COUPLE_CONSTRAINED` → `"moving as a couple; one partner may have limited work rights"`), never adding facts not in the profile.
  - `GUIDE_UNDERSTAND_PROMPT: string` — instructions for the `Understanding` schema (Task 6).
  - `GUIDE_CRISIS_TEXT: string` — starts with `"Lifeline NZ: 0800 543 354"` (C08), then `"Need to Talk? Free call or text 1737."`; verify both numbers on lifeline.org.nz and 1737.org.nz before committing.
  - `GUIDE_OUT_OF_SCOPE_REPLY(agency: string): string`, `GUIDE_NOTHING_FOUND_REPLY(agency: string): string`, `GUIDE_REFUSAL_REPLY: string`, `buildUnverifiedNote(claim: string, host: string | null): string` (`"I couldn't confirm ${claim} against an official source. Check ${host}."`, host-less variant without the last sentence), `buildFollowUp(kind: 'more' | 'task', title?: string): string` (`"Want the rest?"` / `What's involved in "${title}"?`), `buildWhereYouAre(done: number, total: number, next: string | null): string`, `buildStarters(screen: GuideScreen, titles: string[]): string[]` (max 3).
  - `GuideContext` type is imported from `features/guide/types.ts` (Task 5) — define the type there first in this task as an interface-only file so registry compiles.
- [x] **Step 1: Write failing tests** `guide.test.ts`: `GUIDE_SYSTEM_PROMPT.length >= 2200`; it contains `"Never mention internal IDs"`; `buildGuideAboutUser` for a `SOLO` profile contains none of `partner`, `spouse`, `single income`; output contains every task title given and no `T\d{2}` key; `GUIDE_CRISIS_TEXT.startsWith('Lifeline NZ: 0800 543 354')`; `buildStarters` returns ≤ 3; no registry export string matches `/\bT\d{2,3}\b/`.
- [x] **Step 2: Run** `npm run test:run -w @landednz/api -- src/core/prompts/guide.test.ts` → FAIL.
- [x] **Step 3: Implement** the exports; also create `apps/api/src/features/guide/types.ts` with `GuideContext`, `Understanding`, `Passage`, `ReleasedSentence`, `VerifyResult` (shapes in Tasks 5–10).
- [x] **Step 4: Run** → PASS.
- [x] **Step 5: Commit** `feat(guide): guide prompts and copy`

---

### Task 5: Context

**Files:**
- Create: `apps/api/src/features/guide/context.ts`, `context.test.ts`

**Interfaces:**
- Produces `loadGuideContext(userId: string, screen: GuideScreen): Promise<GuideContext>`:
  - `GuideContext = { userName: string | null; profile: { visaType; city; familySituation; occupation; arrivalDate: Date }; daysSinceArrival: number; doneTasks: TaskRef[]; nextTasks: TaskRef[]; totalTasks: number; currentTask: TaskRef | null; memories: { id: string; text: string }[]; taskTitles: Map<string, string> }`, `TaskRef = { taskKey: string; title: string }`.
  - Reads `User`, `UserProfile`, `UserRoadmapEntry` (status, priorityScore) and `GuideMemory` via `db`; titles from `content/index.ts` `task(id)?.name`, skipping retired. `nextTasks` = not complete/skipped, unblocked first, by `priorityScore` desc, max 5. `taskTitles` covers every non-retired task in the bundle. Throws `AppError('PROFILE_NOT_FOUND', …, 404)` without a profile.
  - Never imports `features/roadmap` (C01).
- [ ] **Step 1: Write failing tests** (seed a user, profile, three entries T08 complete / two not started, one memory): `doneTasks` has T08's title; `nextTasks` ordered by score; `currentTask` for `{kind:'task', taskKey:'T08'}` is T08's title; `{kind:'task', taskKey:'T999'}` → `currentTask === null`, no throw; no profile → 404 `PROFILE_NOT_FOUND`; memories included.
- [ ] **Step 2: Run** `npm run test:run -w @landednz/api -- src/features/guide/context.test.ts` → FAIL.
- [ ] **Step 3: Implement.**
- [ ] **Step 4: Run** → PASS.
- [ ] **Step 5: Commit** `feat(guide): build guide context from the database only`

---

### Task 6: Understand and the crisis keyword check

**Files:**
- Create: `apps/api/src/features/guide/understand.ts`, `understand.test.ts`

**Interfaces:**
- Consumes: `structuredHaiku` (Task 3), `GUIDE_UNDERSTAND_PROMPT` (Task 4).
- Produces:
  - `Understanding = { searchQuery: string; scope: 'in' | 'out'; redirectAgency: string | null; needsLive: boolean; distress: boolean; memoryCandidates: { text: string; sensitive: boolean; explicit: boolean }[] }` (zod schema `understandingSchema` exported; `memoryCandidates` max 3, each ≤ 200 chars).
  - `hasCrisisSignal(text: string): boolean` — case-insensitive word list: `suicide`, `suicidal`, `kill myself`, `end my life`, `self harm`, `self-harm`, `hurt myself`, `want to die`, `no reason to live`, `can't go on`, `cant go on`.
  - `understand(question: string, history: HistoryTurn[], ctx: GuideContext): Promise<Understanding>` — 1,000 ms timeout; on any error returns the spec §3.1 fallback; `distress = haiku.distress || hasCrisisSignal(question)`.
  - `warmUnderstand(): Promise<void>` — one call with a fixed question, errors logged and swallowed.
  - `HistoryTurn = { role: 'user' | 'assistant'; content: string }`.
- [ ] **Step 1: Write failing tests** (use `setMockStructured`): Haiku result passes through; Haiku throws → fallback with `searchQuery === question`; Haiku hangs 2 s → fallback within 1.2 s (fake timers allowed); `"I want to end my life"` with Haiku `distress:false` → `distress:true`; `hasCrisisSignal('Can I kill two birds…')` is `false`.
- [ ] **Step 2: Run** → FAIL.
- [ ] **Step 3: Implement.**
- [ ] **Step 4: Run** → PASS.
- [ ] **Step 5: Commit** `feat(guide): understand step with fallback and crisis check`

---

### Task 7: Hybrid retrieval

**Files:**
- Create: `apps/api/src/features/guide/retrieve.ts`, `retrieve.test.ts`

**Interfaces:**
- Produces:
  - `Passage = { id: string; title: string; url: string; origin: 'guide' | 'official'; content: string; similarity: number; taskKey: string | null; checkedAt: string }` (guide passages: `id` = chunkKey, `title` = sourceName, `checkedAt` = chunk `updatedAt` ISO).
  - `retrieve(query: string, opts: { profile: Profile; taskKey: string | null; floor?: number }): Promise<{ passages: Passage[]; candidates: Passage[] }>` — condition pre-filter on chunk keys exactly as `features/chat/rag/retrieval.ts` step 1 (copy, don't import: C01 is about roadmap, but the chat folder is deleted in plan B); vector top 20 by `<=>` and keyword top 20 by `ts_rank("searchText", plainto_tsquery('english', $q))` within the filtered keys; reciprocal-rank fusion with k = 60; task chunks (`taskId === taskKey`) get +0.01; `passages` = fused order filtered to `similarity >= floor` (default `config.guideRelevanceFloor`), max 6; `candidates` = fused order unfiltered, max 10.
  - `fusePassages(lists: Passage[][]): Passage[]` — RRF over lists, dedupe by `id`, keep max similarity; used by the service to merge the raw-question and rewritten-query results.
- [ ] **Step 1: Write failing tests** against the seeded DB: a query whose exact words appear in one chunk ranks that chunk in `candidates[0..2]` even with mock embeddings (keyword arm); `floor: 1.01` → `passages` empty, `candidates` non-empty; with `taskKey: 'T08'` a T08 chunk is in `passages` when `floor: -1`; chunks whose `when` excludes the profile never appear; `fusePassages([[a,b],[b,c]])` returns `[b, a, c]` order.
- [ ] **Step 2: Run** → FAIL.
- [ ] **Step 3: Implement** (two `$queryRaw` calls with the C10 replacer; `Promise.all` with the embedding call).
- [ ] **Step 4: Run** → PASS.
- [ ] **Step 5: Commit** `feat(guide): hybrid retrieval with fusion, floor and task boost`

---

### Task 8: Live official pages

**Files:**
- Create: `apps/api/src/features/guide/allowlist.ts`, `live.ts`, `live.test.ts`

**Interfaces:**
- Produces:
  - `OFFICIAL_ALLOWLIST: readonly string[]` (Global Constraints list); `isAllowedHost(url: string): boolean` (exact host or subdomain match, `https:` only).
  - `htmlToText(html: string): { title: string; text: string }` — drops `script`, `style`, `nav`, `header`, `footer`, tags; decodes basic entities; collapses whitespace; caps text at 100,000 chars.
  - `liveSources(query: string, candidates: Passage[], deps?: LiveDeps): Promise<{ passages: Passage[]; unavailable: boolean }>`
    - `LiveDeps = { fetchPage(url: string, signal: AbortSignal): Promise<{ finalUrl: string; contentType: string; body: string }>; searchUrls(query: string): Promise<string[]>; now(): Date }` (defaults: global `fetch` with `redirect: 'follow'`, body read up to 2 MB then aborted; `searchOfficialUrls`; `new Date()`).
    - URLs: allowed `url`s of `candidates` (dedupe, max 2); if none, `searchUrls` (max 2 allowed). Each page: `LiveSourceCache` hit younger than 24 h used as-is; else fetch (skip if `finalUrl` not allowed, `contentType` not `text/html`, or over 2 MB), upsert cache. On fetch failure, a cache row younger than 7 days is used with its real `fetchedAt`.
    - Split page text into ~800-char passages on paragraph boundaries, embed each and the query, keep the top 3 by cosine; `origin: 'official'`, `checkedAt: fetchedAt` ISO.
    - Whole step bounded by 5,000 ms (`AbortSignal.timeout`); on timeout or no pages → `{ passages: [], unavailable: true }`.
- [ ] **Step 1: Write failing tests** with fake `deps`: candidate `https://www.ird.govt.nz/x` fetched, `https://example.com` never fetched; redirect to `https://evil.example` skipped; `application/pdf` skipped; 3 MB body skipped; fresh cache (2 h) means no fetch; fetch throws + 3-day cache → passage with that date; fetch throws + 10-day cache → `unavailable: true`; no candidates → `searchUrls` called once; slow fetch (6 s) → `unavailable: true` in ≤ 5.5 s; at most 3 passages returned.
- [ ] **Step 2: Run** → FAIL.
- [ ] **Step 3: Implement.**
- [ ] **Step 4: Run** → PASS.
- [ ] **Step 5: Commit** `feat(guide): read allowlisted official pages with cache`

---

### Task 9: Sentence gate

**Files:**
- Create: `apps/api/src/features/guide/sentences.ts`, `sentences.test.ts`

**Interfaces:**
- Produces `createSentenceGate(opts: { passages: Passage[]; taskTitles: Map<string, string>; emit: (part: ReplyPart) => void }): SentenceGate`:
  - `SentenceGate = { push(e: AnswerEvent): void; end(): ReleasedSentence[] /* all released */; dropTail(): void; sentTextCount(): number }`
  - `ReleasedSentence = { text: string; citations: { passageIndex: number; citedText: string }[] }`
  - Behaviour:
    - Buffers text; a sentence ends at `.`, `!`, `?` (optionally followed by `"`, `'`, `)`) followed by whitespace, or at a newline — except after `e.g.`, `i.e.`, `etc.`, `St.`, `Mt.`, `No.`, a single capital initial, or a number-only list marker (`1.`) at line start.
    - Citations received while a sentence is pending attach to it; a `block_end` with buffered text and citations releases it as a sentence (cited blocks are whole claims).
    - Before release: each `\bT\d{2,3}\b` known in `taskTitles` becomes its title and queues one `task_link` part (once per task per reply) emitted after the sentence; unknown IDs and `CHUNK_\w+` are removed; double spaces collapsed.
    - The first time a passage is cited, emit `{type:'source', index, title, url, origin, checkedAt}` (index = order of first citation, starting at 1) before the sentence; the sentence's `text` part carries those indexes.
    - `end()` releases a buffered final sentence only if it ends with terminal punctuation; `dropTail()` discards the buffer (used on `max_tokens`, abort, failure).
- [ ] **Step 1: Write failing tests**: `"Hello there. How are"` + `dropTail()` → one text part `"Hello there."`; chunks `"Do T"`, `"08 first. "` with T08 → text `"Do Get your IRD number first."` then a `task_link` part; unknown `T77` removed; `"e.g. this. Next."` → two sentences; `"1. Apply online\n2. Wait"` + `end()` → first line released, `"2. Wait"` released only if it ends with punctuation; citation to passage 0 emits `source` (index 1) before its text part with `citations: [1]`; two citations to the same passage emit one `source`; no emitted part (JSON) matches `/\bT\d{2,3}\b|CHUNK_/`.
- [ ] **Step 2: Run** → FAIL.
- [ ] **Step 3: Implement.**
- [ ] **Step 4: Run** → PASS.
- [ ] **Step 5: Commit** `feat(guide): sentence gate that never sends half sentences or task IDs`

---

### Task 10: Verify and end parts

**Files:**
- Create: `apps/api/src/features/guide/verify.ts`, `verify.test.ts`, `parts.ts`, `parts.test.ts`

**Interfaces:**
- Produces:
  - `verify(sentences: ReleasedSentence[], passages: Passage[]): VerifyResult`, `VerifyResult = { unmatchedCitations: number; uncitedClaims: string[]; note: ReplyPart | null }`. A citation matches when its whitespace-normalised `citedText` is a substring of the passage content. A sentence is a factual claim when it matches `/\d|\$|%|\b(eligible|eligibility|must|required|fee|cost|deadline)\b/i`. `note` = one `{type:'unverified', text: buildUnverifiedNote(<first 60 chars of the first failing sentence>, <host of its best passage or the top official/guide passage URL host, else null>)}` when any check fails, else `null`.
  - `endParts(args: { verify: VerifyResult; stopReason: AnswerResult['stopReason']; ctx: GuideContext; answerText: string }): ReplyPart[]` — order: `unverified` note; on `max_tokens` `{type:'notice', kind:'truncated'}` then `follow_up` "Want the rest?"; otherwise at most one `follow_up` for `ctx.nextTasks[0]` when its title is not already in `answerText` and the answer text is non-empty.
- [ ] **Step 1: Write failing tests**: matching citation → `note === null`; a citation not in any passage → note; `"The fee is $50."` with no citation → note naming it; `"Welcome to NZ."` uncited → no note; `max_tokens` → `[truncated notice, follow_up "Want the rest?"]`; next task title present in answer → no task follow-up.
- [ ] **Step 2: Run** → FAIL.
- [ ] **Step 3: Implement.**
- [ ] **Step 4: Run** → PASS.
- [ ] **Step 5: Commit** `feat(guide): verify citations and uncited claims, build end parts`

---

### Task 11: Memories

**Files:**
- Create: `apps/api/src/features/guide/remember.ts`, `remember.test.ts`, `memories.ts`, `memories.test.ts`

**Interfaces:**
- Produces:
  - `remember(args: { userId: string; messageId: string; candidates: Understanding['memoryCandidates']; skip: boolean }): Promise<ReplyPart[]>` — returns `[]` when `skip`; drops `sensitive && !explicit`; drops case-insensitive duplicates of existing memory text; stops at 50 per user; creates rows with `sourceMessageId`; returns one `memory_saved` part per new row.
  - `listMemories(userId): Promise<GuideMemoryDto[]>` (newest first), `updateMemory(userId, id, text): Promise<GuideMemoryDto>` (sets `editedByUser: true`; text trimmed 1–200 chars else 400 `VALIDATION_ERROR`), `deleteMemory(userId, id): Promise<void>` — another user's or missing id → 404 `MEMORY_NOT_FOUND`.
- [ ] **Step 1: Write failing tests**: candidate saved and part returned; `skip: true` → nothing; sensitive non-explicit dropped, sensitive explicit saved; duplicate (different case) dropped; user with 50 memories → nothing saved; update/delete of another user's memory → 404; edit sets `editedByUser`.
- [ ] **Step 2: Run** → FAIL.
- [ ] **Step 3: Implement.**
- [ ] **Step 4: Run** → PASS.
- [ ] **Step 5: Commit** `feat(guide): memory saving rules and memory CRUD`

---

### Task 12: Turns, daily cap and sweeper

**Files:**
- Create: `apps/api/src/features/guide/daily-cap.ts`, `turns.ts`, `turns.test.ts`, `sweeper.ts`, `sweeper.test.ts`

**Interfaces:**
- Produces:
  - `countToday(tx, conversationId: string, now: Date): Promise<number>` and `assertUnderGuideCap(tx, conversationId, now): Promise<void>` → `AppError('CHAT_DAILY_CAP_REACHED', 'Daily question limit reached. It resets at midnight NZ time.', 429)`; `capResetAt(now) = nextNzMidnight(now)`.
  - `startTurn(userId: string, text: string, screen: GuideScreen, now?: Date): Promise<{ conversationId: string; userMessageId: string; assistantMessageId: string }>` — one `db.$transaction`: upsert conversation, `SELECT id FROM "GuideConversation" WHERE id = $1 FOR UPDATE`, 409 `GUIDE_BUSY` if a `streaming` assistant row exists, cap check, insert user row (`status 'complete'`, `countsTowardCap true`) and assistant row (`status 'streaming'`, `replyToId`, same screen). A `P2002` on the partial index also maps to 409 `GUIDE_BUSY`.
  - `finishTurn(assistantMessageId: string, r: { status: Exclude<GuideMessageStatus,'streaming'>; parts: ReplyPart[]; text: string; meta: object; textSent: boolean }): Promise<void>` — updates the assistant row; when `!textSent && (status === 'failed' || status === 'cancelled')` sets the user row's `countsTowardCap = false`.
  - `restartTurn(userId: string, assistantMessageId: string, now?: Date): Promise<{ userMessageId: string; question: string; screen: GuideScreen }>` — same lock; row must belong to the user (else 404 `MESSAGE_NOT_FOUND`) and be `failed` or `interrupted` (else 409 `NOT_RETRYABLE`); if the user row is not counting, cap check then set counting; set assistant row `streaming`, clear `parts`.
  - `sweepStale(now?: Date): Promise<{ interrupted: number; cacheDeleted: number }>` (streaming rows with `createdAt` older than 2 min → `interrupted`; `LiveSourceCache.fetchedAt` older than 30 days deleted) `warnOnCost(now?: Date): Promise<void>` (logs `warn` `guide cost above budget` when the average `meta.costCents` of yesterday's NZ-day assistant rows exceeds 5; spec §9.5) and `startSweeper(): () => void` (runs `sweepStale` now and every 5 min and `warnOnCost` hourly, `unref()`ed timers, returns stop).
- [ ] **Step 1: Write failing tests**: `startTurn` twice concurrently (`Promise.allSettled`) → one fulfilled, one 409 `GUIDE_BUSY`; 20 counting questions today → 429, 19 → ok; 25 non-counting rows don't block; question from yesterday NZ time doesn't count; `finishTurn` failed without text → user row not counting; cancelled with text → still counting; `restartTurn` on a `complete` row → 409 `NOT_RETRYABLE`, on another user's row → 404; sweeper marks a 3-min-old streaming row interrupted and leaves a 1-min-old one; `warnOnCost` logs once when yesterday's average is 6¢ and not at 4¢.
- [ ] **Step 2: Run** → FAIL.
- [ ] **Step 3: Implement.**
- [ ] **Step 4: Run** → PASS.
- [ ] **Step 5: Commit** `feat(guide): atomic turn start, fair daily cap, stale-row sweeper`

---

### Task 13: Pipeline service, SSE and message routes

**Files:**
- Create: `apps/api/src/features/guide/sse.ts`, `answer.ts`, `service.ts`, `routes.ts`, `routes.messages.test.ts`
- Modify: `apps/api/src/server.ts` (register `registerGuideRoutes`, call `startSweeper()` and `warmUnderstand()` after listen when `config.aiMode === 'live'`; sweeper always)

**Interfaces:**
- Consumes everything from Tasks 3–12.
- Produces:
  - `openSse(reply: FastifyReply): { send(e: GuideSseEvent): void; end(): void; closed: () => boolean; onClose(fn: () => void): void }` — headers and CORS echo copied from `features/chat/service.ts` `sendMessage` (C14); `send` writes `event: <name>\ndata: <json>\n\n`.
  - `buildAnswerRequest(ctx, history, passages, question): GuideAnswerRequest` in `answer.ts` (documents titled `"${title} (${url})"`).
  - `runTurn(args: { userId: string; reply: FastifyReply; question: string; screen: GuideScreen; ids: { userMessageId: string; assistantMessageId: string }; isRetry: boolean }): Promise<void>` in `service.ts`, implementing spec §5.1 steps 2–8:
    - `notice checking_guide` → `Promise.all([understand, retrieve(question)])` → if `searchQuery !== question` retrieve again and `fusePassages`;
    - out of scope → one text part `GUIDE_OUT_OF_SCOPE_REPLY(redirectAgency ?? 'the right agency')`, no answer call;
    - live when `passages` empty or `needsLive` → `notice checking_official`; `unavailable` → `notice official_unavailable`;
    - no passages at all → `GUIDE_NOTHING_FOUND_REPLY`, logged `guide knowledge gap`;
    - distress → `GUIDE_CRISIS_TEXT` text part first (C08), then the answer;
    - `streamGuideAnswer` through the sentence gate; `refusal` → `GUIDE_REFUSAL_REPLY`; `max_tokens`/`aborted`/error → `dropTail()`;
    - `AIFailureError` before any text → `{type:'error', code:'AI_FAILURE', retryable:true}`, status `failed`; after text → `notice interrupted`, status `interrupted`;
    - verify → `endParts` → `remember` (skip on retry, out-of-scope, distress) → `finishTurn` with `meta` `{ ms: {understand, retrieve, live, firstText, total}, tokens, costCents, steps, verify: {unmatchedCitations, uncitedClaims: n} }` (`costCents` from usage at Sonnet 5.5 $2/$10, cache reads $0.20, Haiku 5.5 $0.10/$0.50 per MTok, plus 1¢ per web search; rates in one constant) → `done`.
  - An in-process `Map<assistantMessageId, AbortController>`; client `close` before `done` aborts with status `interrupted`; `cancelTurn(userId, assistantMessageId): Promise<void>` aborts with status `cancelled` (404 `MESSAGE_NOT_FOUND` when not the user's streaming row). Comment: `// shortcut: in-memory abort map assumes one API instance, move to a DB flag polled by the stream when scaling out`.
  - Routes (all `preHandler: authenticateRequest`): `POST /guide/messages` (body zod: `text` trimmed 1–2,000 chars, `screen` per `GuideScreen`; validation and `startTurn` errors return JSON before SSE opens; then `start` event and `runTurn`), `POST /guide/messages/:id/cancel` (204), `POST /guide/messages/:id/retry` (`restartTurn` then SSE as above with `isRetry: true`).
- [ ] **Step 1: Write failing route tests** (real Supabase user, mock AI, `app.inject` is fine for event order):
  - events in order `start`, `part notice checking_guide`, …, `done`; at least one `source` before the first cited `text`; no body text matches `/\bT\d{2,3}\b|CHUNK_/`; `memory_saved` (send `"Remember that my partner starts work in March"` with `setMockStructured` returning a candidate) arrives before `done`;
  - `text: ''`, `'   '` and 2,001 chars → 400 `VALIDATION_ERROR` and no `GuideMessage` rows;
  - a second POST while a streaming row exists → 409 `GUIDE_BUSY`;
  - 20 counting questions seeded → 429 `CHAT_DAILY_CAP_REACHED`;
  - mock answer throwing `AIFailureError` → `error` part, status `failed`, question not counting; retry of that message → `complete` and counting;
  - distress question → first `text` part starts with `Lifeline NZ: 0800 543 354`;
  - cancel of another user's message → 404.
- [ ] **Step 2: Run** `npm run test:run -w @landednz/api -- src/features/guide/routes.messages.test.ts` → FAIL.
- [ ] **Step 3: Implement.**
- [ ] **Step 4: Run** the guide tests and `npm run typecheck -w @landednz/api` → PASS. Then start the API (`make dev`) and confirm progressive delivery with `curl -N` against `POST /guide/messages` (C14: `app.inject` buffers): sentences arrive as separate events before `done`.
- [ ] **Step 5: Commit** `feat(guide): guide pipeline, SSE stream, cancel and retry`

---

### Task 14: History, opening and memory routes

**Files:**
- Modify: `apps/api/src/features/guide/routes.ts`
- Create: `apps/api/src/features/guide/history.ts`, `routes.read.test.ts`

**Interfaces:**
- Produces:
  - `getConversation(userId, before: string | null, limit: number): Promise<GuideConversationPage>` (newest first, `limit` 1–50 default 20, `before` = message id cursor) and `getTaskMessages(userId, taskKey): Promise<GuideMessageDto[]>` (oldest first, max 50).
  - `getOpening(userId, screen): Promise<GuideOpeningResponse>` from `loadGuideContext` + `buildWhereYouAre` / `buildStarters`; no model call.
  - Routes: `GET /guide/conversation`, `GET /guide/conversation/task/:taskKey`, `GET /guide/opening?screen=home|roadmap|task&taskKey=`, `GET /guide/memories`, `PATCH /guide/memories/:id` (body `{ text }`), `DELETE /guide/memories/:id` (204).
- [ ] **Step 1: Write failing tests**: paging returns `nextBefore` and the next page continues without overlap; task view returns only that task's messages; opening has ≤ 3 starters and no `T\d{2}` keys; memories list/patch/delete; another user's memory → 404; `DELETE /account` leaves no guide rows for that user.
- [ ] **Step 2: Run** → FAIL.
- [ ] **Step 3: Implement.**
- [ ] **Step 4: Run** → PASS.
- [ ] **Step 5: Commit** `feat(guide): conversation history, opening and memory routes`

---

### Task 15: Accuracy set, measurements and staging check

**Files:**
- Create: `apps/api/accuracy/guide-questions.yaml`, `apps/api/scripts/guide-accuracy.ts`, `apps/api/scripts/guide-accuracy.test.ts`
- Modify: `Makefile` (`guide-accuracy` target), `apps/api/package.json` (`guide:accuracy` script)
- Modify: `.claude/constitution.md` (C06 rewritten: "Guide pipeline order: start transaction → understand ∥ retrieve → live → answer through the sentence gate → verify → end parts → remember → finish → done. No text part bypasses the sentence gate." ; C01 adds `features/guide` alongside `features/chat`)

**Interfaces:**
- `guide-questions.yaml`: ~40 entries `{ id, profile: {visaType, city, familySituation, occupation, arrivalDaysAgo}, screen, history?: [...], question, expect: { sources: string[] /* chunk keys or official hosts */, decline: boolean, distress: boolean } }` covering spec §9.3's categories; questions written from the content bundle's tasks, not invented facts.
- `scoreAnswer(q: AccuracyQuestion, run: { parts: ReplyPart[]; text: string }, judge: (claim: string, cited: string) => Promise<boolean>): Promise<AccuracyScore>` — pure apart from `judge`; `AccuracyScore = { sourcesOk: boolean; grounded: number /*0–1*/; declineOk: boolean; inventedProfileFact: boolean; crisisOk: boolean }`.
- Runner (`AI_MODE=live`, local API): creates a test user per profile, posts each question through `POST /guide/messages`, scores with a Haiku judge via `structuredHaiku`, prints the release-bar table (groundedness ≥ 95%, correct sources ≥ 90%, zero invented profile facts, 100% out-of-scope declines, crisis text on every distress question) plus p75 of `meta.ms.firstText` / `total` and average `meta` cost; exits 1 if the bar fails. `--thinking=adaptive|between_tools` sets `GUIDE_ANSWER_THINKING` for the run.
- [ ] **Step 1: Write failing tests** for `scoreAnswer`: expected source cited → `sourcesOk`; answer mentioning "partner" for a `SOLO` profile → `inventedProfileFact`; decline expected and given → `declineOk`; distress without `Lifeline NZ` → `crisisOk === false`.
- [ ] **Step 2: Run** `npm run test:run -w @landednz/api -- scripts/guide-accuracy.test.ts` → FAIL.
- [ ] **Step 3: Implement** the scorer, runner, YAML and Make target; edit the constitution lines.
- [ ] **Step 4: Run** the test → PASS. Then with `make kb-sync-live` done and `ANTHROPIC_MODEL=claude-sonnet-5-5`, run `make guide-accuracy` twice (`--thinking=between_tools`, `--thinking=adaptive`); set `GUIDE_ANSWER_THINKING` to the faster setting that passes the bar; tune `GUIDE_RELEVANCE_FLOOR` (try 0.2–0.45) to the value with the best sources score; record the numbers and the live-fetch block rate per host in `docs/superpowers/plans/2026-10-29-settlement-guide-backend-results.md`. If an allowlisted host blocks plain fetch on most attempts, stop and report it (spec §11 fallback needs an owner decision on cost).
- [ ] **Step 5: Commit** `test(guide): accuracy set, runner and tuned settings`
- [ ] **Step 6: Staging.** Deploy the branch to staging (existing Staging workflow), set `GUIDE_*` env vars, run `make guide-accuracy` against the staging API (`BASE_URL`), confirm the speed targets in spec §5.2 from `meta`, and report results to the owner. Plan B starts after this.
