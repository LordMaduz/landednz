// Chat routes — session creation and message streaming

import { FastifyInstance } from 'fastify';
import { db } from '../../shared/db.js';
import { logger } from '../../shared/logger.js';
import { AppError } from '../../shared/errors.js';
import { config } from '../../shared/config.js';
import { authenticateRequest } from '../../shared/middleware/auth.js';
import { createChatSession, sendMessage } from './service.js';
import type { CreateSessionRequest, CreateSessionResponse, SendMessageRequest } from './chat.types.js';

export function registerChatRoutes(app: FastifyInstance): void {
  // POST /chat/sessions
  // Creates a chat session and returns entry-point-specific opening message.
  // Requires auth + active subscription (chat is premium).
  app.post<{ Body: CreateSessionRequest }>(
    '/chat/sessions',
    { preHandler: authenticateRequest },
    async (request, reply) => {
      const { body } = request;

      // Validate required fields
      if (!body.entryPoint) {
        throw new AppError('VALIDATION_ERROR', 'Missing required field: entryPoint', 400);
      }

      // TASK_CARD entry point requires taskContext
      if (body.entryPoint === 'TASK_CARD' && !body.taskContext) {
        throw new AppError('VALIDATION_ERROR', 'TASK_CARD entry point requires taskContext', 400);
      }

      // Subscription gate — AC-4-13
      // Chat is a premium feature — check if user has active subscription
      // During beta, all users have premium access
      if (!config.betaMode) {
        const subscription = await db.subscription.findUnique({
          where: { userId: request.userId },
          select: { isActive: true },
        });

        if (!subscription?.isActive) {
          throw new AppError('SUBSCRIPTION_REQUIRED', 'Active subscription required for chat', 403);
        }
      }

      // Create session via service
      const result = await createChatSession(
        request.userId,
        body.entryPoint,
        body.taskContext,
      );

      logger.info(
        {
          userId: request.userId,
          sessionId: result.sessionId,
          entryPoint: body.entryPoint,
          taskContext: body.taskContext,
        },
        'Chat session created via route',
      );

      const response: CreateSessionResponse = {
        sessionId: result.sessionId,
        openingMessage: result.openingMessage,
      };

      reply.status(201).send(response);
    },
  );

  // POST /chat/sessions/:sessionId/messages
  // Streams assistant response as SSE events.
  // Implements 10-step pipeline per constitutional constraint C06.
  app.post<{ Params: { sessionId: string }; Body: SendMessageRequest }>(
    '/chat/sessions/:sessionId/messages',
    { preHandler: authenticateRequest },
    async (request, reply) => {
      const { sessionId } = request.params;
      const { body } = request;

      // Validate required fields
      if (!body.content) {
        throw new AppError('VALIDATION_ERROR', 'Missing required field: content', 400);
      }

      // Call service with reply for SSE streaming
      // SSE headers will be set inside service after validation
      await sendMessage(request.userId, sessionId, body.content, reply);
    },
  );
}