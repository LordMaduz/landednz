// Chat service — session creation and management
// Zero imports from features/roadmap/ per constitutional constraint C01

import { db } from '../../shared/db';
import { AppError } from '../../shared/errors';
import { logger } from '../../shared/logger';
import { buildChatOpeningMessage } from '../../core/prompts/registry';
import type { ChatEntryPoint } from '@landednz/types';
import type { CreateSessionResponse } from './chat.types';

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