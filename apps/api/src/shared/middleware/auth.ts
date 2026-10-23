// Reusable Fastify auth middleware.
// Verifies Bearer JWT via JWKS (ES256, Supabase CLI v2+) and attaches userId to request.
// Used by all authenticated routes as a preHandler.

import { FastifyRequest, FastifyReply, FastifyInstance } from 'fastify';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import { config } from '../config.js';
import { logger } from '../logger.js';
import { AppError } from '../errors.js';

// Module augmentation — adds userId to FastifyRequest for all authenticated routes
declare module 'fastify' {
  interface FastifyRequest {
    userId: string;
  }
}

const JWKS = createRemoteJWKSet(new URL(`${config.supabaseUrl}/auth/v1/.well-known/jwks.json`));

// Registers the request decoration — must be called once on the Fastify instance
export function registerAuthDecoration(app: FastifyInstance): void {
  app.decorateRequest('userId', '');
}

// preHandler — extracts and verifies JWT, attaches userId to request
export async function authenticateRequest(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const authHeader = request.headers.authorization;

  if (!authHeader) {
    throw new AppError('INVALID_TOKEN', 'Missing Authorization header', 401);
  }

  const match = authHeader.match(/^Bearer\s+(.+)$/);
  if (!match) {
    throw new AppError('INVALID_TOKEN', 'Invalid Authorization header format', 401);
  }

  const token = match[1];

  let payload: any; // any: jose jwtVerify returns JWTPayload which needs extension access for sub
  try {
    const { payload: verifiedPayload } = await jwtVerify(token, JWKS);
    payload = verifiedPayload;
  } catch (err) {
    logger.warn({ err }, 'JWT verification failed in auth middleware');
    throw new AppError('INVALID_TOKEN', 'Invalid or expired JWT token', 401);
  }

  const userId = payload.sub as string;
  if (!userId) {
    throw new AppError('INVALID_TOKEN', 'JWT missing required sub claim', 401);
  }

  request.userId = userId;
}
