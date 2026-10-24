import { CITIES, FAMILY_SITUATIONS, OCCUPATIONS, VISA_TYPES } from '@landednz/types';
import { describe, expect, test } from 'vitest';
import { City, FamilySituation, Occupation, VisaType } from '../generated/prisma/enums.js';

// A registry change without a Prisma migration fails here. Sets, not order: display order is intentional.
describe('dimensions registry matches Prisma enums', () => {
  test.each([
    ['visa', VISA_TYPES, VisaType],
    ['city', CITIES, City],
    ['family', FAMILY_SITUATIONS, FamilySituation],
    ['occupation', OCCUPATIONS, Occupation],
  ] as const)('%s', (_n, registry, prismaEnum) => {
    expect(registry.map(([v]) => v).sort()).toEqual(Object.values(prismaEnum).sort());
  });
});
