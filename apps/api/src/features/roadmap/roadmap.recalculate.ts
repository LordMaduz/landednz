// Daily priority recalculation job, also run after each content deploy.
// Reconciles every user's roadmap with the current content (adds newly applicable
// tasks, drops open entries that no longer apply) and rescores with the current date,
// so time-sensitive urgency bonuses (T16 month 10-11, T06/T07 days 1-3, etc.)
// remain accurate as time passes since onboarding.
//
// Triggered manually via POST /admin/recalculate (MVP).
// No cron scheduler — Railway cron or manual trigger at this phase.

import { db } from '../../shared/db.js';
import { logger } from '../../shared/logger.js';
import { reconcileRoadmap } from './roadmap.build.js';
import type { RecalculateResponse } from './roadmap.types.js';

export async function recalculateAllRoadmaps(
  currentDate: Date = new Date(),
): Promise<RecalculateResponse> {
  // 1. Find all distinct userIds that have roadmap entries
  const userIdRows = await db.userRoadmapEntry.findMany({
    select: { userId: true },
    distinct: ['userId'],
  });

  const userIds = userIdRows.map(r => r.userId);
  logger.info({ userCount: userIds.length, currentDate }, 'recalculateAllRoadmaps started');

  let entriesUpdated = 0;
  let entriesAdded = 0;
  let entriesRemoved = 0;

  for (const userId of userIds) {
    // 2. Fetch profile — skip users with no profile (shouldn't happen, but be safe)
    const profile = await db.userProfile.findUnique({ where: { userId } });
    if (!profile) {
      logger.warn({ userId }, 'recalculate: no profile found, skipping user');
      continue;
    }

    // 3. Reconcile with the current content: add, drop and rescore
    const r = await db.$transaction(tx => reconcileRoadmap(tx, userId, profile, profile.arrivalDate, currentDate));
    entriesUpdated += r.updated;
    entriesAdded += r.added;
    entriesRemoved += r.removed;
  }

  logger.info({ usersProcessed: userIds.length, entriesUpdated, entriesAdded, entriesRemoved }, 'recalculateAllRoadmaps complete');

  return { usersProcessed: userIds.length, entriesUpdated, entriesAdded, entriesRemoved };
}
