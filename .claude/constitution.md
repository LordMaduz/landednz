# LandedNZ — Architectural Constitution
*Source: 12-build-specification.md + 09-ai-design.md*
*Non-negotiable. Any violation must be flagged and resolved before implementation proceeds.*
*Run by: constitutional-validator agent via /rpi:plan*

---

## INVIOLABLE BOUNDARIES

**[C01] Two AI Jobs Are Always Separate**
features/roadmap/ and features/chat/ NEVER import from each other.
Shared types go in packages/types/ only.
The AI never touches task sequencing, dependency resolution, or priority scoring.

**[C02] core/ Contains Only Pure Functions**
Zero Fastify, zero Prisma, zero Anthropic SDK in core/.
If a function needs a DB or API call → it belongs in features/, not core/.

**[C03] claude.client.ts Is the Only SDK Import Point**
No file other than shared/ai/claude.client.ts imports from @anthropic-ai/sdk.

**[C04] All Prompts in registry.ts**
No prompt string literals anywhere except core/prompts/registry.ts.

---

## ORDERING CONSTRAINTS

**[C05] ivfflat Index Created AFTER Embeddings Load**
CORRECT: load all embeddings → THEN run `CREATE INDEX USING ivfflat`.
VIOLATION: ivfflat created before embeddings loaded, or in generate-embeddings.ts.

**[C06] SSE Pipeline 10-Step Order Must Be Preserved**
Step 2 (Level 1 guardrail) BEFORE step 6 (streamMessage).
Step 9 (Level 2 guardrail) AFTER step 8 (persist response).
Any reordering = violation.

**[C07] RAG Persona Pre-Filter Runs in SQL Before Vector Search**
The persona pre-filter is a SQL WHERE clause — runs before semantic similarity.
Post-filtering retrieved chunks by persona AFTER vector search = violation.

**[C08] CRISIS_SIGNAL — Lifeline NZ FIRST**
When CRISIS_SIGNAL guardrail triggers, Lifeline NZ (0800 543 354) MUST appear
before any settlement information. No exceptions.

---

## DATA CONSTRAINTS

**[C09] HMAC Verification Before DB Touch**
POST /subscription/webhook MUST verify X-RevenueCat-Signature BEFORE any DB operation.

**[C10] BigInt Serialisation on All $queryRaw**
`JSON.stringify(result, (_, v) => typeof v === 'bigint' ? Number(v) : v)`
Required on every $queryRaw result. No exceptions.

**[C11] EXPIRATION vs CANCELLATION Events**
EXPIRATION webhook → isActive: false.
CANCELLATION webhook → no access change (user retains until expiration).

**[C12] Cosine Distance Operator**
Always <=> (cosine). Never <-> (L2/Euclidean) for semantic similarity.

---

## ARCHITECTURAL PATTERNS

**[C13] Error Type Hierarchy**
Expected failures: AppError with typed ErrorCode.
Claude API failures: AIFailureError — caught INSIDE chat service, never reaches global handler.
The roadmap NEVER fails due to an AI failure.

**[C14] SSE Uses reply.raw**
SSE responses MUST use reply.raw directly. reply.send() buffers — unacceptable.
reply.raw.setTimeout(0) required to prevent Railway 30s timeout.

**[C15] Prisma Migrations Only — Never db push**
Always `npx prisma migrate dev`. Never `npx prisma db push`.
db push skips migration history. Migration history required for production.

**[C16] pgvector Column via Raw SQL Migration**
`ALTER TABLE "KnowledgeBaseChunk" ADD COLUMN embedding vector(1536);`
Cannot be expressed in Prisma schema syntax. Always raw SQL in migration file.
