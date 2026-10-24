import { describe, it, expect, afterAll } from 'vitest';
import { db } from '../src/shared/db.js';
import { bootstrap } from './bootstrap.js';

// Runs against the local Supabase DB. The first run may embed; the second must change nothing.
describe('bootstrap', () => {
  afterAll(async () => {
    await db.$disconnect();
  });

  it('bootstrap is idempotent', async () => {
    await bootstrap();
    const chunksBefore = await db.knowledgeBaseChunk.count();

    const second = await bootstrap();

    expect(second.embedded).toBe(0);
    expect(second.deleted).toBe(0);
    expect(await db.knowledgeBaseChunk.count()).toBe(chunksBefore);
    const [{ count }] = await db.$queryRaw<Array<{ count: bigint }>>`
      SELECT count(*) FROM pg_indexes WHERE indexname = 'kb_chunk_embedding_ivfflat'
    `;
    expect(Number(count)).toBe(1);
  }, 600_000);
});
