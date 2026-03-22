# apps/api — LandedNZ Backend
# Stack: Node.js · Fastify · PostgreSQL/pgvector · Prisma · Supabase Auth · Claude API
# This file is loaded by Claude Code when working inside apps/api/.
# Keep under 160 lines. Add new gotchas via /learn during the build.

---

## Structure

```
apps/api/src/
├── features/          ← product features (roadmap, chat, onboarding, reminders, auth)
│   ├── roadmap/       ← Job A — engine, routes, types. NEVER imports from features/chat/
│   ├── chat/          ← Job B — RAG, guardrails, routes. NEVER imports from features/roadmap/
│   ├── onboarding/
│   ├── reminders/
│   └── auth/
├── core/              ← pure functions ONLY — zero Fastify, Prisma, SDK imports
│   ├── priority/      ← scoreTask(), filterApplicableTasks(), derivePersonaKey()
│   ├── dependencies/  ← resolveBlockedTasks(), getAffectedTasks()
│   └── prompts/       ← registry.ts — ALL prompt construction lives here
└── shared/            ← db client, errors, logger, config, claude.client.ts
```

**Two inviolable boundaries:**
1. `features/roadmap/` and `features/chat/` NEVER import from each other
2. `core/` NEVER imports Fastify, Prisma, or @anthropic-ai/sdk — pure functions only

---

## Key patterns

**Error handling:**
- Business logic failures → `AppError` with typed `ErrorCode`
- Claude API failures → `AIFailureError` — caught INSIDE chat service, never reaches global handler
- Global handler in `shared/plugins/error-handler.ts` — handles AppError only

**AI layer (call chain — always in this order):**
```
Service → core/prompts/registry.ts → shared/ai/claude.client.ts → catch AIFailureError
```
`@anthropic-ai/sdk` imported ONLY in `shared/ai/claude.client.ts`. Nowhere else.

**Prompt strings:** All prompt construction in `core/prompts/registry.ts`. Zero inline prompt strings in services or routes.

**SSE pipeline (10 steps — order is non-negotiable):**
1. Persist user message → 2. Level 1 guardrail → 3. Fetch history → 4. RAG retrieval →
5. Build system prompt → 6. streamMessage() → 7. Write chunks to reply.raw →
8. Persist assistant message → 9. Level 2 guardrail → 10. Close stream

---

## Known Gotchas

### Prisma

- **`prisma generate` must run after every schema change before TypeScript compilation.**
  Without it, TypeScript compiles against old types — no error, wrong runtime behaviour.
  Sequence: edit schema → `npx prisma migrate dev --name [desc]` → `npx prisma generate`

- **Always use `migrate dev`, never `db push`.**
  `db push` skips migration history. Required for production deployment.

- **pgvector column added via raw SQL in migration — not Prisma schema syntax.**
  `ALTER TABLE "KnowledgeBaseChunk" ADD COLUMN embedding vector(1536);`

### pgvector

- **ivfflat index MUST be created AFTER all embeddings are loaded — never before.**
  Sequence: run `generate-embeddings.ts` → verify `WHERE embedding IS NULL` = 0 →
  THEN manually run: `CREATE INDEX ON "KnowledgeBaseChunk" USING ivfflat (embedding vector_cosine_ops);`
  Never put this command inside `generate-embeddings.ts`.

- **Cosine operator is `<=>`, not `<->`.**
  `<->` is L2 (Euclidean). Always use `<=>` for cosine similarity.

- **Embedding dimensions must match column exactly.**
  text-embedding-3-small → 1536 dims. Column must be `vector(1536)`. Mismatch = silent failure.

- **`$queryRaw` returns BigInt — always apply replacer.**
  `JSON.stringify(result, (_, v) => typeof v === 'bigint' ? Number(v) : v)`

- **Persona pre-filter runs as SQL WHERE clause — never post-search.**
  Wrong order = wrong-persona chunks in system prompt.

### Fastify + SSE

- **SSE routes MUST use `reply.raw` — `reply.send()` buffers the entire response.**
  ```typescript
  reply.raw.setTimeout(0)  // prevent Railway 30s timeout
  reply.raw.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' })
  reply.raw.write(`data: ${JSON.stringify(chunk)}\n\n`)
  reply.raw.end()
  ```

- **Global error handler does NOT catch errors inside `reply.raw.write()` loops.**
  Headers already sent. Catch inside the loop → emit error SSE event → `reply.raw.end()`.

