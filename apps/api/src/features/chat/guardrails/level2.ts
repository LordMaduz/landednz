// Level 2 guardrail — output validator
// Runs on the COMPLETE assistant response AFTER it has been generated and persisted.
// LOGGING ONLY — never blocks or modifies the response.
// Constitutional constraint C06: must remain at step 9 of the SSE pipeline.

import type { Level2Result } from '../chat.types';

export function runLevel2Guardrail(response: string): Level2Result {
  const flags: string[] = [];

  // MISSING_CITATION: response must contain "Source:" followed by a URL anywhere after.
  // Flexible check — URL can appear anywhere in the string after "Source:" to allow
  // for different citation formatting styles.
  const sourceIndex = response.indexOf('Source:');
  const hasCitation = sourceIndex !== -1 && /https?:\/\//.test(response.slice(sourceIndex));
  if (!hasCitation) {
    flags.push('MISSING_CITATION');
  }

  // SPECIFIC_NUMBER: response contains %, $, NZD, or time patterns (e.g. "working days").
  // These should be flagged for human review — specific numbers change and may become stale.
  if (/%|\$|NZD|working days/.test(response)) {
    flags.push('SPECIFIC_NUMBER');
  }

  // POTENTIAL_OUT_OF_SCOPE: documented stub — requires Level 1 flags for accuracy.
  // Without Level 1 context, any heuristic produces false positives (most settlement
  // responses won't contain redirect URLs). Deferred until function signature extended.

  return { flags };
}