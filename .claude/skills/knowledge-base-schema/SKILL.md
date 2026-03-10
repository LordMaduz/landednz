# Skill: Knowledge Base Schema
# Domain knowledge for implementing KB seed data and RAG retrieval.
# Preloaded by: senior-software-engineer agent

---

## What this skill covers

Everything needed to seed the knowledge base (T01–T21), construct KB chunks,
and implement RAG retrieval in `features/chat/rag/retrieval.ts`.

---

## Files in scope

```
apps/api/scripts/
├── seed-knowledge-base.ts      ← T01–T21 task + content variant seed data
└── generate-embeddings.ts      ← Phase 5 — reads chunks, generates embeddings

apps/api/src/features/chat/rag/
└── retrieval.ts                ← retrieveChunks() — persona filter + semantic search

apps/api/prisma/schema.prisma   ← KnowledgeBaseChunk, Task, TaskContentVariant tables
```

---

## Canonical task list (T01–T21)

| ID | Task | Phase | Type |
|----|------|-------|------|
| T01 | Auckland suburb research | 1 (Pre-Arrival) | Free |
| T02 | Temporary accommodation booking | 1 (Pre-Arrival) | Free |
| T03 | Overseas bank account final prep | 1 (Pre-Arrival) | Free |
| T04 | Moving and transit insurance | 1 (Pre-Arrival) | Free |
| T05 | Home country tax — final year considerations | 1 (Pre-Arrival) | Premium |
| T06 | NZ SIM card | 2 (Arrival) | Free |
| T07 | Open NZ bank account in person | 2 (Arrival) | Free |
| T08 | IRD number application | 2 (Week 1) | Free |
| T09 | Tax code declaration (IR330) | 2 (Week 1) | Free |
| T10 | KiwiSaver election | 2 (Week 1) | Free |
| T11 | Rental agreement and bond | 2 (Week 1–4) | Free |
| T12 | Register with GP | 2 (Week 2–4) | Free |
| T13 | ACC overview | 2 (Week 1) | Free |
| T14 | NZ tenancy rights | 2 (Week 1–2) | Free |
| T15 | Set up international remittances | 3 (Month 1–2) | Premium |
| T16 | NZ driving licence conversion | 3 (Month 2–6) | Free |
| T17 | NZQA qualification assessment | 3 (Month 1–3) | Premium |
| T18 | Build NZ credit history | 3 (Month 3–6) | Premium |
| T19 | NZ CV and LinkedIn | 3 (Pre-Arrival / Month 1–2) | Premium |
| T20 | KiwiSaver first contribution confirmation | 3 (Month 2–3) | Free |
| T21 | Joint bank account | 3 (Month 2–4) | Free |

Task IDs are fixed. Do not renumber.

---

## Content variant structure (per task, per persona)

At MVP: exactly 2 persona variants per task — `constrained_couple` and `solo_aewv`.
`family_with_children` is defined but not required at MVP.

Each variant includes:
- `summary` — 2–3 dense sentences. Used as RAG chunk preamble.
- `whatAndWhy` — 150–300 words. NZ-specific system explanation for India/Sri Lanka/Singapore migrants.
- `howTo` — numbered steps. Step sequence matters.
- `keyFacts` — 5–10 bullets with number type tags inline.
- `numberTypes` — machine-readable table of all figures (Type A/B/C).
- `consequenceLine` — one sentence. Used in task card Layer 1.
- `steps` — same as howTo as ordered array (for task card).
- `documentsRequired` — persona-specific.
- `commonMistakes` — migrant-specific risk flags.
- `watchOuts` — differences from home country expectations.
- `cost` — null if free.
- `sourceUrl` + `sourceName` — required, never null.
- `relatedTasks` — cross-references.
- `professionalAdviceRequired` — boolean.
- `nextReviewTrigger` — plain English condition, not a date.

---

## Number type caveat rules (AI must apply these when presenting numbers)

