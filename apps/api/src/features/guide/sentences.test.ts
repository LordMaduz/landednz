import { describe, it, expect } from 'vitest';
import type { ReplyPart } from '@landednz/types';
import type { AnswerEvent } from '../../shared/ai/claude.client.js';
import type { Passage } from './types.js';
import { createSentenceGate } from './sentences.js';

const passage = (n: number): Passage => ({
  id: `CHUNK_${n}`,
  title: `Source ${n}`,
  url: `https://example.govt.nz/${n}`,
  origin: 'official',
  content: 'x',
  similarity: 0.9,
  taskKey: null,
  checkedAt: '2026-10-01',
});
const taskTitles = new Map([['T08', 'Get your IRD number']]);

const run = (events: AnswerEvent[], tail: 'end' | 'drop' = 'end') => {
  const parts: ReplyPart[] = [];
  const gate = createSentenceGate({ passages: [passage(0), passage(1)], taskTitles, emit: (p) => parts.push(p) });
  events.forEach((e) => gate.push(e));
  if (tail === 'drop') gate.dropTail();
  const released = gate.end();
  return { parts, released, gate };
};
const t = (text: string): AnswerEvent => ({ type: 'text', text });
const texts = (parts: ReplyPart[]) => parts.filter((p) => p.type === 'text').map((p) => (p as { text: string }).text);

