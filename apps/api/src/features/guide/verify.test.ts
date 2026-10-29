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
    expect(r.note).toEqual({ type: 'unverified', text: `I couldn't confirm "You can apply online" against an official source. Check ird.govt.nz.` });
  });

  test('a citation must match the passage it cites, not any passage', () => {
    const other = { ...passage, id: 'p2', content: 'Something else entirely.' };
    const cite = (passageIndex: number) => [{ text: 'It takes 8 days.', citations: [{ passageIndex, citedText: 'It usually takes 8 to 10 working days.' }] }];
    expect(verify(cite(1), [passage, other]).unmatchedCitations).toBe(1);
    expect(verify(cite(5), [passage, other]).unmatchedCitations).toBe(1);
    expect(verify(cite(0), [passage, other]).unmatchedCitations).toBe(0);
  });

  test('an uncited factual sentence is flagged and quoted in the note', () => {
    const r = verify([{ text: 'The fee is $50.', citations: [] }], [passage]);
    expect(r.uncitedClaims).toEqual(['The fee is $50.']);
    expect(r.note).toEqual({ type: 'unverified', text: `I couldn't confirm "The fee is $50" against an official source. Check ird.govt.nz.` });
  });

  test('a numbered list item is not a factual claim, but a numbered fact still is', () => {
    expect(verify([{ text: '1. Open a bank account.', citations: [] }], [passage]).note).toBeNull();
    const r = verify([{ text: '2. The fee is $50.', citations: [] }], [passage]);
    expect(r.note).toEqual({ type: 'unverified', text: expect.stringContaining('"The fee is $50"') });
  });

  test('an uncited non-factual sentence is fine', () => {
    expect(verify([{ text: 'Welcome to NZ.', citations: [] }], [passage]).note).toBeNull();
  });

  test('a long claim is cut at a word boundary with an ellipsis, and no host without passages', () => {
    const long = `You must ${'really '.repeat(20)}apply.`;
    const r = verify([{ text: long, citations: [] }], []);
    const text = r.note && r.note.type === 'unverified' ? r.note.text : '';
    const claim = /"(.*)"/.exec(text)?.[1] ?? '';
    expect(claim.endsWith('…')).toBe(true);
    expect(claim.length).toBeLessThanOrEqual(61);
    expect(claim.slice(0, -1)).toBe(long.slice(0, claim.length - 1));
    expect(claim.slice(0, -1).endsWith(' ')).toBe(false);
    expect(text).not.toContain('Check');
  });
});
