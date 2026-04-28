#!/usr/bin/env ts-node
/**
 * Post-seed validation script for AC-2-15
 * Validates knowledge base seeding completeness and content integrity
 *
 * Run after seed-knowledge-base.ts to verify:
 * - Correct record counts (21 tasks, ≥42 variants)
 * - No null/empty required fields
 * - professionalAdviceRequired tasks have notes
 * - Tier 1 source URLs resolve
 */
declare function validateSeedContent(): Promise<void>;
export { validateSeedContent };
//# sourceMappingURL=validate-seed-content.d.ts.map