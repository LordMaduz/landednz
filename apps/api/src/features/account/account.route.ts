import { FastifyInstance } from 'fastify';
import { authenticateRequest } from '../../shared/middleware/auth.js';
import { deleteAccount } from './account.service.js';

export function registerAccountRoutes(app: FastifyInstance): void {
  // DELETE /account
  // Deletes the user's rows and their Supabase auth user. 204 on success;
  // 401 when the token's account no longer exists.
  app.delete(
    '/account',
    { preHandler: authenticateRequest },
    async (request, reply) => {
      await deleteAccount(request.userId);
      reply.status(204).send();
    },
  );
}
