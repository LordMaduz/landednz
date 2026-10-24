// Daily priority recalculation job.
// Re-scores all users' non-COMPLETE roadmap entries using the current date,
// so time-sensitive urgency bonuses (T16 month 10-11, T06/T07 days 1-3, etc.)
// remain accurate as time passes since onboarding.
//
// Triggered manually via POST /admin/recalculate (MVP).
// No cron scheduler — Railway cron or manual trigger at this phase.

import { db } from '../../shared/db.js';
import { logger } from '../../shared/logger.js';
import { contentVersion } from '../../content/index.js';
import { buildRoadmapEntries } from './roadmap.build.js';
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

  for (const userId of userIds) {
    // 2. Fetch profile — skip users with no profile (shouldn't happen, but be safe)
    const profile = await db.userProfile.findUnique({ where: { userId } });
    if (!profile) {
      logger.warn({ userId }, 'recalculate: no profile found, skipping user');
      continue;
    }

    // 3. Rebuild from content and rescore the user's non-COMPLETE entries.
    // Entries whose task no longer applies are left as they are.
    const allEntries = await db.userRoadmapEntry.findMany({ where: { userId } });
    const completedTaskIds = allEntries.filter(e => e.status === 'COMPLETE').map(e => e.taskId);
    const openTaskIds = new Set(allEntries.filter(e => e.status !== 'COMPLETE').map(e => e.taskId));
    const version = contentVersion();

    for (const e of buildRoadmapEntries(profile, profile.arrivalDate, currentDate, completedTaskIds)) {
      if (!openTaskIds.has(e.taskId)) continue;
      await db.userRoadmapEntry.update({
        where: { userId_taskId: { userId, taskId: e.taskId } },
        data: { isBlocked: e.isBlocked, priorityScore: e.priorityScore, contentVersion: version },
      });
      entriesUpdated++;
    }
  }

  logger.info({ usersProcessed: userIds.length, entriesUpdated }, 'recalculateAllRoadmaps complete');

  return { usersProcessed: userIds.length, entriesUpdated };
}
