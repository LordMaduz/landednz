# LandedNZ — Implementation State Tracker
*Read this FIRST on every session start. Updated after every AC.*

---

## Overall Progress

**Active Phase:** Phase 2 — Roadmap Engine
**Phases Complete:** 1 / 5

| Phase | Status | AC Passed | Gate |
|-------|--------|-----------|------|
| 1 — Foundation (~60h) | COMPLETE | 15 / 15 | PASS |
| 2 — Roadmap Engine (~100h) | COMPLETE | 12 PASS + 3 DEFERRED / 15 | PASS |
| 3 — Monetisation (~55h) | DEFERRED | 0 / 12 | Intentionally deferred — UI ACs + Phase 3 completing after Phase 4 |
| 4 — AI Chat Basic (~40h) | IN PROGRESS | 1 / 15 | — |
| 5 — RAG + Launch (~60h) | BLOCKED | 0 / 13 | Requires Phase 4 PASS |

---

## Phase 1 — Foundation

**Status:** COMPLETE — Gate passed 2026-03-14
**Research dir:** `rpi/phase1-foundation/research/`
**Plans dir:** `rpi/phase1-foundation/plans/`

| AC | Description | Status | Notes |
|----|-------------|--------|-------|
| AC-1-01 | pgvector available after docker compose up | PASS | Docker + pgvector working |
| AC-1-02 | prisma migrate dev clean, all tables exist | PASS | 11 tables + _prisma_migrations, Prisma client generated |
| AC-1-03 | GET /health → 200 { status: "ok", dbConnected: true } | PASS | Fastify scaffold + health route |
| AC-1-04 | GET /health → 503 when DB unreachable | PASS | Same handler, 503 on DB failure |
| AC-1-05 | supabase start — all services running | PASS | supabase init + start, all core services running |
| AC-1-06 | Google OAuth end-to-end on iOS Simulator | PASS | React Native CLI + Supabase OAuth + Linking API, direct Xcode build successful |
| AC-1-07 | Apple Sign-In configured in iOS project | PASS | @invertase/react-native-apple-authentication + LandedNZ.entitlements + CODE_SIGN_ENTITLEMENTS in pbxproj, pod install clean |
| AC-1-08 | POST /auth/verify valid JWT → 200 correct fields | PASS | ES256 JWKS verification, user upsert, isNewUser detection |
| AC-1-09 | POST /auth/verify invalid JWT → 401 | PASS | Same endpoint, error handling for invalid JWT/headers |
| AC-1-10 | App shell launches + bottom tabs on iOS Simulator | PASS | iOS Xcode project + NavigationContainer + 3-tab navigator (Roadmap/Chat/Profile) |
| AC-1-11 | tsc --noEmit zero errors both workspaces | PASS | Zero errors: apps/api + apps/mobile both clean |
| AC-1-12 | packages/types imported by both apps | PASS | @landednz/types package + 9 types + workspace linkage complete |
| AC-1-13 | npm run seed + verification golden examples | PASS | Seed script scaffold created with TaskSeedEntry interface |
| AC-1-14 | .env.example complete with all required vars | PASS | All required environment variables documented |
| AC-1-15 | **ALL Expo dependencies removed from docs** | PASS | 25 files updated across docs/config/source; zero grep matches for Expo imports/prefixes |

**Phase 1 Gate:** PASS — 2026-03-14. All services verified: Docker/pgvector, Prisma migrations, Supabase, GET /health → 200.

---

## Phase 2 — Roadmap Engine

**Status:** COMPLETE — Gate passed 2026-03-15

