import { describe, expect, it } from 'vitest';
import { bestByDate } from './roadmap.build.js';

const nov2 = new Date('2026-11-02T00:00:00Z');

describe('bestByDate', () => {
  it('day window gives arrival + toDay − 1', () => expect(bestByDate([{ fromDay: 4, toDay: 14, by: 25 }], nov2)).toBe('2026-11-15'));
  it('several day windows take the earliest', () =>
    expect(bestByDate([{ fromDay: 4, toDay: 14, by: 25 }, { fromDay: 1, toDay: 10, by: 5 }], nov2)).toBe('2026-11-11'));
  it('no rule gives null', () => expect(bestByDate([], nov2)).toBeNull());
  it('a month rule gives null', () => expect(bestByDate([{ months: [2, 3], afterFirstYear: true, by: 25 }], nov2)).toBeNull());
  it('no arrival date gives null', () => expect(bestByDate([{ fromDay: 4, toDay: 14, by: 25 }], null)).toBeNull());
});
