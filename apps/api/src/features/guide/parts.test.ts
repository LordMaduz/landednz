import { describe, expect, test } from 'vitest';
import { endParts } from './parts.js';
import type { GuideContext, VerifyResult } from './types.js';

const ctx = { nextTasks: [{ taskKey: 'T08', title: 'Get your IRD number' }] } as GuideContext;
const clean: VerifyResult = { unmatchedCitations: 0, uncitedClaims: [], note: null };
const note = { type: 'unverified' as const, text: "I couldn't confirm the fee against an official source." };

describe('endParts', () => {
  test('max_tokens ends with a truncated notice and "Want the rest?"', () => {
    expect(endParts({ verify: clean, stopReason: 'max_tokens', ctx, answerText: 'Some text.' })).toEqual([
      { type: 'notice', kind: 'truncated' },
      { type: 'follow_up', text: 'Want the rest?' },
    ]);
  });

  test('a finished answer offers the next task', () => {
    expect(endParts({ verify: clean, stopReason: 'end_turn', ctx, answerText: 'Open a bank account.' })).toEqual([
      { type: 'follow_up', text: 'What\'s involved in "Get your IRD number"?' },
    ]);
  });

  test('no task follow-up when the answer already names the next task', () => {
    expect(endParts({ verify: clean, stopReason: 'end_turn', ctx, answerText: 'Next, Get your IRD number.' })).toEqual([]);
  });

  test('no task follow-up for an empty answer or with no next task', () => {
    expect(endParts({ verify: clean, stopReason: 'end_turn', ctx, answerText: '' })).toEqual([]);
    expect(endParts({ verify: clean, stopReason: 'end_turn', ctx: { nextTasks: [] } as unknown as GuideContext, answerText: 'Hi.' })).toEqual([]);
  });

  test('the unverified note comes first', () => {
    const parts = endParts({ verify: { ...clean, uncitedClaims: ['x'], note }, stopReason: 'max_tokens', ctx, answerText: 'x' });
    expect(parts[0]).toEqual(note);
    expect(parts).toHaveLength(3);
  });
});
