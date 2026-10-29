# Settlement guide: chat redesign

**Date:** 2026-10-29 · **Status:** Draft for owner review (revised after independent review) · **Replaces:** the R0 task-scoped chat (`features/chat`, `AskPanel`)

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
| 7 | Cost | About 1.5¢ per typical answer, up to about 5¢ when official sites are checked; 20 questions per user per day. |
| 8 | Proactive behaviour | Inside the chat only, kept quiet (§6.3). |
| 9 | Delivery | Two phases, two implementation plans: A = backend and accuracy set; B = premium UI/UX designed from scratch with the impeccable skill, plus removal of the old chat. |
| 10 | Streaming | Text appears sentence by sentence. Shown text is never taken back; problems found later are added as a note under the answer. |
| 11 | Daily cap fairness | A question counts once, only if the user received answer text. Stop before any text appears gives the question back; Stop after text does not. |

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
   ├─► understand (Haiku) ───────────────┐
   └─► retrieve (raw question) ──────────┤
                                         ▼
context ─► [re-retrieve if rewritten] ─► [live, only if needed] ─► answer (Sonnet, streamed)
                                                                      │
                                                         sentence gate ─► SSE text parts
                                                                      │
                                                    verify ─► end parts ─► remember ─► done
```

### 3.1 Units

Each unit is a file with one job, testable on its own.

| Unit | Input → output | Notes |
|---|---|---|
| `context.ts` | userId, screen → `GuideContext` | Profile, roadmap progress (done/next tasks with titles), current task, saved memories. Only data from the database. No inferred facts. |
| `understand.ts` | question, last 6 messages, context → `Understanding` | Haiku 5.5, structured output: `searchQuery` (standalone rewrite), `scope` (`in` / `out` + redirect agency), `needsLive` (bool), `distress` (bool), `memoryCandidates` (short facts the user stated about themselves). 3 s timeout (raised from 1 s after Task 15 measurements: the Haiku round trip alone is ~1 s); on failure falls back to `{searchQuery: question, scope: 'in', needsLive: false, distress: <keyword check>, memoryCandidates: []}`. A crisis keyword check runs on every question regardless of Haiku and can only turn `distress` on. The schema is warmed with one call at API start (first use of a schema compiles slowly). |
| `retrieve.ts` | query, context → `Passage[]` | Hybrid search: pgvector cosine + Postgres full-text (`tsvector`), merged with reciprocal-rank fusion, boosted for the current task's chunks, condition pre-filter kept. Returns up to 6 passages above a relevance floor (tuned on the accuracy set, stored in config). Starts on the raw question in parallel with `understand`; runs again with `searchQuery` only when the rewrite differs (follow-ups), and the two result sets are fused. |
| `live.ts` | query, retrieved chunks → `Passage[]` | Runs when nothing is above the floor or `needsLive` is true. **Finds pages:** the official `sourceUrl`s of the top retrieved chunks (even below the floor); only if there are none, one Sonnet call with `web_search_20260209` (`allowed_domains` = allowlist §4.3, `max_uses: 1`) to get URLs. **Reads pages itself:** plain HTTP fetch of at most 2 allowlisted URLs, HTML to text, page text cached in `LiveSourceCache` for 24 h. Splits pages into passages, embeds them and keeps the top 3. 5 s budget for the whole step. |
| `answer.ts` | context, understanding, passages, recent messages → stream of text + citations | Sonnet 5.5, streamed. Passages sent as `document` blocks with `citations: {enabled: true}`. Prompt from `prompts.ts` (§5.3). Handles `stop_reason`: `end_turn`, `max_tokens` (§7), `refusal`. |
| `sentences.ts` | answer stream → text parts | The sentence gate. Holds back only the sentence still being written; releases each finished sentence as a `text` part with its citations. Before release it replaces task IDs with task titles (a `task_link` part follows) and strips any remaining internal ID pattern (`T\d+`, chunk keys). When the stream ends early or on `max_tokens`, the unfinished sentence is dropped, so a half word is never sent. Emits a `source` part the first time a source is cited, before the sentence that cites it. |
| `verify.ts` | released sentences, passages → `VerifyResult` | Two checks: every citation's `cited_text` is found in a passage we sent; and sentences with factual claims (numbers, dates, fees, `$`, `%`, eligibility words) have a citation. A failure never removes shown text: it adds one `unverified` part under the answer naming what to double-check and where (§7). |
| `parts.ts` | verify result, context, understanding → end `ReplyPart[]` | Builds the parts that come after the text: `unverified` note, `notice: truncated`, at most one `follow_up`. |
| `remember.ts` | memoryCandidates, messageId → `Memory[]` | Runs before `done`. Deduplicates against existing memories. Skips sensitive categories (health, mental health, immigration problems such as visa refusals) unless the user explicitly asked to be remembered. Skipped on retries, out-of-scope questions and distress messages. At most 50 memories per user (new ones are not saved past the limit). Emits `memory_saved` parts, which are also stored in the message's `parts`. |
| `prompts.ts` | → prompt strings | All guide prompt text lives here. Replaces the chat prompt functions in `core/prompts/registry.ts`. |
| `daily-cap.ts` | userId, transaction → void | Moved from `features/chat/daily-cap.ts` (keeps its `Pacific/Auckland` midnight logic), counting guide messages (§4.4). |
| `sweeper.ts` | → void | At API start and every 5 minutes: assistant rows still `streaming` after 2 minutes become `interrupted`; `LiveSourceCache` rows older than 30 days are deleted. |
| `service.ts` | orchestrates the units, persistence, logging | |
| `routes.ts` | HTTP layer | §4.2. |

### 3.2 Models

| Step | Model | Settings |
|---|---|---|
| understand | `claude-haiku-5-5` | Structured output (`output_config.format`), effort `low`. |
| answer | `claude-sonnet-5-5` | Streaming, effort `low`, `max_tokens: 2000`, citations on. Thinking: `{type: "between_tools"}` turns it off for this call (no tools, effort ≤ `high`); measure first-text time against adaptive at `low` and keep the faster. No refusal fallback (it only covers decline types this app never meets). |
| live search | `claude-sonnet-5-5` server tool | Only when no official URL is known. A short call (effort `low`) whose only job is to return result URLs. Page reading is ours (§3.1). |
| accuracy judge | `claude-haiku-5-5` | Offline only. |

Local and test runs keep the existing rule: `ANTHROPIC_MODEL` override with Haiku for cheap tests; Sonnet only on staging and production.

Citations and structured output cannot be combined in one call (API returns 400), which is why the answer call streams text with citations and our code builds the typed parts.

### 3.3 Cost estimate

- understand: ~1.5k input, ~150 output on Haiku 5.5 → under 0.1¢.
- answer: ~5k input (system ~1.2k cached, passages ~3k, history ~0.8k) and ~400 output on Sonnet 5.5 → about 1.4¢.
- live with a known official URL: 2 page fetches (free), embedding (negligible), 3 extra passages (~1.5k tokens) in the answer → about +0.3¢.
- live needing search: one web search (1¢) plus the search call's tokens → about +2-3¢.

Typical answer about 1.5¢; with official sites about 2-5¢. Prompt caching on the static system prefix (Sonnet 5.5 minimum cacheable prefix is 512 tokens). Fetched pages never go to a model in full; only the top passages do.

## 4. Interfaces

### 4.1 Reply parts (shared type in `@landednz/types`)

```ts
type ReplyPart =
  | { type: 'notice'; kind: 'checking_guide' | 'checking_official' | 'official_unavailable' | 'interrupted' | 'truncated' }
  | { type: 'text'; text: string; citations: number[] }           // one finished sentence; indexes into the reply's sources
  | { type: 'source'; index: number; title: string; url: string; origin: 'guide' | 'official'; checkedAt: string }
  | { type: 'task_link'; taskKey: string; title: string }          // taskKey for routing only; UI renders the title
  | { type: 'unverified'; text: string }                           // "I couldn't confirm the fee against an official source. Check ird.govt.nz."
  | { type: 'follow_up'; text: string }
  | { type: 'memory_saved'; memoryId: string; text: string }
  | { type: 'error'; code: 'AI_FAILURE'; retryable: boolean }
