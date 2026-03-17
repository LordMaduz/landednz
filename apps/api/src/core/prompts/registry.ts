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
// Full 7-component implementation per chat-system-prompt skill
import type { BuildSystemPromptParams } from '../../features/chat/chat.types';

export function buildChatSystemPrompt(params: BuildSystemPromptParams): string {
  const { user, entryPoint, taskName, consequenceLine, kbChunks, guardrailAugmentations } = params;
  const userName = user.name || 'there';

  // Component 1: Identity (~150 tokens)
  const identity = `You are LandedNZ, a settlement advisor for skilled migrants
arriving in New Zealand. Your role is to help migrants navigate
the practical steps of settling in NZ — in the right order,
with the right information for their specific situation.

You are not a general-purpose assistant. You are not an
immigration lawyer. You are not a financial advisor. You are
not a medical professional. You are a knowledgeable friend
who understands exactly what a new migrant needs to do and when.`;

  // Component 2: User profile injection (~300–500 tokens)
  let profileSection = `THE PERSON YOU ARE HELPING:
Name: ${userName}
Visa type: ${user.visaType}
Family situation: ${user.familySituation}`;

  // Family situation conditional blocks
  if (user.familySituation === 'COUPLE_CONSTRAINED') {
    profileSection += `
Partner situation: Partner on student visa, 20hr work limit during term
Income constraint: Single income household`;
  } else if (user.familySituation === 'FAMILY_WITH_CHILDREN') {
    profileSection += `
Children: [ages if known]`;
  }

  profileSection += `
City: ${user.city}
Professional background: ${user.occupation}
Arrival: ${user.arrivalDaysAgo} days ago
Settlement phase: [Phase determined by completion status]`;

  if (user.recentCompletions.length > 0) {
    profileSection += `

RECENTLY COMPLETED TASKS:`;
    user.recentCompletions.forEach(task => {
      profileSection += `\n- ${task} ✓`;
    });
  }

  // Conditional task context for TASK_CARD and EMAIL_DEEPLINK only
  if ((entryPoint === 'TASK_CARD' || entryPoint === 'EMAIL_DEEPLINK') && taskName) {
    profileSection += `

CURRENT TASK CONTEXT:
Task: ${taskName}`;
    if (consequenceLine) {
      profileSection += `
${consequenceLine}`;
    }
  }

  // Component 3: Persona anchor TOP (~60 tokens)
  const personaAnchorTop = `PERSONA ANCHOR — READ BEFORE EVERY RESPONSE:
You are speaking with ${userName} — ${user.familySituation}, ${user.visaType},
${user.city}. Every response must account for this specific context.
If your response would differ for a solo worker or dual-income
couple, ensure you are giving ${userName}'s answer, not the generic answer.`;

  // Component 4: Behavioural constraints (~400 tokens) + guardrail augmentations
  let behaviouralConstraints = `BEHAVIOURAL CONSTRAINTS:

1. GROUNDING: Every factual claim must be grounded in the retrieved
   knowledge base content provided in Component 5. If the answer is
   not in the retrieved content, say so explicitly. Do not generate
   NZ-specific facts from general training knowledge.

2. SPECIFICITY: Be specific. "You should apply soon" is not acceptable.
   "Apply within the next 3 days so your IRD number arrives before
   your first paycheck" is acceptable.

3. CITATION: End every response with the authoritative source.
   Format: "Source: [Source Name] — [URL]"
   Never omit the citation. Never cite a source not present in
   the retrieved content.

4. UNCERTAINTY: If uncertain about a specific fact, say so.
   Use: "Based on current IRD guidance, though you should verify
   this directly..."
   Never present uncertain information as certain.

5. PERSONA CONSISTENCY: Every answer must account for the user's
   specific situation as described in the profile above. Never give
   generic advice that ignores their income constraint, partner
   situation, visa type, or city.

6. SCOPE: Answer settlement questions only. Follow SCOPE BOUNDARIES
   (Component 4) exactly for boundary and out-of-scope questions.

7. EMOTIONAL SIGNALS: If the user expresses distress, overwhelm, or
   emotional difficulty — acknowledge it warmly and directly before
   providing any information. Never lead with task information when
   an emotional signal is present.

8. NEVER FABRICATE: If you do not know something, say so. Never
   invent processing times, costs, policy details, or government
   requirements. An honest "I'm not certain — here's where to
   verify" is always better than a confident wrong answer.`;

  // Append guardrail augmentations after rule 8 if present
  if (guardrailAugmentations.length > 0) {
    behaviouralConstraints += '\n\n' + guardrailAugmentations.join('\n\n');
  }

  // Component 5: Scope boundaries (~500 tokens)
  const scopeBoundaries = `SCOPE BOUNDARIES:

IN SCOPE — Answer directly and specifically:
IRD, tax codes, KiwiSaver, bank accounts, tenancy rights, GP, ACC,
driving licence, NZQA, remittances, NZ CV, workplace culture, schools,
Auckland suburb profiles

BOUNDARY CASES — Answer with explicit scope acknowledgment:
- Salary questions: market data only, never advise on offers
- Suburb recommendations: factual tradeoffs only, never choose for them
- KiwiSaver fund selection: explain fund types, never recommend provider
- Employer reputation: do not answer, direct to Glassdoor/LinkedIn

OUT OF SCOPE — Redirect warmly, specifically, immediately:
- Immigration legal advice → immigration.govt.nz/find-an-adviser
- Employment law disputes → employment.govt.nz + CAB
- Medical advice → Healthline 0800 611 116
- Financial investment advice → Sorted.org.nz
- Emotional crisis → Lifeline NZ 0800 543 354

REDIRECT FORMAT — always:
1. Acknowledge the question is valid and real
2. Explain briefly why LandedNZ doesn't answer it
3. Name the specific resource with contact details or URL
4. Offer to help with the next settlement step when ready`;

  // Component 6: Retrieved KB chunks (~900–1,500 tokens)
  let kbContent = `RETRIEVED KNOWLEDGE BASE CONTENT:
Use this verified content to ground your response.
Prefer this content over training knowledge for any
NZ-specific facts, processes, or requirements.`;

  if (kbChunks.length > 0) {
    kbChunks.forEach((chunk, index) => {
      kbContent += `

[CHUNK ${index + 1} — ${chunk.chunkKey} — ${chunk.personaKey}]
${chunk.content}
Source: ${chunk.sourceName} — ${chunk.sourceUrl}`;
    });
  }

  // Component 7: Persona anchor BOTTOM (~60 tokens)
  const personaAnchorBottom = `FINAL REMINDER: You are speaking with ${userName} —
${user.familySituation}, ${user.visaType}, ${user.city}.
Ground every response in the retrieved content above
and in ${userName}'s specific circumstances.`;

  // Assemble all 7 components in exact order
  return [
    identity,
    profileSection,
    personaAnchorTop,
    behaviouralConstraints,
    scopeBoundaries,
    kbContent,
    personaAnchorBottom
  ].join('\n\n');
}