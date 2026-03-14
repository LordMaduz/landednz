import { FastifyInstance } from 'fastify';
import { authenticateRequest } from '../../shared/middleware/auth';
import { getRoadmap, completeTask } from './roadmap.service';
import type { RoadmapResponse, TaskCompleteResponse } from './roadmap.types';

export function registerRoadmapRoutes(app: FastifyInstance): void {
  // GET /roadmap
  // Returns the authenticated user's personalised roadmap:
  //   topThree — top 3 non-complete, non-blocked tasks by priorityScore DESC
  //   phases   — all tasks grouped by phase
  //   lastComputedAt — ISO timestamp of last roadmap computation
  app.get<{ Reply: RoadmapResponse }>(
    '/roadmap',
    { preHandler: authenticateRequest },
    async (request, reply) => {
      const result = await getRoadmap(request.userId);
      reply.status(200).send(result);
    },
  );

  // POST /roadmap/tasks/:taskId/complete
  // Marks a task COMPLETE, triggers targeted recomputation for affected dependents.
  // Returns updated topThree and list of newly unblocked task IDs.
  app.post<{ Params: { taskId: string }; Reply: TaskCompleteResponse }>(
    '/roadmap/tasks/:taskId/complete',
    { preHandler: authenticateRequest },
    async (request, reply) => {
      const { taskId } = request.params;
      const result = await completeTask(request.userId, taskId);
      reply.status(200).send(result);
    },
  );
}