// Reserved for the agent feature: { type: 'action'; ... } with a confirm step.
```

The UI renders parts and never parses reply text for meaning. The answer label ("From LandedNZ's checked guide" / "From official sites, checked today") comes from the sources' `origin`. The daily cap is not a part: it is refused with HTTP 429 before the stream opens.

### 4.2 API

| Method + path | Purpose |
|---|---|
| `POST /guide/messages` | Body `{ text, screen: { kind: 'home' \| 'roadmap' \| 'task', taskKey? } }`. 429 `CHAT_DAILY_CAP_REACHED` (with reset time) when over the cap; 409 `GUIDE_BUSY` when an answer is already streaming in this conversation (another tab or device). Otherwise SSE: `start` `{userMessageId, assistantMessageId}`, then `part` events (each a `ReplyPart`), then `done`. |
| `POST /guide/messages/:id/cancel` | Stops a streaming answer (`:id` = assistant message id from `start`). |
| `POST /guide/messages/:id/retry` | Re-runs a failed or interrupted answer into the same assistant row. Checks the cap if the question does not currently count. |
| `GET /guide/conversation?before=&limit=` | Paged full history, newest first. |
| `GET /guide/conversation/task/:taskKey` | That task's messages, for the "on a task, its messages first" view. |
| `GET /guide/opening?screen=` | The "where you are" line and up to 3 starter questions, built from roadmap data with no model call. |
| `GET /guide/memories` | List memories. |
| `PATCH /guide/memories/:id` | Edit a memory's text. |
| `DELETE /guide/memories/:id` | Delete a memory (hard delete). |

All routes require auth.

**Starting an answer is one transaction:** lock the user's conversation row (`SELECT … FOR UPDATE`), count today's questions, refuse at 20, insert the user row and an assistant row with status `streaming`. A partial unique index (one `streaming` assistant row per conversation) backs the 409.

**Client disconnects** (tab closed, network lost): the server aborts the model call, saves the sentences already sent with status `interrupted`, and the question counts if any text was sent.

### 4.3 Official-site allowlist

Stored in config, reviewed with content: `govt.nz`, `ird.govt.nz`, `immigration.govt.nz`, `tenancy.govt.nz`, `acc.co.nz`, `healthnz.govt.nz`, `info.health.nz`, `nzta.govt.nz`, `employment.govt.nz`, `workandincome.govt.nz`, `sorted.org.nz`, `nzqa.govt.nz`, `education.govt.nz`, `kiwisaver.govt.nz`. Subdomains are covered. `live.ts` fetches only URLs whose host is on this list.

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
  id              String            @id @default(uuid())
  conversationId  String
  conversation    GuideConversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  role            String            // 'user' | 'assistant'
  replyToId       String?           @unique  // assistant row → the user row it answers
  text            String            // user question, or assistant plain text for history replay
  parts           Json?             // assistant ReplyPart[] as sent
  screenKind      String
  taskKey         String?
  status          String            // assistant: 'streaming' | 'complete' | 'failed' | 'interrupted' | 'cancelled'; user: 'complete'
  countsTowardCap Boolean           @default(true)  // user rows only
  meta            Json?             // latency per step, tokens, cost, steps run, verify result
  createdAt       DateTime          @default(now())
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
  content   String   // page text, capped at 100k characters
  fetchedAt DateTime
}
```