| Type | Label | AI Presentation Rule |
|------|-------|---------------------|
| A | Statutory | State as confirmed fact with legislation citation. |
| B | Administrative | State with recency caveat — confirm at source before applying. |
| C | Market | State as guidance — fees vary, check with specific provider. |

---

## Chunk construction rules

Each `TaskContentVariant` becomes one `KnowledgeBaseChunk`.

Chunk content = concatenation in this order:
1. `summary`
2. `whatAndWhy`
3. `keyFacts` joined as bullet list
4. `howTo` joined as numbered list
5. `watchOuts` joined as bullet list

Chunk key format: `CHUNK_{taskId}_{personaKey}`
Example: `CHUNK_T08_constrained_couple`

---

## Source tier rules

| Tier | Examples | Usage |
|------|----------|-------|
| 1 — Primary Government | ird.govt.nz, tenancy.govt.nz, acc.co.nz, immigration.govt.nz, nzqa.govt.nz | Required for all task content variants |
| 2 — Government-Affiliated | sorted.org.nz, cab.org.nz, careers.govt.nz | Acceptable for context chunks |
| 3 — Commercial / Community | Market rate data | Only where Tier 1/2 unavailable |

`sourceUrl` must never be null. Seed blocked if empty.

---

## RAG retrieval pipeline (exact order)

```
1. PERSONA PRE-FILTER (SQL WHERE clause — not post-search)
   WHERE (personaKey = input.personaKey OR personaKey IS NULL)
   AND (chunk not excluded by profile)

2. GENERATE QUERY EMBEDDING
   Call Anthropic text-embedding-3-small on input.query
   Produces 1536-dimension vector

3. SEMANTIC SEARCH (within filtered set)
   SELECT *, 1 - (embedding <=> query_embedding) as similarity
   ORDER BY embedding <=> query_embedding
   LIMIT 10

4. RE-RANK
   Sort by: similarity (primary) + persona exactness (secondary) + contentVersion (tertiary)
   Select top 3–5

5. TASK CONTEXT BOOST
   If taskContext provided: ensure task-specific chunk is in results (boost if needed)

6. RETURN 3–5 chunks
```

Critical: persona pre-filter runs as SQL — never as post-search filter.

---

## pgvector specifics

- Column: `embedding vector(1536)` — added via raw SQL migration, NOT Prisma schema syntax
- Distance operator: `<=>` (cosine) — NEVER `<->` (L2/Euclidean)
- Index: `CREATE INDEX ON "KnowledgeBaseChunk" USING ivfflat (embedding vector_cosine_ops)`
  — created MANUALLY after all embeddings loaded — NEVER inside generate-embeddings.ts
- BigInt fix: all `$queryRaw` results must use:
  `JSON.stringify(result, (_, v) => typeof v === 'bigint' ? Number(v) : v)`

---

## RAG golden examples (Phase 5 — must pass)

```
GOLDEN 1: constrained_couple asks "how do I get my IRD number"
Expected: CHUNK_T08_constrained_couple in top 3
NOT: CHUNK_T08_solo_aewv (wrong persona)

GOLDEN 2: constrained_couple asks about bond
Expected: CHUNK_T11_constrained_couple in results
NOT: CHUNK_T14_constrained_couple (similar words, different task)

GOLDEN 3: general question about Auckland suburbs
Expected: CHUNK_CONTEXT_suburbs in results (null personaKey — no filter)
AND: CHUNK_T01_constrained_couple (suburb research task)

GOLDEN 4: out-of-scope medical question
Expected: fewer than 3 relevant chunks (low similarity scores)
Level 1 guardrail fires before retrieval matters
```

Run: `npm test -- golden-examples/rag-retrieval.ts`

---

## DB verification checks

After seeding:
- `SELECT count(*) FROM "Task"` → must equal 21
- `SELECT count(*) FROM "TaskContentVariant"` → must be ≥ 42
- After embeddings: `SELECT count(*) FROM "KnowledgeBaseChunk" WHERE embedding IS NULL` → must equal 0
