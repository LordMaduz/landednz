import type { FastifyInstance } from 'fastify'
import rateLimit from '@fastify/rate-limit'
import { AppError } from './errors.js'
import { config } from './config.js'

// Global per-IP limit. Must be awaited before routes register so it attaches to every route.
// /health is exempt: monitoring polls it and it keeps free Supabase projects awake.
export async function registerRateLimit(app: FastifyInstance): Promise<void> {
  await app.register(rateLimit, {
    global: true,
    max: config.rateLimitPerMinute,
    timeWindow: '1 minute',
    allowList: (request) => request.routeOptions.url === '/health',
    // Thrown into the global error handler, which renders AppError as { error, message }
    errorResponseBuilder: (_request, context) =>
      new AppError('RATE_LIMITED', `Too many requests. Try again in ${context.after}.`, 429),
  })
}
