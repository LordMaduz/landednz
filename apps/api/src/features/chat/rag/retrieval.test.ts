// A chunk left without an embedding (aborted sync) is never retrieved.
// Real DB; AI_MODE=mock. Restores every embedding afterwards for the rest of the suite.
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { db } from '../../../shared/db.js';
import { config } from '../../../shared/config.js';
import { loadContent } from '../../../content/index.js';
import { syncChunks } from '../../../../scripts/sync-chunks.js';
import { retrieveChunks } from './retrieval.js';

const profile = { visaType: 'AEWV', city: 'AUCKLAND', familySituation: 'SOLO', occupation: 'OTHER_PROFESSIONAL' };
const kept = 'CHUNK_T08_general';

// Restoring re-embeds every chunk, which under AI_MODE=live would mean paid API calls: skip it
describe.skipIf(config.aiMode === 'live')('retrieveChunks', () => {
  beforeAll(async () => {
    await loadContent();
    await syncChunks();
    // contentHash null too, so the restore re-embeds these rows
    await db.$executeRaw`
      UPDATE "KnowledgeBaseChunk" SET embedding = NULL, "contentHash" = NULL WHERE "chunkKey" <> ${kept}`;
  }, 60_000);

  afterAll(async () => {
    await syncChunks();
    await db.$disconnect();
  }, 60_000);

  it('skips chunks whose embedding is NULL', async () => {
    const result = await retrieveChunks({ query: 'how do I get my IRD number', profile, taskContext: null });
    expect(result.map((r) => r.chunkKey)).toEqual([kept]);
  });
});
