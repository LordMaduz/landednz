import { z } from 'zod';
import type { Condition } from './types.js';

export const DIMENSION_KEYS = ['visa', 'city', 'family', 'occupation'] as const;

// Recursive, so the TS type is declared in types.ts. The leaf record accepts any key
// so cross-file rules (Task 2) can report unknown dimensions after parsing.
export const conditionSchema: z.ZodType<Condition> = z.lazy(() =>
  z.union([
    z.literal('all'),
    z.strictObject({ any: z.array(conditionSchema) }),
    z.strictObject({ not: conditionSchema }),
    z.record(z.string(), z.array(z.string())),
  ]),
);

const isoDate = z.iso.date();
const numberType = z.enum(['A', 'B', 'C']);

export const itemSchema = z.strictObject({
  id: z.string(),
  text: z.string(),
  when: conditionSchema.optional(),
  source: z.string(),
  checked: isoDate,
  verified: z.boolean(),
  numberType: numberType.optional(),
});

const urgencyRuleSchema = z.union([
  z.strictObject({ fromDay: z.number(), toDay: z.number(), by: z.number() }),
  z.strictObject({ months: z.array(z.number()), afterFirstYear: z.literal(true), by: z.number() }),
]);

export const taskSchema = z.strictObject({
  id: z.string(),
  name: z.string(),
  phase: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]),
  priority: z.number(),
  boosts: z.array(z.strictObject({ when: conditionSchema, by: z.number() })),
  urgency: z.array(urgencyRuleSchema),
  duration: z.string(),
  processingTime: z.string().optional(),
  appliesTo: conditionSchema,
  dependsOn: z.array(z.strictObject({ task: z.string(), type: z.enum(['hard', 'soft']) })),
  retired: z.boolean(),
  why: z.array(itemSchema),
  steps: z.array(itemSchema),
  documents: z.array(itemSchema),
  mistakes: z.array(itemSchema),
  watchOuts: z.array(itemSchema),
  cost: itemSchema.optional(),
  advice: itemSchema.extend({ required: z.boolean() }).optional(),
});

export const sourceSchema = z.strictObject({
  url: z.string(),
  title: z.string(),
  agency: z.string(),
  tier: z.enum(['government', 'legislation', 'provider']),
  reason: z.string().optional(),
});
export const sourcesSchema = z.record(z.string(), sourceSchema);

export const factSchema = z.strictObject({
  value: z.string(),
  numberType,
  source: z.string(),
  checked: isoDate,
  verified: z.boolean(),
});
export const factsSchema = z.record(z.string(), factSchema);

export const dimensionsSchema = z.record(
  z.enum(DIMENSION_KEYS),
  z.strictObject({ label: z.string(), values: z.array(z.tuple([z.string(), z.string()])) }),
);
