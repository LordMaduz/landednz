import { describe, expect, test } from 'vitest';
import { verify } from './verify.js';
import type { Passage } from './types.js';

const passage: Passage = {
  id: 'p1',
  title: 'IRD numbers',
  url: 'https://www.ird.govt.nz/managing-my-tax/ird-numbers',
  origin: 'official',
  content: 'You need an IRD number to start work.\nIt usually takes   8 to 10 working days.',
  similarity: 0.8,
  taskKey: null,
  checkedAt: '2026-10-29',
};

describe('verify', () => {
  test('a citation found in a passage (whitespace-normalised) gives no note', () => {
    const r = verify([{ text: 'It takes 8 to 10 working days.', citations: [{ passageIndex: 0, citedText: 'It usually takes 8 to 10\nworking days.' }] }], [passage]);
    expect(r).toEqual({ unmatchedCitations: 0, uncitedClaims: [], note: null });
  });

  test('a citation not in any passage adds a note naming the sentence and its host', () => {
    const r = verify([{ text: 'You can apply online.', citations: [{ passageIndex: 0, citedText: 'Apply at any post shop.' }] }], [passage]);
    expect(r.unmatchedCitations).toBe(1);
    expect(r.note).toEqual({ type: 'unverified', text: expect.stringContaining('You can apply online.') });
    expect(r.note).toEqual({ type: 'unverified', text: expect.stringContaining('www.ird.govt.nz') });
  });

  test('an uncited factual sentence is flagged and named in the note', () => {
    const r = verify([{ text: 'The fee is $50.', citations: [] }], [passage]);
    expect(r.uncitedClaims).toEqual(['The fee is $50.']);
    expect(r.note).toEqual({ type: 'unverified', text: expect.stringContaining('The fee is $50.') });
  });

  test('an uncited non-factual sentence is fine', () => {
    expect(verify([{ text: 'Welcome to NZ.', citations: [] }], [passage]).note).toBeNull();
  });

  test('the note names at most the first 60 characters and no host without passages', () => {
    const long = `You must ${'really '.repeat(20)}apply.`;
    const r = verify([{ text: long, citations: [] }], []);
    expect(r.note).toEqual({ type: 'unverified', text: expect.stringContaining(long.slice(0, 60)) });
    expect(r.note && r.note.type === 'unverified' && r.note.text).not.toContain(long.slice(0, 61));
    expect(r.note && r.note.type === 'unverified' && r.note.text).not.toContain('Check');
  });
});
