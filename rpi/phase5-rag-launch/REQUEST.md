# RPI Request — Phase 5: RAG + Launch
# Read this file at the start of every /rpi:research and /rpi:implement session for Phase 5.

---

## Phase goal

Vector search replacing DB fetch in chat. Embeddings generated for all KB chunks.
App submitted to App Store and Play Store. Product fully functional and publicly available.

---

## Scope

**Builds:**
- Embedding generation script (`scripts/generate-embeddings.ts`)
- pgvector ivfflat index creation (manually, post-embedding)
- RAG retrieval pipeline (persona pre-filter → semantic search → re-rank)
- Replace Phase 4 DB fetch with RAG in chat pipeline
- System prompt Component 5 populated with retrieved chunks (not DB task fetch)
- App Store submission (iOS)
- Play Store submission (Android)
- Production environment setup (Railway + Supabase production)
- Environment variable migration (local → production)
- Smoke test production build

**Defers to v2:**
- AI personalisation layer for consequence lines
- Push notifications
- Hybrid cache delta sync
- Lapsed user flow

---

## Key files

```
apps/api/scripts/
└── generate-embeddings.ts           ← reads KnowledgeBaseChunk, generates embeddings, updates column

apps/api/src/features/chat/rag/
└── retrieval.ts                     ← retrieveChunks() — full RAG pipeline

golden-examples/
└── rag-retrieval.ts                 ← 4 golden examples — must pass before implementation
```

---

## RAG retrieval pipeline — exact order (constitutional constraint C11)

```
1. PERSONA PRE-FILTER (SQL WHERE clause — NOT post-search filter)
   WHERE (personaKey = input.personaKey OR personaKey IS NULL)

2. GENERATE QUERY EMBEDDING
   Anthropic text-embedding-3-small → 1536-dimension vector

3. SEMANTIC SEARCH (within filtered set)
   SELECT *, 1 - (embedding <=> query_embedding) as similarity
   ORDER BY embedding <=> query_embedding
   LIMIT 10

4. RE-RANK
   similarity (primary) + persona exactness (secondary) + contentVersion (tertiary)
   Select top 3–5

5. TASK CONTEXT BOOST
   If taskContext provided: ensure task-specific chunk in results

6. RETURN 3–5 chunks to buildChatSystemPrompt()
```

**Critical:** persona pre-filter runs as SQL WHERE clause — never as post-search filter.
Filtering after retrieval allows wrong-persona chunks into the system prompt.

---

## pgvector setup sequence (constitutional constraint C05)

```
1. Run generate-embeddings.ts — populates embedding column for all chunks
2. Verify: SELECT count(*) FROM "KnowledgeBaseChunk" WHERE embedding IS NULL → returns 0
3. THEN manually run: CREATE INDEX ON "KnowledgeBaseChunk" USING ivfflat (embedding vector_cosine_ops);
4. Verify index with: EXPLAIN SELECT on cosine similarity query → shows "Index Scan" not "Seq Scan"
```

Index creation MUST happen after all embeddings are loaded.
generate-embeddings.ts must NOT contain the CREATE INDEX command.

---

## RAG golden examples (write before implementing retrieval)

```
GOLDEN 1: constrained_couple asks "how do I get my IRD number"
Expected: CHUNK_T08_constrained_couple in top 3
NOT: CHUNK_T08_solo_aewv (wrong persona filtered out)

GOLDEN 2: constrained_couple asks about bond
Expected: CHUNK_T11_constrained_couple in results
NOT: CHUNK_T14_constrained_couple (tenancy rights — similar words, different task)

GOLDEN 3: general question about Auckland suburbs
Expected: CHUNK_CONTEXT_suburbs in results (null personaKey — passes pre-filter)
AND: CHUNK_T01_constrained_couple (suburb research task)

GOLDEN 4: out-of-scope medical question about symptoms
Expected: fewer than 3 relevant chunks (low similarity scores)
Level 1 guardrail fires before retrieval matters
```

Run: `npm test -- golden-examples/rag-retrieval.ts`
Write these tests BEFORE writing retrieval.ts.

---

## Acceptance criteria

