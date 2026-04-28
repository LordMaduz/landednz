"use strict";
// Chat routes — session creation and message streaming
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerChatRoutes = registerChatRoutes;
const db_1 = require("../../shared/db");
const logger_1 = require("../../shared/logger");
const errors_1 = require("../../shared/errors");
const config_1 = require("../../shared/config");
const auth_1 = require("../../shared/middleware/auth");
const service_1 = require("./service");
function registerChatRoutes(app) {
    // POST /chat/sessions
    // Creates a chat session and returns entry-point-specific opening message.
    // Requires auth + active subscription (chat is premium).
    app.post('/chat/sessions', { preHandler: auth_1.authenticateRequest }, async (request, reply) => {
        const { body } = request;
        // Validate required fields
        if (!body.entryPoint) {
            throw new errors_1.AppError('VALIDATION_ERROR', 'Missing required field: entryPoint', 400);
        }
        // TASK_CARD entry point requires taskContext
        if (body.entryPoint === 'TASK_CARD' && !body.taskContext) {
            throw new errors_1.AppError('VALIDATION_ERROR', 'TASK_CARD entry point requires taskContext', 400);
        }
        // Subscription gate — AC-4-13
        // Chat is a premium feature — check if user has active subscription
        // During beta, all users have premium access
        if (!config_1.config.betaMode) {
            const subscription = await db_1.db.subscription.findUnique({
                where: { userId: request.userId },
                select: { isActive: true },
            });
            if (!subscription?.isActive) {
                throw new errors_1.AppError('SUBSCRIPTION_REQUIRED', 'Active subscription required for chat', 403);
            }
        }
        // Create session via service
        const result = await (0, service_1.createChatSession)(request.userId, body.entryPoint, body.taskContext);
        logger_1.logger.info({
            userId: request.userId,
            sessionId: result.sessionId,
            entryPoint: body.entryPoint,
            taskContext: body.taskContext,
        }, 'Chat session created via route');
        const response = {
            sessionId: result.sessionId,
            openingMessage: result.openingMessage,
        };
        reply.status(201).send(response);
    });
    // POST /chat/sessions/:sessionId/messages
    // Streams assistant response as SSE events.
    // Implements 10-step pipeline per constitutional constraint C06.
    app.post('/chat/sessions/:sessionId/messages', { preHandler: auth_1.authenticateRequest }, async (request, reply) => {
        const { sessionId } = request.params;
        const { body } = request;
        // Validate required fields
        if (!body.content) {
            throw new errors_1.AppError('VALIDATION_ERROR', 'Missing required field: content', 400);
        }
        // Call service with reply for SSE streaming
        // SSE headers will be set inside service after validation
        await (0, service_1.sendMessage)(request.userId, sessionId, body.content, reply);
    });
}
//# sourceMappingURL=routes.js.map