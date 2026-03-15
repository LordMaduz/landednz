// All prompt construction lives here and nowhere else.
// This is the single registry for all AI prompt construction per constitutional constraint C04.

import type { ChatEntryPoint } from '@landednz/types';

export function buildChatOpeningMessage(
  entryPoint: ChatEntryPoint,
  user: {
    name: string | null;
    profile: {
      visaType: string;
      familySituation: string;
      city: string;
      occupation: string;
    };
    completedTaskCount: number;
  },
  taskContext: { taskName: string } | null,
): string {
  const name = user.name || 'there';
  const city = user.profile.city.toLowerCase();
  const familySituation = user.profile.familySituation;

  // Persona-specific context for task-based entries
  const getPersonaContext = () => {
    if (familySituation === 'COUPLE_CONSTRAINED') {
      return "you're on a partner visa with work restrictions";
    } else if (familySituation === 'FAMILY_WITH_CHILDREN') {
      return "you're settling with family";
    } else {
      return "you're settling independently";
    }
  };

  switch (entryPoint) {
    case 'TASK_CARD':
    case 'EMAIL_DEEPLINK':
      if (!taskContext?.taskName) {
        return `Hi ${name} — I know ${getPersonaContext()}. What would you like to know about your current task?`;
      }
      return `You're looking at the ${taskContext.taskName} task. I know ${getPersonaContext()}. What would you like to know?`;

    case 'ROADMAP':
    case 'NAVIGATION':
      return `Hi ${name} — you've completed ${user.completedTaskCount} tasks so far. What would you like to know about settling in ${city}?`;

    default:
      // Fallback should never happen with proper types, but defensive programming
      return `Hi ${name} — I'm here to help with your NZ settlement. What would you like to know?`;
  }
}

// Phase 4 — Chat advisor system prompt
// Stub for AC-4-08 — buildChatSystemPrompt() will be implemented in later AC
export function buildChatSystemPrompt(...args: any[]): string {
  throw new Error('TODO: AC-4-08 — buildChatSystemPrompt() not yet implemented');
}