// Chat routes — session creation and message streaming

import { FastifyInstance } from 'fastify';
import { db } from '../../shared/db';
import { logger } from '../../shared/logger';
import { AppError } from '../../shared/errors';
import { authenticateRequest } from '../../shared/middleware/auth';
import { createChatSession } from './service';
import type { CreateSessionRequest, CreateSessionResponse } from './chat.types';

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
      const subscription = await db.subscription.findUnique({
        where: { userId: request.userId },
        select: { isActive: true },
      });

      if (!subscription?.isActive) {
        throw new AppError('SUBSCRIPTION_REQUIRED', 'Active subscription required for chat', 403);
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
}