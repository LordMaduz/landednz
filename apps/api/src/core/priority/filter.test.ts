// Test file for filterApplicableTasks() and derivePersonaKey() — written first in TDD approach
// All tests will fail initially — implementation comes after

import { describe, expect, test } from 'vitest';
import { filterApplicableTasks, derivePersonaKey } from './filter';
import { FamilySituation, PersonaKey } from '@landednz/types';

// ─── Helpers ────────────────────────────────────────────────────────────────

function makeTask(overrides: {
  id?: string;
  applicableVisaTypes?: string;
  applicableFamilySituations?: string;
  applicableOccupations?: string;
}) {
  return {
    id: overrides.id ?? 'T01',
    applicableVisaTypes: overrides.applicableVisaTypes ?? '["ALL"]',
    applicableFamilySituations: overrides.applicableFamilySituations ?? '["ALL"]',
    applicableOccupations: overrides.applicableOccupations ?? '["ALL"]',
  };
}

const soloProfile = {
  visaType: 'AEWV' as const,
  familySituation: 'SOLO' as const,
  occupation: 'TECHNOLOGY' as const,
};

const familyProfile = {
  visaType: 'AEWV' as const,
  familySituation: 'FAMILY_WITH_CHILDREN' as const,
  occupation: 'TECHNOLOGY' as const,
};

const constrainedCoupleProfile = {
  visaType: 'PARTNER_OF_STUDENT' as const,
  familySituation: 'COUPLE_CONSTRAINED' as const,
  occupation: 'FINANCE' as const,
};

const dualWorkCoupleProfile = {
  visaType: 'AEWV' as const,
  familySituation: 'COUPLE_DUAL_WORK' as const,
  occupation: 'HEALTHCARE' as const,
};

// ─── filterApplicableTasks() ────────────────────────────────────────────────

