// Transitional (removed in Task 6): roadmaps are built from the content bundle, but getRoadmap and
// friends still join each entry to a DB Task row. Test files that delete canonical tasks leave
// gaps, so files that read roadmaps fill in a bare row for every content task the DB lacks.
import { tasks } from '../content/index.js';
import { db } from '../shared/db.js';

export async function ensureLegacyTaskRows(): Promise<void> {
  const existing = new Set((await db.task.findMany({ select: { id: true } })).map(t => t.id));
  await db.task.createMany({
    data: tasks()
      .filter(t => !existing.has(t.id))
      .map(t => ({
        id: t.id,
        name: t.name,
        phase: t.phase,
        basePriority: t.priority,
        estimatedDuration: t.duration,
        governmentSourceUrl: 'https://example.com',
        applicableVisaTypes: '["ALL"]',
        applicableFamilySituations: '["ALL"]',
        applicableOccupations: '["ALL"]',
      })),
  });
}
