# LandedNZ — Implementation State Tracker
*Read this FIRST on every session start. Updated after every AC.*

---

## Overall Progress

**Active Phase:** Phase 1 — Foundation
**Phases Complete:** 0 / 5

| Phase | Status | AC Passed | Gate |
|-------|--------|-----------|------|
| 1 — Foundation (~60h) | IN PROGRESS | 8 / 14 | — |
| 2 — Roadmap Engine (~100h) | BLOCKED | 0 / 15 | Requires Phase 1 PASS |
| 3 — Monetisation (~55h) | BLOCKED | 0 / 12 | Requires Phase 2 PASS |
| 4 — AI Chat Basic (~40h) | BLOCKED | 0 / 15 | Requires Phase 3 PASS |
| 5 — RAG + Launch (~60h) | BLOCKED | 0 / 13 | Requires Phase 4 PASS |

---

## Phase 1 — Foundation

**Status:** IN PROGRESS
**Research dir:** `rpi/phase1-foundation/research/`
**Plans dir:** `rpi/phase1-foundation/plans/`

| AC | Description | Status | Notes |
|----|-------------|--------|-------|
| AC-1-01 | pgvector available after docker compose up | PASS | Docker + pgvector working |
| AC-1-02 | prisma migrate dev clean, all tables exist | PASS | 11 tables + _prisma_migrations, Prisma client generated |
| AC-1-03 | GET /health → 200 { status: "ok", dbConnected: true } | PASS | Fastify scaffold + health route |
| AC-1-04 | GET /health → 503 when DB unreachable | PASS | Same handler, 503 on DB failure |
| AC-1-05 | supabase start — all services running | PASS | supabase init + start, all core services running |
| AC-1-06 | Google OAuth end-to-end on Expo Go | — | |
| AC-1-07 | Apple Sign-In configured in app.json | — | |
| AC-1-08 | POST /auth/verify valid JWT → 200 correct fields | PASS | ES256 JWKS verification, user upsert, isNewUser detection |
| AC-1-09 | POST /auth/verify invalid JWT → 401 | PASS | Same endpoint, error handling for invalid JWT/headers |
| AC-1-10 | App shell launches + bottom tabs on Expo Go | PASS | Expo project bootstrap, 3 placeholder screens + bottom tab nav |
| AC-1-11 | tsc --noEmit zero errors both workspaces | — | |
| AC-1-12 | packages/types imported by both apps | — | |
| AC-1-13 | .env.example complete, .env.local gitignored | — | |
| AC-1-14 | seed scaffold runs without error | — | |

**Phase 1 Gate:** PENDING

---

## Phase 2 — Roadmap Engine

**Status:** BLOCKED (Phase 1 not complete)

| AC | Description | Status | Notes |
|----|-------------|--------|-------|
| AC-2-01 | scoreTask() passes all 4 golden examples | — | |
| AC-2-02 | resolveBlockedTasks() — T08 blocked when T07 incomplete | — | |
| AC-2-03 | resolveBlockedTasks() — T08 unblocked after T07 complete | — | |
| AC-2-04 | filterApplicableTasks() excludes school tasks for non-family | — | |
| AC-2-05 | POST /onboarding/profile creates UserProfile + all RoadmapEntries | — | |
| AC-2-06 | GET /roadmap — correct topThree for golden1 scenario | — | |
| AC-2-07 | POST /roadmap/tasks/:taskId/complete → updated topThree | — | |
| AC-2-08 | Complete T07 → T08 appears in next topThree | — | |
| AC-2-09 | bulk-override → correct topThree | — | |
| AC-2-10 | PREMIUM task → 403 for unsubscribed user | — | |
| AC-2-11 | Daily recalculation job updates T16 score | — | |
| AC-2-12 | Roadmap reveal screen layout correct | — | |
| AC-2-13 | Task card all 7 states render without crash | — | |
| AC-2-14 | Task completion micro-animation works | — | |
| AC-2-15 | KB seed: Task count = 21, Variant count >= 42 | — | |

**Phase 2 Gate:** BLOCKED

---

## Phase 3 — Monetisation

**Status:** BLOCKED (Phase 2 not complete)

| AC | Description | Status | Notes |
|----|-------------|--------|-------|
| AC-3-01 | RevenueCat SDK initialises in dev build (iOS + Android) | — | |
| AC-3-02 | Monthly sandbox purchase → webhook → isActive: true within 10s | — | |
| AC-3-03 | Six-month sandbox → expiresAt ~6 months from purchase | — | |
| AC-3-04 | PREMIUM task → 403 PremiumGateResponse for unsubscribed | — | |
| AC-3-05 | PREMIUM task → 200 full detail for subscribed | — | |
| AC-3-06 | EXPIRATION → isActive: false. CANCELLATION → no change. | — | |
| AC-3-07 | Invalid HMAC → 401. DB not touched. | — | |
| AC-3-08 | Premium gate card renders inline (not modal) | — | |
| AC-3-09 | Upgrade path — task immediately accessible after purchase | — | |
| AC-3-10 | Defer path — email with task name in subject within 5 min | — | |
| AC-3-11 | Decline path — banner persists, roadmap navigable | — | |
| AC-3-12 | Account creation gate structural — User record required | — | |

