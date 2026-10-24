import { z } from 'zod';
import type { Bundle, ResolvedItem, ResolvedTask } from './build.js';
import { matches } from './matches.js';
import { dimensionsSchema, factSchema, itemSchema, sourceSchema, taskSchema } from './schema.js';
import { FileContentSource, type ContentSource } from './source.js';
import type { Fact, Profile, Source } from './types.js';

export { FileContentSource, type ContentSource };

export class ContentLoadError extends Error {
  constructor(where: string, cause: unknown) {
    super(`Cannot load content from ${where}: ${cause instanceof Error ? cause.message : String(cause)}. Run \`npm run content:build -w @landednz/api\`.`, { cause });
    this.name = 'ContentLoadError';
  }
}

const resolvedItem = itemSchema.extend({ factIds: z.array(z.string()) });
const resolvedTask = taskSchema.extend({
  why: z.array(resolvedItem),
  steps: z.array(resolvedItem),
  documents: z.array(resolvedItem),
  mistakes: z.array(resolvedItem),
  watchOuts: z.array(resolvedItem),
  cost: resolvedItem.optional(),
  advice: resolvedItem.extend({ required: z.boolean() }).optional(),
  checkedAt: z.string(),
});
const bundleSchema = z.object({
  version: z.string(),
  builtAt: z.string(),
  dimensions: dimensionsSchema,
  sources: z.record(z.string(), sourceSchema),
  facts: z.record(z.string(), factSchema),
  tasks: z.array(resolvedTask),
});

let state: Bundle | undefined;
const current = (): Bundle => {
  if (!state) throw new Error('Content not loaded: call loadContent() first');
  return state;
};

export const useContent = (bundle: Bundle): void => {
  state = bundle;
};

export async function loadContent(src: ContentSource = new FileContentSource()): Promise<Bundle> {
  const where = src instanceof FileContentSource ? src.path : src.constructor.name;
  let raw: unknown;
  try {
    raw = await src.load();
  } catch (e) {
    throw new ContentLoadError(where, e);
  }
  const parsed = bundleSchema.safeParse(raw);
  if (!parsed.success) throw new ContentLoadError(where, parsed.error);
  state = parsed.data as Bundle;
  return state;
}

export const contentVersion = (): string => current().version;
export const tasks = (): ResolvedTask[] => current().tasks.filter((t) => !t.retired);
export const task = (id: string): ResolvedTask | undefined => current().tasks.find((t) => t.id === id);
export const applicableTasks = (profile: Profile): ResolvedTask[] => tasks().filter((t) => matches(t.appliesTo, profile));

export function source(id: string): Source {
  const s = current().sources[id];
  if (!s) throw new Error(`Unknown source: ${id}`);
  return s;
}
export function fact(id: string): Fact {
  const f = current().facts[id];
  if (!f) throw new Error(`Unknown fact: ${id}`);
  return f;
}

export function itemsFor(t: ResolvedTask, profile: Profile) {
  const pick = <T extends ResolvedItem>(items: T[]) => items.filter((i) => matches(i.when, profile));
  const one = <T extends ResolvedItem>(item: T | undefined) => (item && matches(item.when, profile) ? item : null);
  return {
    why: pick(t.why)[0] ?? null,
    steps: pick(t.steps),
    documents: pick(t.documents),
    mistakes: pick(t.mistakes),
    watchOuts: pick(t.watchOuts),
    cost: one(t.cost),
    advice: one(t.advice),
  };
}
