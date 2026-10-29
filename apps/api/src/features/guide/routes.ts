// Guide routes: ask (SSE), cancel, retry, plus history, opening and memories. Validation and turn-start errors return JSON before the stream opens.
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { AppError } from '../../shared/errors.js';
import { authenticateRequest } from '../../shared/middleware/auth.js';
import { getConversation, getOpening, getTaskMessages } from './history.js';
import { deleteMemory, listMemories, updateMemory } from './memories.js';
import { restartTurn, startTurn } from './turns.js';
import { cancelTurn, runTurn } from './service.js';

const askSchema = z.object({
  text: z.string().trim().min(1).max(2000),
  screen: z.object({ kind: z.enum(['home', 'roadmap', 'task']), taskKey: z.string().min(1).max(16).optional() }),
});

const conversationQuery = z.object({
  before: z.string().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

const openingQuery = z.object({ screen: z.enum(['home', 'roadmap', 'task']), taskKey: z.string().min(1).max(16).optional() });

const memoryBody = z.object({ text: z.string() });

function parse<T>(schema: z.ZodType<T>, value: unknown): T {
  const r = schema.safeParse(value);
  if (!r.success) throw new AppError('VALIDATION_ERROR', r.error.issues[0]?.message ?? 'Invalid request', 400);
  return r.data;
}

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

  app.get('/guide/conversation', { preHandler: authenticateRequest }, async (request) => {
    const { before, limit } = parse(conversationQuery, request.query);
    return getConversation(request.userId, before ?? null, limit);
  });

  app.get<{ Params: { taskKey: string } }>('/guide/conversation/task/:taskKey', { preHandler: authenticateRequest }, async (request) =>
    getTaskMessages(request.userId, request.params.taskKey),
  );

  app.get('/guide/opening', { preHandler: authenticateRequest }, async (request) => {
    const { screen, taskKey } = parse(openingQuery, request.query);
    return getOpening(request.userId, { kind: screen, ...(taskKey ? { taskKey } : {}) });
  });

  app.get('/guide/memories', { preHandler: authenticateRequest }, async (request) => listMemories(request.userId));

  app.patch<IdParams>('/guide/memories/:id', { preHandler: authenticateRequest }, async (request) =>
    updateMemory(request.userId, request.params.id, parse(memoryBody, request.body).text),
  );

  app.delete<IdParams>('/guide/memories/:id', { preHandler: authenticateRequest }, async (request, reply) => {
    await deleteMemory(request.userId, request.params.id);
    reply.status(204).send();
  });
}
