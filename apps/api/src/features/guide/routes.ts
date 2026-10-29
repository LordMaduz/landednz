// Guide message routes: ask (SSE), cancel, retry. Validation and turn-start errors return JSON before the stream opens.
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { AppError } from '../../shared/errors.js';
import { authenticateRequest } from '../../shared/middleware/auth.js';
import { restartTurn, startTurn } from './turns.js';
import { cancelTurn, runTurn } from './service.js';

const askSchema = z.object({
  text: z.string().trim().min(1).max(2000),
  screen: z.object({ kind: z.enum(['home', 'roadmap', 'task']), taskKey: z.string().min(1).optional() }),
});

type IdParams = { Params: { id: string } };

export function registerGuideRoutes(app: FastifyInstance): void {
  app.post('/guide/messages', { preHandler: authenticateRequest }, async (request, reply) => {
    const body = askSchema.safeParse(request.body);
    if (!body.success) throw new AppError('VALIDATION_ERROR', 'Ask with text of 1 to 2,000 characters and a screen.', 400);
    const { text, screen } = body.data;
    const { userMessageId, assistantMessageId } = await startTurn(request.userId, text, screen);
    await runTurn({ userId: request.userId, reply, question: text, screen, ids: { userMessageId, assistantMessageId }, isRetry: false });
  });

  app.post<IdParams>('/guide/messages/:id/cancel', { preHandler: authenticateRequest }, async (request, reply) => {
    await cancelTurn(request.userId, request.params.id);
    reply.status(204).send();
  });

  app.post<IdParams>('/guide/messages/:id/retry', { preHandler: authenticateRequest }, async (request, reply) => {
    const assistantMessageId = request.params.id;
    const turn = await restartTurn(request.userId, assistantMessageId);
    await runTurn({
      userId: request.userId,
      reply,
      question: turn.question,
      screen: turn.screen,
      ids: { userMessageId: turn.userMessageId, assistantMessageId },
      isRetry: true,
    });
  });
}
