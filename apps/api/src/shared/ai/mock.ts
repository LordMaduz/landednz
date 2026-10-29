// Deterministic AI for AI_MODE=mock — free, offline, repeatable tests and CI.
// Imports no SDK: claude.client.ts and embeddings.client.ts delegate here (C03 holds).

import { createHash } from 'crypto';
import type { z } from 'zod';
import type { AnswerEvent, AnswerResult, ChatMessage, GuideAnswerRequest } from './claude.client.js';

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

// Tests pick the structured fixture; the default throws so callers exercise their fallback path.
type StructuredFixture = (system: string, user: string) => unknown;
const throwingFixture: StructuredFixture = () => {
  throw new Error('No mock structured fixture set');
};
let structuredFixture = throwingFixture;

export function setMockStructured(fn: StructuredFixture | null): void {
  structuredFixture = fn ?? throwingFixture;
}

export async function mockStructured<T>(system: string, user: string, schema: z.ZodType<T>): Promise<T> {
  return schema.parse(structuredFixture(system, user));
}

// Tests can swap the answer stream (e.g. to throw AIFailureError); null restores the default.
type AnswerFixture = typeof defaultAnswerStream;
let answerFixture: AnswerFixture | null = null;

export function setMockAnswer(fn: AnswerFixture | null): void {
  answerFixture = fn;
}

export function mockAnswerStream(
  req: GuideAnswerRequest,
  onEvent: (e: AnswerEvent) => void,
  signal?: AbortSignal,
): Promise<AnswerResult> {
  return (answerFixture ?? defaultAnswerStream)(req, onEvent, signal);
}

async function defaultAnswerStream(
  req: GuideAnswerRequest,
  onEvent: (e: AnswerEvent) => void,
  signal?: AbortSignal,
): Promise<AnswerResult> {
  const usage = { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 };
  if (signal?.aborted) return { stopReason: 'aborted', usage };
  onEvent({ type: 'text', text: 'This is a mock reply from LandedNZ. ' });
  const firstDoc = req.documents[0];
  if (firstDoc) onEvent({ type: 'citation', documentIndex: 0, citedText: firstDoc.text.slice(0, 40) });
  onEvent({ type: 'text', text: 'It has a second sentence.' });
  onEvent({ type: 'block_end' });
  return { stopReason: 'end_turn', usage };
}

export async function mockSearchUrls(): Promise<string[]> {
  return [];
}
