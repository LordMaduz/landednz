"use strict";
// Pure functions for task filtering and persona key derivation.
// Zero framework imports — constitutional constraint C02.
Object.defineProperty(exports, "__esModule", { value: true });
exports.filterApplicableTasks = filterApplicableTasks;
exports.derivePersonaKey = derivePersonaKey;
// ─── Helpers ─────────────────────────────────────────────────────────────────
// Parses a JSON string field — returns [] on any parse failure (defensive exclusion)
function parseJsonField(jsonString) {
    try {
        const parsed = JSON.parse(jsonString);
        return Array.isArray(parsed) ? parsed : [];
    }
    catch {
        return [];
    }
}
// A field passes if it contains "ALL" (no restriction) or the user's profile value
function fieldPasses(jsonString, profileValue) {
    const values = parseJsonField(jsonString);
    return values.includes('ALL') || values.includes(profileValue);
}
// ─── filterApplicableTasks() ─────────────────────────────────────────────────
function filterApplicableTasks(input) {
    const { tasks, profile } = input;
    return tasks.filter(task => 
    // AND logic — all three fields must pass
    fieldPasses(task.applicableVisaTypes, profile.visaType) &&
        fieldPasses(task.applicableFamilySituations, profile.familySituation) &&
        fieldPasses(task.applicableOccupations, profile.occupation));
}
// ─── derivePersonaKey() ──────────────────────────────────────────────────────
// visaType does NOT affect the persona key — only familySituation does
function derivePersonaKey(familySituation) {
    if (familySituation === 'COUPLE_CONSTRAINED')
        return 'constrained_couple';
    if (familySituation === 'FAMILY_WITH_CHILDREN')
        return 'family_with_children';
    if (familySituation === 'COUPLE_DUAL_WORK')
        return 'dual_work_couple';
    return 'solo_aewv'; // SOLO and any future values
}
//# sourceMappingURL=filter.js.map