Raw SQL in the migration (Prisma 7 cannot express these):

- A generated `tsvector` column on `KnowledgeBaseChunk` (declared as `Unsupported("tsvector")`) with a GIN index, for keyword search.
- The partial unique index `ON "GuideMessage" ("conversationId") WHERE status = 'streaming'`.

**Daily cap rule.** The cap counts user rows with `countsTowardCap = true` created since midnight `Pacific/Auckland`. A user row is inserted counting. It is set to not counting when its answer fails or is cancelled before any text was sent. Retrying a not-counting question checks the cap and sets it counting again. So each question counts once, and only when the user got answer text.

## 5. Flow of one question

### 5.1 Steps

1. **Start.** The transaction in §4.2; send `start` with both message ids.
2. **Understand and retrieve in parallel.** Send `notice: checking_guide` at once. Out of scope → a short, kind redirect to the right agency (immigration adviser finder, Healthline, Employment NZ, Sorted) with no Sonnet call. `distress` → §6.4.
3. **Re-retrieve** with the rewritten query if it differs.
4. **Live, only if needed.** Send `notice: checking_official`. Cache first, then known official URLs, then search.
5. **Answer** (Sonnet, streamed through the sentence gate). Each finished sentence goes out as it completes.
6. **Verify and finish.** Send any `unverified` note, `truncated` notice and `follow_up`.
7. **Remember.** Save memory candidates; send `memory_saved` parts.
8. **Done.** Save the assistant row with its `parts` and `meta`; send `done`.