describe('sentence gate', () => {
  const textParts = (parts: ReplyPart[]) => parts.filter((p) => p.type === 'text');

  it('marks numbered lines as steps', () => {
    const { parts } = run([t("Yes.\n1. Register for myIR. You don't need a number.\n2. Apply as a new arrival.\n")]);
    expect(textParts(parts)).toEqual([
      { type: 'text', text: 'Yes.', citations: [] },
      { type: 'text', text: 'Register for myIR.', citations: [], block: 'step', step: 1 },
      { type: 'text', text: "You don't need a number.", citations: [], block: 'step', step: 1 },
      { type: 'text', text: 'Apply as a new arrival.', citations: [], block: 'step', step: 2 },
    ]);
  });

  it('turns the limits heading into a block', () => {
    const { parts } = run([t("**What I can’t tell you**\nHow long it takes. Inland Revenue can, on 0800 227 774.\n")]);
    expect(textParts(parts)).toEqual([
      { type: 'text', text: 'How long it takes.', citations: [], block: 'limits' },
      { type: 'text', text: 'Inland Revenue can, on 0800 227 774.', citations: [], block: 'limits' },
    ]);
  });

  it('limits mode ends with the block', () => {
    const { parts } = run([t("What I can't tell you:\nYour own timing.\n"), { type: 'block_end' }, t('Next part. ')]);
    expect(textParts(parts).at(-1)).toEqual({ type: 'text', text: 'Next part.', citations: [] });
  });

  it('drops an unfinished tail', () => {
    expect(texts(run([t('Hello there. How are')], 'drop').parts)).toEqual(['Hello there.']);
  });

  it('swaps a task ID split across chunks for its title and queues a task_link', () => {
    const { parts } = run([t('Do T'), t('08 first. ')]);
    expect(texts(parts)).toEqual(['Do Get your IRD number first.']);
    expect(parts[1]).toEqual({ type: 'task_link', taskKey: 'T08', title: 'Get your IRD number' });
  });

  it('links a task once per reply', () => {
    const { parts } = run([t('See T08. Then T08 again. ')]);
    expect(parts.filter((p) => p.type === 'task_link')).toHaveLength(1);
  });

  it('removes unknown task IDs and chunk IDs', () => {
    const { parts } = run([t('Ask about T77 and CHUNK_abc now. ')]);
    expect(texts(parts)).toEqual(['Ask about and now.']);
    expect(JSON.stringify(parts)).not.toMatch(/\bT\d{2,3}\b|CHUNK_/);
  });

  it('splits after a bold list heading that ends ".**"', () => {
    expect(texts(run([t('1. **Book a test.** Allow plenty of time. ')]).parts)).toEqual(['Book a test.', 'Allow plenty of time.']);
  });

  it('does not split after abbreviations', () => {
    expect(texts(run([t('Bring e.g. this. Next.')]).parts)).toEqual(['Bring e.g. this.', 'Next.']);
  });

  it('splits list lines and holds an unfinished last line', () => {
    expect(texts(run([t('1. Apply online\n2. Wait')]).parts)).toEqual(['Apply online']);
    expect(texts(run([t('1. Apply online\n2. Wait.')]).parts)).toEqual(['Apply online', 'Wait.']);
  });

  it('emits a source before the cited sentence, once per passage', () => {
    const { parts, released } = run([
      t('First claim. '),
      { type: 'citation', documentIndex: 0, citedText: 'a' },
      { type: 'citation', documentIndex: 0, citedText: 'b' },
      t('Second claim.'),
      { type: 'block_end' },
      { type: 'citation', documentIndex: 0, citedText: 'c' },
      t('Third claim.'),
      { type: 'block_end' },
    ]);
    expect(parts.map((p) => p.type)).toEqual(['text', 'source', 'text', 'text']);
    expect(parts[1]).toMatchObject({ type: 'source', index: 1, title: 'Source 0', origin: 'official' });
    expect(parts[2]).toMatchObject({ text: 'Second claim.', citations: [1] });
    expect(parts[3]).toMatchObject({ text: 'Third claim.', citations: [1] });
    expect(released[1].citations).toHaveLength(2);
  });

  it('keeps the mock stream shape: citation lands on the second sentence', () => {
    const { parts } = run([
      t('This is a mock reply from LandedNZ. '),
      { type: 'citation', documentIndex: 0, citedText: 'q' },
      t('It has a second sentence.'),
      { type: 'block_end' },
    ]);
    expect(parts.map((p) => p.type)).toEqual(['text', 'source', 'text']);
    expect(parts[0]).toMatchObject({ citations: [] });
    expect(parts[2]).toMatchObject({ text: 'It has a second sentence.', citations: [1] });
  });

  it('joins a cited sentence split over blocks without a full stop', () => {
    const { parts } = run([
      t('To start work, '),
      { type: 'block_end' },
      { type: 'citation', documentIndex: 0, citedText: 'IRD' },
      t('you need an IRD number'),
      { type: 'block_end' },
      t('. It takes about 10 working days.'),
      { type: 'block_end' },
    ]);
    expect(parts.map((p) => p.type)).toEqual(['source', 'text', 'text']);
    expect(parts[1]).toMatchObject({ text: 'To start work, you need an IRD number.', citations: [1] });
    expect(parts[2]).toMatchObject({ text: 'It takes about 10 working days.', citations: [] });
  });

  it('attaches a citation that precedes the next block to the next sentence', () => {
    const { parts } = run([
      t('Done.'),
      { type: 'block_end' },
      { type: 'citation', documentIndex: 1, citedText: 'z' },
      t('Next one.'),
      { type: 'block_end' },
    ]);
    expect(parts.map((p) => p.type)).toEqual(['text', 'source', 'text']);
    expect(parts[0]).toMatchObject({ text: 'Done.', citations: [] });
    expect(parts[2]).toMatchObject({ text: 'Next one.', citations: [1] });
  });

  it('never releases a fragment without terminal punctuation', () => {
    const { parts, gate } = run([t('Half a thought'), { type: 'block_end' }]);
    expect(parts).toEqual([]);
    expect(gate.sentTextCount()).toBe(0);
  });

  it('releases a final sentence that ends in an excepted word at end()', () => {
    expect(texts(run([t('Bring ID, passport, etc.')]).parts)).toEqual(['Bring ID, passport, etc.']);
    expect(texts(run([t('Yes. So do I.')]).parts)).toEqual(['Yes.', 'So do I.']);
  });

  it('still holds a bare list marker at end()', () => {
    expect(texts(run([t('1. Apply online\n2.')]).parts)).toEqual(['Apply online']);
  });

  it('keeps pending citations across a whitespace-only segment', () => {
    const { parts } = run([
      t('Done. '),
      { type: 'block_end' },
      { type: 'citation', documentIndex: 0, citedText: 'q' },
      t('\n\nNext one.'),
    ]);
    expect(parts.map((p) => p.type)).toEqual(['text', 'source', 'text']);
    expect(parts[2]).toMatchObject({ text: 'Next one.', citations: [1] });
  });
});
