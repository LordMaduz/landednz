# Settlement guide: chat redesign

**Date:** 2026-10-29 · **Status:** Draft for owner review · **Replaces:** the R0 task-scoped chat (`features/chat`, `AskPanel`)

## 1. Why

Owner testing on staging showed the current chat is not good enough to ship:

- Answers were cut off mid-word ("**Saf"): `max_tokens: 1024` with no `stop_reason` handling.
- Answers stated facts the user never gave ("partner on student visa, single income"): hard-coded per-`familySituation` text in the system prompt.
- Retrieval takes the top 5 chunks with no relevance floor, searches with the raw question, and citations are free text the UI scrapes with a regex.
- The answer is squeezed into a 380 px aside on the task screen.

This is a clean-slate redesign. Nothing from the old chat spec, prompt or UI constrains it.

## 2. What we are building

A **settlement guide** for skilled migrants new to NZ. It is reachable from home, roadmap and task screens on desktop and phone, and knows the user's profile, roadmap and progress.

### Decisions (owner-approved)

| # | Topic | Decision |
|---|---|---|
| 1 | Role | Answers, links to the user's tasks, suggests next steps. Read-only: it changes nothing. Agent actions with a confirm step are the next feature; the reply format leaves room for them. |
| 2 | Internal names | Never shown. Tasks appear by their real title as a link ("Get your IRD number →"), never as "T08". |
| 3 | Sources | LandedNZ's checked guide first, then a fixed allowlist of official NZ sites. Every claim cited. Each answer labelled "From LandedNZ's checked guide" or "From official sites, checked today". Never answers NZ facts from model memory. |
| 4 | Conversation | One continuous conversation per user, saved and synced across devices. Each question records the screen it came from; on a task, that task's messages show first with full history available. |
| 5 | Memory | The guide remembers facts the user tells it. Every memory is visible, editable and deletable in Settings. Nothing is remembered invisibly. |
| 6 | Language | English only. No voice. Multilingual replies are a later prompt change. |
| 7 | Cost | About 3-6¢ per answer; 20 questions per user per day. |
| 8 | Proactive behaviour | Inside the chat only, kept quiet (§6.3). |
| 9 | Delivery | Two phases planned together: backend engineering, then a premium UI/UX designed from scratch with the impeccable skill. |

### Success criteria

1. The accuracy test set (§9.3) passes its release bar.
2. No user sees a truncated reply or a profile fact they did not give.
3. Speed targets in §5.2 are met on staging.
4. The UI passes impeccable critique and audit with no open P0/P1 and the owner approves it.

### Out of scope

Agent actions; multilingual replies; voice; notifications, emails or nudges outside the chat; migrating old chat history (no real users yet).

## 3. Architecture

A new API feature `apps/api/src/features/guide/` replaces `features/chat/`. One request runs a fixed pipeline that our code controls (approach B: chosen over a single model call with built-in search, which gives less control over cost and accuracy, and over a tool-using agent, which is slower and less predictable).

```
question + screen
   │
   ▼
context ─► understand (Haiku) ─► retrieve ─► [live, only if needed] ─► answer (Sonnet, streamed) ─► verify ─► parts ─► SSE
                                                                                                         │
                                                                                                         └─► remember (after reply)
```

### 3.1 Units

Each unit is a file with one job, testable on its own.

