// Onboarding service — orchestrates profile creation and roadmap generation.
// Calls core/ pure functions for task filtering, dependency resolution, and scoring.

import { db } from '../../shared/db';
import { logger } from '../../shared/logger';
import { AppError } from '../../shared/errors';
import { filterApplicableTasks } from '../../core/priority/filter';
import { derivePersonaKey } from '../../core/priority/filter';
import { resolveBlockedTasks } from '../../core/dependencies/resolver';
import { scoreTask } from '../../core/priority/scoring';
import type { CreateProfileRequest, CreateProfileResponse } from './onboarding.types';
import type { PersonaKey } from '../../shared/types';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function isValidISODate(dateStr: string): boolean {
  if (!dateStr || !dateStr.includes('-')) return false;
  const date = new Date(dateStr);
  return !isNaN(date.getTime());
}

// ─── createProfile() ─────────────────────────────────────────────────────────

export async function createProfile(
  userId: string,
  request: CreateProfileRequest,
  currentDate: Date = new Date(),
): Promise<CreateProfileResponse> {
  // Validate arrivalDate
  if (!isValidISODate(request.arrivalDate)) {
    throw new AppError(
      'VALIDATION_ERROR',
      'arrivalDate must be a valid ISO date string (e.g. 2024-03-15)',
      400,
    );
  }

  // Check for duplicate profile — 409 if already exists
  const existing = await db.userProfile.findUnique({ where: { userId } });
  if (existing) {
    throw new AppError('PROFILE_EXISTS', 'A profile already exists for this user', 409);
  }

  const arrivalDate = new Date(request.arrivalDate);
  const personaKey: PersonaKey = derivePersonaKey(request.familySituation);

  // Create UserProfile
  const profile = await db.userProfile.create({
    data: {
      userId,
      visaType: request.visaType,
      city: request.city,
      familySituation: request.familySituation,
      occupation: request.occupation,
      arrivalDate,
      personaKey,
    },
  });

  logger.info({ userId, personaKey }, 'UserProfile created');

  // Fetch all Tasks with dependencies for pipeline
  const allTasks = await db.task.findMany({
    include: {
      dependencies: {
        select: { prerequisiteId: true, dependencyType: true },
      },
    },
  });

  // Step 1: filter to tasks applicable to this profile
  const applicableTasks = filterApplicableTasks({
    tasks: allTasks,
    profile: {
      visaType: request.visaType,
      familySituation: request.familySituation,
      occupation: request.occupation,
    },
  });

  // Build a lookup map to access full task data (basePriority, phase) for scoring
  const taskMap = new Map(allTasks.map(t => [t.id, t]));

  // Step 2: resolve blocked tasks — new profile has no completions
  const resolvedTasks = resolveBlockedTasks({
    tasks: applicableTasks.map(t => {
      const full = taskMap.get(t.id)!;
      return { id: t.id, dependencies: full.dependencies };
    }),
    completedTaskIds: [],
  });

  const resolvedMap = new Map(resolvedTasks.map(r => [r.taskId, r]));

  // Pre-arrival: future arrivalDate means urgency bonuses should be 0
  const isPreArrival = arrivalDate > currentDate;
  const scoringArrivalDate = isPreArrival ? null : arrivalDate;

  // Step 3: score each applicable task
  const roadmapEntries = applicableTasks.map(t => {
    const full = taskMap.get(t.id)!;
    const resolved = resolvedMap.get(t.id)!;

    const scored = scoreTask({
      task: { id: full.id, basePriority: full.basePriority, phase: full.phase },
      personaKey,
      arrivalDate: scoringArrivalDate,
      currentDate,
      isBlocked: resolved.isBlocked,
      isComplete: false,
    });

    return {
      userId,
      taskId: full.id,
      priorityScore: scored.finalPriority,
      isBlocked: resolved.isBlocked,
    };
  });

  // Step 4: bulk create all roadmap entries in one DB call
  await db.userRoadmapEntry.createMany({ data: roadmapEntries });

  logger.info({ userId, entryCount: roadmapEntries.length }, 'UserRoadmapEntry records created');

  return {
    profileId: profile.id,
    personaKey,
    roadmapGenerated: true,
  };
}
