import { describe, expect, test } from 'vitest';
import { matches } from './matches.js';
import type { Condition, Profile } from './types.js';

const p: Profile = { visaType: 'AEWV', city: 'AUCKLAND', familySituation: 'SOLO', occupation: 'OTHER_PROFESSIONAL' };

describe('matches', () => {
  test('undefined and all match', () => {
    expect(matches(undefined, p)).toBe(true);
    expect(matches('all', p)).toBe(true);
  });
  test('dimension values are any-of', () => {
    expect(matches({ city: ['AUCKLAND', 'WELLINGTON'] }, p)).toBe(true);
    expect(matches({ city: ['WELLINGTON'] }, p)).toBe(false);
  });
  test('keys are all-of', () => {
    expect(matches({ city: ['AUCKLAND'], family: ['FAMILY_WITH_CHILDREN'] }, p)).toBe(false);
    expect(matches({ city: ['AUCKLAND'], family: ['SOLO'], visa: ['AEWV'] }, p)).toBe(true);
  });
  test('any', () => {
    expect(matches({ any: [{ visa: ['STRAIGHT_TO_RESIDENCE'] }, { occupation: ['OTHER_PROFESSIONAL'] }] }, p)).toBe(true);
    expect(matches({ any: [{ visa: ['X'] }] }, p)).toBe(false);
  });
  test('not, nested', () => {
    expect(matches({ not: { city: ['AUCKLAND'] } }, p)).toBe(false);
    expect(matches({ not: { any: [{ city: ['WELLINGTON'] }, { visa: ['X'] }] } }, p)).toBe(true);
  });
  test('unknown key does not match', () => {
    expect(matches({ town: ['AUCKLAND'] } as Condition, p)).toBe(false);
  });
});
