// Guide context comes from the database and the content bundle only (constitution C01: no roadmap/chat imports).
import type { GuideScreen } from '@landednz/types';
import { db } from '../../shared/db.js';
import { AppError } from '../../shared/errors.js';
import { task, tasks } from '../../content/index.js';
import type { GuideContext, TaskRef } from './types.js';

const MS_PER_DAY = 86_400_000;

export async function loadGuideContext(userId: string, screen: GuideScreen): Promise<GuideContext> {
  const [user, profile, entries, memories] = await Promise.all([
    db.user.findUnique({ where: { id: userId }, select: { name: true } }),
    db.userProfile.findUnique({ where: { userId } }),
    db.userRoadmapEntry.findMany({ where: { userId }, orderBy: { priorityScore: 'desc' } }),
    db.guideMemory.findMany({ where: { userId }, orderBy: { createdAt: 'asc' }, select: { id: true, text: true } }),
  ]);
  if (!profile) throw new AppError('PROFILE_NOT_FOUND', 'Profile not found', 404);

  const ref = (taskKey: string): TaskRef | null => {
    const t = task(taskKey);
    return t && !t.retired ? { taskKey, title: t.name } : null;
  };
  const live = entries.flatMap((e) => {
    const r = ref(e.taskId);
    return r ? [{ e, r }] : [];
  });

  return {
    userName: user?.name ?? null,
    profile: {
      visaType: profile.visaType,
      city: profile.city,
      familySituation: profile.familySituation,
      occupation: profile.occupation,
      arrivalDate: profile.arrivalDate,
    },
    daysSinceArrival: Math.floor((Date.now() - profile.arrivalDate.getTime()) / MS_PER_DAY),
    doneTasks: live.filter(({ e }) => e.status === 'COMPLETE').map(({ r }) => r),
    // Array sort is stable, so score order from the query holds within each blocked group
    nextTasks: live
      .filter(({ e }) => e.status !== 'COMPLETE' && e.status !== 'SKIPPED')
      .sort((a, b) => Number(a.e.isBlocked) - Number(b.e.isBlocked))
      .slice(0, 5)
      .map(({ r }) => r),
    totalTasks: live.length,
    currentTask: screen.kind === 'task' && screen.taskKey ? ref(screen.taskKey) : null,
    memories,
    taskTitles: new Map(tasks().map((t) => [t.id, t.name])),
  };
}