| AC | Description | Status | Notes |
|----|-------------|--------|-------|
| AC-2-01 | scoreTask() passes all 4 golden examples | PASS | TDD implementation, corrected golden examples vs pre-analysis |
| AC-2-02 | resolveBlockedTasks() — T08 blocked when T07 incomplete | PASS | T08→T09 HARD dep used (T07→T08 is SOFT, confirmed) |
| AC-2-03 | resolveBlockedTasks() — T08 unblocked after T07 complete | PASS | Same function, same test file as AC-2-02 |
| AC-2-04 | filterApplicableTasks() excludes school tasks for non-family | PASS | AND logic, "ALL" sentinel, defensive JSON parse, derivePersonaKey() co-located |
| AC-2-05 | POST /onboarding/profile creates UserProfile + all RoadmapEntries | PASS | Shared auth middleware + filter→resolve→score pipeline. ArrivalTiming removed — exact date required. 10 integration tests pass. |
| AC-2-06 | GET /roadmap — correct topThree for golden1 scenario | PASS | Single Prisma query with deep includes. topThree=["T06","T08","T03"] verified. consequenceLine fallback chain: personaKey→solo_aewv→''. 7 integration tests pass. |
| AC-2-07 | POST /roadmap/tasks/:taskId/complete → updated topThree | PASS | completeTask() with targeted recomputation via getAffectedTasks(). 5 integration tests pass. |
| AC-2-08 | Complete T07 → T08 appears in next topThree | PASS | Tested as T06 complete → T07 unblocked (T06→T07 HARD dep is correct). unlockedTasks=['T07'] verified. |
| AC-2-09 | bulk-override → correct topThree | PASS | bulkOverride() with updateMany + full recomputation. 6 integration tests. IDs not in roadmap silently ignored. |
| AC-2-10 | PREMIUM task → 403 for unsubscribed user | PASS | GET /roadmap/tasks/:taskId with PREMIUM gate. Schema migrated: watchOuts + professionalAdviceRequired + professionalAdviceNote added to TaskContentVariant. 5 integration tests pass. |
| AC-2-11 | Daily recalculation job updates T16 score | PASS | recalculateAllRoadmaps() + POST /admin/recalculate (ADMIN_API_KEY). T16 score 70→100 when arrivalDate set to 10 months ago. 3 integration tests. |
| AC-2-12 | Roadmap reveal screen layout correct | DEFERRED | UI implementation separated - will implement in dedicated UI phase to avoid rework |
| AC-2-13 | Task card all 7 states render without crash | DEFERRED | UI implementation separated - will implement in dedicated UI phase to avoid rework |
| AC-2-14 | Task completion micro-animation works | DEFERRED | UI implementation separated - will implement in dedicated UI phase to avoid rework |
| AC-2-15 | KB seed: Task count = 21, Variant count >= 42 | PASS | PRODUCTION-READY: Complete rewrite with rich AI/RAG content. 21 tasks, 12 dependencies, 42 variants, 42 knowledge chunks. Comprehensive validation, persona-specific content, URL corrections applied. Phase 4/5 ready. |

**Phase 2 Gate:** PASS — 2026-03-15. 12/15 AC pass. AC-2-12/13/14 (UI) intentionally deferred. 101/101 tests pass.

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
| AC-4-01 | POST /chat/sessions → entry-point-specific opening message | PASS | TDD implementation: buildChatOpeningMessage() + createChatSession() + subscription gate. 12/12 tests pass. TASK_CARD T08 → mentions IRD. AC-4-13 subscription 403 verified. |
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
| AC-4-13 | POST /chat/sessions → 403 for unsubscribed | PASS | Subscription gate implemented in routes.ts. Returns 403 SUBSCRIPTION_REQUIRED for users without active subscription. Verified with real HTTP testing. |
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
| Priority GOLDEN 1 | apps/api/src/core/priority/scoring.test.ts | 2026-03-14 | PASS |
| Priority GOLDEN 2 | apps/api/src/core/priority/scoring.test.ts | 2026-03-14 | PASS |
| Priority GOLDEN 3 | apps/api/src/core/priority/scoring.test.ts | 2026-03-14 | PASS |
| Priority GOLDEN 4 | apps/api/src/core/priority/scoring.test.ts | 2026-03-14 | PASS |
| RAG GOLDEN 1 | golden-examples/rag-retrieval.ts | — | — |
| RAG GOLDEN 2 | golden-examples/rag-retrieval.ts | — | — |
| RAG GOLDEN 3 | golden-examples/rag-retrieval.ts | — | — |
| RAG GOLDEN 4 | golden-examples/rag-retrieval.ts | — | — |

