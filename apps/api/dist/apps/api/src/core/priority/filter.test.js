"use strict";
// Test file for filterApplicableTasks() and derivePersonaKey() — written first in TDD approach
// All tests will fail initially — implementation comes after
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const filter_1 = require("./filter");
// ─── Helpers ────────────────────────────────────────────────────────────────
function makeTask(overrides) {
    return {
        id: overrides.id ?? 'T01',
        applicableVisaTypes: overrides.applicableVisaTypes ?? '["ALL"]',
        applicableFamilySituations: overrides.applicableFamilySituations ?? '["ALL"]',
        applicableOccupations: overrides.applicableOccupations ?? '["ALL"]',
    };
}
const soloProfile = {
    visaType: 'AEWV',
    familySituation: 'SOLO',
    occupation: 'TECHNOLOGY',
};
const familyProfile = {
    visaType: 'AEWV',
    familySituation: 'FAMILY_WITH_CHILDREN',
    occupation: 'TECHNOLOGY',
};
const constrainedCoupleProfile = {
    visaType: 'PARTNER_OF_STUDENT',
    familySituation: 'COUPLE_CONSTRAINED',
    occupation: 'FINANCE',
};
const dualWorkCoupleProfile = {
    visaType: 'AEWV',
    familySituation: 'COUPLE_DUAL_WORK',
    occupation: 'HEALTHCARE',
};
// ─── filterApplicableTasks() ────────────────────────────────────────────────
(0, vitest_1.describe)('filterApplicableTasks()', () => {
    (0, vitest_1.describe)('["ALL"] sentinel — no restriction', () => {
        (0, vitest_1.test)('task with ["ALL"] on all fields → included for any profile', () => {
            const task = makeTask({});
            const result = (0, filter_1.filterApplicableTasks)({ tasks: [task], profile: soloProfile });
            (0, vitest_1.expect)(result).toHaveLength(1);
            (0, vitest_1.expect)(result[0].id).toBe('T01');
        });
        (0, vitest_1.test)('["ALL"] on all fields → included for family profile too', () => {
            const task = makeTask({});
            const result = (0, filter_1.filterApplicableTasks)({ tasks: [task], profile: familyProfile });
            (0, vitest_1.expect)(result).toHaveLength(1);
        });
        (0, vitest_1.test)('empty task list → returns []', () => {
            const result = (0, filter_1.filterApplicableTasks)({ tasks: [], profile: soloProfile });
            (0, vitest_1.expect)(result).toHaveLength(0);
        });
    });
    (0, vitest_1.describe)('visaType restriction', () => {
        (0, vitest_1.test)('task restricted to AEWV → included for AEWV profile', () => {
            const task = makeTask({ applicableVisaTypes: '["AEWV"]' });
            const result = (0, filter_1.filterApplicableTasks)({ tasks: [task], profile: soloProfile }); // AEWV
            (0, vitest_1.expect)(result).toHaveLength(1);
        });
        (0, vitest_1.test)('task restricted to AEWV → excluded for PARTNER_OF_STUDENT profile', () => {
            const task = makeTask({ applicableVisaTypes: '["AEWV"]' });
            const result = (0, filter_1.filterApplicableTasks)({ tasks: [task], profile: constrainedCoupleProfile }); // PARTNER_OF_STUDENT
            (0, vitest_1.expect)(result).toHaveLength(0);
        });
        (0, vitest_1.test)('task restricted to multiple visa types → included if profile matches any', () => {
            const task = makeTask({ applicableVisaTypes: '["AEWV","PARTNER_OF_STUDENT"]' });
            const result = (0, filter_1.filterApplicableTasks)({ tasks: [task], profile: constrainedCoupleProfile }); // PARTNER_OF_STUDENT
            (0, vitest_1.expect)(result).toHaveLength(1);
        });
    });
    (0, vitest_1.describe)('familySituation restriction', () => {
        (0, vitest_1.test)('task restricted to FAMILY_WITH_CHILDREN → included for family profile', () => {
            const task = makeTask({ applicableFamilySituations: '["FAMILY_WITH_CHILDREN"]' });
            const result = (0, filter_1.filterApplicableTasks)({ tasks: [task], profile: familyProfile });
            (0, vitest_1.expect)(result).toHaveLength(1);
        });
        // ── AC-2-04 core scenarios ──────────────────────────────────────────────
        (0, vitest_1.test)('AC-2-04: FAMILY_WITH_CHILDREN restriction → excluded for SOLO', () => {
            const task = makeTask({ id: 'T01', applicableFamilySituations: '["FAMILY_WITH_CHILDREN"]' });
            const result = (0, filter_1.filterApplicableTasks)({ tasks: [task], profile: soloProfile });
            (0, vitest_1.expect)(result).toHaveLength(0);
        });
        (0, vitest_1.test)('AC-2-04: FAMILY_WITH_CHILDREN restriction → excluded for COUPLE_CONSTRAINED', () => {
            const task = makeTask({ id: 'T01', applicableFamilySituations: '["FAMILY_WITH_CHILDREN"]' });
            const result = (0, filter_1.filterApplicableTasks)({ tasks: [task], profile: constrainedCoupleProfile });
            (0, vitest_1.expect)(result).toHaveLength(0);
        });
        (0, vitest_1.test)('AC-2-04: FAMILY_WITH_CHILDREN restriction → excluded for COUPLE_DUAL_WORK', () => {
            const task = makeTask({ id: 'T01', applicableFamilySituations: '["FAMILY_WITH_CHILDREN"]' });
            const result = (0, filter_1.filterApplicableTasks)({ tasks: [task], profile: dualWorkCoupleProfile });
            (0, vitest_1.expect)(result).toHaveLength(0);
        });
        (0, vitest_1.test)('AC-2-04: FAMILY_WITH_CHILDREN restriction → included for FAMILY_WITH_CHILDREN', () => {
            const task = makeTask({ id: 'T01', applicableFamilySituations: '["FAMILY_WITH_CHILDREN"]' });
            const result = (0, filter_1.filterApplicableTasks)({ tasks: [task], profile: familyProfile });
            (0, vitest_1.expect)(result).toHaveLength(1);
            (0, vitest_1.expect)(result[0].id).toBe('T01');
        });
    });
    (0, vitest_1.describe)('occupation restriction', () => {
        (0, vitest_1.test)('task restricted to TECHNOLOGY → included for TECHNOLOGY profile', () => {
            const task = makeTask({ applicableOccupations: '["TECHNOLOGY"]' });
            const result = (0, filter_1.filterApplicableTasks)({ tasks: [task], profile: soloProfile }); // TECHNOLOGY
            (0, vitest_1.expect)(result).toHaveLength(1);
        });
        (0, vitest_1.test)('task restricted to TECHNOLOGY → excluded for FINANCE profile', () => {
            const task = makeTask({ applicableOccupations: '["TECHNOLOGY"]' });
            const result = (0, filter_1.filterApplicableTasks)({ tasks: [task], profile: constrainedCoupleProfile }); // FINANCE
            (0, vitest_1.expect)(result).toHaveLength(0);
        });
    });
    (0, vitest_1.describe)('AND logic — all three fields must pass', () => {
        (0, vitest_1.test)('passes visaType + familySituation but fails occupation → excluded', () => {
            const task = makeTask({
                applicableVisaTypes: '["AEWV"]',
                applicableFamilySituations: '["SOLO"]',
                applicableOccupations: '["HEALTHCARE"]', // profile has TECHNOLOGY
            });
            const result = (0, filter_1.filterApplicableTasks)({ tasks: [task], profile: soloProfile }); // TECHNOLOGY
            (0, vitest_1.expect)(result).toHaveLength(0);
        });
        (0, vitest_1.test)('passes all three → included', () => {
            const task = makeTask({
                applicableVisaTypes: '["AEWV"]',
                applicableFamilySituations: '["SOLO"]',
                applicableOccupations: '["TECHNOLOGY"]',
            });
            const result = (0, filter_1.filterApplicableTasks)({ tasks: [task], profile: soloProfile });
            (0, vitest_1.expect)(result).toHaveLength(1);
        });
        (0, vitest_1.test)('multiple tasks — mixed applicability → only matching ones returned', () => {
            const familyTask = makeTask({ id: 'T01', applicableFamilySituations: '["FAMILY_WITH_CHILDREN"]' });
            const allTask = makeTask({ id: 'T06' }); // ["ALL"] on all fields
            const result = (0, filter_1.filterApplicableTasks)({
                tasks: [familyTask, allTask],
                profile: soloProfile,
            });
            (0, vitest_1.expect)(result).toHaveLength(1);
            (0, vitest_1.expect)(result[0].id).toBe('T06');
        });
    });
    (0, vitest_1.describe)('Defensive JSON parsing', () => {
        (0, vitest_1.test)('malformed JSON in applicableVisaTypes → task excluded', () => {
            const task = makeTask({ applicableVisaTypes: 'not-valid-json' });
            const result = (0, filter_1.filterApplicableTasks)({ tasks: [task], profile: soloProfile });
            (0, vitest_1.expect)(result).toHaveLength(0);
        });
        (0, vitest_1.test)('malformed JSON in applicableFamilySituations → task excluded', () => {
            const task = makeTask({ applicableFamilySituations: '{bad}' });
            const result = (0, filter_1.filterApplicableTasks)({ tasks: [task], profile: soloProfile });
            (0, vitest_1.expect)(result).toHaveLength(0);
        });
        (0, vitest_1.test)('malformed JSON in applicableOccupations → task excluded', () => {
            const task = makeTask({ applicableOccupations: 'undefined' });
            const result = (0, filter_1.filterApplicableTasks)({ tasks: [task], profile: soloProfile });
            (0, vitest_1.expect)(result).toHaveLength(0);
        });
    });
});
// ─── derivePersonaKey() ─────────────────────────────────────────────────────
(0, vitest_1.describe)('derivePersonaKey()', () => {
    const cases = [
        ['COUPLE_CONSTRAINED', 'constrained_couple'],
        ['FAMILY_WITH_CHILDREN', 'family_with_children'],
        ['SOLO', 'solo_aewv'],
        ['COUPLE_DUAL_WORK', 'dual_work_couple'],
    ];
    cases.forEach(([situation, expectedKey]) => {
        (0, vitest_1.test)(`${situation} → "${expectedKey}"`, () => {
            (0, vitest_1.expect)((0, filter_1.derivePersonaKey)(situation)).toBe(expectedKey);
        });
    });
    (0, vitest_1.test)('visaType does NOT affect persona key (only familySituation does)', () => {
        // Both AEWV and PARTNER_OF_STUDENT with SOLO → same key
        (0, vitest_1.expect)((0, filter_1.derivePersonaKey)('SOLO')).toBe('solo_aewv');
        (0, vitest_1.expect)((0, filter_1.derivePersonaKey)('COUPLE_CONSTRAINED')).toBe('constrained_couple');
    });
});
//# sourceMappingURL=filter.test.js.map