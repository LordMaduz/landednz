// bootstrap.ts
// Brings a database to a ready state; idempotent, run once per environment and on first local start.
// Order: migrate deploy → sync content chunks (embeds changed ones) → ivfflat index (C05).
//
// Usage: npm run db:bootstrap

import { execFileSync } from 'child_process';
import path from 'path';
import { pathToFileURL } from 'url';
import { db } from '../src/shared/db.js';
import { logger } from '../src/shared/logger.js';
import { loadContent } from '../src/content/index.js';
import { syncChunks } from './sync-chunks.js';
import { createVectorIndex } from './create-vector-index.js';

export async function bootstrap(): Promise<{ embedded: number; deleted: number; unchanged: number; indexCreated: boolean }> {
  execFileSync('npx', ['prisma', 'migrate', 'deploy'], {
    cwd: path.join(import.meta.dirname, '..'),
    stdio: 'inherit',
  });

  await loadContent();
  const synced = await syncChunks();
  const indexCreated = await createVectorIndex();
  logger.info({ ...synced, indexCreated }, 'Database bootstrap complete');
  return { ...synced, indexCreated };
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
