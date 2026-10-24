import type { z } from 'zod';
import type { dimensionsSchema, factSchema, itemSchema, sourceSchema, taskSchema } from './schema.js';

export type DimensionKey = 'visa' | 'city' | 'family' | 'occupation';

export type Profile = { visaType: string; city: string; familySituation: string; occupation: string };

export type Condition =
  | 'all'
  | { any: Condition[] }
  | { not: Condition }
  | Partial<Record<DimensionKey, string[]>>;

export type Item = z.infer<typeof itemSchema>;
export type TaskDef = z.infer<typeof taskSchema>;
export type UrgencyRule = TaskDef['urgency'][number];
export type Source = z.infer<typeof sourceSchema>;
export type Fact = z.infer<typeof factSchema>;
export type Dimensions = z.infer<typeof dimensionsSchema>;
