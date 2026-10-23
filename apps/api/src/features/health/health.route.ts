import { FastifyInstance } from 'fastify'
import { db } from '../../shared/db.js'
import { logger } from '../../shared/logger.js'
import { config } from '../../shared/config.js'

interface HealthResponse {
  status: 'ok'
  timestamp: string
  dbConnected: boolean
  betaMode: boolean
}

interface HealthErrorResponse {
  status: 'error'
  message: string
}

export function registerHealthRoutes(app: FastifyInstance): void {
  // GET /config — public endpoint for frontend feature flags
  app.get('/config', async (_request, reply) => {
    reply.status(200).send({ betaMode: config.betaMode })
  })

  app.get('/health', async (_request, reply) => {
    try {
      // C10: $queryRaw can return BigInt — always apply replacer even when result is not returned
      const result = await db.$queryRaw<unknown[]>`SELECT 1`
      JSON.stringify(result, (_, v) => (typeof v === 'bigint' ? Number(v) : v))

      const response: HealthResponse = {
        status: 'ok',
        timestamp: new Date().toISOString(),
        dbConnected: true,
        betaMode: config.betaMode,
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
