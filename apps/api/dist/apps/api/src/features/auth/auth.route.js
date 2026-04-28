"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerAuthRoutes = registerAuthRoutes;
const logger_1 = require("../../shared/logger");
const errors_1 = require("../../shared/errors");
const auth_service_1 = require("./auth.service");
function registerAuthRoutes(app) {
    app.post('/auth/verify', async (request, reply) => {
        // Extract Authorization header
        const authHeader = request.headers.authorization;
        if (!authHeader) {
            throw new errors_1.AppError('INVALID_TOKEN', 'Missing Authorization header', 401);
        }
        // Extract Bearer token
        const match = authHeader.match(/^Bearer\s+(.+)$/);
        if (!match) {
            throw new errors_1.AppError('INVALID_TOKEN', 'Invalid Authorization header format', 401);
        }
        const token = match[1];
        // Verify JWT and upsert user — throws AppError on failure
        const result = await (0, auth_service_1.verifyAndUpsertUser)(token);
        logger_1.logger.info({ userId: result.userId, isNewUser: result.isNewUser, hasProfile: result.hasProfile }, 'Auth verification successful');
        const response = {
            userId: result.userId,
            email: result.email,
            isNewUser: result.isNewUser,
            hasProfile: result.hasProfile,
        };
        reply.status(200).send(response);
    });
}
//# sourceMappingURL=auth.route.js.map