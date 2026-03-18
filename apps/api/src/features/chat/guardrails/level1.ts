// Level 1 guardrail — input classifier
// Runs on EVERY user message BEFORE RAG retrieval and prompt construction.
// Constitutional constraint C07: must remain at step 2 of the SSE pipeline.

import type { GuardrailResult } from '../chat.types';

// CRISIS_SIGNAL patterns — case-insensitive substring match
const CRISIS_SIGNAL_PATTERNS: string[] = [
  "don't know what to do",
  "can't cope",
  "want to give up",
  "can't go on",
  "overwhelmed",
  "end it all",
  "end it",
  "give up everything",
  "can't handle this",
  "want to go home",
];

// Verbatim augmentation string from spec Appendix D — do not paraphrase
// Injected into Component 3 of system prompt via buildChatSystemPrompt()
// Constitutional constraint C08: Lifeline NZ MUST appear before any settlement info
const CRISIS_AUGMENTATION =
  `CRISIS RESOURCE — RESPOND WITH THIS FIRST, BEFORE ANY OTHER INFORMATION:\n` +
  `"It sounds like you're going through a really difficult time. Settling in a new ` +
  `country is genuinely hard — you're not alone in finding it overwhelming.\n` +
  `If you need someone to talk to, Lifeline NZ is available 24/7: 0800 543 354.\n` +
  `They're experienced with exactly this kind of transition."\n` +
  `After providing this resource, you may then address any settlement question.`;

export function runLevel1Guardrail(content: string): GuardrailResult {
  const lower = content.toLowerCase();

  if (CRISIS_SIGNAL_PATTERNS.some(pattern => lower.includes(pattern))) {
    return {
      triggered: true,
      flags: ['CRISIS_SIGNAL'],
      augmentations: [CRISIS_AUGMENTATION],
    };
  }

  // AC-4-05: PROMPT_INJECTION — stub, implemented in AC-4-05
  // AC-4-06: OUT_OF_SCOPE_IMMIGRATION — stub, implemented in AC-4-06

  return {
    triggered: false,
    flags: [],
    augmentations: [],
  };
}