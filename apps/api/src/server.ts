import './instrument.js'
import * as Sentry from '@sentry/node'
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
import { registerGuideRoutes } from './features/guide/routes.js'
import { startSweeper } from './features/guide/sweeper.js'
import { warmUnderstand } from './features/guide/understand.js'
import { registerAccountRoutes } from './features/account/account.route.js'
import { registerAuthDecoration } from './shared/middleware/auth.js'
import { registerRateLimit } from './shared/rate-limit.js'
import { loadContent } from './content/index.js'
import { checkStoredTaskIds } from './content/integrity.js'

export async function buildApp() {
  const app = Fastify({
    logger: false,
    // Fastify 5 treats a numeric trustProxy as "trust nobody", so trust exactly one hop with a function:
    // req.ip is then the address the platform proxy appended, which a client cannot forge
    trustProxy: config.trustProxy ? (_addr, hop) => hop < 1 : false,
  })

  // Reports unexpected 5xx errors; the error handler below still shapes the response
  if (config.sentryDsn) Sentry.setupFastifyErrorHandler(app)

  // Enable CORS for browser requests from web app
  app.register(cors, {
    origin: config.corsOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  })

  registerErrorHandler(app)
  await registerRateLimit(app) // before routes, so the global limit attaches to each
  registerAuthDecoration(app) // must register before any route that uses authenticateRequest
  registerHealthRoutes(app)
  registerAuthRoutes(app)
  registerOnboardingRoutes(app)
  registerRoadmapRoutes(app)
  registerChatRoutes(app)
  registerGuideRoutes(app)
  registerAccountRoutes(app)

  return app
}

async function start() {
  try {
    await loadContent()
  } catch (err) {
    logger.error({ err }, 'Failed to load content')
    process.exit(1)
  }

  // Never blocks start-up: unknown ids are logged as warnings by the check itself
  checkStoredTaskIds().then(
    ({ unknown, retired }) => logger.info({ unknown: unknown.length, retired: retired.length }, 'Stored task ids checked'),
    (err) => logger.error({ err }, 'Stored task id check failed'),
  )

  const app = await buildApp()

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
    startSweeper()
    // Takes the slow first structured-output compile off the first question; warmUnderstand never throws
    if (config.aiMode === 'live') void warmUnderstand()
  } catch (err) {
    logger.error({ err }, 'Failed to start server')
    process.exit(1)
  }
}

start()