### 5.2 Speed targets (staging, p75)

| | First `notice` | First answer text | Complete answer |
|---|---|---|---|
| From the guide | ≤ 1 s | ≤ 2.5 s | ≤ 8 s |
| With official sites | ≤ 1 s | ≤ 8 s | ≤ 12 s |

"First answer text" is the first finished sentence. Running retrieval in parallel with understand saves roughly the time the sentence gate adds.

### 5.3 Answer prompt

Order matters for caching. **System (static, cached):**

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

**Final user turn (dynamic, after the cache breakpoint):**

4. **About this user:** name, visa type, family situation in plain words, city, occupation, days since arrival, completed and next tasks by title, saved memories, current screen/task.
5. **Documents:** passages as citable `document` blocks, titled with source name and URL.
6. **The question.**

The last 6 messages sit between the system prompt and the final user turn. No persona anchors, no hard-coded per-situation facts, no placeholders.

## 6. Behaviour rules

### 6.1 Conversation

- Model input history: the last 6 messages (plain text, no old passages). Older context lives in memories.
- One answer streams at a time per user, enforced by the server (409 `GUIDE_BUSY`); the input is also locked in the UI until the answer finishes or the user presses Stop.

### 6.2 Memory

- Only facts the user stated about themselves ("my partner starts work in March"), never inferences.
- Not saved automatically: health, mental health and immigration problems, unless the user asks the guide to remember them.
- Shown in the reply as "Remembered: …" with undo, and in Settings → Memory with edit and delete.
- Deleted memories are hard-deleted and never used again.
- At most 50 per user.

### 6.3 Proactive limits

- On open: one "where you are" line and at most 3 starter questions, from roadmap data. Hidden once the conversation has started.
- Per answer: at most one follow-up, none when the answer already ends with the next step.
- A dismissed or ignored suggestion is not repeated in the session.
- Nothing outside the guide: no pop-ups, badges or nudges elsewhere.

### 6.4 Distress

- `distress` is set by Haiku or by the crisis keyword check (whichever fires; the keyword check works even when Haiku fails).
- The answer acknowledges feelings first, then answers.
- When the keyword check fires, the reply always includes fixed crisis text: Need to Talk? free call or text 1737, and Lifeline. The numbers are verified against their official pages during implementation and stored in `prompts.ts`, not generated.
- The crisis text is sent at the start of the turn when the keyword check fires, before understand and retrieve finish, so a later failure still leaves it on screen (owner decision 2026-10-30).
- Haiku is the main distress signal (it reads meaning; the keywords only catch explicit phrases). When understand times out, it keeps running in the background: a late `distress` before the answer starts sends the crisis text then; after the answer has started, the reply ends with a short check-in pointing to 1737. The understand prompt treats ambiguous cases as distress: a false alarm costs little, a miss costs a lot.
- **Distress plus out of scope:** crisis text, then fixed warm copy that acknowledges the feeling and points to the right agency. No Sonnet call (owner decision 2026-10-30; replaces "crisis text then an answer").

## 7. Errors and edge cases

