"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyAndUpsertUser = verifyAndUpsertUser;
const jose_1 = require("jose");
const library_1 = require("@prisma/client/runtime/library");
const config_1 = require("../../shared/config");
const db_1 = require("../../shared/db");
const logger_1 = require("../../shared/logger");
const errors_1 = require("../../shared/errors");
// JWKS endpoint for JWT verification
const JWKS = (0, jose_1.createRemoteJWKSet)(new URL(`${config_1.config.supabaseUrl}/auth/v1/.well-known/jwks.json`));
async function verifyAndUpsertUser(token) {
    let payload; // any: jose jwtVerify returns JWTPayload which needs extension access for email/sub
    try {
        // Verify JWT using ES256 JWKS (not HS256 secret)
        const { payload: verifiedPayload } = await (0, jose_1.jwtVerify)(token, JWKS);
        payload = verifiedPayload;
    }
    catch (err) {
        // All JWT verification errors → INVALID_TOKEN
        logger_1.logger.warn({ err }, 'JWT verification failed');
        throw new errors_1.AppError('INVALID_TOKEN', 'Invalid or expired JWT token', 401);
    }
    // Extract required claims
    const userId = payload.sub;
    const email = payload.email;
    if (!userId || !email) {
        throw new errors_1.AppError('INVALID_TOKEN', 'JWT missing required claims (sub, email)', 401);
    }
    // Attempt to create user — if exists, catch Prisma P2002
    let isNewUser = false;
    try {
        await db_1.db.user.create({
            data: {
                id: userId,
                email: email,
            },
        });
        isNewUser = true;
        logger_1.logger.info({ userId, email }, 'New user created from JWT');
    }
    catch (err) {
        if (err instanceof library_1.PrismaClientKnownRequestError && err.code === 'P2002') {
            // Unique constraint violation — user already exists
            isNewUser = false;
            logger_1.logger.debug({ userId }, 'User already exists');
        }
        else {
            // Unexpected DB error
            logger_1.logger.error({ err, userId }, 'User creation failed');
            throw err;
        }
    }
    // Check if user has profile
    const profileCount = await db_1.db.userProfile.count({
        where: { userId },
    });
    const hasProfile = profileCount > 0;
    return {
        userId,
        email,
        isNewUser,
        hasProfile,
    };
}
//# sourceMappingURL=auth.service.js.map