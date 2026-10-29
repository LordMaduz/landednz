import { describe, expect, test } from 'vitest';
import { nextNzMidnight, startOfNzDay } from './nz-day.js';

describe('nz-day', () => {
  test('summer (NZDT): day starts 11:00Z the previous UTC day, next midnight 24h on', () => {
    const now = new Date('2026-10-24T10:30:00Z');
    expect(startOfNzDay(now)).toEqual(new Date('2026-10-23T11:00:00Z'));
    expect(nextNzMidnight(now)).toEqual(new Date('2026-10-24T11:00:00Z'));
  });

  test('winter (NZST): day starts 12:00Z the previous UTC day', () => {
    expect(startOfNzDay(new Date('2026-06-15T05:00:00Z'))).toEqual(new Date('2026-06-14T12:00:00Z'));
  });
});
