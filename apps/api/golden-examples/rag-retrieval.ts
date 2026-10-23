// golden-examples/rag-retrieval.ts
// RAG retrieval golden examples — written before retrieval implementation (TDD).
// Run: npm test -- golden-examples/rag-retrieval
//
// These tests hit the real DB (43 chunks with real embeddings).
// They call the OpenAI API to generate query embeddings.
// Run after: AC-5-01 (embeddings loaded) + AC-5-02 (ivfflat index created)
//
// GOLDEN 1 — AC-5-03 verification: persona pre-filter + semantic search
// GOLDEN 2 — AC-5-04: semantic precision (bond vs tenancy rights)
// GOLDEN 3 — AC-5-04: null personaKey chunks pass pre-filter
// GOLDEN 4 — AC-5-04: out-of-scope query returns low-relevance chunks

import { describe, it, expect } from 'vitest';
import { retrieveChunks } from '../src/features/chat/rag/retrieval.js';

// Mock embeddings carry no meaning, so semantic golden examples only run with AI_MODE=live
describe.skipIf(process.env.AI_MODE === 'mock')('RAG Retrieval Golden Examples', () => {
  it('GOLDEN 1: constrained_couple IRD query returns CHUNK_T08_constrained_couple in top 3', async () => {
    const result = await retrieveChunks({
      query: 'how do I get my IRD number',
      personaKey: 'constrained_couple',
      visaType: 'AEWV',
      city: 'AUCKLAND',
      taskContext: null,
    });

    const keys = result.map(r => r.chunkKey);

    // Persona pre-filter: solo_aewv chunk must be excluded
    expect(keys).not.toContain('CHUNK_T08_solo_aewv');

    // Semantic precision: constrained_couple IRD chunk in top 3
    expect(keys.slice(0, 3)).toContain('CHUNK_T08_constrained_couple');

    // Chunk shape: required fields present
    const irdChunk = result.find(r => r.chunkKey === 'CHUNK_T08_constrained_couple')!;
    expect(irdChunk.content).toBeTruthy();
    expect(irdChunk.sourceUrl).toMatch(/ird\.govt\.nz/);
    expect(irdChunk.similarityScore).toBeGreaterThan(0.5);
  }, 30_000);

  it('GOLDEN 2: constrained_couple bond query returns CHUNK_T11 not CHUNK_T14', async () => {
    const result = await retrieveChunks({
      query: 'how much is the bond for renting in NZ and how do I pay it',
      personaKey: 'constrained_couple',
      visaType: 'AEWV',
      city: 'AUCKLAND',
      taskContext: null,
    });

    const keys = result.map(r => r.chunkKey);

    // Semantic precision: rental agreement + bond chunk (T11) over tenancy rights chunk (T14)
    expect(keys).toContain('CHUNK_T11_constrained_couple');

    // Persona pre-filter: solo_aewv excluded
    expect(keys).not.toContain('CHUNK_T11_solo_aewv');
    expect(keys).not.toContain('CHUNK_T14_solo_aewv');

    // T11 should rank above T14 for a bond-specific question
    const t11Idx = keys.indexOf('CHUNK_T11_constrained_couple');
    const t14Idx = keys.indexOf('CHUNK_T14_constrained_couple');
    if (t14Idx !== -1) {
      expect(t11Idx).toBeLessThan(t14Idx);
    }
  }, 30_000);

  it('GOLDEN 3: Auckland suburb query returns CHUNK_CONTEXT_suburbs (null personaKey) and CHUNK_T01', async () => {
    const result = await retrieveChunks({
      query: 'which Auckland suburb should I live in as a skilled migrant',
      personaKey: 'constrained_couple',
      visaType: 'AEWV',
      city: 'AUCKLAND',
      taskContext: null,
    });

    const keys = result.map(r => r.chunkKey);

    // Null personaKey chunk passes through pre-filter (C07)
    expect(keys).toContain('CHUNK_CONTEXT_suburbs');

    // Task-specific chunk for suburb research also present
    expect(keys).toContain('CHUNK_T01_constrained_couple');

    // Persona pre-filter: solo_aewv excluded
    expect(keys).not.toContain('CHUNK_T01_solo_aewv');
  }, 30_000);

  it('GOLDEN 4: out-of-scope medical question returns chunks with low similarity', async () => {
    const result = await retrieveChunks({
      query: 'I have a headache and feel nauseous, what could be wrong with me',
      personaKey: 'constrained_couple',
      visaType: 'AEWV',
      city: 'AUCKLAND',
      taskContext: null,
    });

    // Function still returns chunks (retrieval always runs per spec)
    expect(result.length).toBeGreaterThanOrEqual(3);
    expect(result.length).toBeLessThanOrEqual(5);

    // All chunks have low similarity — medical question doesn't match settlement content
    const highSimilarityChunks = result.filter(r => r.similarityScore > 0.5);
    expect(highSimilarityChunks.length).toBeLessThan(3);
  }, 30_000);
});
