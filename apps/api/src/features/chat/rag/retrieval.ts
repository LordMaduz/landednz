// features/chat/rag/retrieval.ts
// RAG retrieval pipeline — condition pre-filter + semantic search + re-rank.
// Pipeline order is a constitutional constraint (C07, C12).
// Zero imports from features/roadmap/ (C01). Prisma use allowed in features/ (C02).

import { db } from '../../../shared/db.js';
import { generateEmbedding } from '../../../shared/ai/embeddings.client.js';
import { logger } from '../../../shared/logger.js';
import { buildChunks } from '../../../content/chunks.js';
import { currentBundle } from '../../../content/index.js';
import { matches } from '../../../content/matches.js';
import type { Profile } from '../../../content/types.js';

export interface RetrievalInput {
  query: string;
  profile: Profile;
  taskContext: string | null;  // task ID — drives step 5 (task context boost)
}

export interface RetrievedChunk {
  chunkKey: string;
  content: string;
  sourceUrl: string;
  sourceName: string;
  itemIds: string[];
  similarityScore: number;   // 0–1 cosine similarity
}

interface RawChunkRow {
  chunkKey: string;
  content: string;
  sourceUrl: string;
  sourceName: string;
  itemIds: string;
  similarity: number;
}

// Returns top 3–5 chunks after condition pre-filter + semantic search + re-rank.
// Pipeline (exact order — constitutional constraint C07):
//   1. Condition pre-filter (SQL WHERE — never post-search)
//   2. Generate query embedding
//   3. Semantic search within filtered set (cosine <=>, LIMIT 10)
//   4. Re-rank: similarity → condition-specific chunks above general ones
//   5. Task context boost if taskContext provided
//   6. Return 3–5 chunks
export async function retrieveChunks(input: RetrievalInput): Promise<RetrievedChunk[]> {
  // Step 1: the chunks whose `when` matches this profile, computed from the bundle the DB was synced from
  const keys = buildChunks(currentBundle())
    .filter((c) => c.when === null || matches(c.when, input.profile))
    .map((c) => c.chunkKey);

  // Step 2: Generate query embedding (1536-dim via OpenAI text-embedding-3-small)
  const queryEmbedding = await generateEmbedding(input.query);
  const vectorLiteral = `[${queryEmbedding.join(',')}]`;

  // Steps 1 + 3: condition pre-filter (C07 — SQL WHERE, not post-filter) + semantic search.
  // ORDER BY cosine distance ascending = most similar first.
  // C12: <=> is cosine distance — never <-> (L2 Euclidean).
  const rawRows = await db.$queryRaw<RawChunkRow[]>`
    SELECT
      "chunkKey",
      content,
      "sourceUrl",
      "sourceName",
      "itemIds",
      1 - (embedding <=> ${vectorLiteral}::vector) AS similarity
    FROM "KnowledgeBaseChunk"
    WHERE "chunkKey" = ANY(${keys})
    ORDER BY embedding <=> ${vectorLiteral}::vector
    LIMIT 10
  `;

  // C10: BigInt replacer on every $queryRaw result — non-negotiable.
  const rows: RawChunkRow[] = JSON.parse(
    JSON.stringify(rawRows, (_, v) => (typeof v === 'bigint' ? Number(v) : v)),
  );

  // Step 4: Re-rank top 10 candidates.
  // Primary: similarity (cosine, descending).
  // Secondary: a chunk written for the user's answers ranks above a general one when similarity is close.
  const general = (r: RawChunkRow) => (r.chunkKey.endsWith('_general') ? 1 : 0);
  const reranked = [...rows].sort((a, b) => {
    const simDiff = b.similarity - a.similarity;
    if (Math.abs(simDiff) >= 0.01) return simDiff;
    return general(a) - general(b);
  });

  // Step 5: Task context boost — if session entered via task card, ensure task chunk in results.
  // If the task's chunk is not already in top 5, replace lowest-ranked chunk with it.
  let results = reranked.slice(0, 5);
  if (input.taskContext) {
    const taskChunkKey = `CHUNK_${input.taskContext}_general`;
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
    itemIds: JSON.parse(r.itemIds) as string[],
    similarityScore: Number(r.similarity),
  }));
}