| AC | Description | Verification |
|----|-------------|-------------|
| AC-5-01 | `generate-embeddings.ts` runs on all KnowledgeBaseChunk records without error | `SELECT count(*) FROM "KnowledgeBaseChunk" WHERE embedding IS NULL` = 0 |
| AC-5-02 | ivfflat index created manually after embeddings loaded | `EXPLAIN SELECT` on cosine similarity query shows "Index Scan" not "Seq Scan" |
| AC-5-03 | `retrieveChunks()` returns CHUNK_T08_constrained_couple (not solo_aewv) for constrained_couple user asking about IRD | Golden example 1 passes |
| AC-5-04 | `retrieveChunks()` returns 3–5 chunks for all 4 golden examples | No golden example returns 0 or 1 chunk |
| AC-5-05 | Chat response for "what documents do I need for my IRD application?" grounded in T08 chunk. Source cites ird.govt.nz. | Manual chat test in production |
| AC-5-06 | System prompt Component 5 populated with retrieved chunks (not DB task fetch). `ChatMessage.retrievedChunks` contains chunk IDs from KnowledgeBaseChunk. | Inspect DB column |
| AC-5-07 | Production environment on Railway connects to Supabase production DB. `GET /health` returns `dbConnected: true`. | Hit production endpoint |
| AC-5-08 | iOS app submission: no rejection for missing Apple Sign-In (configured Phase 1 — verify still present) | App Store Connect — no binary rejection |
| AC-5-09 | iOS sandbox payment tested on real device against production RevenueCat. Subscription status updates in production DB. | End-to-end payment on real device |
| AC-5-10 | App Store submission completes without binary rejection. App in TestFlight before public submission. | App Store Connect |
| AC-5-11 | Play Store submission completes. APK passes automated review checks. | Play Console |
| AC-5-12 | Smoke test production: full user journey end-to-end. Onboarding → roadmap → task card → premium gate → upgrade → chat. No errors in Railway logs. | Manual smoke test |
| AC-5-13 | Prisma BigInt fix applied before production. pgvector similarity query result serialises to JSON without error. | `JSON.stringify` with BigInt replacer on all `$queryRaw` results |

---

## Known failure points

- **ivfflat AFTER embeddings — always.** Index creation before embeddings = index on empty data = useless index. Run generate-embeddings.ts first, then create index manually.
- **Cosine operator `<=>` not `<->`** — `<->` is L2 (Euclidean). `<=>` is cosine. Wrong operator = wrong similarity. Pre-tool-use hook flags this.
- **BigInt on `$queryRaw`** — Prisma returns BigInt for integer columns in some versions. Apply replacer on ALL `$queryRaw` results: `JSON.stringify(result, (_, v) => typeof v === 'bigint' ? Number(v) : v)`.
- **Persona pre-filter as SQL** — Not post-search. If post-search, wrong-persona chunks contaminate the system prompt. Constitutional constraint C11.
- **Embedding dimensions** — text-embedding-3-small produces 1536 dimensions. Column must be `vector(1536)`. Mismatch = silent failure.
- **Apple Sign-In** — Must still be present in production build (configured Phase 1). Verify before submission. App Store guideline 4.8.
- **EAS Build free tier** — Upgrade to EAS Production plan at least one week before submission deadline. Free tier queues builds.
- **bundleIdentifier** — `com.landednz.app` must be registered in App Store Connect before `eas submit`. Do this in Week 15, not submission week.

---

## Launch checklist (beyond ACs — required before public release)

- [ ] All 21 KB tasks verified against live government sources (source URLs return 200)
- [ ] Level 2 guardrail logs reviewed — no systematic citation failures
- [ ] CLAUDE.md updated with any gotchas discovered during build
- [ ] Privacy policy live at landednz.app/privacy (required for App Store)
- [ ] Terms of service live at landednz.app/terms (required for App Store)
- [ ] RevenueCat production products configured (not sandbox)
- [ ] Resend production domain verified (not sandbox)
- [ ] Railway autoscaling limits set (prevent runaway costs)

---

## Skills to load

- `knowledge-base-schema` — chunk construction, RAG pipeline, pgvector specifics, golden examples
- `ai-guardrails` — Level 1 pipeline position relative to RAG
- `chat-system-prompt` — Component 5 structure, how retrieved chunks are injected

---

## Phase gate — Launch

ALL 13 ACs must pass. Complete launch checklist above.
Then run `/rpi:gate phase5`.
