// Onboarding service — orchestrates profile creation and roadmap generation.
// Calls core/ pure functions for task filtering, dependency resolution, and scoring.

import { db } from '../../shared/db.js';
import { logger } from '../../shared/logger.js';
import { AppError } from '../../shared/errors.js';
import { filterApplicableTasks } from '../../core/priority/filter.js';
import { derivePersonaKey } from '../../core/priority/filter.js';
import { resolveBlockedTasks } from '../../core/dependencies/resolver.js';
import { scoreTask } from '../../core/priority/scoring.js';
import type { CreateProfileRequest, CreateProfileResponse, GetProfileResponse } from './onboarding.types.js';
import type { PersonaKey } from '../../shared/types.js';

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

// ─── updateProfileAndRegenerateRoadmap() ─────────────────────────────────────

export async function updateProfileAndRegenerateRoadmap(
  userId: string,
  request: CreateProfileRequest,
  currentDate: Date = new Date(),
): Promise<CreateProfileResponse & { entriesCreated: number }> {
  // Validate arrivalDate
  if (!isValidISODate(request.arrivalDate)) {
    throw new AppError(
      'VALIDATION_ERROR',
      'arrivalDate must be a valid ISO date string (e.g. 2024-03-15)',
      400,
    );
  }

  const arrivalDate = new Date(request.arrivalDate);
  const personaKey: PersonaKey = derivePersonaKey(request.familySituation);

  // Use transaction to ensure atomicity
  return await db.$transaction(async (tx) => {
    // Step 1: Update existing profile
    const updatedProfile = await tx.userProfile.update({
      where: { userId },
      data: {
        visaType: request.visaType,
        city: request.city,
        familySituation: request.familySituation,
        occupation: request.occupation,
        arrivalDate,
        personaKey,
        updatedAt: new Date()
      }
    });

    logger.info({ userId, personaKey }, 'UserProfile updated');

    // Step 2: Keep the user's completions (read before the delete), then delete all existing roadmap entries
    const existingCompletions = await tx.userRoadmapEntry.findMany({
      where: { userId, status: 'COMPLETE' },
      select: { taskId: true, completedAt: true },
    });

    await tx.userRoadmapEntry.deleteMany({
      where: { userId }
    });

    logger.info({ userId }, 'Existing roadmap entries deleted');

    // Step 3: Fetch all Tasks with dependencies for pipeline (same as createProfile)
    const allTasks = await tx.task.findMany({
      include: {
        dependencies: {
          select: { prerequisiteId: true, dependencyType: true },
        },
      },
    });

    // Step 4: filter to tasks applicable to this profile
    const applicableTasks = filterApplicableTasks({
      tasks: allTasks,
      profile: {
        visaType: request.visaType,
        familySituation: request.familySituation,
        occupation: request.occupation,
      },
    });

    // Build a lookup map to access full task data
    const taskMap = new Map(allTasks.map(t => [t.id, t]));

    // Step 5: resolve blocked tasks — updated profile preserves existing completions
    const completedTaskIds = existingCompletions.map(e => e.taskId);
    const completedAtById = new Map(existingCompletions.map(e => [e.taskId, e.completedAt]));

    const resolvedTasks = resolveBlockedTasks({
      tasks: applicableTasks.map(t => {
        const full = taskMap.get(t.id)!;
        return { id: t.id, dependencies: full.dependencies };
      }),
      completedTaskIds,
    });

    const resolvedMap = new Map(resolvedTasks.map(r => [r.taskId, r]));

    // Pre-arrival: future arrivalDate means urgency bonuses should be 0
    const isPreArrival = arrivalDate > currentDate;
    const scoringArrivalDate = isPreArrival ? null : arrivalDate;

    // Step 6: score each applicable task
    const roadmapEntries = applicableTasks.map(t => {
      const full = taskMap.get(t.id)!;
      const resolved = resolvedMap.get(t.id)!;
      const wasCompleted = completedTaskIds.includes(t.id);

      const scored = scoreTask({
        task: { id: full.id, basePriority: full.basePriority, phase: full.phase },
        personaKey,
        arrivalDate: scoringArrivalDate,
        currentDate,
        isBlocked: resolved.isBlocked,
        isComplete: wasCompleted,
      });

      return {
        userId,
        taskId: full.id,
        priorityScore: scored.finalPriority,
        isBlocked: resolved.isBlocked,
        status: wasCompleted ? 'COMPLETE' as const : 'NOT_STARTED' as const,
        completedAt: completedAtById.get(full.id) ?? null,
      };
    });

    // Step 7: bulk create all new roadmap entries
    await tx.userRoadmapEntry.createMany({ data: roadmapEntries });

    logger.info({ userId, entryCount: roadmapEntries.length }, 'New roadmap entries created');

    return {
      profileId: updatedProfile.id,
      personaKey,
      roadmapGenerated: true,
      entriesCreated: roadmapEntries.length
    };
  });
}

// ─── getUserProfile() ────────────────────────────────────────────────────────

export async function getUserProfile(userId: string): Promise<GetProfileResponse> {
  const profile = await db.userProfile.findUnique({
    where: { userId }
  });

  if (!profile) {
    throw new AppError('PROFILE_NOT_FOUND', 'No profile found for this user', 404);
  }

  return {
    profileId: profile.id,
    visaType: profile.visaType,
    city: profile.city,
    familySituation: profile.familySituation,
    occupation: profile.occupation,
    arrivalDate: profile.arrivalDate.toISOString().split('T')[0], // Convert to ISO date string
    personaKey: profile.personaKey as PersonaKey
  };
}
