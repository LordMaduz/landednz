import { describe, it, expect, afterAll } from 'vitest';
import { db } from '../src/shared/db.js';
import { bootstrap } from './bootstrap.js';

// Runs against the local Supabase DB. The first run may seed and embed; the second must change nothing.
describe('bootstrap', () => {
  afterAll(async () => {
    await db.$disconnect();
  });

  it('bootstrap is idempotent', async () => {
    await bootstrap();
    const tasksBefore = await db.task.count();
    const chunksBefore = await db.knowledgeBaseChunk.count();

    const second = await bootstrap();

    expect(second.tasksSeeded).toBe(0);
    expect(second.chunksEmbedded).toBe(0);
    expect(await db.task.count()).toBe(tasksBefore);
    expect(await db.knowledgeBaseChunk.count()).toBe(chunksBefore);
    const [{ count }] = await db.$queryRaw<Array<{ count: bigint }>>`
      SELECT count(*) FROM pg_indexes WHERE indexname = 'kb_chunk_embedding_ivfflat'
    `;
    expect(Number(count)).toBe(1);
  }, 600_000);
});
