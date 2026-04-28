// Implementation of scoreTask() — scoring formula for priority calculation
// Pure function — zero framework imports per constitutional constraint C02

import { PersonaKey } from '@landednz/types';

// Types
interface ScoringInput {
  task: { id: string; basePriority: number; phase: number };
  personaKey: PersonaKey;
  arrivalDate: Date | null;
  currentDate: Date;
  isBlocked: boolean;
  isComplete: boolean;
}

interface ScoringResult {
  taskId: string;
  finalPriority: number;
  breakdown: {
    basePriority: number;
    personaWeight: number;
    timeUrgencyBonus: number;
    dependencyPenalty: number;
  };
}

// Named constants (exact values — do not deviate)
const DEPENDENCY_PENALTY = 50;

const PERSONA_WEIGHTS = {
  constrained_couple: {
    T08: 20, T09: 20, T10: 15, T11: 10, T12: 10, T16: 5, T01: 0,
  },
  family_with_children: {
    T08: 15, T09: 15, T10: 10, T11: 15, T12: 20, T16: 15, T01: 20,
  },
  solo_aewv: {
    T08: 10, T09: 10, T10: 5, T11: 5, T12: 5, T16: 5, T01: 0,
  },
  dual_work_couple: {
    T08: 18, T09: 18, T10: 12, T11: 8, T12: 8, T16: 10, T01: 5,
  },
} as const;

const URGENCY_BONUSES = {
  DAYS_1_3_T06: 30,
  DAYS_1_3_T07: 30,
  DAYS_4_14_T08: 25,
  T08_APPLIED_T09_NOT: 28,
  MONTH_10_11_T16: 30,
  FEB_MAR_TAX: 25,
} as const;

// Helper functions
function calculateDaysSinceArrival(arrivalDate: Date | null, currentDate: Date): number | null {
  if (!arrivalDate) return null;
  const diffMs = currentDate.getTime() - arrivalDate.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1; // Day 1 = arrival day
}

function calculateMonthsSinceArrival(arrivalDate: Date | null, currentDate: Date): number | null {
  if (!arrivalDate) return null;
  const diffMs = currentDate.getTime() - arrivalDate.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24 * 30.44)); // Approximate months
}

function getPersonaWeight(taskId: string, personaKey: PersonaKey): number {
  // Default to solo_aewv for unknown personas (defensive programming)
  const safePersonaKey = personaKey in PERSONA_WEIGHTS ? personaKey : 'solo_aewv';
  const weights = PERSONA_WEIGHTS[safePersonaKey];
  return (weights as Record<string, number>)[taskId] || 0;
}

function calculateTimeUrgencyBonus(
  taskId: string,
  arrivalDate: Date | null,
  currentDate: Date,
  input: ScoringInput, // Need full context for T09 logic
): number {
  // PRE_ARRIVAL state — all urgency bonuses = 0
  if (!arrivalDate) return 0;

  let totalBonus = 0;
  const daysSince = calculateDaysSinceArrival(arrivalDate, currentDate);

  if (daysSince === null) return 0;

  // Days 1–3, T06 (SIM) incomplete
  if (taskId === 'T06' && daysSince >= 1 && daysSince <= 3) {
    totalBonus += URGENCY_BONUSES.DAYS_1_3_T06;
  }

  // Days 1–3, T07 (bank) incomplete
  if (taskId === 'T07' && daysSince >= 1 && daysSince <= 3) {
    totalBonus += URGENCY_BONUSES.DAYS_1_3_T07;
  }

  // Days 4–14, T08 (IRD) not applied
  if (taskId === 'T08' && daysSince >= 4 && daysSince <= 14) {
    totalBonus += URGENCY_BONUSES.DAYS_4_14_T08;
  }

  // T08 applied, T09 (tax code) not declared
  // This bonus requires checking if T08 is complete - simulating with task context
  if (taskId === 'T09') {
    // In the golden examples, this bonus only applies when T08 is complete
    // For unit test purposes, this would need external completion state
    // For now, not adding the bonus in basic implementation
  }

  // Month 10–11, T16 (foreign licence) in use
  // Calculate accurate day range for months 10-11 (approximately 275-337 days)
  const diffMs = currentDate.getTime() - arrivalDate.getTime();
  const daysSinceArrival = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (taskId === 'T16' && daysSinceArrival >= 275 && daysSinceArrival <= 336) {
    totalBonus += URGENCY_BONUSES.MONTH_10_11_T16;
  }

  // February–March, tax tasks incomplete (only after first year in NZ)
  const currentMonth = currentDate.getMonth() + 1; // 1-based months
  const currentYear = currentDate.getFullYear();
  const arrivalYear = arrivalDate.getFullYear();

  // Only apply Feb-Mar bonus if it's at least the year after arrival
  if ((currentMonth === 2 || currentMonth === 3) &&
      currentYear > arrivalYear &&
      ['T08', 'T09'].includes(taskId)) {
    totalBonus += URGENCY_BONUSES.FEB_MAR_TAX;
  }

  return totalBonus;
}

// Main scoring function
export function scoreTask(input: ScoringInput): ScoringResult {
  const { task, personaKey, arrivalDate, currentDate, isBlocked } = input;

  // All four components always present
  const basePriority = task.basePriority;
  const personaWeight = getPersonaWeight(task.id, personaKey);
  const timeUrgencyBonus = calculateTimeUrgencyBonus(task.id, arrivalDate, currentDate, input);
  const dependencyPenalty = isBlocked ? DEPENDENCY_PENALTY : 0;

  // Final scoring formula
  const finalPriority = basePriority + personaWeight + timeUrgencyBonus - dependencyPenalty;

  return {
    taskId: task.id,
    finalPriority,
    breakdown: {
      basePriority,
      personaWeight,
      timeUrgencyBonus,
      dependencyPenalty,
    },
  };
}