import { FastifyInstance } from 'fastify';
import { authenticateRequest } from '../../shared/middleware/auth.js';
import { getRoadmap, completeTask, reopenTask, bulkOverride, getTaskDetail } from './roadmap.service.js';
import { recalculateAllRoadmaps } from './roadmap.recalculate.js';
import { config } from '../../shared/config.js';
import type { RoadmapResponse, TaskCompleteResponse, TaskReopenResponse, BulkOverrideRequest, BulkOverrideResponse, TaskDetailResponse, RecalculateResponse } from './roadmap.types.js';

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

  // POST /roadmap/bulk-override
  // Marks multiple tasks COMPLETE in a single request (completionMethod: BULK_OVERRIDE).
  // For users who completed tasks before finding LandedNZ.
  // Already-complete tasks are silently skipped. Unknown task IDs are silently ignored.
  app.post<{ Body: BulkOverrideRequest; Reply: BulkOverrideResponse }>(
    '/roadmap/bulk-override',
    { preHandler: authenticateRequest },
    async (request, reply) => {
      const { completedTaskIds } = request.body;
      const result = await bulkOverride(request.userId, completedTaskIds ?? []);
      reply.status(200).send(result);
    },
  );

  // GET /roadmap/tasks/:taskId
  // Returns full task detail for Layer 2 (expanded task card).
  // 403 if task is PREMIUM and user has no active subscription.
  // 404 if task not in user's roadmap.
  app.get<{ Params: { taskId: string }; Reply: TaskDetailResponse }>(
    '/roadmap/tasks/:taskId',
    { preHandler: authenticateRequest },
    async (request, reply) => {
      const { taskId } = request.params;
      const result = await getTaskDetail(request.userId, taskId);
      reply.status(200).send(result);
    },
  );

  // POST /admin/recalculate
  // Triggers full priority recalculation for all users' roadmap entries.
  // Uses today's currentDate so time-sensitive urgency bonuses stay accurate.
  // Protected by X-Admin-Key header (checked against ADMIN_API_KEY env var).
  // If ADMIN_API_KEY is not set, check is skipped (dev convenience).
  app.post<{ Reply: RecalculateResponse }>(
    '/admin/recalculate',
    async (request, reply) => {
      if (config.adminApiKey) {
        const key = request.headers['x-admin-key'];
        if (key !== config.adminApiKey) {
          reply.status(401).send({ error: 'UNAUTHORIZED', message: 'Invalid or missing X-Admin-Key' } as never);
          return;
        }
      }
      const result = await recalculateAllRoadmaps();
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

  // POST /roadmap/tasks/:taskId/reopen
  // Marks a done task not done (Undo / "Mark as not done"); open dependents re-block.
  // Idempotent: reopening a task that is not done changes nothing.
  app.post<{ Params: { taskId: string }; Reply: TaskReopenResponse }>(
    '/roadmap/tasks/:taskId/reopen',
    { preHandler: authenticateRequest },
    async (request, reply) => {
      const { taskId } = request.params;
      const result = await reopenTask(request.userId, taskId);
      reply.status(200).send(result);
    },
  );
}
