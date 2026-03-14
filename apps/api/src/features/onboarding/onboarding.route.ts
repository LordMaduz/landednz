import { FastifyInstance } from 'fastify';
import { logger } from '../../shared/logger';
import { AppError } from '../../shared/errors';
import { authenticateRequest } from '../../shared/middleware/auth';
import { createProfile } from './onboarding.service';
import type { CreateProfileRequest, CreateProfileResponse } from './onboarding.types';

export function registerOnboardingRoutes(app: FastifyInstance): void {
  // POST /onboarding/profile
  // Creates UserProfile + all applicable UserRoadmapEntry records synchronously.
  // Requires valid JWT — userId extracted by authenticateRequest preHandler.
  app.post<{ Body: CreateProfileRequest }>(
    '/onboarding/profile',
    { preHandler: authenticateRequest },
    async (request, reply) => {
      const { body } = request;

      // Validate required fields are present
      if (!body.visaType || !body.city || !body.familySituation || !body.occupation || !body.arrivalDate) {
        throw new AppError('VALIDATION_ERROR', 'Missing required fields: visaType, city, familySituation, occupation, arrivalDate', 400);
      }

      const result = await createProfile(request.userId, body);

      logger.info({ userId: request.userId, profileId: result.profileId }, 'Onboarding profile created');

      const response: CreateProfileResponse = {
        profileId: result.profileId,
        personaKey: result.personaKey,
        roadmapGenerated: result.roadmapGenerated,
      };

      reply.status(201).send(response);
    },
  );
}
