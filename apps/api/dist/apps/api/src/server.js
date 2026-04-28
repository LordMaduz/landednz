"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildApp = buildApp;
// Load environment variables from .env.local first
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)({ path: '.env.local' });
const fastify_1 = __importDefault(require("fastify"));
const config_1 = require("./shared/config");
const logger_1 = require("./shared/logger");
const db_1 = require("./shared/db");
const error_handler_1 = require("./shared/plugins/error-handler");
const health_route_1 = require("./features/health/health.route");
const auth_route_1 = require("./features/auth/auth.route");
const onboarding_route_1 = require("./features/onboarding/onboarding.route");
const roadmap_route_1 = require("./features/roadmap/roadmap.route");
const routes_1 = require("./features/chat/routes");
const auth_1 = require("./shared/middleware/auth");
function buildApp() {
    const app = (0, fastify_1.default)({ logger: false });
    // Enable CORS for browser requests from web app
    app.register(require('@fastify/cors'), {
        origin: config_1.config.corsOrigin,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    });
    (0, error_handler_1.registerErrorHandler)(app);
    (0, auth_1.registerAuthDecoration)(app); // must register before any route that uses authenticateRequest
    (0, health_route_1.registerHealthRoutes)(app);
    (0, auth_route_1.registerAuthRoutes)(app);
    (0, onboarding_route_1.registerOnboardingRoutes)(app);
    (0, roadmap_route_1.registerRoadmapRoutes)(app);
    (0, routes_1.registerChatRoutes)(app);
    return app;
}
async function start() {
    const app = buildApp();
    // Graceful shutdown — disconnect Prisma before exit to avoid connection pool leak on Railway.
    const shutdown = async () => {
        logger_1.logger.info('Shutting down server');
        await db_1.db.$disconnect();
        process.exit(0);
    };
    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
    try {
        await app.listen({ port: config_1.config.port, host: '0.0.0.0' });
        logger_1.logger.info({ port: config_1.config.port }, 'Server listening');
    }
    catch (err) {
        logger_1.logger.error({ err }, 'Failed to start server');
        process.exit(1);
    }
}
start();
//# sourceMappingURL=server.js.map