import { FastifyInstance } from 'fastify'
import { logger } from '../../shared/logger'
import { AppError } from '../../shared/errors'
import type { AuthVerifyResponse } from '../../shared/types'
import { verifyAndUpsertUser } from './auth.service'

export function registerAuthRoutes(app: FastifyInstance): void {
  app.post('/auth/verify', async (request, reply) => {
    // Extract Authorization header
    const authHeader = request.headers.authorization

    if (!authHeader) {
      throw new AppError('INVALID_TOKEN', 'Missing Authorization header', 401)
    }

    // Extract Bearer token
    const match = authHeader.match(/^Bearer\s+(.+)$/)
    if (!match) {
      throw new AppError('INVALID_TOKEN', 'Invalid Authorization header format', 401)
    }

    const token = match[1]

    // Verify JWT and upsert user — throws AppError on failure
    const result = await verifyAndUpsertUser(token)

    logger.info(
      { userId: result.userId, isNewUser: result.isNewUser, hasProfile: result.hasProfile },
      'Auth verification successful',
    )

    const response: AuthVerifyResponse = {
      userId: result.userId,
      email: result.email,
      isNewUser: result.isNewUser,
      hasProfile: result.hasProfile,
    }

    reply.status(200).send(response)
  })
}