| Case | User sees | System does |
|---|---|---|
| Daily cap reached | "You've used today's 20 questions. Back at midnight NZ time." Input disabled; history readable. | 429 `CHAT_DAILY_CAP_REACHED` with reset time; no model calls. |
| Answer already streaming elsewhere | "An answer is still coming in another window." | 409 `GUIDE_BUSY`. |
| understand fails / > 3 s | Nothing different | Fallback understanding (§3.1). |
| Nothing above the floor and live fails | "I couldn't find this in checked sources. [Agency] is the right place to ask." | Logged as a knowledge gap for content review. |
| Official sites slow / blocked | `notice: official_unavailable`, answer from the guide only | 5 s cap. Cached page text up to 7 days old is used if present, and its `checkedAt` shows the real date. |
| Sonnet fails before text | "Something went wrong." + Retry | `error` part; status `failed`; question stops counting. |
| Stream drops mid-answer | Sentences already shown stay, with "Interrupted" + Retry | Status `interrupted`; counts (text was sent). |
| Client disconnects | (Seen on next load as interrupted) | Model call aborted; status `interrupted`. |
| Server crash mid-answer | Interrupted + Retry on next load | Sweeper marks the row `interrupted`. |
| `stop_reason: max_tokens` | Answer ends at the last finished sentence, `truncated` notice and a "Want the rest?" follow-up | The unfinished sentence was never sent. Logged. |
| `stop_reason: refusal` | Honest "I can't help with that one" + relevant agency | Logged with category. |
| Citation doesn't match, or a factual sentence has no citation | Text stays; a note below names what to double-check and where | `unverified` part; logged and added to accuracy set candidates. |
| User presses Stop before any text | Stop becomes Send; question given back | Model call aborted; `cancelled`; not counting. |
| User presses Stop after text | Shown sentences stay | Model call aborted; `cancelled`; counts. |
| Memory deleted | Gone immediately | Hard delete. |
| Account deleted | Everything gone | Cascade delete of conversation, messages, memories. |
| Instructions inside a fetched page | Nothing different | Fetched pages enter only as citable passages from allowlisted domains, never as instructions. |

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
   - Sentence-by-sentence arrival that still feels smooth (reduced motion respected).
   - Clickable source chips with the origin label.
   - Task links by real title.
   - The `unverified` note.
   - A single follow-up.
   - The "Checking…" notices.
   - Stop while streaming.
   - Interrupted, failed, busy-elsewhere and retry states.
3. **Opening:**
   - The "where you are" line plus at most 3 starters.
   - Opened from a task: that task's earlier messages first, with the full history available.
4. **Memory:**
   - The in-chat "Remembered: …" with undo.
   - A new Settings → Memory page with edit and delete.
5. **Edge states:** daily cap reached, nothing found, official sites unavailable, empty first visit, distress reply with crisis text.
6. **Task screen:** with Ask gone from the aside, the left column scrolls on its own and the actions column stays put. Review side whitespace at 1440 and 390.

### 8.3 Removed in plan B's release

The old chat keeps working until the new UI ships, then goes in the same release:

- **API:** `features/chat/` (`daily-cap.ts` already moved in plan A), the chat prompt functions in `core/prompts/registry.ts`, the unused `generateText` and `buildResponseStructuringPrompt`, and the old chat tables.
- **Web:** `AskPanel`, `AiReply`, `lib/trace.ts` and the chat stream helper in `lib/api.ts`.
- **Tests:** their tests are removed with them.

## 9. Testing

### 9.1 Unit (Vitest, no model calls)

| Unit | What's tested |
|---|---|
| context | Database facts only. |
| understand | Fallback on error and timeout; keyword check turns distress on without Haiku. |
| retrieve | Fusion, floor, task boost and the second retrieval, against the seeded test database. |
| live | Only allowlisted hosts fetched; known URLs used before search; cache and 7-day stale fallback; top-3 passages only. |
| sentences | No half sentence released on early end or `max_tokens`; task IDs replaced even when split across stream chunks; `source` before the sentence citing it. |
| verify | Matched and unmatched citations; uncited factual sentences flagged. |
| remember | Sensitive categories skipped; skipped on retry, out-of-scope and distress; 50 limit. |
| daily cap | Counts only counting user rows since NZ midnight; Stop before and after text. |
| sweeper | Stale `streaming` rows become `interrupted`; old cache rows deleted. |

