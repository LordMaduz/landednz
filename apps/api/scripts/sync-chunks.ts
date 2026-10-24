// sync-chunks.ts
// Brings KnowledgeBaseChunk in line with the loaded content bundle (spec §4.4): upsert by chunkKey,
// embed only chunks whose content or embedding mode changed, delete chunks no longer in the bundle.
// Run through db:bootstrap, which loads the content first.

import { Prisma } from '../src/generated/prisma/client.js';
import { db } from '../src/shared/db.js';
import { config } from '../src/shared/config.js';
import { logger } from '../src/shared/logger.js';
import { generateEmbedding } from '../src/shared/ai/embeddings.client.js';
import { buildChunks } from '../src/content/chunks.js';
import { currentBundle } from '../src/content/index.js';

export async function syncChunks(): Promise<{ embedded: number; deleted: number; unchanged: number }> {
  const bundle = currentBundle();
  const chunks = buildChunks(bundle);
  const existing = new Map(
    (await db.knowledgeBaseChunk.findMany({ select: { chunkKey: true, contentHash: true, embeddingMode: true } })).map((r) => [r.chunkKey, r]),
  );

  let embedded = 0;
  for (const c of chunks) {
    const first = bundle.sources[c.sourceIds[0]!]!;
    const data = {
      taskId: c.taskId,
      chunkType: 'TASK_CONTENT' as const,
      content: c.content,
      sourceUrl: first.url,
      sourceName: first.title,
      when: c.when ?? Prisma.DbNull,
      itemIds: JSON.stringify(c.itemIds),
      sourceIds: JSON.stringify(c.sourceIds),
    };
    await db.knowledgeBaseChunk.upsert({ where: { chunkKey: c.chunkKey }, create: { chunkKey: c.chunkKey, ...data }, update: data });

    const row = existing.get(c.chunkKey);
    if (row?.contentHash === c.contentHash && row.embeddingMode === config.aiMode) continue;
    // contentHash moves only with the embedding, so a failed embed is retried on the next sync
    const vector = `[${(await generateEmbedding(c.content)).join(',')}]`;
    await db.$executeRaw`
      UPDATE "KnowledgeBaseChunk"
      SET embedding = ${vector}::vector, "contentHash" = ${c.contentHash}, "embeddingMode" = ${config.aiMode}
      WHERE "chunkKey" = ${c.chunkKey}
    `;
    embedded++;
  }

  const { count: deleted } = await db.knowledgeBaseChunk.deleteMany({ where: { chunkKey: { notIn: chunks.map((c) => c.chunkKey) } } });
  await db.contentRelease.upsert({
    where: { version: bundle.version },
    create: { version: bundle.version, builtAt: new Date(bundle.builtAt) },
    update: {},
  });

  const result = { embedded, deleted, unchanged: chunks.length - embedded };
  logger.info({ version: bundle.version, ...result }, 'Content chunks synced');
  return result;
}
