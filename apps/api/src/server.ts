import Fastify from 'fastify'
import cors from '@fastify/cors'
import { config } from './shared/config.js'
import { logger } from './shared/logger.js'
import { db } from './shared/db.js'
import { registerErrorHandler } from './shared/plugins/error-handler.js'
import { registerHealthRoutes } from './features/health/health.route.js'
import { registerAuthRoutes } from './features/auth/auth.route.js'
import { registerOnboardingRoutes } from './features/onboarding/onboarding.route.js'
import { registerRoadmapRoutes } from './features/roadmap/roadmap.route.js'
import { registerChatRoutes } from './features/chat/routes.js'
import { registerAuthDecoration } from './shared/middleware/auth.js'

export function buildApp() {
  const app = Fastify({ logger: false })

  // Enable CORS for browser requests from web app
  app.register(cors, {
    origin: config.corsOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
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
