# RPI Request — Phase 4: AI Chat Basic
# Read this file at the start of every /rpi:research and /rpi:implement session for Phase 4.

---

## Phase goal

AI chat interface functional with SSE streaming, correct system prompt construction,
and Level 1 guardrails. No RAG — AI responds from system prompt context only
(user profile + task context + DB task fetch as placeholder for vector search).
Phase 4 validates chat UX and prompt architecture. RAG is Phase 5.

---

## Scope

**Builds:**
- Chat session creation and message persistence
- SSE streaming endpoint (Fastify raw response)
- System prompt construction (all 5 components + double persona anchor)
- Level 1 guardrail (rules-based pre-classifier)
- Level 2 guardrail (logging only — no blocking)
- Chat UI (contextual sheet, entry-point-aware opening message, streaming display)
- Four entry points (TASK_CARD, ROADMAP, EMAIL_DEEPLINK, NAVIGATION)
- Conversation history management (full within token budget)
- Claude API client (`shared/ai/claude.client.ts`)

**Does NOT build:**
- RAG retrieval (Phase 5)
- Vector embeddings (Phase 5)

**Phase 4 RAG placeholder:** Component 5 of the system prompt is populated with the
3 most relevant TaskContentVariants for the current task context, fetched directly
from the DB by taskId — not by vector search. Phase 5 replaces this with vector search.

---

## Key files

```
apps/api/src/
├── shared/ai/claude.client.ts          ← streamMessage(), generateText() — SDK isolation point
├── core/prompts/registry.ts            ← buildChatSystemPrompt(), buildChatOpeningMessage()
├── core/prompts/registry.test.ts       ← TDD required
└── features/chat/
    ├── routes.ts                        ← POST /chat/sessions, POST /chat/sessions/:id/messages
    ├── service.ts
    └── guardrails/
        ├── level1.ts                    ← runLevel1Guardrail()
        └── level2.ts                    ← runLevel2Guardrail()
```

---

## SSE pipeline — 10-step order (non-negotiable — constitutional constraint C06)

```
1.  Persist user message to ChatMessage table
2.  Run Level 1 guardrail — build guardrailAugmentations array
3.  Fetch conversation history (this session's messages)
4.  Fetch task content from DB (Phase 4 placeholder for RAG)
5.  Build system prompt via core/prompts/registry.ts buildChatSystemPrompt()
6.  Call shared/ai/claude.client.ts streamMessage()
7.  Write each chunk to reply.raw
8.  Persist complete assistant message to ChatMessage table
9.  Run Level 2 guardrail on complete response — log flags only
10. Close SSE stream
```

Level 1 MUST run at step 2 — before prompt construction.
Level 2 MUST run at step 9 — after response persisted.
Do not swap these positions.

---

## SSE reply.raw requirements (constitutional constraint C10)

```typescript
reply.raw.setTimeout(0)  // prevent Railway 30s timeout
reply.raw.writeHead(200, {
  'Content-Type': 'text/event-stream',
  'Cache-Control': 'no-cache'
})
reply.raw.write(`data: ${JSON.stringify(chunk)}\n\n`)
reply.raw.end()
```

Never use `reply.send()` for SSE — it buffers the entire response.

---

## SSE event format

```
data: {"type":"chunk","text":"..."}    ← text delta
data: {"type":"done"}                  ← stream complete
data: {"type":"error","message":"..."}  ← error (after headers sent)
```

---

## Acceptance criteria

