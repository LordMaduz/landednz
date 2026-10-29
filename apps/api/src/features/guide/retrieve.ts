// Hybrid retrieval for the settlement guide: condition pre-filter, vector + keyword arms, RRF fusion.
import { db } from '../../shared/db.js';
import { config } from '../../shared/config.js';
import { generateEmbedding } from '../../shared/ai/embeddings.client.js';
import { buildChunks } from '../../content/chunks.js';
import { currentBundle } from '../../content/index.js';
import { matches } from '../../content/matches.js';
import type { Profile } from '../../content/types.js';
import type { Passage } from './types.js';

const RRF_K = 60;
const TASK_BOOST = 0.01;
const ARM_LIMIT = 20;

type Row = { chunkKey: string; taskId: string | null; content: string; sourceUrl: string; sourceName: string; updatedAt: string; similarity: number };

const toPassage = (r: Row): Passage => ({
  id: r.chunkKey,
  title: r.sourceName,
  url: r.sourceUrl,
  origin: 'guide',
  content: r.content,
  similarity: Number(r.similarity),
  taskKey: r.taskId,
  checkedAt: new Date(r.updatedAt).toISOString(),
});

// C10: BigInt replacer on every $queryRaw result
const clean = (rows: unknown): Row[] => JSON.parse(JSON.stringify(rows, (_, v) => (typeof v === 'bigint' ? Number(v) : v)));

function rrf(lists: Passage[][]): Map<string, { passage: Passage; score: number }> {
  const acc = new Map<string, { passage: Passage; score: number }>();
  for (const list of lists) {
    list.forEach((passage, rank) => {
      const add = 1 / (RRF_K + rank + 1);
      const cur = acc.get(passage.id);
      if (cur) {
        cur.score += add;
        cur.passage = { ...cur.passage, similarity: Math.max(cur.passage.similarity, passage.similarity) };
      } else acc.set(passage.id, { passage, score: add });
    });
  }
  return acc;
}

export function fusePassages(lists: Passage[][]): Passage[] {
  return [...rrf(lists).values()].sort((a, b) => b.score - a.score).map((x) => x.passage);
}

export async function retrieve(
  query: string,
  opts: { profile: Profile; taskKey: string | null; floor?: number },
): Promise<{ passages: Passage[]; candidates: Passage[] }> {
  const floor = opts.floor ?? config.guideRelevanceFloor;
  // C07: condition pre-filter, applied in SQL via the key list
  const keys = buildChunks(currentBundle())
    .filter((c) => c.when === null || matches(c.when, opts.profile))
    .map((c) => c.chunkKey);

  const vec = `[${(await generateEmbedding(query)).join(',')}]`;
  // C12: <=> cosine distance, never <->. Both arms select cosine similarity.
  const [vecRows, kwRows] = await Promise.all([
    db.$queryRaw`
      SELECT "chunkKey", "taskId", content, "sourceUrl", "sourceName", "updatedAt",
        1 - (embedding <=> ${vec}::vector) AS similarity
      FROM "KnowledgeBaseChunk"
      WHERE "chunkKey" = ANY(${keys}) AND embedding IS NOT NULL
      ORDER BY embedding <=> ${vec}::vector
      LIMIT ${ARM_LIMIT}`,
    db.$queryRaw`
      SELECT "chunkKey", "taskId", content, "sourceUrl", "sourceName", "updatedAt",
        COALESCE(1 - (embedding <=> ${vec}::vector), 0) AS similarity
      FROM "KnowledgeBaseChunk"
      WHERE "chunkKey" = ANY(${keys}) AND "searchText" @@ plainto_tsquery('english', ${query})
      ORDER BY ts_rank("searchText", plainto_tsquery('english', ${query})) DESC
      LIMIT ${ARM_LIMIT}`,
  ]);

  const fused = [...rrf([clean(vecRows).map(toPassage), clean(kwRows).map(toPassage)]).values()]
    .map((x) => ({ ...x, score: x.score + (opts.taskKey && x.passage.taskKey === opts.taskKey ? TASK_BOOST : 0) }))
    .sort((a, b) => b.score - a.score)
    .map((x) => x.passage);

  return {
    passages: fused.filter((x) => x.similarity >= floor).slice(0, 6),
    candidates: fused.slice(0, 10),
  };
}
