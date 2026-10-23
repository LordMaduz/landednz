// features/chat/rag/retrieval.ts
// RAG retrieval pipeline — persona pre-filter + semantic search + re-rank.
// Pipeline order is a constitutional constraint (C07, C12).
// Zero imports from features/roadmap/ (C01). Prisma use allowed in features/ (C02).

import { db } from '../../../shared/db.js';
import { generateEmbedding } from '../../../shared/ai/embeddings.client.js';
import { logger } from '../../../shared/logger.js';

export interface RetrievalInput {
  query: string;
  personaKey: string;      // constrained_couple | solo_aewv | family_with_children
  visaType: string;
  city: string;
  taskContext: string | null;  // task ID — drives step 5 (task context boost)
}

export interface RetrievedChunk {
  chunkKey: string;
  content: string;
  sourceUrl: string;
  sourceName: string;
  similarityScore: number;   // 0–1 cosine similarity
}

interface RawChunkRow {
  chunkKey: string;
  content: string;
  sourceUrl: string;
  sourceName: string;
  personaKey: string | null;
  contentVersion: number;
  similarity: number;
}

// Returns top 3–5 chunks after persona pre-filter + semantic search + re-rank.
// Pipeline (exact order — constitutional constraint C07):
//   1. Persona pre-filter (SQL WHERE — never post-search)
//   2. Generate query embedding
//   3. Semantic search within filtered set (cosine <=>, LIMIT 10)
//   4. Re-rank: similarity → persona exactness → contentVersion
//   5. Task context boost if taskContext provided
//   6. Return 3–5 chunks
export async function retrieveChunks(input: RetrievalInput): Promise<RetrievedChunk[]> {
  // Step 2: Generate query embedding (1536-dim via OpenAI text-embedding-3-small)
  const queryEmbedding = await generateEmbedding(input.query);
  const vectorLiteral = `[${queryEmbedding.join(',')}]`;

  // Steps 1 + 3: Persona pre-filter (C07 — SQL WHERE, not post-filter) + semantic search.
  // WHERE clause: exact persona match OR null personaKey (general/context chunks pass through).
  // ORDER BY cosine distance ascending = most similar first.
  // C12: <=> is cosine distance — never <-> (L2 Euclidean).
  const rawRows = await db.$queryRaw<RawChunkRow[]>`
    SELECT
      "chunkKey",
      content,
      "sourceUrl",
      "sourceName",
      "personaKey",
      "contentVersion",
      1 - (embedding <=> ${vectorLiteral}::vector) AS similarity
    FROM "KnowledgeBaseChunk"
    WHERE ("personaKey" = ${input.personaKey} OR "personaKey" IS NULL)
    ORDER BY embedding <=> ${vectorLiteral}::vector
    LIMIT 10
  `;

  // C10: BigInt replacer on every $queryRaw result — non-negotiable.
  const rows: RawChunkRow[] = JSON.parse(
    JSON.stringify(rawRows, (_, v) => (typeof v === 'bigint' ? Number(v) : v)),
  );

  // Step 4: Re-rank top 10 candidates.
  // Primary: similarity (cosine, descending).
  // Secondary: persona exactness (exact match ranks above null personaKey when similarity is close).
  // Tertiary: contentVersion (higher = more recent content).
  const reranked = [...rows].sort((a, b) => {
    const simDiff = b.similarity - a.similarity;
    if (Math.abs(simDiff) >= 0.01) return simDiff;

    const aExact = a.personaKey === input.personaKey ? 1 : 0;
    const bExact = b.personaKey === input.personaKey ? 1 : 0;
    if (aExact !== bExact) return bExact - aExact;

    return (b.contentVersion ?? 1) - (a.contentVersion ?? 1);
  });

  // Step 5: Task context boost — if session entered via task card, ensure task chunk in results.
  // If the task's chunk is not already in top 5, replace lowest-ranked chunk with it.
  let results = reranked.slice(0, 5);
  if (input.taskContext) {
    const taskChunkKey = `CHUNK_${input.taskContext}_${input.personaKey}`;
    const hasTaskChunk = results.some(r => r.chunkKey === taskChunkKey);
    if (!hasTaskChunk) {
      const taskChunk = reranked.find(r => r.chunkKey === taskChunkKey);
      if (taskChunk) {
        // Inject task chunk at top, keep best 4 others
        results = [taskChunk, ...results.slice(0, 4)];
      }
    }
  }

  logger.info(
    {
      query: input.query.slice(0, 60),
      personaKey: input.personaKey,
      taskContext: input.taskContext,
      chunkCount: results.length,
      topChunk: results[0]?.chunkKey,
    },
    'RAG retrieval complete',
  );

  // Step 6: Return 3–5 chunks with required fields.
  return results.map(r => ({
    chunkKey: r.chunkKey,
    content: r.content,
    sourceUrl: r.sourceUrl,
    sourceName: r.sourceName,
    similarityScore: Number(r.similarity),
  }));
}
