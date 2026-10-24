import { FastifyInstance } from 'fastify';
import { logger } from '../../shared/logger.js';
import { AppError } from '../../shared/errors.js';
import { authenticateRequest } from '../../shared/middleware/auth.js';
import { createProfile, updateProfileAndRegenerateRoadmap, getUserProfile } from './onboarding.service.js';
import { db } from '../../shared/db.js';
import { parsePreviewRequest, previewRoadmap } from './onboarding.preview.js';
import type { CreateProfileRequest, CreateProfileResponse, GetProfileResponse, OnboardingPreviewResponse } from './onboarding.types.js';

export function registerOnboardingRoutes(app: FastifyInstance): void {
  // POST /onboarding/preview
  // Public (no auth; the global per-IP rate limit applies). Returns the task list the five
  // answers would produce, so the preview before sign-up is the real roadmap.
  app.post<{ Reply: OnboardingPreviewResponse }>(
    '/onboarding/preview',
    async (request, reply) => {
      const answers = parsePreviewRequest(request.body);
      reply.status(200).send(await previewRoadmap(answers));
    },
  );

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

      // Check if profile already exists
      const existingProfile = await db.userProfile.findUnique({
        where: { userId: request.userId }
      });

      if (existingProfile) {
        throw new AppError('PROFILE_EXISTS', 'Profile already exists. Use PATCH to update.', 409);
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

  // PATCH /onboarding/profile
  // Updates existing UserProfile and regenerates complete roadmap.
  // Only allowed from settings page (X-Request-Source header check).
  app.patch<{ Body: CreateProfileRequest }>(
    '/onboarding/profile',
    { preHandler: authenticateRequest },
    async (request, reply) => {
      const { body } = request;

      // Check request is from settings page
      if (request.headers['x-request-source'] !== 'settings-page') {
        throw new AppError('UNAUTHORIZED', 'Profile updates only allowed from settings', 403);
      }

      // Validate required fields are present
      if (!body.visaType || !body.city || !body.familySituation || !body.occupation || !body.arrivalDate) {
        throw new AppError('VALIDATION_ERROR', 'Missing required fields: visaType, city, familySituation, occupation, arrivalDate', 400);
      }

      // Check profile exists
      const existingProfile = await db.userProfile.findUnique({
        where: { userId: request.userId }
      });

      if (!existingProfile) {
        throw new AppError('PROFILE_NOT_FOUND', 'No profile found. Use POST to create.', 404);
      }

      const result = await updateProfileAndRegenerateRoadmap(request.userId, body);

      logger.info({ userId: request.userId, profileId: result.profileId }, 'Profile updated and roadmap regenerated');

      const response = {
        profileId: result.profileId,
        personaKey: result.personaKey,
        roadmapRegenerated: true,
        entriesCreated: result.entriesCreated
      };

      reply.status(200).send(response);
    },
  );

  // GET /onboarding/profile
  // Retrieves the current user's profile data for settings display
  app.get(
    '/onboarding/profile',
    { preHandler: authenticateRequest },
    async (request, reply) => {
      const result = await getUserProfile(request.userId);

      logger.info({ userId: request.userId, profileId: result.profileId }, 'Profile retrieved');

      const response: GetProfileResponse = result;

      reply.status(200).send(response);
    },
  );
}
