// Chat service — session creation and management
// Zero imports from features/roadmap/ per constitutional constraint C01

import { db } from '../../shared/db';
import { AppError, AIFailureError } from '../../shared/errors';
import { logger } from '../../shared/logger';
import { buildChatOpeningMessage, buildChatSystemPrompt } from '../../core/prompts/registry';
import { streamMessage, type ChatMessage } from '../../shared/ai/claude.client';
import { runLevel1Guardrail } from './guardrails/level1';
import { runLevel2Guardrail } from './guardrails/level2';
import type { ChatEntryPoint } from '@landednz/types';
import type { CreateSessionResponse, BuildSystemPromptParams, ChatKbChunk } from './chat.types';
import type { FastifyReply } from 'fastify';

export async function createChatSession(
  userId: string,
  entryPoint: ChatEntryPoint,
  taskContext?: string,
): Promise<CreateSessionResponse> {
  // Fetch user profile + completed task count
  const user = await db.user.findUnique({
    where: { id: userId },
    include: {
      profile: true,
    },
  });

  if (!user) {
    throw new AppError('USER_NOT_FOUND', 'User not found', 404);
  }

  if (!user.profile) {
    throw new AppError('PROFILE_NOT_FOUND', 'User profile not found', 404);
  }

  // Count completed roadmap entries
  const completedTaskCount = await db.userRoadmapEntry.count({
    where: {
      userId,
      status: 'COMPLETE',
    },
  });

  // Fetch task name if TASK_CARD or EMAIL_DEEPLINK entry point
  let taskContextData: { taskName: string } | null = null;
  if ((entryPoint === 'TASK_CARD' || entryPoint === 'EMAIL_DEEPLINK') && taskContext) {
    const task = await db.task.findUnique({
      where: { id: taskContext },
      select: { name: true },
    });

    if (!task) {
      throw new AppError('TASK_NOT_FOUND', `Task ${taskContext} not found`, 404);
    }

    taskContextData = { taskName: task.name };
  }

  // Create ChatSession record
  const session = await db.chatSession.create({
    data: {
      userId,
      entryPoint,
      taskContext,
    },
  });

  // Build opening message via registry
  const openingMessage = buildChatOpeningMessage(
    entryPoint,
    {
      name: user.name,
      profile: {
        visaType: user.profile.visaType,
        familySituation: user.profile.familySituation,
        city: user.profile.city,
        occupation: user.profile.occupation,
      },
      completedTaskCount,
    },
    taskContextData,
  );

  logger.info(
    {
      sessionId: session.id,
      userId,
      entryPoint,
      taskContext,
    },
    'Chat session created',
  );

  return {
    sessionId: session.id,
    openingMessage,
  };
}

