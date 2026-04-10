// Load environment variables from .env.local first
import { config as loadDotenv } from 'dotenv'
loadDotenv({ path: '.env.local' })

import Fastify from 'fastify'
import { config } from './shared/config'
import { logger } from './shared/logger'
import { db } from './shared/db'
import { registerErrorHandler } from './shared/plugins/error-handler'
import { registerHealthRoutes } from './features/health/health.route'
import { registerAuthRoutes } from './features/auth/auth.route'
import { registerOnboardingRoutes } from './features/onboarding/onboarding.route'
import { registerRoadmapRoutes } from './features/roadmap/roadmap.route'
import { registerChatRoutes } from './features/chat/routes'
import { registerAuthDecoration } from './shared/middleware/auth'

export function buildApp() {
  const app = Fastify({ logger: false })

  // Enable CORS for browser requests from web app
  app.register(require('@fastify/cors'), {
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true,
  })

  registerErrorHandler(app)
  registerAuthDecoration(app) // must register before any route that uses authenticateRequest
  registerHealthRoutes(app)
  registerAuthRoutes(app)
  registerOnboardingRoutes(app)
  registerRoadmapRoutes(app)
  registerChatRoutes(app)

  return app
}

async function start() {
  const app = buildApp()

  // Graceful shutdown — disconnect Prisma before exit to avoid connection pool leak on Railway.
  const shutdown = async () => {
    logger.info('Shutting down server')
    await db.$disconnect()
    process.exit(0)
  }
  process.on('SIGTERM', shutdown)
  process.on('SIGINT', shutdown)

  try {
    await app.listen({ port: config.port, host: '0.0.0.0' })
    logger.info({ port: config.port }, 'Server listening')
  } catch (err) {
    logger.error({ err }, 'Failed to start server')
    process.exit(1)
  }
}

start()
