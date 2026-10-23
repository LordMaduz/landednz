// create-vector-index.ts
// Creates the ivfflat index on KnowledgeBaseChunk.embedding — only once every chunk has an
// embedding (constitutional constraint C05). Safe to re-run.
//
// Usage: npm run db:bootstrap

import { pathToFileURL } from 'url';
import { db } from '../src/shared/db.js';
import { logger } from '../src/shared/logger.js';

const INDEX_NAME = 'kb_chunk_embedding_ivfflat';

// Returns true only when this call created the index.
export async function createVectorIndex(): Promise<boolean> {
  const [{ missing }] = await db.$queryRaw<Array<{ missing: bigint }>>`
    SELECT count(*) AS missing FROM "KnowledgeBaseChunk" WHERE embedding IS NULL
  `;
  if (Number(missing) > 0) {
    logger.warn({ missing: Number(missing) }, 'Chunks without embeddings — ivfflat index not created (C05)');
    return false;
  }

  const [{ existing }] = await db.$queryRaw<Array<{ existing: bigint }>>`
    SELECT count(*) AS existing FROM pg_indexes WHERE indexname = ${INDEX_NAME}
  `;
  if (Number(existing) > 0) return false;

  await db.$executeRawUnsafe(
    `CREATE INDEX IF NOT EXISTS ${INDEX_NAME} ON "KnowledgeBaseChunk" USING ivfflat (embedding vector_cosine_ops)`,
  );
  logger.info({ index: INDEX_NAME }, 'ivfflat index created');
  return true;
}

// Run only when executed directly, not when imported by bootstrap
if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  createVectorIndex()
    .catch((error) => {
      logger.error({ error: error instanceof Error ? error.message : String(error) }, 'Fatal error in create-vector-index');
      process.exitCode = 1;
    })
    .finally(() => db.$disconnect());
}
