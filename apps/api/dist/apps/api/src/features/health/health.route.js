"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerHealthRoutes = registerHealthRoutes;
const db_1 = require("../../shared/db");
const logger_1 = require("../../shared/logger");
function registerHealthRoutes(app) {
    app.get('/health', async (_request, reply) => {
        try {
            // C10: $queryRaw can return BigInt — always apply replacer even when result is not returned
            const result = await db_1.db.$queryRaw `SELECT 1`;
            JSON.stringify(result, (_, v) => (typeof v === 'bigint' ? Number(v) : v));
            const response = {
                status: 'ok',
                timestamp: new Date().toISOString(),
                dbConnected: true,
            };
            reply.status(200).send(response);
        }
        catch (err) {
            // Infrastructure failure — not a business logic failure, so not AppError (C13).
            // Returned directly as 503 with error message.
            logger_1.logger.error({ err }, 'Health check: DB unreachable');
            const response = {
                status: 'error',
                message: 'Database unreachable',
            };
            reply.status(503).send(response);
        }
    });
}
//# sourceMappingURL=health.route.js.map