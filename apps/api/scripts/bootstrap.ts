// bootstrap.ts
// Brings a database to a ready state; idempotent, run once per environment and on first local start.
// Order: migrate deploy → seed KB → embeddings for chunks without one → ivfflat index (C05).
//
// Usage: npm run db:bootstrap

import { execFileSync } from 'child_process';
import path from 'path';
import { pathToFileURL } from 'url';
import { db } from '../src/shared/db.js';
import { logger } from '../src/shared/logger.js';
import { seedKnowledgeBase } from './seed-knowledge-base.js';
import { generateEmbeddings } from './generate-embeddings.js';
import { createVectorIndex } from './create-vector-index.js';

export async function bootstrap(): Promise<{ tasksSeeded: number; chunksEmbedded: number; indexCreated: boolean }> {
  execFileSync('npx', ['prisma', 'migrate', 'deploy'], {
    cwd: path.join(import.meta.dirname, '..'),
    stdio: 'inherit',
  });

  // Seed upserts, so a re-run changes no row counts; report only newly created tasks.
  const tasksBefore = await db.task.count();
  await seedKnowledgeBase();
  const tasksSeeded = (await db.task.count()) - tasksBefore;

  const { processed: chunksEmbedded, failed } = await generateEmbeddings();
  if (failed > 0) {
    throw new Error(`${failed} chunks failed to embed — re-run db:bootstrap to retry`);
  }

  const indexCreated = await createVectorIndex();
  logger.info({ tasksSeeded, chunksEmbedded, indexCreated }, 'Database bootstrap complete');
  return { tasksSeeded, chunksEmbedded, indexCreated };
}

// Run only when executed directly, not when imported by tests
if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  bootstrap()
    .catch((error) => {
      logger.error({ error: error instanceof Error ? error.message : String(error) }, 'Database bootstrap failed');
      process.exitCode = 1;
    })
    .finally(() => db.$disconnect());
}
