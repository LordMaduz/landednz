// Level 1 guardrail — input classifier
// Runs on EVERY user message BEFORE RAG retrieval and prompt construction.
// Real detection patterns implemented in AC-4-04 through AC-4-06.

import type { GuardrailResult } from '../chat.types';

export function runLevel1Guardrail(content: string): GuardrailResult {
  // Stub implementation — returns no flags or augmentations
  // Real pattern detection implemented in subsequent ACs:
  // AC-4-04: CRISIS_SIGNAL
  // AC-4-05: PROMPT_INJECTION
  // AC-4-06: OUT_OF_SCOPE_IMMIGRATION
  return {
    triggered: false,
    flags: [],
    augmentations: [],
  };
}