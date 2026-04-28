// Pure functions for task filtering and persona key derivation.
// Zero framework imports — constitutional constraint C02.

import { FamilySituation, Occupation, PersonaKey, VisaType } from '@landednz/types';

// ─── Types ──────────────────────────────────────────────────────────────────

// Minimal interface — Prisma Task is NOT imported in core/ (constitutional C02)
export interface FilterableTask {
  id: string;
  applicableVisaTypes: string;       // JSON string — e.g. '["AEWV"]' or '["ALL"]'
  applicableFamilySituations: string; // JSON string — e.g. '["FAMILY_WITH_CHILDREN"]' or '["ALL"]'
  applicableOccupations: string;     // JSON string — e.g. '["ALL"]'
  [key: string]: unknown;            // passthrough — caller may have extra Task fields
}

interface UserProfile {
  visaType: VisaType;
  familySituation: FamilySituation;
  occupation: Occupation;
}

interface TaskFilterInput {
  tasks: FilterableTask[];
  profile: UserProfile;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

// Parses a JSON string field — returns [] on any parse failure (defensive exclusion)
function parseJsonField(jsonString: string): string[] {
  try {
    const parsed = JSON.parse(jsonString);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

// A field passes if it contains "ALL" (no restriction) or the user's profile value
function fieldPasses(jsonString: string, profileValue: string): boolean {
  const values = parseJsonField(jsonString);
  return values.includes('ALL') || values.includes(profileValue);
}

// ─── filterApplicableTasks() ─────────────────────────────────────────────────

export function filterApplicableTasks(input: TaskFilterInput): FilterableTask[] {
  const { tasks, profile } = input;

  return tasks.filter(task =>
    // AND logic — all three fields must pass
    fieldPasses(task.applicableVisaTypes, profile.visaType) &&
    fieldPasses(task.applicableFamilySituations, profile.familySituation) &&
    fieldPasses(task.applicableOccupations, profile.occupation)
  );
}

// ─── derivePersonaKey() ──────────────────────────────────────────────────────

// visaType does NOT affect the persona key — only familySituation does
export function derivePersonaKey(familySituation: FamilySituation): PersonaKey {
  if (familySituation === 'COUPLE_CONSTRAINED') return 'constrained_couple';
  if (familySituation === 'FAMILY_WITH_CHILDREN') return 'family_with_children';
  if (familySituation === 'COUPLE_DUAL_WORK') return 'dual_work_couple';
  return 'solo_aewv'; // SOLO and any future values
}
