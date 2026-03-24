// generate-embeddings.ts
// Generates OpenAI text-embedding-3-small embeddings for all KnowledgeBaseChunk records.
// Run once before creating the ivfflat index (constitutional constraint C05).
//
// Usage: npx ts-node scripts/generate-embeddings.ts
//
// After this script completes with zero errors:
//   1. Verify: SELECT count(*) FROM "KnowledgeBaseChunk" WHERE embedding IS NULL → 0
//   2. THEN manually create the index:
//      CREATE INDEX ON "KnowledgeBaseChunk" USING ivfflat (embedding vector_cosine_ops);
//
// DO NOT add the CREATE INDEX command here — C05 violation.

import { db } from '../src/shared/db';
import { logger } from '../src/shared/logger';
import { generateEmbedding } from '../src/shared/ai/embeddings.client';

async function main(): Promise<void> {
  logger.info('Starting embedding generation for KnowledgeBaseChunk records');

  // Fetch all chunks without embeddings via raw query (embedding column is not in Prisma schema)
  const rawChunks = await db.$queryRaw<Array<{ id: string; chunkKey: string; content: string }>>`
    SELECT id, "chunkKey", content
    FROM "KnowledgeBaseChunk"
    WHERE embedding IS NULL
    ORDER BY "chunkKey"
  `;

  // C10: BigInt replacer on every $queryRaw result — non-negotiable.
  const chunks = JSON.parse(
    JSON.stringify(rawChunks, (_, v) => (typeof v === 'bigint' ? Number(v) : v)),
  ) as Array<{ id: string; chunkKey: string; content: string }>;

  const total = chunks.length;
  logger.info({ total }, 'Chunks requiring embeddings');

  if (total === 0) {
    logger.info('All chunks already have embeddings — nothing to do');
    return;
  }

  let processed = 0;
  let failed = 0;

  for (const chunk of chunks) {
    try {
      const embedding = await generateEmbedding(chunk.content);

      // Format as pgvector literal: [x1,x2,...,x1536]
      const vectorLiteral = `[${embedding.join(',')}]`;

      // Update via raw SQL — $queryRaw required for vector type (C16)
      await db.$queryRaw`
        UPDATE "KnowledgeBaseChunk"
        SET embedding = ${vectorLiteral}::vector
        WHERE id = ${chunk.id}
      `;

      processed++;
      logger.info(
        { chunkKey: chunk.chunkKey, processed, total },
        'Embedding generated and saved',
      );
    } catch (error) {
      failed++;
      logger.error(
        { chunkKey: chunk.chunkKey, error: error instanceof Error ? error.message : String(error) },
        'Failed to generate embedding for chunk',
      );
      // Continue processing remaining chunks — do not abort on single failure
    }
  }

  logger.info({ processed, failed, total }, 'Embedding generation complete');

  if (failed > 0) {
    logger.warn({ failed }, 'Some chunks failed — re-run script to retry failed chunks');
    process.exit(1);
  }
}

main()
  .catch((error) => {
    logger.error({ error: error instanceof Error ? error.message : String(error) }, 'Fatal error in generate-embeddings');
    process.exit(1);
  })
  .finally(() => {
    db.$disconnect();
  });
