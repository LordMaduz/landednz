"use strict";
// Reusable Fastify auth middleware.
// Verifies Bearer JWT via JWKS (ES256, Supabase CLI v2+) and attaches userId to request.
// Used by all authenticated routes as a preHandler.
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerAuthDecoration = registerAuthDecoration;
exports.authenticateRequest = authenticateRequest;
const jose_1 = require("jose");
const config_1 = require("../config");
const logger_1 = require("../logger");
const errors_1 = require("../errors");
const JWKS = (0, jose_1.createRemoteJWKSet)(new URL(`${config_1.config.supabaseUrl}/auth/v1/.well-known/jwks.json`));
// Registers the request decoration — must be called once on the Fastify instance
function registerAuthDecoration(app) {
    app.decorateRequest('userId', '');
}
// preHandler — extracts and verifies JWT, attaches userId to request
async function authenticateRequest(request, reply) {
    const authHeader = request.headers.authorization;
    if (!authHeader) {
        throw new errors_1.AppError('INVALID_TOKEN', 'Missing Authorization header', 401);
    }
    const match = authHeader.match(/^Bearer\s+(.+)$/);
    if (!match) {
        throw new errors_1.AppError('INVALID_TOKEN', 'Invalid Authorization header format', 401);
    }
    const token = match[1];
    let payload; // any: jose jwtVerify returns JWTPayload which needs extension access for sub
    try {
        const { payload: verifiedPayload } = await (0, jose_1.jwtVerify)(token, JWKS);
        payload = verifiedPayload;
    }
    catch (err) {
        logger_1.logger.warn({ err }, 'JWT verification failed in auth middleware');
        throw new errors_1.AppError('INVALID_TOKEN', 'Invalid or expired JWT token', 401);
    }
    const userId = payload.sub;
    if (!userId) {
        throw new errors_1.AppError('INVALID_TOKEN', 'JWT missing required sub claim', 401);
    }
    request.userId = userId;
}
//# sourceMappingURL=auth.js.map