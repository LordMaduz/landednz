// scoreTask(): priority + matching condition boosts + urgency rules − dependency penalty.
// Pure function — zero framework imports per constitutional constraint C02.

import { matches } from '../../content/matches.js';
import type { Profile, TaskDef, UrgencyRule } from '../../content/types.js';

interface ScoringInput {
  task: { id: string; priority: number; boosts: TaskDef['boosts']; urgency: UrgencyRule[] };
  profile: Profile;
  arrivalDate: Date | null; // null = pre-arrival: no urgency
  currentDate: Date;
  isBlocked: boolean;
}

interface ScoringResult {
  taskId: string;
  finalPriority: number;
  breakdown: {
    basePriority: number;
    conditionBoost: number;
    timeUrgencyBonus: number;
    dependencyPenalty: number;
  };
}

const DEPENDENCY_PENALTY = 50;
const DAY_MS = 1000 * 60 * 60 * 24;

function urgencyBonus(rules: UrgencyRule[], arrivalDate: Date | null, currentDate: Date): number {
  if (!arrivalDate) return 0;
  const day = Math.floor((currentDate.getTime() - arrivalDate.getTime()) / DAY_MS) + 1; // Day 1 = arrival day
  const month = currentDate.getMonth() + 1;
  const afterFirstYear = currentDate.getFullYear() > arrivalDate.getFullYear();
  return rules.reduce((sum, r) => {
    const fires = 'fromDay' in r ? day >= r.fromDay && day <= r.toDay : afterFirstYear && r.months.includes(month);
    return fires ? sum + r.by : sum;
  }, 0);
}

export function scoreTask(input: ScoringInput): ScoringResult {
  const { task, profile, arrivalDate, currentDate, isBlocked } = input;
  const basePriority = task.priority;
  const conditionBoost = task.boosts.reduce((sum, b) => (matches(b.when, profile) ? sum + b.by : sum), 0);
  const timeUrgencyBonus = urgencyBonus(task.urgency, arrivalDate, currentDate);
  const dependencyPenalty = isBlocked ? DEPENDENCY_PENALTY : 0;

  return {
    taskId: task.id,
    finalPriority: basePriority + conditionBoost + timeUrgencyBonus - dependencyPenalty,
    breakdown: { basePriority, conditionBoost, timeUrgencyBonus, dependencyPenalty },
  };
}