| Unit | Input → output | Notes |
|---|---|---|
| `context.ts` | userId, screen → `GuideContext` | Profile, roadmap progress (done/next tasks with titles), current task, saved memories. Only data from the database. No inferred facts. |
| `understand.ts` | question, last 6 messages, context → `Understanding` | Haiku 5.5, structured output: `searchQuery` (standalone rewrite), `scope` (`in` / `out` + redirect agency), `needsLive` (bool), `distress` (bool), `memoryCandidates` (short facts the user stated about themselves). 2 s timeout; on failure falls back to `{searchQuery: question, scope: 'in', needsLive: false, distress: false, memoryCandidates: []}`. |
| `retrieve.ts` | searchQuery, context → `Passage[]` | Hybrid search: pgvector cosine + Postgres full-text (`tsvector`), merged with reciprocal-rank fusion, boosted for the current task's chunks, condition pre-filter kept. Returns up to 6 passages above a relevance floor (initial value tuned on the accuracy set and stored in config). |
| `live.ts` | searchQuery → `Passage[]` | Runs when `retrieve` returns nothing above the floor or `needsLive` is true. Anthropic web search (`web_search_20260209`) with `allowed_domains` set to the allowlist (§4.3), `max_uses: 2`, plus web fetch (`web_fetch_20260209`, same allowlist) for the chosen pages. Results stored in `LiveSourceCache` for 24 h, keyed by URL; cache checked first. 5 s budget. |
| `answer.ts` | context, understanding, passages, recent messages → stream of text + citations | Sonnet 5.5, streamed. Passages sent as `document` blocks with `citations: {enabled: true}`. System prompt from `prompts.ts` (§5.3). Handles `stop_reason`: `end_turn`, `max_tokens` (§7), `refusal`. |
| `verify.ts` | answer blocks, passages → verified blocks + `VerifyResult` | Every citation's `cited_text` must be found in a passage we sent. Unmatched citations dropped. If more than half fail, the answer is replaced by the "couldn't verify" reply (§7). |
| `parts.ts` | verified blocks, context, understanding → `ReplyPart[]` | Builds typed parts (§4.1). Task titles in the answer become `task_link` parts. Adds at most one `follow_up`. Strips any internal ID pattern (`T\d+`, chunk keys) as a last guard. |
| `remember.ts` | memoryCandidates, messageId → `Memory[]` | Runs after the reply is sent. Deduplicates against existing memories. Emits a `memory_saved` part so the user sees "Remembered: …" with undo. |
| `prompts.ts` | → system prompt string | All guide prompt text lives here. Replaces the chat prompt functions in `core/prompts/registry.ts`. |
| `service.ts` | orchestrates the units, persistence, logging | |
| `routes.ts` | HTTP layer | §4.2. |

### 3.2 Models

| Step | Model | Settings |
|---|---|---|
| understand | `claude-haiku-5-5` | Structured output (`output_config.format`), effort `low`. |
| answer | `claude-sonnet-5-5` | Streaming, effort `low` (chat route), `max_tokens: 2000`, citations on. Thinking cannot be disabled on Sonnet 5.5; `low` effort keeps latency down. Refusal fallback enabled per SDK guidance. |
| live | `claude-sonnet-5-5` server tools | A separate short call (effort `low`) that runs web search + fetch and returns the fetched pages. `live.ts` caches them and passes them to the answer call as ordinary documents, so every source (guide or official) is cited and verified the same way. |
| accuracy judge | `claude-haiku-5-5` | Offline only. |

Local and test runs keep the existing rule: `ANTHROPIC_MODEL` override with Haiku for cheap tests; Sonnet only on staging and production.

Citations and structured output cannot be combined in one call (API returns 400), which is why the answer call streams text with citations and `parts.ts` builds the typed parts afterwards.

### 3.3 Cost estimate

- understand: ~1.5k input, ~150 output on Haiku 5.5 → under 0.1¢.
- answer: ~5k input (system ~1.2k cached, passages ~3k, history ~0.8k) and ~400 output on Sonnet 5.5 → about 1.4¢.
- live, when it runs: web search $10 per 1,000 searches (≤ 2 per answer) plus fetched page tokens → about 2-4¢.

Typical answer about 1.5¢; live answers about 4-6¢. Within the 3-6¢ budget. Prompt caching on the static system prefix (Sonnet 5.5 minimum cacheable prefix is 512 tokens).

## 4. Interfaces

### 4.1 Reply parts (shared type in `@landednz/types`)

```ts
type ReplyPart =
  | { type: 'notice'; kind: 'checking_guide' | 'checking_official' | 'official_unavailable' | 'interrupted' | 'truncated' }
  | { type: 'text'; text: string; citations: number[] }           // indexes into the reply's sources
  | { type: 'source'; index: number; title: string; url: string; origin: 'guide' | 'official'; checkedAt: string }
  | { type: 'task_link'; taskKey: string; title: string }          // taskKey for routing only; UI renders the title
  | { type: 'follow_up'; text: string }
  | { type: 'memory_saved'; memoryId: string; text: string }
  | { type: 'error'; code: 'AI_FAILURE' | 'DAILY_CAP'; retryable: boolean }
// Reserved for the agent feature: { type: 'action'; ... } with a confirm step.
```

