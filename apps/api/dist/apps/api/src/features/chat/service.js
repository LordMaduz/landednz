"use strict";
// Chat service — session creation and management
// Zero imports from features/roadmap/ per constitutional constraint C01
Object.defineProperty(exports, "__esModule", { value: true });
exports.createChatSession = createChatSession;
exports.sendMessage = sendMessage;
const db_1 = require("../../shared/db");
const errors_1 = require("../../shared/errors");
const logger_1 = require("../../shared/logger");
const registry_1 = require("../../core/prompts/registry");
const claude_client_1 = require("../../shared/ai/claude.client");
const level1_1 = require("./guardrails/level1");
const level2_1 = require("./guardrails/level2");
const retrieval_1 = require("./rag/retrieval");
async function createChatSession(userId, entryPoint, taskContext) {
    // Fetch user profile + completed task count
    const user = await db_1.db.user.findUnique({
        where: { id: userId },
        include: {
            profile: true,
        },
    });
    if (!user) {
        throw new errors_1.AppError('USER_NOT_FOUND', 'User not found', 404);
    }
    if (!user.profile) {
        throw new errors_1.AppError('PROFILE_NOT_FOUND', 'User profile not found', 404);
    }
    // Count completed roadmap entries
    const completedTaskCount = await db_1.db.userRoadmapEntry.count({
        where: {
            userId,
            status: 'COMPLETE',
        },
    });
    // Fetch task name if TASK_CARD or EMAIL_DEEPLINK entry point
    let taskContextData = null;
    if ((entryPoint === 'TASK_CARD' || entryPoint === 'EMAIL_DEEPLINK') && taskContext) {
        const task = await db_1.db.task.findUnique({
            where: { id: taskContext },
            select: { name: true },
        });
        if (!task) {
            throw new errors_1.AppError('TASK_NOT_FOUND', `Task ${taskContext} not found`, 404);
        }
        taskContextData = { taskName: task.name };
    }
    // Create ChatSession record
    const session = await db_1.db.chatSession.create({
        data: {
            userId,
            entryPoint,
            taskContext,
        },
    });
    // Build opening message via registry
    const openingMessage = (0, registry_1.buildChatOpeningMessage)(entryPoint, {
        name: user.name,
        profile: {
            visaType: user.profile.visaType,
            familySituation: user.profile.familySituation,
            city: user.profile.city,
            occupation: user.profile.occupation,
        },
        completedTaskCount,
    }, taskContextData);
    logger_1.logger.info({
        sessionId: session.id,
        userId,
        entryPoint,
        taskContext,
    }, 'Chat session created');
    return {
        sessionId: session.id,
        openingMessage,
    };
}
async function sendMessage(userId, sessionId, content, reply) {
    // Session ownership check
    const session = await db_1.db.chatSession.findUnique({
        where: { id: sessionId },
        include: {
            user: {
                include: {
                    profile: true,
                },
            },
        },
    });
    if (!session) {
        throw new errors_1.AppError('SESSION_NOT_FOUND', 'Chat session not found', 404);
    }
    if (session.userId !== userId) {
        throw new errors_1.AppError('SESSION_ACCESS_DENIED', 'Chat session access denied', 403);
    }
    if (!session.user.profile) {
        throw new errors_1.AppError('PROFILE_NOT_FOUND', 'User profile not found', 404);
    }
    // Set up SSE headers (C14) after validation — reply.raw required, never reply.send()
    // Prevent Railway 30s timeout (skip in test environment)
    if (process.env.NODE_ENV !== 'test' && reply.raw.setTimeout) {
        try {
            reply.raw.setTimeout(0);
        }
        catch (error) {
            // Ignore setTimeout errors in test environment
        }
    }
    reply.raw.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no',
        // CORS headers (manually added because reply.raw bypasses @fastify/cors plugin)
        'Access-Control-Allow-Origin': 'http://localhost:3000',
        'Access-Control-Allow-Credentials': 'true',
    });
    try {
        // 10-step pipeline (exact C06 order — Level 1 at step 2, Level 2 at step 9)
        // Step 1: Persist user message
        const userMessage = await db_1.db.chatMessage.create({
            data: {
                sessionId,
                role: 'USER',
                content,
            },
        });
        // Step 2: Run Level 1 guardrail
        const level1Result = (0, level1_1.runLevel1Guardrail)(content);
        // Step 3: Fetch conversation history (this session's messages)
        const history = await db_1.db.chatMessage.findMany({
            where: { sessionId },
            orderBy: { createdAt: 'asc' },
            select: { role: true, content: true },
        });
        const historyMessages = history.map(msg => ({
            role: msg.role.toLowerCase(),
            content: msg.content,
        }));
        // Step 4: RAG retrieval — replaces Phase 4 DB placeholder (C07, C13)
        // Runs for ALL messages regardless of entry point — query drives retrieval.
        let retrievedChunksResult = [];
        try {
            retrievedChunksResult = await (0, retrieval_1.retrieveChunks)({
                query: content,
                personaKey: session.user.profile.personaKey,
                visaType: session.user.profile.visaType,
                city: session.user.profile.city,
                taskContext: session.taskContext,
            });
        }
        catch (error) {
            // C13: embeddings.client.ts does NOT wrap OpenAI errors as AIFailureError.
            // SSE headers already sent — must convert here so outer catch emits SSE error event.
            throw new errors_1.AIFailureError(`RAG retrieval failed: ${error instanceof Error ? error.message : String(error)}`);
        }
        const kbChunks = retrievedChunksResult.map(chunk => ({
            chunkKey: chunk.chunkKey,
            personaKey: session.user.profile.personaKey,
            content: chunk.content,
            sourceName: chunk.sourceName,
            sourceUrl: chunk.sourceUrl,
        }));
        // Fetch taskName + consequenceLine separately — Component 2 task context, not Component 6 KB
        let taskName = null;
        let consequenceLine = null;
        if (session.taskContext) {
            const task = await db_1.db.task.findUnique({
                where: { id: session.taskContext },
                select: { name: true },
            });
            taskName = task?.name ?? null;
            const variant = await db_1.db.taskContentVariant.findFirst({
                where: {
                    taskId: session.taskContext,
                    personaKey: session.user.profile.personaKey,
                },
                select: { consequenceLine: true },
            });
            consequenceLine = variant?.consequenceLine ?? null;
        }
        // Calculate arrival days ago
        const arrivalDaysAgo = Math.floor((new Date().getTime() - session.user.profile.arrivalDate.getTime()) / (1000 * 60 * 60 * 24));
        // Get recent completions (last 5)
        const recentCompletions = await db_1.db.userRoadmapEntry.findMany({
            where: {
                userId,
                status: 'COMPLETE',
            },
            orderBy: { updatedAt: 'desc' },
            take: 5,
            include: { task: true },
        });
        const recentCompletionNames = recentCompletions.map(entry => entry.task.name);
        // Step 5: Build system prompt
        const systemPromptParams = {
            user: {
                name: session.user.name,
                visaType: session.user.profile.visaType,
                familySituation: session.user.profile.familySituation,
                city: session.user.profile.city,
                occupation: session.user.profile.occupation,
                arrivalDaysAgo,
                personaKey: session.user.profile.personaKey,
                recentCompletions: recentCompletionNames,
            },
            entryPoint: session.entryPoint,
            taskName,
            consequenceLine,
            kbChunks,
            guardrailAugmentations: level1Result.augmentations,
        };
        const systemPrompt = (0, registry_1.buildChatSystemPrompt)(systemPromptParams);
        // Step 6: Call streamMessage() and Steps 7: Write chunks to reply.raw
        let fullResponse = '';
        await (0, claude_client_1.streamMessage)(systemPrompt, historyMessages, (text) => {
            // Step 7: Write each chunk to reply.raw
            fullResponse += text;
            reply.raw.write(`data: ${JSON.stringify({ type: 'chunk', text })}\n\n`);
        });
        // Step 8: Persist complete assistant message
        const assistantMessage = await db_1.db.chatMessage.create({
            data: {
                sessionId,
                role: 'ASSISTANT',
                content: fullResponse,
                guardrailFlags: JSON.stringify(level1Result.flags),
                retrievedChunks: JSON.stringify(retrievedChunksResult.map(chunk => chunk.chunkKey)),
            },
        });
        // Step 9: Run Level 2 guardrail on complete response
        const level2Result = (0, level2_1.runLevel2Guardrail)(fullResponse);
        if (level2Result.flags.length > 0) {
            await db_1.db.chatMessage.update({
                where: { id: assistantMessage.id },
                data: { level2Flags: JSON.stringify(level2Result.flags) },
            });
        }
        // Step 10: Close SSE stream
        reply.raw.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`);
        reply.raw.end();
        logger_1.logger.info({
            userId,
            sessionId,
            messageLength: fullResponse.length,
            level1Flags: level1Result.flags,
            level2Flags: level2Result.flags,
        }, 'Chat message processed via SSE pipeline');
    }
    catch (error) {
        // AIFailureError handling (C13) — caught inside service, never reaches global handler
        if (error instanceof errors_1.AIFailureError) {
            reply.raw.write(`data: ${JSON.stringify({ type: 'error', message: 'AI service unavailable' })}\n\n`);
            reply.raw.end();
            logger_1.logger.error({ userId, sessionId, error: error.message }, 'AI failure during chat message processing');
            return;
        }
        // Re-throw other errors (AppError, etc.) to be handled by global handler
        throw error;
    }
}
//# sourceMappingURL=service.js.map