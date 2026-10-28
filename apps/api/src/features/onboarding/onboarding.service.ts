// Onboarding service — orchestrates profile creation and roadmap generation.
// Roadmap entries come from the content bundle via buildRoadmapEntries().

import { db } from '../../shared/db.js';
import { logger } from '../../shared/logger.js';
import { AppError } from '../../shared/errors.js';
import { contentVersion } from '../../content/index.js';
import { buildRoadmapEntries, reconcileRoadmap } from '../roadmap/roadmap.build.js';
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

    // Step 2: reconcile entries with the new answers — started entries stay, open ones that no longer apply go
    const { applicable } = await reconcileRoadmap(tx, userId, request, arrivalDate, currentDate);

    logger.info({ userId, entryCount: applicable }, 'Roadmap entries reconciled');

    return {
      profileId: updatedProfile.id,
      roadmapGenerated: true,
      entriesCreated: applicable
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