The UI renders parts and never parses reply text for meaning. The answer label ("From LandedNZ's checked guide" / "From official sites, checked today") comes from the sources' `origin`.

### 4.2 API

| Method + path | Purpose |
|---|---|
| `POST /guide/messages` | Body `{ text, screen: { kind: 'home' \| 'roadmap' \| 'task', taskKey? } }`. Responds with SSE: `part` events (each a `ReplyPart`, text streamed as incremental `text` parts), then `done` with the saved message id. |
| `POST /guide/messages/:id/cancel` | Stops a streaming answer. Cancelled answers do not count against the daily cap. |
| `POST /guide/messages/:id/retry` | Re-runs a failed or interrupted answer. Does not count against the cap. |
| `GET /guide/conversation?before=&limit=&taskKey=` | Paged history. With `taskKey`, that task's messages come first. |
| `GET /guide/opening?screen=` | The "where you are" line and up to 3 starter questions, built from roadmap data with no model call. |
| `GET /guide/memories` | List memories. |
| `PATCH /guide/memories/:id` | Edit a memory's text. |
| `DELETE /guide/memories/:id` | Delete a memory (hard delete). |

All routes require auth. `POST /guide/messages` runs `assertUnderDailyCap` with the cap set to 20.

### 4.3 Official-site allowlist

Stored in config, reviewed with content: `govt.nz`, `ird.govt.nz`, `immigration.govt.nz`, `tenancy.govt.nz`, `acc.co.nz`, `healthnz.govt.nz`, `info.health.nz`, `nzta.govt.nz`, `employment.govt.nz`, `workandincome.govt.nz`, `sorted.org.nz`, `nzqa.govt.nz`, `education.govt.nz`, `kiwisaver.govt.nz`. Subdomains are covered.

### 4.4 Data (Prisma)

```prisma
model GuideConversation {
  id        String         @id @default(uuid())
  userId    String         @unique
  user      User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  messages  GuideMessage[]
  createdAt DateTime       @default(now())
}

model GuideMessage {
  id             String            @id @default(uuid())
  conversationId String
  conversation   GuideConversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  role           String            // 'user' | 'assistant'
  text           String            // user question, or assistant plain text for history replay
  parts          Json?             // assistant ReplyPart[]
  screenKind     String
  taskKey        String?
  status         String            // 'complete' | 'streaming' | 'failed' | 'interrupted' | 'cancelled'
  countsTowardCap Boolean          @default(true)
  meta           Json?             // latency per step, tokens, cost, steps run, verify result
  createdAt      DateTime          @default(now())
  @@index([conversationId, createdAt])
  @@index([conversationId, taskKey])
}

model GuideMemory {
  id              String   @id @default(uuid())
  userId          String
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  text            String
  sourceMessageId String?
  editedByUser    Boolean  @default(false)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  @@index([userId])
}

model LiveSourceCache {
  url       String   @id
  title     String
  content   String
  fetchedAt DateTime
}
```

Plus a generated `tsvector` column and GIN index on the knowledge-base chunk table for keyword search.

The daily cap counts `GuideMessage` rows with `role = 'user'`, `countsTowardCap = true`, created since midnight NZ time.

## 5. Flow of one question

### 5.1 Steps

1. **Receive.** Check the cap, save the user message with its screen, open the SSE stream.
2. **Understand** (Haiku, ~300 ms). Out of scope → stream a short, kind redirect to the right agency (immigration adviser finder, Healthline, Lifeline, Employment NZ, Sorted) with no Sonnet call. `distress` → the answer step acknowledges feelings first.
3. **Retrieve.** Stream `notice: checking_guide` immediately. Hybrid search, task boost, up to 6 passages above the floor.
4. **Live, only if needed.** Stream `notice: checking_official`. Cache first, then allowlisted search and fetch.
5. **Answer** (Sonnet, streamed). Text streams to the client as it arrives.
6. **Verify and finish.** Drop unsupported citations, build `source`, `task_link` and at most one `follow_up` part, handle truncation (§7), save the reply with `meta`.
7. **Remember.** Save memory candidates; stream `memory_saved` parts.