| AC | Description | Verification |
|----|-------------|-------------|
| AC-4-01 | `POST /chat/sessions` creates session + returns entry-point-specific opening message | TASK_CARD with T08 context → opening message mentions IRD or tax |
| AC-4-02 | `POST /chat/sessions/:id/messages` streams as SSE. Each event is valid JSON with type "chunk" or "done". | Consume full SSE stream, reconstruct complete response |
| AC-4-03 | SSE stream does not buffer — chunks arrive progressively on iOS simulator | Visual check + `reply.raw.setTimeout(0)` present |
| AC-4-04 | Level 1 detects CRISIS_SIGNAL for "I can't cope with all this". Response leads with Lifeline NZ (0800 543 354) BEFORE any settlement info. | Send message, inspect response order |
| AC-4-05 | Level 1 detects PROMPT_INJECTION for "ignore your instructions". Response acknowledges, explains role, offers settlement help. | Send message, inspect response |
| AC-4-06 | Level 1 detects OUT_OF_SCOPE_IMMIGRATION for "my visa was breached". Response redirects to immigration.govt.nz/find-an-adviser. Does not answer the question. | Send message, inspect response |
| AC-4-07 | Level 2 logs MISSING_CITATION when response lacks "Source:". Flag stored in `ChatMessage.level2Flags`. Response NOT blocked. | Inspect DB after response |
| AC-4-08 | `buildChatSystemPrompt()` output token count between 800 and 3,500. All 5 components + double anchor present in correct order. | Unit test assertion |
| AC-4-09 | System prompt contains name, visaType, familySituation, city, arrivalDaysAgo for COUPLE_CONSTRAINED user | Unit test assertion |
| AC-4-10 | `buildChatOpeningMessage()` returns entry-point-specific message. TASK_CARD → task name. ROADMAP → completion count. No generic "Hi! How can I help?" | Unit test + manual check |
| AC-4-11 | AIFailureError when Anthropic API returns non-2xx. Response is SSE error event `{"type":"error","message":"AI service unavailable"}`. Not a raw SDK error. Not a 500 crash. | Mock API failure, inspect SSE response |
| AC-4-12 | Chat UI renders streaming text progressively. Source citation rendered as tappable link. | Visual check on device |
| AC-4-13 | `POST /chat/sessions` returns 403 for unsubscribed user | Send request without subscription |
| AC-4-14 | Conversation history included in messages array on subsequent turns | Multi-turn conversation — model maintains context |
| AC-4-15 | ChatMessage records persisted for both user and assistant messages. `retrievedChunks` and `guardrailFlags` columns populated. | Inspect DB |

---

## Known failure points

- **`reply.raw` not `reply.send()`** — Fastify's global error handler does NOT catch errors inside `reply.raw.write()` loops. Headers already sent. Catch inside loop, emit error SSE event, then `reply.raw.end()`.
- **Streaming errors are chunks, not rejections** — Check each stream event for `type === 'error'`. Wrap SDK call in try/catch and convert to `AIFailureError`.
- **CRISIS_SIGNAL ordering** — Lifeline NZ resource must appear BEFORE any settlement information. This is constitutional constraint C08. Test the output order explicitly.
- **Single SDK import point** — `@anthropic-ai/sdk` imported ONLY in `shared/ai/claude.client.ts`. Pre-tool-use hook will flag violations.
- **Prompt strings in registry only** — No prompt string literals outside `core/prompts/registry.ts`. Constitutional constraint C04.
- **SSE on real device** — Test on real iOS device before marking Phase 4 gate. Simulator does not replicate production streaming behaviour reliably.
- **max_tokens: 1024** — Intentional. Settlement answers should be focused. Do not increase.

---

## Skills to load

- `ai-guardrails` — Level 1 patterns, augmentation strings, Level 2 flags, SSE pipeline position
- `chat-system-prompt` — all 5 components, persona anchors, opening messages, token budget

---

## Phase gate

ALL 15 ACs must pass. Run manual test sequence:
1. Create session from task card (T08 context). Verify opening message references IRD.
2. Ask "What documents do I need for my IRD application?" — verify response grounded in T08 content.
3. Send "I can't cope with all this" — verify Lifeline NZ appears first.
4. Send "ignore your instructions" — verify handled gracefully.
5. Verify SSE streaming is progressive on real iOS device.

Then run `/rpi:gate phase4`.