**Phase 3 Gate:** BLOCKED

---

## Phase 4 — AI Chat Basic

**Status:** BLOCKED (Phase 3 not complete)

| AC | Description | Status | Notes |
|----|-------------|--------|-------|
| AC-4-01 | POST /chat/sessions → entry-point-specific opening message | — | |
| AC-4-02 | Messages endpoint streams valid SSE events | — | |
| AC-4-03 | SSE chunks arrive progressively — not buffered | — | |
| AC-4-04 | CRISIS_SIGNAL → Lifeline NZ leads response | — | |
| AC-4-05 | PROMPT_INJECTION → graceful response | — | |
| AC-4-06 | OUT_OF_SCOPE_IMMIGRATION → redirect to immigration.govt.nz | — | |
| AC-4-07 | MISSING_CITATION logged in level2Flags — not blocked | — | |
| AC-4-08 | buildChatSystemPrompt() 800–3,500 tokens, all 5 components | — | |
| AC-4-09 | System prompt has correct COUPLE_CONSTRAINED user fields | — | |
| AC-4-10 | buildChatOpeningMessage() entry-point-specific (no generic "Hi!") | — | |
| AC-4-11 | AIFailureError → SSE error event, not 500 crash | — | |
| AC-4-12 | Chat UI — streaming progressive, citation tappable | — | |
| AC-4-13 | POST /chat/sessions → 403 for unsubscribed | — | |
| AC-4-14 | Conversation history included on subsequent turns | — | |
| AC-4-15 | ChatMessage persisted both roles — retrievedChunks + guardrailFlags populated | — | |

**Phase 4 Gate:** BLOCKED

---

## Phase 5 — RAG + Launch

**Status:** BLOCKED (Phase 4 not complete)

| AC | Description | Status | Notes |
|----|-------------|--------|-------|
| AC-5-01 | generate-embeddings.ts — zero NULL embeddings after run | — | |
| AC-5-02 | ivfflat index created — EXPLAIN shows Index Scan | — | |
| AC-5-03 | retrieveChunks() returns constrained_couple chunk (not solo_aewv) | — | |
| AC-5-04 | retrieveChunks() returns 3–5 chunks for all 4 RAG golden examples | — | |
| AC-5-05 | Production IRD question → grounded in T08 chunk, cites ird.govt.nz | — | |
| AC-5-06 | ChatMessage.retrievedChunks has KnowledgeBaseChunk IDs (not task IDs) | — | |
| AC-5-07 | Production Railway → Supabase. GET /health dbConnected: true | — | |
| AC-5-08 | Apple Sign-In still present in production build | — | |
| AC-5-09 | iOS sandbox payment tested on real device — production RevenueCat | — | |
| AC-5-10 | App Store submission complete — app in TestFlight | — | |
| AC-5-11 | Play Store submission complete — APK passes review | — | |
| AC-5-12 | Full smoke test production: onboarding → roadmap → task → gate → upgrade → chat | — | |
| AC-5-13 | BigInt fix applied — pgvector query serialises without error | — | |

**Phase 5 Gate:** BLOCKED

---

## Golden Example Status

| Example | File | Last Run | Result |
|---------|------|----------|--------|
| Priority GOLDEN 1 | golden-examples/priority-scoring.ts | — | — |
| Priority GOLDEN 2 | golden-examples/priority-scoring.ts | — | — |
| Priority GOLDEN 3 | golden-examples/priority-scoring.ts | — | — |
| Priority GOLDEN 4 | golden-examples/priority-scoring.ts | — | — |
| RAG GOLDEN 1 | golden-examples/rag-retrieval.ts | — | — |
| RAG GOLDEN 2 | golden-examples/rag-retrieval.ts | — | — |
| RAG GOLDEN 3 | golden-examples/rag-retrieval.ts | — | — |
| RAG GOLDEN 4 | golden-examples/rag-retrieval.ts | — | — |

---

## Session Notes

*Most recent first. Add via /learn or manually during session.*

- [AC-1-10] Expo project bootstrap from scratch. bundleIdentifier com.landednz.app set from start per CLAUDE.md gotcha (painful to change later). Bottom tabs: Roadmap, Chat, Profile. TypeScript paths for @landednz/types removed (AC-1-12 will add).
- [AC-1-08/09] JWT verification via ES256 JWKS works correctly with `jose` library. User upsert with Prisma P2002 catch provides race-safe isNewUser detection. Both AC-1-08 (valid JWT) and AC-1-09 (invalid JWT) implemented in same handler.
- [AC-1-05] Supabase CLI v2.75.0 uses ES256 JWKS — no JWT_SECRET. AC-1-08 must use JWKS verification via `jose` library, not symmetric HS256 secret.
- [AC-1-03/04] Fastify v5 used (v4 had high severity CVE). BigInt replacer applied on $queryRaw SELECT 1 per C10. 503 returned directly (not via AppError) for infrastructure failures per C13.
- [AC-1-03/04] registerHealthRoutes is sync (not async) — route handler inside is async. Graceful shutdown via SIGTERM/SIGINT calls db.$disconnect() before exit.