export async function sendMessage(
  userId: string,
  sessionId: string,
  content: string,
  reply: FastifyReply,
): Promise<void> {
  // Session ownership check
  const session = await db.chatSession.findUnique({
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
    throw new AppError('SESSION_NOT_FOUND', 'Chat session not found', 404);
  }

  if (session.userId !== userId) {
    throw new AppError('SESSION_ACCESS_DENIED', 'Chat session access denied', 403);
  }

  if (!session.user.profile) {
    throw new AppError('PROFILE_NOT_FOUND', 'User profile not found', 404);
  }

  // Set up SSE headers (C14) after validation — reply.raw required, never reply.send()
  // Prevent Railway 30s timeout (skip in test environment)
  if (process.env.NODE_ENV !== 'test' && reply.raw.setTimeout) {
    try {
      reply.raw.setTimeout(0);
    } catch (error) {
      // Ignore setTimeout errors in test environment
    }
  }
  reply.raw.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no',
  });

  try {
    // 10-step pipeline (exact C06 order — Level 1 at step 2, Level 2 at step 9)

    // Step 1: Persist user message
    const userMessage = await db.chatMessage.create({
      data: {
        sessionId,
        role: 'USER',
        content,
      },
    });

    // Step 2: Run Level 1 guardrail
    const level1Result = runLevel1Guardrail(content);

    // Step 3: Fetch conversation history (this session's messages)
    const history = await db.chatMessage.findMany({
      where: { sessionId },
      orderBy: { createdAt: 'asc' },
      select: { role: true, content: true },
    });

    const historyMessages: ChatMessage[] = history.map(msg => ({
      role: msg.role.toLowerCase() as 'user' | 'assistant',
      content: msg.content,
    }));

    // Step 4: Fetch task content from DB (Phase 4 placeholder for RAG)
    let kbChunks: ChatKbChunk[] = [];
    let taskName: string | null = null;
    let consequenceLine: string | null = null;

    if (session.taskContext) {
      const taskVariants = await db.taskContentVariant.findMany({
        where: { taskId: session.taskContext },
        include: { task: true },
      });

      if (taskVariants.length > 0) {
        taskName = taskVariants[0].task.name;

        // Format as KB chunks (Phase 4 placeholder)
        kbChunks = taskVariants.map(variant => ({
          chunkKey: `${variant.taskId}-${variant.personaKey}`,
          personaKey: variant.personaKey,
          content: `${variant.steps}\n\nDocuments required: ${variant.documentsRequired}\n\nCommon mistakes: ${variant.commonMistakes}`,
          sourceName: variant.task.name,
          sourceUrl: variant.sourceUrl,
        }));

        // Get consequence line for user's persona
        const userVariant = taskVariants.find(v => v.personaKey === session.user.profile!.personaKey);
        consequenceLine = userVariant?.consequenceLine || taskVariants[0]?.consequenceLine || null;
      }
    }

    // Calculate arrival days ago
    const arrivalDaysAgo = Math.floor(
      (new Date().getTime() - session.user.profile.arrivalDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Get recent completions (last 5)
    const recentCompletions = await db.userRoadmapEntry.findMany({
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
    const systemPromptParams: BuildSystemPromptParams = {
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

    const systemPrompt = buildChatSystemPrompt(systemPromptParams);

    // Step 6: Call streamMessage() and Steps 7: Write chunks to reply.raw
    let fullResponse = '';

    await streamMessage(systemPrompt, historyMessages, (text: string) => {
      // Step 7: Write each chunk to reply.raw
      fullResponse += text;
      reply.raw.write(`data: ${JSON.stringify({ type: 'chunk', text })}\n\n`);
    });

    // Step 8: Persist complete assistant message
    const assistantMessage = await db.chatMessage.create({
      data: {
        sessionId,
        role: 'ASSISTANT',
        content: fullResponse,
        guardrailFlags: JSON.stringify(level1Result.flags),
        retrievedChunks: JSON.stringify(kbChunks.map(chunk => chunk.chunkKey)),
      },
    });

    // Step 9: Run Level 2 guardrail on complete response
    const level2Result = runLevel2Guardrail(fullResponse);

    if (level2Result.flags.length > 0) {
      await db.chatMessage.update({
        where: { id: assistantMessage.id },
        data: { level2Flags: JSON.stringify(level2Result.flags) },
      });
    }

    // Step 10: Close SSE stream
    reply.raw.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`);
    reply.raw.end();

    logger.info(
      {
        userId,
        sessionId,
        messageLength: fullResponse.length,
        level1Flags: level1Result.flags,
        level2Flags: level2Result.flags,
      },
      'Chat message processed via SSE pipeline',
    );

  } catch (error) {
    // AIFailureError handling (C13) — caught inside service, never reaches global handler
    if (error instanceof AIFailureError) {
      reply.raw.write(`data: ${JSON.stringify({ type: 'error', message: 'AI service unavailable' })}\n\n`);
      reply.raw.end();

      logger.error(
        { userId, sessionId, error: error.message },
        'AI failure during chat message processing',
      );
      return;
    }

    // Re-throw other errors (AppError, etc.) to be handled by global handler
    throw error;
  }
}