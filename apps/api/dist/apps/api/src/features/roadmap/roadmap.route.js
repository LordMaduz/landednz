"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerRoadmapRoutes = registerRoadmapRoutes;
const auth_1 = require("../../shared/middleware/auth");
const roadmap_service_1 = require("./roadmap.service");
const roadmap_recalculate_1 = require("./roadmap.recalculate");
const config_1 = require("../../shared/config");
function registerRoadmapRoutes(app) {
    // GET /roadmap
    // Returns the authenticated user's personalised roadmap:
    //   topThree — top 3 non-complete, non-blocked tasks by priorityScore DESC
    //   phases   — all tasks grouped by phase
    //   lastComputedAt — ISO timestamp of last roadmap computation
    app.get('/roadmap', { preHandler: auth_1.authenticateRequest }, async (request, reply) => {
        const result = await (0, roadmap_service_1.getRoadmap)(request.userId);
        reply.status(200).send(result);
    });
    // POST /roadmap/bulk-override
    // Marks multiple tasks COMPLETE in a single request (completionMethod: BULK_OVERRIDE).
    // For users who completed tasks before finding LandedNZ.
    // Already-complete tasks are silently skipped. Unknown task IDs are silently ignored.
    app.post('/roadmap/bulk-override', { preHandler: auth_1.authenticateRequest }, async (request, reply) => {
        const { completedTaskIds } = request.body;
        const result = await (0, roadmap_service_1.bulkOverride)(request.userId, completedTaskIds ?? []);
        reply.status(200).send(result);
    });
    // GET /roadmap/tasks/:taskId
    // Returns full task detail for Layer 2 (expanded task card).
    // 403 if task is PREMIUM and user has no active subscription.
    // 404 if task not in user's roadmap.
    app.get('/roadmap/tasks/:taskId', { preHandler: auth_1.authenticateRequest }, async (request, reply) => {
        const { taskId } = request.params;
        const result = await (0, roadmap_service_1.getTaskDetail)(request.userId, taskId);
        reply.status(200).send(result);
    });
    // POST /admin/recalculate
    // Triggers full priority recalculation for all users' roadmap entries.
    // Uses today's currentDate so time-sensitive urgency bonuses stay accurate.
    // Protected by X-Admin-Key header (checked against ADMIN_API_KEY env var).
    // If ADMIN_API_KEY is not set, check is skipped (dev convenience).
    app.post('/admin/recalculate', async (request, reply) => {
        if (config_1.config.adminApiKey) {
            const key = request.headers['x-admin-key'];
            if (key !== config_1.config.adminApiKey) {
                reply.status(401).send({ error: 'UNAUTHORIZED', message: 'Invalid or missing X-Admin-Key' });
                return;
            }
        }
        const result = await (0, roadmap_recalculate_1.recalculateAllRoadmaps)();
        reply.status(200).send(result);
    });
    // POST /roadmap/tasks/:taskId/complete
    // Marks a task COMPLETE, triggers targeted recomputation for affected dependents.
    // Returns updated topThree and list of newly unblocked task IDs.
    app.post('/roadmap/tasks/:taskId/complete', { preHandler: auth_1.authenticateRequest }, async (request, reply) => {
        const { taskId } = request.params;
        const result = await (0, roadmap_service_1.completeTask)(request.userId, taskId);
        reply.status(200).send(result);
    });
}
//# sourceMappingURL=roadmap.route.js.map