describe('filterApplicableTasks()', () => {

  describe('["ALL"] sentinel — no restriction', () => {
    test('task with ["ALL"] on all fields → included for any profile', () => {
      const task = makeTask({});
      const result = filterApplicableTasks({ tasks: [task], profile: soloProfile });
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('T01');
    });

    test('["ALL"] on all fields → included for family profile too', () => {
      const task = makeTask({});
      const result = filterApplicableTasks({ tasks: [task], profile: familyProfile });
      expect(result).toHaveLength(1);
    });

    test('empty task list → returns []', () => {
      const result = filterApplicableTasks({ tasks: [], profile: soloProfile });
      expect(result).toHaveLength(0);
    });
  });

  describe('visaType restriction', () => {
    test('task restricted to AEWV → included for AEWV profile', () => {
      const task = makeTask({ applicableVisaTypes: '["AEWV"]' });
      const result = filterApplicableTasks({ tasks: [task], profile: soloProfile }); // AEWV
      expect(result).toHaveLength(1);
    });

    test('task restricted to AEWV → excluded for PARTNER_OF_STUDENT profile', () => {
      const task = makeTask({ applicableVisaTypes: '["AEWV"]' });
      const result = filterApplicableTasks({ tasks: [task], profile: constrainedCoupleProfile }); // PARTNER_OF_STUDENT
      expect(result).toHaveLength(0);
    });

    test('task restricted to multiple visa types → included if profile matches any', () => {
      const task = makeTask({ applicableVisaTypes: '["AEWV","PARTNER_OF_STUDENT"]' });
      const result = filterApplicableTasks({ tasks: [task], profile: constrainedCoupleProfile }); // PARTNER_OF_STUDENT
      expect(result).toHaveLength(1);
    });
  });

  describe('familySituation restriction', () => {
    test('task restricted to FAMILY_WITH_CHILDREN → included for family profile', () => {
      const task = makeTask({ applicableFamilySituations: '["FAMILY_WITH_CHILDREN"]' });
      const result = filterApplicableTasks({ tasks: [task], profile: familyProfile });
      expect(result).toHaveLength(1);
    });

    // ── AC-2-04 core scenarios ──────────────────────────────────────────────

    test('AC-2-04: FAMILY_WITH_CHILDREN restriction → excluded for SOLO', () => {
      const task = makeTask({ id: 'T01', applicableFamilySituations: '["FAMILY_WITH_CHILDREN"]' });
      const result = filterApplicableTasks({ tasks: [task], profile: soloProfile });
      expect(result).toHaveLength(0);
    });

    test('AC-2-04: FAMILY_WITH_CHILDREN restriction → excluded for COUPLE_CONSTRAINED', () => {
      const task = makeTask({ id: 'T01', applicableFamilySituations: '["FAMILY_WITH_CHILDREN"]' });
      const result = filterApplicableTasks({ tasks: [task], profile: constrainedCoupleProfile });
      expect(result).toHaveLength(0);
    });

    test('AC-2-04: FAMILY_WITH_CHILDREN restriction → excluded for COUPLE_DUAL_WORK', () => {
      const task = makeTask({ id: 'T01', applicableFamilySituations: '["FAMILY_WITH_CHILDREN"]' });
      const result = filterApplicableTasks({ tasks: [task], profile: dualWorkCoupleProfile });
      expect(result).toHaveLength(0);
    });

    test('AC-2-04: FAMILY_WITH_CHILDREN restriction → included for FAMILY_WITH_CHILDREN', () => {
      const task = makeTask({ id: 'T01', applicableFamilySituations: '["FAMILY_WITH_CHILDREN"]' });
      const result = filterApplicableTasks({ tasks: [task], profile: familyProfile });
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('T01');
    });
  });

  describe('occupation restriction', () => {
    test('task restricted to TECHNOLOGY → included for TECHNOLOGY profile', () => {
      const task = makeTask({ applicableOccupations: '["TECHNOLOGY"]' });
      const result = filterApplicableTasks({ tasks: [task], profile: soloProfile }); // TECHNOLOGY
      expect(result).toHaveLength(1);
    });

    test('task restricted to TECHNOLOGY → excluded for FINANCE profile', () => {
      const task = makeTask({ applicableOccupations: '["TECHNOLOGY"]' });
      const result = filterApplicableTasks({ tasks: [task], profile: constrainedCoupleProfile }); // FINANCE
      expect(result).toHaveLength(0);
    });
  });

  describe('AND logic — all three fields must pass', () => {
    test('passes visaType + familySituation but fails occupation → excluded', () => {
      const task = makeTask({
        applicableVisaTypes: '["AEWV"]',
        applicableFamilySituations: '["SOLO"]',
        applicableOccupations: '["HEALTHCARE"]', // profile has TECHNOLOGY
      });
      const result = filterApplicableTasks({ tasks: [task], profile: soloProfile }); // TECHNOLOGY
      expect(result).toHaveLength(0);
    });

    test('passes all three → included', () => {
      const task = makeTask({
        applicableVisaTypes: '["AEWV"]',
        applicableFamilySituations: '["SOLO"]',
        applicableOccupations: '["TECHNOLOGY"]',
      });
      const result = filterApplicableTasks({ tasks: [task], profile: soloProfile });
      expect(result).toHaveLength(1);
    });

    test('multiple tasks — mixed applicability → only matching ones returned', () => {
      const familyTask = makeTask({ id: 'T01', applicableFamilySituations: '["FAMILY_WITH_CHILDREN"]' });
      const allTask = makeTask({ id: 'T06' }); // ["ALL"] on all fields
      const result = filterApplicableTasks({
        tasks: [familyTask, allTask],
        profile: soloProfile,
      });
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('T06');
    });
  });

  describe('Defensive JSON parsing', () => {
    test('malformed JSON in applicableVisaTypes → task excluded', () => {
      const task = makeTask({ applicableVisaTypes: 'not-valid-json' });
      const result = filterApplicableTasks({ tasks: [task], profile: soloProfile });
      expect(result).toHaveLength(0);
    });

    test('malformed JSON in applicableFamilySituations → task excluded', () => {
      const task = makeTask({ applicableFamilySituations: '{bad}' });
      const result = filterApplicableTasks({ tasks: [task], profile: soloProfile });
      expect(result).toHaveLength(0);
    });

    test('malformed JSON in applicableOccupations → task excluded', () => {
      const task = makeTask({ applicableOccupations: 'undefined' });
      const result = filterApplicableTasks({ tasks: [task], profile: soloProfile });
      expect(result).toHaveLength(0);
    });
  });
});

// ─── derivePersonaKey() ─────────────────────────────────────────────────────

describe('derivePersonaKey()', () => {
  const cases: [FamilySituation, PersonaKey][] = [
    ['COUPLE_CONSTRAINED', 'constrained_couple'],
    ['FAMILY_WITH_CHILDREN', 'family_with_children'],
    ['SOLO', 'solo_aewv'],
    ['COUPLE_DUAL_WORK', 'dual_work_couple'],
  ];

  cases.forEach(([situation, expectedKey]) => {
    test(`${situation} → "${expectedKey}"`, () => {
      expect(derivePersonaKey(situation)).toBe(expectedKey);
    });
  });

  test('visaType does NOT affect persona key (only familySituation does)', () => {
    // Both AEWV and PARTNER_OF_STUDENT with SOLO → same key
    expect(derivePersonaKey('SOLO')).toBe('solo_aewv');
    expect(derivePersonaKey('COUPLE_CONSTRAINED')).toBe('constrained_couple');
  });
});
