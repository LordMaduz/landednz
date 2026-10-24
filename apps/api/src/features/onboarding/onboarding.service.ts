// Onboarding service — orchestrates profile creation and roadmap generation.
// Roadmap entries come from the content bundle via buildRoadmapEntries().

import { db } from '../../shared/db.js';
import { logger } from '../../shared/logger.js';
import { AppError } from '../../shared/errors.js';
import { contentVersion } from '../../content/index.js';
import { buildRoadmapEntries } from '../roadmap/roadmap.build.js';
import type { CreateProfileRequest, CreateProfileResponse, GetProfileResponse } from './onboarding.types.js';

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

  const profile = await db.userProfile.create({
    data: {
      userId,
      visaType: request.visaType,
      city: request.city,
      familySituation: request.familySituation,
      occupation: request.occupation,
      arrivalDate,
    },
  });

  logger.info({ userId }, 'UserProfile created');

  const version = contentVersion();
  const roadmapEntries = buildRoadmapEntries(request, arrivalDate, currentDate, []).map(e => ({ ...e, userId, contentVersion: version }));
  await db.userRoadmapEntry.createMany({ data: roadmapEntries });

  logger.info({ userId, entryCount: roadmapEntries.length }, 'UserRoadmapEntry records created');

  return {
    profileId: profile.id,
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
        updatedAt: new Date()
      }
    });

    logger.info({ userId }, 'UserProfile updated');

    // Step 2: Keep the user's completions (read before the delete), then delete all existing roadmap entries
    const existingCompletions = await tx.userRoadmapEntry.findMany({
      where: { userId, status: 'COMPLETE' },
      select: { taskId: true, completedAt: true },
    });

    await tx.userRoadmapEntry.deleteMany({
      where: { userId }
    });

    logger.info({ userId }, 'Existing roadmap entries deleted');

    // Step 3: rebuild from content — completions survive for tasks that still apply
    const completedAtById = new Map(existingCompletions.map(e => [e.taskId, e.completedAt]));
    const version = contentVersion();
    const roadmapEntries = buildRoadmapEntries(request, arrivalDate, currentDate, [...completedAtById.keys()]).map(e => ({
      ...e,
      userId,
      contentVersion: version,
      status: completedAtById.has(e.taskId) ? 'COMPLETE' as const : 'NOT_STARTED' as const,
      completedAt: completedAtById.get(e.taskId) ?? null,
    }));

    // Step 4: bulk create all new roadmap entries
    await tx.userRoadmapEntry.createMany({ data: roadmapEntries });

    logger.info({ userId, entryCount: roadmapEntries.length }, 'New roadmap entries created');

    return {
      profileId: updatedProfile.id,
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
  };
}
