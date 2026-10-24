import { db } from '../shared/db.js';
import { logger } from '../shared/logger.js';
import { task } from './index.js';

// Stored roadmap entries point at content task ids with no FK, so check them against the loaded bundle.
export async function checkStoredTaskIds(): Promise<{ unknown: string[]; retired: string[] }> {
  const rows = await db.userRoadmapEntry.findMany({ distinct: ['taskId'], select: { taskId: true } });
  const unknown: string[] = [];
  const retired: string[] = [];
  for (const { taskId } of rows) {
    const t = task(taskId);
    if (!t) {
      unknown.push(taskId);
      logger.warn({ taskId }, 'Stored roadmap entry references a task id missing from the content bundle');
    } else if (t.retired) retired.push(taskId);
  }
  return { unknown, retired };
}
