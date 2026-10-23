import { describe, expect, test } from 'vitest';
import { mockEmbedding, mockStream } from './mock.js';

describe('mockEmbedding', () => {
  test('mockEmbedding returns 1536 unit-length numbers', () => {
    const vector = mockEmbedding('How do I get my IRD number?');
    expect(vector).toHaveLength(1536);
    expect(vector.every(n => Number.isFinite(n))).toBe(true);
    const norm = Math.sqrt(vector.reduce((sum, n) => sum + n * n, 0));
    expect(norm).toBeCloseTo(1, 10);
  });

  test('mockEmbedding is deterministic', () => {
    expect(mockEmbedding('bond refund')).toEqual(mockEmbedding('bond refund'));
    expect(mockEmbedding('bond refund')).not.toEqual(mockEmbedding('GP enrolment'));
  });
});

describe('mockStream', () => {
  test('mockStream emits the fixed reply across 3 chunks', async () => {
    const chunks: string[] = [];
    await mockStream([{ role: 'user', content: 'Hello' }], chunk => chunks.push(chunk));
    expect(chunks).toHaveLength(3);
    expect(chunks.join('')).toBe('This is a mock reply from LandedNZ.');
  });
});
