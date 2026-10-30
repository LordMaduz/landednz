import { describe, expect, test } from 'vitest';
import { mockAnswerStream, mockEmbedding, mockSearchUrls } from './mock.js';
import type { AnswerEvent } from './claude.client.js';

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

describe('mockAnswerStream', () => {
  const request = (documents: { title: string; text: string }[]) => ({
    system: 'sys',
    history: [],
    aboutUser: 'About me',
    documents,
    question: 'How do I get an IRD number?',
  });

  test('mockAnswerStream emits the reply with a citation to document 0 before the first block_end', async () => {
    const events: AnswerEvent[] = [];
    const doc = { title: 'IRD', text: 'Apply for an IRD number online through myIR once you have a visa.' };
    const result = await mockAnswerStream(request([doc]), e => events.push(e));
    const text = events.flatMap(e => (e.type === 'text' ? [e.text] : [])).join('');
    // Steps, a task ID and the limits heading so the gate and the UI see every answer shape (spec §9.4)
    expect(text).toBe(
      "This is a mock reply from LandedNZ. It has a second sentence.\n1. Register for myIR first.\n2. Then T08 gets easier.\n**What I can't tell you**\nHow long your own application takes.\n",
    );
    const citations = events.filter(e => e.type === 'citation');
    expect(citations).toEqual([{ type: 'citation', documentIndex: 0, citedText: doc.text.slice(0, 40) }]);
    expect(events.findIndex(e => e.type === 'citation')).toBeLessThan(events.findIndex(e => e.type === 'block_end'));
    expect(result.stopReason).toBe('end_turn');
  });

  test('mockAnswerStream emits no citation when there are no documents', async () => {
    const events: AnswerEvent[] = [];
    await mockAnswerStream(request([]), e => events.push(e));
    expect(events.some(e => e.type === 'citation')).toBe(false);
  });
});

describe('mockSearchUrls', () => {
  test('mockSearchUrls returns no URLs', async () => {
    expect(await mockSearchUrls()).toEqual([]);
  });
});
