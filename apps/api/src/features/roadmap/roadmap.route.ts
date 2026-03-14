import { FastifyInstance } from 'fastify';
import { authenticateRequest } from '../../shared/middleware/auth';
import { getRoadmap } from './roadmap.service';
import type { RoadmapResponse } from './roadmap.types';

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
}