- **Always use async Fastify routes.**
  Non-async routes with unhandled promise rejections crash the process.

### Supabase Auth

- **Supabase CLI v2+ uses ES256 JWKS, not HS256 secret.**
  There is no `SUPABASE_JWT_SECRET` variable. JWT verification must use JWKS endpoint discovery
  with the `jose` library: `http://127.0.0.1:54321/auth/v1/.well-known/jwks.json`
  Do NOT use symmetric `jsonwebtoken.verify(token, secret)` — it will fail.

- **Local Supabase: `supabase start` — NOT docker-compose.**
  Supabase CLI manages its own containers. Do NOT add to `docker-compose.yml`.
  `docker-compose.yml` is for the application PostgreSQL only.

- **User upsert with Prisma P2002 handling provides race-safe isNewUser detection.**
  Catch unique constraint violation on email during user creation to determine if user is new.


### Claude API

- **Model string via env var — never hardcode.**

- **Streaming errors are chunks, not rejected promises.**
  Check each event: `if (event.type === 'error') { throw new AIFailureError(event.error); }`

- **SDK throws on non-2xx — wrap in try/catch → convert to AIFailureError.**

- **max_tokens: 1024 is intentional.** Do not increase.

### RevenueCat Webhook

- **HMAC verification BEFORE any DB operation — always.**
  Verify `X-RevenueCat-Signature` against `REVENUECAT_WEBHOOK_SECRET` first.
  Return 401 on failure. DB untouched.

- **EXPIRATION → isActive: false. CANCELLATION → no action.**
  Users retain access from cancellation until expiration. Wrong event = wrong revocation.

### Testing & Dependencies

- **Test DB has no seed data — create test-specific TaskContentVariants in tests.**
  Any test needing TaskContentVariants must create them in beforeAll using test-specific task IDs (e.g., TEST-P15).
  Never assume seeded tasks like T08/T09 exist in test DB — they only exist after AC-2-15 seed in dev/prod.

- **onRoute hooks added AFTER buildApp() never fire — routes already registered.**
  Mock auth via onRoute hooks is impossible because routes register immediately when `buildApp()` returns.
  Always use real Supabase auth: create user → get JWT → Authorization header. Broken pattern:
  ```typescript
  const app = buildApp(); app.addHook('onRoute', ...) // hook never fires
  ```

- **Error precedence in route guards: auth (401) → validation (400) → subscription (403) → business (404).**
  When testing edge cases like "no subscription + no profile", subscription gate (403) fires before profile check (404).
  Respect the middleware order when writing expected test outcomes.

- **Integration test cleanup with canonical task IDs requires comprehensive deletion.**
  Delete ALL TaskDependency records referencing canonical IDs (T06/T07/T08 etc.) as both prerequisiteId and dependentId.
  AC-2-15 seed data introduces real dependencies for all 21 tasks — narrow cleanup queries miss these.
  ```typescript
  await db.taskDependency.deleteMany({
    where: {
      OR: [
        { prerequisiteId: { in: ['T06', 'T07', 'T08'] } },
        { dependentId: { in: ['T06', 'T07', 'T08'] } }
      ]
    }
  });
  ```

- **vitest.config.ts fileParallelism:false required for canonical task ID tests.**
  Concurrent tests using the same canonical task IDs (T06/T07/T08) create conflicts.
  Set `fileParallelism: false` to run test files sequentially.

- **ADMIN_API_KEY env var pattern for admin endpoints.**
  Protect admin routes with optional ADMIN_API_KEY check via X-Admin-Key header.
  If env var not set, check is skipped (dev convenience). If set, header must match.

### Business Logic Patterns

- **Targeted recomputation pattern: completeTask() rescores only direct dependents.**
  Use getAffectedTasks() to identify tasks that need rescoring after completion.
  Never rescore the entire roadmap — only tasks whose blocking status changed.

- **consequenceLine fallback chain: personaKey → solo_aewv → empty string.**
  If no content for user's persona, try solo_aewv default. If still missing, use empty string.
  Never crash on missing consequence lines.

- **arrivalDate always required — no ArrivalTiming enum.**
  Phase 2 removed the ArrivalTiming approach. scoringArrivalDate field handles future arrivals (null = urgency 0).

### General TypeScript

- **No `any` without inline comment explaining why.**
- **`packages/types/` for anything crossing the mobile/api boundary.**
  Never redefine types that already exist in `packages/types/index.ts`.