### 5.2 Speed targets (staging, p75)

First `notice` ≤ 1 s · first answer text ≤ 2.5 s from the guide, ≤ 6 s with live sources · complete answer ≤ 8 s.

### 5.3 Answer prompt

Short and fixed, in this order (static first so it caches):

1. **Who the guide is.** A settlement guide for new migrants in NZ; calm, plain English; not a lawyer, financial adviser or doctor.
2. **Rules.**
   - Answer only from the supplied documents. If they don't cover it, say so and name the agency to ask.
   - Use the user's facts only when they change the answer.
   - Never mention internal IDs.
   - **Shape:** the direct answer first, then numbered steps when there is a process, then "What I can't tell you" when relevant.
   - **Length:** 150-200 words.
3. **Scope.**
   - In-scope topics, aligned to the knowledge base's topics.
   - Out-of-scope redirects with contact details.
4. **About this user** (dynamic): name, visa type, family situation in plain words, city, occupation, days since arrival, completed and next tasks by title, saved memories, current screen/task.
5. **Documents** (dynamic): passages as citable `document` blocks, titled with source name and URL.

No persona anchors, no hard-coded per-situation facts, no placeholders.

## 6. Behaviour rules

### 6.1 Conversation

- Model input history: the last 6 messages (plain text, no old passages). Older context lives in memories.
- One answer streams at a time; the input is locked until it finishes or the user presses Stop.

### 6.2 Memory

- Only facts the user stated about themselves ("my partner starts work in March"), never inferences.
- Shown in the reply as "Remembered: …" with undo, and in Settings → Memory with edit and delete.
- Deleted memories are hard-deleted and never used again.

### 6.3 Proactive limits

- On open: one "where you are" line and at most 3 starter questions, from roadmap data. Hidden once the conversation has started.
- Per answer: at most one follow-up, none when the answer already ends with the next step.
- A dismissed or ignored suggestion is not repeated in the session.
- Nothing outside the guide: no pop-ups, badges or nudges elsewhere.

## 7. Errors and edge cases

| Case | User sees | System does |
|---|---|---|
| Daily cap reached | "You've used today's 20 questions. Back at midnight NZ time." Input disabled; history readable. | 429 `CHAT_DAILY_CAP_REACHED` with reset time; no model calls. |
| understand fails / > 2 s | Nothing different | Fallback understanding (§3.1). |
| Nothing above the floor and live fails | "I couldn't find this in checked sources. [Agency] is the right place to ask." | Logged as a knowledge gap for content review. |
| Official sites slow / blocked | `notice: official_unavailable`, answer from the guide only | 5 s cap; stale cache used if present. |
| Sonnet fails before text | "Something went wrong." + Retry | `error` part; message `failed`; retry does not count. |
| Stream drops mid-answer | Partial answer kept with "Interrupted" + Retry | Saved as `interrupted`. |
| `stop_reason: max_tokens` | Answer ends at the last complete sentence with a `truncated` notice and a "Want the rest?" follow-up | Logged. Never shows a half word. |
| `stop_reason: refusal` | Honest "I can't help with that one" + relevant agency | Logged with category. |
| Over half of citations unverifiable | Answer replaced with "I couldn't verify this against checked sources" + agency | Logged and added to the accuracy set candidates. |
| User cancels | Answer stops; Stop becomes Send | Model call aborted; `cancelled`; does not count. |
| Memory deleted | Gone immediately | Hard delete. |
| Account deleted | Everything gone | Cascade delete of conversation, messages, memories. |
| Instructions inside a fetched page | Nothing different | Fetched pages enter only as citable documents from allowlisted domains, never as instructions. |

Every reply logs per-step latency, tokens, cost, steps run and verify result in `GuideMessage.meta`.

## 8. UI/UX phase

### 8.1 Method

The UI is designed from scratch with the **impeccable** skill for a premium look; nothing is carried over from the current aside or `AskPanel`.

1. impeccable shapes the direction and produces 2-3 variants as claude.ai artifacts (redesigned screens only).
2. The owner picks a direction; iterate to approval.
3. Build, then run impeccable critique and audit, save the full output to a gate file, fix every P0/P1 before owner review.
4. App rules still apply: design tokens only, light theme only, reduced motion respected, API types from `@landednz/types`.

