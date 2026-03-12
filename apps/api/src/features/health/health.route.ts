import { FastifyInstance } from 'fastify'
import { db } from '../../shared/db'
import { logger } from '../../shared/logger'

interface HealthResponse {
  status: 'ok'
  timestamp: string
  dbConnected: boolean
}

interface HealthErrorResponse {
  status: 'error'
  message: string
}

export function registerHealthRoutes(app: FastifyInstance): void {
  app.get('/health', async (_request, reply) => {
    try {
      // C10: $queryRaw can return BigInt — always apply replacer even when result is not returned
      const result = await db.$queryRaw<unknown[]>`SELECT 1`
      JSON.stringify(result, (_, v) => (typeof v === 'bigint' ? Number(v) : v))

      const response: HealthResponse = {
        status: 'ok',
        timestamp: new Date().toISOString(),
        dbConnected: true,
      }
      reply.status(200).send(response)
    } catch (err) {
      // Infrastructure failure — not a business logic failure, so not AppError (C13).
      // Returned directly as 503 with error message.
      logger.error({ err }, 'Health check: DB unreachable')
      const response: HealthErrorResponse = {
        status: 'error',
        message: 'Database unreachable',
      }
      reply.status(503).send(response)
    }
  })
}