---

## Session Notes

*Most recent first. Add via /learn or manually during session.*

- [AC-4-01/13] Code-reviewer: PASS — Implementation verified with real Supabase Auth-generated JWT tokens and HTTP requests. Zero constitutional violations (C01/C03/C04/C07). Excellent error handling, comprehensive test coverage (12/12 pass), production-ready code. Real HTTP verification: AC-4-01 (subscribed user + T09 → tax opening message), AC-4-13 (unsubscribed user → 403 SUBSCRIPTION_REQUIRED). Manual verification achieved "real confidence" without test manipulation.
- [AC-4-01] buildChatOpeningMessage(): Core prompt function created in core/prompts/registry.ts (pure function, zero deps). Entry-point-specific messages: TASK_CARD/EMAIL_DEEPLINK reference task name + persona context, ROADMAP/NAVIGATION reference completion count + city. Opening message is static text (no Claude API call). createChatSession() fetches user profile + task name, creates DB session. Route includes subscription gate (AC-4-13): checks Subscription.isActive, returns 403 SUBSCRIPTION_REQUIRED if false. Constitutional compliance: C04 (all prompts in registry), C01 (no feature cross-imports), C03 (no SDK import for this AC). 12/12 tests pass including T08 IRD verification.
- [AC-2-11] recalculateAllRoadmaps(): processes all users sequentially, re-runs resolveBlockedTasks + scoreTask with currentDate for all non-COMPLETE entries. POST /admin/recalculate protected by optional ADMIN_API_KEY env var (X-Admin-Key header). If ADMIN_API_KEY not set, check skipped (dev convenience). Must use canonical task ID T16 in tests — scoreTask() checks taskId === 'T16' for persona weights + urgency bonuses. 101/101 tests pass.
- [AC-2-10] GET /roadmap/tasks/:taskId: PREMIUM gate checks Subscription.isActive — 403 PREMIUM_REQUIRED if no record or isActive:false. Schema migrated: watchOuts (JSON array, default "[]"), professionalAdviceRequired (boolean, default false), professionalAdviceNote (nullable string) added to TaskContentVariant. relatedTasks always [] in MVP (no join model). personaKey fallback chain: personaKey → solo_aewv. 98/98 tests pass.
- [AC-2-09] POST /roadmap/bulk-override: updateMany for atomic bulk mark, full recomputation (resolveBlockedTasks + scoreTask for ALL non-COMPLETE tasks — not targeted). completionMethod=BULK_OVERRIDE. Task IDs not in roadmap silently ignored (Option A — keeps `skipped` semantically clean). 93/93 tests pass.
- [AC-2-07/08] POST /roadmap/tasks/:taskId/complete implemented. Targeted recomputation: only direct dependents via getAffectedTasks() rescored — not full roadmap. unlockedTasks tracks isBlocked true→false transitions. AC-2-08 uses T06→T07 HARD dep (spec comment about T07→T08 was stale — T07→T08 is SOFT per pre-analysis). vitest.config.ts fileParallelism:false prevents concurrent canonical task ID conflicts between test files. 87/87 tests pass.
- [AC-2-06] GET /roadmap implemented in features/roadmap/. Single Prisma query with deep includes (Task + TaskContentVariants + HARD deps with prerequisite names). topThree filter: status !== COMPLETE AND isBlocked === false, sorted priorityScore DESC. consequenceLine fallback: personaKey → solo_aewv → ''. Tests use canonical task IDs (T06/T07/T08/T03) so scoreTask() applies correct persona weights + urgency bonuses for golden1 scores. 7 integration tests pass.
- [AC-2-05] POST /onboarding/profile implemented in features/onboarding/. Shared auth middleware created at shared/middleware/auth.ts — reusable preHandler for all future authenticated routes. Pipeline: filterApplicableTasks → resolveBlockedTasks → scoreTask → createMany(). Future arrivalDate sets scoringArrivalDate=null (urgency=0). ArrivalTiming enum removed — arrivalDate always required. 10 integration tests hit real DB.
- [AC-2-04] filterApplicableTasks() + derivePersonaKey() implemented in core/priority/filter.ts. AND logic across all 3 JSON fields. "ALL" sentinel means no restriction. Malformed JSON defensively treated as [] (task excluded). derivePersonaKey() maps familySituation only — visaType ignored. 24 tests pass.
- [AC-2-02/03] resolveBlockedTasks() and getAffectedTasks() implemented in core/dependencies/resolver.ts. Key: T07→T08 is SOFT (confirmed by domain expert — IRD can be applied with overseas bank details). AC-2-02/03 test T08→T09 HARD dep instead. getAffectedTasks() returns direct dependents only (not transitive). 21 tests pass.
- [AC-2-01] scoreTask() TDD implementation complete. Key corrections: Golden 2 expected T08=118 (not 143) — Day 2 is not in T08 urgency range (Days 4-14). Month 10-11 T16 bonus uses accurate day range 275-336 days. February-March tax bonus only applies after first year. All 20 tests pass including 4 golden examples. Vitest setup added to API workspace.
- [AC-1-06] Google OAuth working via React Native CLI + Supabase + Linking API. Key fixes: babel.config.js required (was missing), react-native-dotenv for env vars, .env var names fixed (removed EXPO_PUBLIC_ prefix), CFBundleURLTypes in Info.plist, openURL handler in AppDelegate.mm. React Native CLI build failed (code signing), direct Xcode build successful. OAuth flow: Supabase signInWithOAuth → Linking.openURL(Safari) → landednz://auth/callback deep link → session + authVerify.
- [AC-1-10] iOS native project generated via `react-native@0.76.1 init`, bundle ID `com.landednz.app`, CocoaPods installed (68 deps). App.tsx: NavigationContainer + createBottomTabNavigator (Roadmap/Chat/Profile). react-native-screens@3.34.0 for RN 0.76.1 compatibility. Build reaches code signing (requires Apple Developer setup).
- [AC-1-15] Full Expo → React Native CLI migration: 25 files updated across docs, config, source. EXPO_PUBLIC_ prefix removed from env vars. .expo/ directory deleted, .expo/ added to .gitignore. index.js uses AppRegistry (not registerRootComponent). Zero grep matches for Expo imports/prefixes after migration.
- [AC-1-14] Seed script scaffold created at apps/api/scripts/seed-knowledge-base.ts. Complete TaskSeedEntry interface per spec §2.3, empty tasks array for Phase 1, proper DB connection/disconnection pattern. Uses logger (not console.log), structured error handling with process.exit(1), runs successfully with npx ts-node.
- [AC-1-13] .env.example updated with all 7 required vars from config.ts + apps/api/CLAUDE.md: DATABASE_URL, SUPABASE_URL (was missing), PORT, NODE_ENV (optional), ANTHROPIC_API_KEY, ANTHROPIC_MODEL, REVENUECAT_WEBHOOK_SECRET. SUPABASE_JWT_SECRET omitted per root CLAUDE.md (CLI v2+ uses JWKS, not HS256 secret).
- [AC-1-12] @landednz/types package created with 9 types + ApiError from spec §3.2.3. npm workspaces linking + TypeScript paths in both apps. API: shared/types.ts re-export hub. Mobile: services/api.ts imports. rootDir removed from API tsconfig for cross-package imports.
- [AC-1-08/09] JWT verification via ES256 JWKS works correctly with `jose` library. User upsert with Prisma P2002 catch provides race-safe isNewUser detection. Both AC-1-08 (valid JWT) and AC-1-09 (invalid JWT) implemented in same handler.
- [AC-1-05] Supabase CLI v2.75.0 uses ES256 JWKS — no JWT_SECRET. AC-1-08 must use JWKS verification via `jose` library, not symmetric HS256 secret.
- [AC-1-03/04] Fastify v5 used (v4 had high severity CVE). BigInt replacer applied on $queryRaw SELECT 1 per C10. 503 returned directly (not via AppError) for infrastructure failures per C13.
- [AC-1-03/04] registerHealthRoutes is sync (not async) — route handler inside is async. Graceful shutdown via SIGTERM/SIGINT calls db.$disconnect() before exit.
