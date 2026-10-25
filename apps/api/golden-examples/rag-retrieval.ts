// golden-examples/rag-retrieval.ts
// RAG retrieval golden examples over the chunks synced from the content bundle.
// Run: npm test -- golden-examples/rag-retrieval
//
// These tests hit the real DB with real embeddings (`make kb-sync-live`) and
// call the OpenAI API to generate query embeddings.
//
// GOLDEN 1 — condition pre-filter + semantic search
// GOLDEN 2 — semantic precision (bond vs tenancy rights)
// GOLDEN 3 — suburb research query finds the suburb task
// GOLDEN 4 — out-of-scope query returns low-relevance chunks

import { describe, it, expect } from 'vitest';
import { retrieveChunks } from '../src/features/chat/rag/retrieval.js';

const profile = { visaType: 'AEWV', city: 'AUCKLAND', familySituation: 'COUPLE_CONSTRAINED', occupation: 'OTHER_PROFESSIONAL' };

// Mock embeddings carry no meaning, so semantic golden examples only run with AI_MODE=live
describe.skipIf(process.env.AI_MODE === 'mock')('RAG Retrieval Golden Examples', () => {
  it('GOLDEN 1: IRD query returns CHUNK_T08_general in top 3', async () => {
    const result = await retrieveChunks({ query: 'how do I get my IRD number', profile, taskContext: null });

    const keys = result.map(r => r.chunkKey);
    expect(keys.slice(0, 3)).toContain('CHUNK_T08_general');

    // Chunk shape: required fields present
    const irdChunk = result.find(r => r.chunkKey === 'CHUNK_T08_general')!;
    expect(irdChunk.content).toBeTruthy();
    expect(irdChunk.sourceUrl).toMatch(/ird\.govt\.nz/);
    expect(irdChunk.itemIds.length).toBeGreaterThan(0);
    expect(irdChunk.similarityScore).toBeGreaterThan(0.5);
  }, 30_000);

  it('GOLDEN 2: bond query returns CHUNK_T11 above CHUNK_T14', async () => {
    const result = await retrieveChunks({ query: 'how much is the bond for renting in NZ and how do I pay it', profile, taskContext: null });

    const keys = result.map(r => r.chunkKey);
    expect(keys).toContain('CHUNK_T11_general');

    // T11 should rank above T14 for a bond-specific question
    const t11Idx = keys.indexOf('CHUNK_T11_general');
    const t14Idx = keys.indexOf('CHUNK_T14_general');
    if (t14Idx !== -1) {
      expect(t11Idx).toBeLessThan(t14Idx);
    }
  }, 30_000);

  it('GOLDEN 3: Auckland suburb query returns CHUNK_T01_general', async () => {
    const result = await retrieveChunks({ query: 'which Auckland suburb should I live in as a skilled migrant', profile, taskContext: null });

    expect(result.map(r => r.chunkKey)).toContain('CHUNK_T01_general');
  }, 30_000);

  it('GOLDEN 4: out-of-scope medical question returns chunks with low similarity', async () => {
    const result = await retrieveChunks({ query: 'I have a headache and feel nauseous, what could be wrong with me', profile, taskContext: null });

    // Function still returns chunks (retrieval always runs per spec)
    expect(result.length).toBeGreaterThanOrEqual(3);
    expect(result.length).toBeLessThanOrEqual(5);

    // All chunks have low similarity — medical question doesn't match settlement content
    const highSimilarityChunks = result.filter(r => r.similarityScore > 0.5);
    expect(highSimilarityChunks.length).toBeLessThan(3);
  }, 30_000);
});
