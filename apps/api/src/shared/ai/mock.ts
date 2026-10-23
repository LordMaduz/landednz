// Deterministic AI for AI_MODE=mock — free, offline, repeatable tests and CI.
// Imports no SDK: claude.client.ts and embeddings.client.ts delegate here (C03 holds).

import { createHash } from 'crypto';
import type { ChatMessage } from './claude.client.js';

const MOCK_REPLY_CHUNKS = ['This is a mock ', 'reply from ', 'LandedNZ.'];
const EMBEDDING_DIMENSIONS = 1536;

export async function mockStream(_messages: ChatMessage[], onChunk: (text: string) => void): Promise<void> {
  for (const chunk of MOCK_REPLY_CHUNKS) onChunk(chunk);
}

// Unit-length vector seeded from a hash of the text: same text → same vector. Carries no meaning.
export function mockEmbedding(text: string): number[] {
  let seed = createHash('sha256').update(text).digest().readUInt32LE(0);
  const vector = Array.from({ length: EMBEDDING_DIMENSIONS }, () => {
    // mulberry32 PRNG step
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296 - 0.5;
  });
  const norm = Math.sqrt(vector.reduce((sum, n) => sum + n * n, 0));
  return vector.map(n => n / norm);
}