### 9.2 API (mocked models)

- The full pipeline with fake Haiku and Sonnet.
- SSE order: `start` first, `done` last, `memory_saved` before `done`.
- Cap at 20, including two requests at once from the same user.
- 409 while another answer streams.
- Cancel, retry and disconnect, with cap counting.
- Memory save, undo, edit and delete.
- Cascade on account delete.

### 9.3 Accuracy set (real models; on demand and before each release)

- **The set:** about 40 questions, each with its expected sources. It covers:
  - every settlement topic;
  - questions asked from task screens;
  - follow-ups that depend on earlier messages;
  - out-of-scope questions;
  - distress messages;
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
  - 100% correct out-of-scope declines;
  - crisis text present on every distress question.
- Failures logged in production become candidate questions.

### 9.4 End-to-end (Playwright)

- Ask from a task.
- The streamed answer shows sources and a task link.
- Edit and delete a memory in Settings.
- The cap message.
- axe at 1440 and 390.
- Remote runs use longer timeouts when `BASE_URL` is set.

### 9.5 Cost watch

Daily sum of `meta.cost`; warn when the average per answer exceeds 5¢.

## 10. Order of work

**Plan A: backend**

1. Schema and migration, including the raw SQL (§4.4); move `daily-cap.ts`.
2. Units in §3.1 with their tests.
3. Routes.
4. The accuracy set and runner; tune the relevance floor; measure the thinking setting (§3.2).
5. Staging: accuracy set run and speed check.

**Plan B: UI and release** (design can start while plan A is built)

1. UI design with impeccable, owner picks and approves a direction.
2. UI build against the finished API, then the impeccable gate and owner review.
3. Removal of the old chat (§8.3) in the same release.
4. Staging owner test.

Plan B starts with these backend tasks (owner decisions 2026-10-30, from the Plan A final review and Task 15):

1. Crisis text at turn start on the keyword check (§6.4).
2. Time limit on the steps before the answer: per-request embedding timeout (~10 s), a turn deadline under the 2-minute sweep, and `running.delete` only when the map still holds this turn's controller.
3. Distress plus out of scope as fixed copy (§6.4).
4. Late Haiku distress is not dropped (§6.4).
5. Distress test set grown from 3 to ~40 varied questions (indirect, understated, typos, mixed with a task, plus "frustrated but fine" negatives); report catches and false alarms on every run.
6. getready.govt.nz becomes "guide content only": no live reads of that host (it returns 403 to plain fetch); its guide chunks still answer and show their checked date.
7. 429 body carries `resetAt` (§4.2) for the UI.

**Release 2: monthly source refresh.** A scheduled job re-fetches every source page the guide cites, diffs it against the version the content was written from, and turns changes into a review item (the agent re-checks facts and updates content; the owner gets only judgement calls). It never rewrites content by itself. No bot-block workarounds: an honest User-Agent with a contact address, robots.txt respected, one fetch per page per run. For blocked hosts, ask the agency to allow the bot (getready.govt.nz: NEMA), then a real browser at human pace or Anthropic `web_fetch`; a page that still can't be read is marked "couldn't re-check" with its last checked date kept visible.

## 11. Implementation notes to verify

- SDK: `@anthropic-ai/sdk` 1.1.0 (installed) already supports `web_search_20260209`, `citations_delta` and `between_tools`; no upgrade needed. Confirm the streamed citation event shape against its types when writing `answer.ts`.
- Some official NZ sites block plain HTTP clients. Measure how often `live.ts` is blocked on the allowlist; if often, fall back to Anthropic `web_fetch_20260209` (with `max_content_tokens` ~4k) for those hosts.
- Web search pricing at implementation time.
- The relevance floor value: tune on the accuracy set, not by guess.
- Crisis numbers: verify against the official pages before storing.
