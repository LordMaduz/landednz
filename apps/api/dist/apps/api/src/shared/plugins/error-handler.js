"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerErrorHandler = registerErrorHandler;
const errors_1 = require("../errors");
const logger_1 = require("../logger");
// Global error handler for Fastify.
// Handles AppError (business logic) → maps to typed HTTP response.
// Handles unexpected errors → 500.
// AIFailureError is caught INSIDE the chat service and never reaches here.
function registerErrorHandler(app) {
    app.setErrorHandler((error, _request, reply) => {
        if (error instanceof errors_1.AppError) {
            logger_1.logger.warn({ code: error.code, statusCode: error.statusCode }, error.message);
            reply.status(error.statusCode).send({ error: error.code, message: error.message });
            return;
        }
        logger_1.logger.error({ err: error }, 'Unhandled error');
        reply.status(500).send({ error: 'INTERNAL_ERROR', message: 'An unexpected error occurred' });
    });
}
//# sourceMappingURL=error-handler.js.map