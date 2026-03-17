// Level 2 guardrail — output validator
// Runs on the COMPLETE assistant response AFTER it has been generated and persisted.
// LOGGING ONLY — never blocks or modifies the response.
// Real detection patterns implemented in AC-4-07.

import type { Level2Result } from '../chat.types';

export function runLevel2Guardrail(response: string): Level2Result {
  // Stub implementation — returns no flags
  // Real detection implemented in AC-4-07:
  // - MISSING_CITATION (response lacks "Source:" + URL)
  // - SPECIFIC_NUMBER (response contains %, $, or time period)
  // - POTENTIAL_OUT_OF_SCOPE (response appears to answer flagged categories)
  return {
    flags: [],
  };
}