### 8.2 The design must cover

1. **Placement** on home, roadmap and task screens, desktop and phone. Variants to compare include a push-aside panel, a full-screen view, and a docked panel on wide screens.
2. **Conversation:**
   - Answer layout: direct answer, steps, "What I can't tell you".
   - Clickable source chips with the origin label.
   - Task links by real title.
   - A single follow-up.
   - The "Checking…" notices.
   - Stop while streaming.
   - Interrupted, failed and retry states.
3. **Opening:**
   - The "where you are" line plus at most 3 starters.
   - Opened from a task: that task's earlier messages first, with the full history available.
4. **Memory:**
   - The in-chat "Remembered: …" with undo.
   - A new Settings → Memory page with edit and delete.
5. **Edge states:** daily cap reached, nothing found, official sites unavailable, empty first visit.
6. **Task screen:** with Ask gone from the aside, the left column scrolls on its own and the actions column stays put. Review side whitespace at 1440 and 390.

### 8.3 Removed in the same release

- **API:** `features/chat/`, the chat prompt functions in `core/prompts/registry.ts`, the unused `generateText` and `buildResponseStructuringPrompt`, and the old chat tables.
- **Web:** `AskPanel`, `AiReply`, `lib/trace.ts` and the chat stream helper in `lib/api.ts`.
- **Tests:** their tests are removed with them.

## 9. Testing

### 9.1 Unit (Vitest, no model calls)

| Unit | What's tested |
|---|---|
| context | Database facts only. |
| retrieve | Fusion, floor and task boost, against the seeded test database. |
| verify | Matched and unmatched citations; the over-half fallback. |
| parts | Task-link mapping; no internal IDs in any part. |
| answer | Truncation ends at a sentence. |
| understand | Fallback on error and timeout. |
| daily cap | Cap counting excludes failed, cancelled and retried messages. |

### 9.2 API (mocked models)

- The full pipeline with fake Haiku and Sonnet.
- SSE part order.
- Cap at 20.
- Cancel and retry don't count.
- Memory save, undo, edit and delete.
- Cascade on account delete.

### 9.3 Accuracy set (real models; on demand and before each release)

- **The set:** about 40 questions, each with its expected sources. It covers:
  - every settlement topic;
  - questions asked from task screens;
  - follow-ups that depend on earlier messages;
  - out-of-scope questions;
  - questions that need live sources;
  - deliberately uncovered questions.
- **Scored per question:**
  - expected sources cited;
  - every claim supported by its cited text (Haiku judge);
  - the answer addresses the question asked;
  - correct decline when it should decline;
  - no profile fact that isn't in the test profile.
- **Release bar:**
  - groundedness ≥ 95%;
  - correct sources ≥ 90%;
  - zero invented profile facts;
  - 100% correct out-of-scope declines.
- Failures logged in production become candidate questions.

### 9.4 End-to-end (Playwright)

- Ask from a task.
- The streamed answer shows sources and a task link.
- Edit and delete a memory in Settings.
- The cap message.
- axe at 1440 and 390.
- Remote runs use longer timeouts when `BASE_URL` is set.

### 9.5 Cost watch

Daily sum of `meta.cost`; warn when the average per answer exceeds 6¢.

## 10. Order of work

1. **Backend:**
   - Schema and migration.
   - Units in §3.1 with their tests.
   - Routes.
   - The accuracy set and runner.
2. **UI design** with impeccable runs in parallel with step 1.
3. **UI build** against the finished API, then the impeccable gate and owner review.
4. **Removal** of the old chat (§8.3) in the same release.
5. **Staging:**
   - Accuracy set run.
   - Speed check.
   - Owner test.

## 11. Implementation notes to verify

- The exact TypeScript SDK event shape for streamed citations (`citations_delta`) and the server-tool result blocks: confirm against the installed `@anthropic-ai/sdk` version before writing `answer.ts` and `live.ts`; upgrade the SDK if it predates `web_search_20260209`.
- Web search and fetch pricing at implementation time.
- The relevance floor value: tune on the accuracy set, not by guess.
