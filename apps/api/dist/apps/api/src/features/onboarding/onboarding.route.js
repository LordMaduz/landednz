"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerOnboardingRoutes = registerOnboardingRoutes;
const logger_1 = require("../../shared/logger");
const errors_1 = require("../../shared/errors");
const auth_1 = require("../../shared/middleware/auth");
const onboarding_service_1 = require("./onboarding.service");
const db_1 = require("../../shared/db");
function registerOnboardingRoutes(app) {
    // POST /onboarding/profile
    // Creates UserProfile + all applicable UserRoadmapEntry records synchronously.
    // Requires valid JWT — userId extracted by authenticateRequest preHandler.
    app.post('/onboarding/profile', { preHandler: auth_1.authenticateRequest }, async (request, reply) => {
        const { body } = request;
        // Validate required fields are present
        if (!body.visaType || !body.city || !body.familySituation || !body.occupation || !body.arrivalDate) {
            throw new errors_1.AppError('VALIDATION_ERROR', 'Missing required fields: visaType, city, familySituation, occupation, arrivalDate', 400);
        }
        // Check if profile already exists
        const existingProfile = await db_1.db.userProfile.findUnique({
            where: { userId: request.userId }
        });
        if (existingProfile) {
            throw new errors_1.AppError('PROFILE_EXISTS', 'Profile already exists. Use PATCH to update.', 409);
        }
        const result = await (0, onboarding_service_1.createProfile)(request.userId, body);
        logger_1.logger.info({ userId: request.userId, profileId: result.profileId }, 'Onboarding profile created');
        const response = {
            profileId: result.profileId,
            personaKey: result.personaKey,
            roadmapGenerated: result.roadmapGenerated,
        };
        reply.status(201).send(response);
    });
    // PATCH /onboarding/profile
    // Updates existing UserProfile and regenerates complete roadmap.
    // Only allowed from settings page (X-Request-Source header check).
    app.patch('/onboarding/profile', { preHandler: auth_1.authenticateRequest }, async (request, reply) => {
        const { body } = request;
        // Check request is from settings page
        if (request.headers['x-request-source'] !== 'settings-page') {
            throw new errors_1.AppError('UNAUTHORIZED', 'Profile updates only allowed from settings', 403);
        }
        // Validate required fields are present
        if (!body.visaType || !body.city || !body.familySituation || !body.occupation || !body.arrivalDate) {
            throw new errors_1.AppError('VALIDATION_ERROR', 'Missing required fields: visaType, city, familySituation, occupation, arrivalDate', 400);
        }
        // Check profile exists
        const existingProfile = await db_1.db.userProfile.findUnique({
            where: { userId: request.userId }
        });
        if (!existingProfile) {
            throw new errors_1.AppError('PROFILE_NOT_FOUND', 'No profile found. Use POST to create.', 404);
        }
        const result = await (0, onboarding_service_1.updateProfileAndRegenerateRoadmap)(request.userId, body);
        logger_1.logger.info({ userId: request.userId, profileId: result.profileId }, 'Profile updated and roadmap regenerated');
        const response = {
            profileId: result.profileId,
            personaKey: result.personaKey,
            roadmapRegenerated: true,
            entriesCreated: result.entriesCreated
        };
        reply.status(200).send(response);
    });
    // GET /onboarding/profile
    // Retrieves the current user's profile data for settings display
    app.get('/onboarding/profile', { preHandler: auth_1.authenticateRequest }, async (request, reply) => {
        const result = await (0, onboarding_service_1.getUserProfile)(request.userId);
        logger_1.logger.info({ userId: request.userId, profileId: result.profileId }, 'Profile retrieved');
        const response = result;
        reply.status(200).send(response);
    });
}
//# sourceMappingURL=onboarding.route.js.map