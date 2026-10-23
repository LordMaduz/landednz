import { FastifyError, FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { AppError } from '../errors.js'
import { logger } from '../logger.js'

// Global error handler for Fastify.
// Handles AppError (business logic) → maps to typed HTTP response.
// Handles unexpected errors → 500.
// AIFailureError is caught INSIDE the chat service and never reaches here.
export function registerErrorHandler(app: FastifyInstance): void {
  app.setErrorHandler(
    (error: FastifyError | AppError | Error, _request: FastifyRequest, reply: FastifyReply) => {
      if (error instanceof AppError) {
        logger.warn({ code: error.code, statusCode: error.statusCode }, error.message)
        reply.status(error.statusCode).send({ error: error.code, message: error.message })
        return
      }

      logger.error({ err: error }, 'Unhandled error')
      reply.status(500).send({ error: 'INTERNAL_ERROR', message: 'An unexpected error occurred' })
    },
  )
}
