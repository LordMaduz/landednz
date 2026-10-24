// content:build — read the YAML content, validate it (rules.ts), resolve facts and hash the bundle.
import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'yaml';
import type { z } from 'zod';
import { RULES, FACT_RE, type Ctx, type RuleError } from './rules.js';
import { dimensionsSchema, factsSchema, sourcesSchema, taskSchema } from './schema.js';
import type { Dimensions, Fact, Item, Source, TaskDef } from './types.js';

export type { Ctx, RuleError };
export type ResolvedItem = Item & { text: string; factIds: string[] };
type ItemKeys = 'why' | 'steps' | 'documents' | 'mistakes' | 'watchOuts' | 'cost' | 'advice';
export type ResolvedTask = Omit<TaskDef, ItemKeys> & {
  why: ResolvedItem[];
  steps: ResolvedItem[];
  documents: ResolvedItem[];
  mistakes: ResolvedItem[];
  watchOuts: ResolvedItem[];
  cost?: ResolvedItem;
  advice?: ResolvedItem & { required: boolean };
  checkedAt: string; // oldest `checked` across its items and their facts
};
export type Bundle = {
  version: string;
  builtAt: string;
  dimensions: Dimensions;
  sources: Record<string, Source>;
  facts: Record<string, Fact>;
  tasks: ResolvedTask[];
};

type Loaded = Omit<Ctx, 'now' | 'allowUnverified'>;

const yamlFiles = (dir: string) =>
  existsSync(dir) ? readdirSync(dir).filter((f) => /\.ya?ml$/.test(f)).sort() : [];

// Parses every file it can; a file that fails YAML or schema parsing is reported and left out.
export function loadContent(dir: string): { ctx?: Loaded; errors: RuleError[] } {
  const errors: RuleError[] = [];
  function read<T>(file: string, schema: z.ZodType<T>): T | undefined {
    try {
      const r = schema.safeParse(parse(readFileSync(join(dir, file), 'utf8')));
      if (r.success) return r.data;
      const message = r.error.issues.map((i) => `${i.path.join('.') || '(root)'}: ${i.message}`).join('; ');
      errors.push({ file, rule: 'schema', message });
    } catch (e) {
      errors.push({ file, rule: 'schema', message: (e as Error).message });
    }
  }

  const dimensions = read('dimensions.yaml', dimensionsSchema);
  if (!dimensions) return { errors }; // every condition check depends on it
  const sources = existsSync(join(dir, 'sources.yaml')) ? read('sources.yaml', sourcesSchema) ?? {} : {};
  const factFiles = yamlFiles(join(dir, 'facts')).flatMap((f) => {
    const file = `facts/${f}`;
    const facts = read(file, factsSchema);
    return facts ? [{ file, facts }] : [];
  });
  const tasks = yamlFiles(join(dir, 'tasks')).flatMap((f) => {
    const file = `tasks/${f}`;
    const task = read(file, taskSchema);
    return task ? [{ file, task }] : [];
  });
  return { ctx: { dimensions, sources, factFiles, tasks }, errors };
}

export const runRules = (ctx: Ctx): RuleError[] => RULES.flatMap((rule) => rule(ctx));

function resolveTask(task: TaskDef, facts: Record<string, Fact>): ResolvedTask {
  const dates: string[] = [];
  const resolve = <T extends Item>(item: T): T & ResolvedItem => {
    const factIds = [...new Set([...item.text.matchAll(FACT_RE)].map(([, id]) => id!))];
    dates.push(item.checked, ...factIds.map((id) => facts[id]!.checked));
    return { ...item, text: item.text.replace(FACT_RE, (_, id: string) => facts[id]!.value), factIds };
  };
  const resolved = {
    ...task, // cost/advice stay undefined when absent; JSON drops them
    why: task.why.map(resolve),
    steps: task.steps.map(resolve),
    documents: task.documents.map(resolve),
    mistakes: task.mistakes.map(resolve),
    watchOuts: task.watchOuts.map(resolve),
    cost: task.cost && resolve(task.cost),
    advice: task.advice && resolve(task.advice),
  };
  return { ...resolved, checkedAt: dates.sort()[0]! };
}

// JSON with object keys sorted, so the hash ignores key order
const canonical = (v: unknown) =>
  JSON.stringify(v, (_, x) => (x && typeof x === 'object' && !Array.isArray(x) ? Object.fromEntries(Object.entries(x).sort(([a], [b]) => (a < b ? -1 : 1))) : x));

export function buildBundle(
  dir: string,
  opts: { now: Date; allowUnverified: boolean },
): { bundle: Bundle } | { errors: RuleError[] } {
  const { ctx, errors } = loadContent(dir);
  if (ctx) errors.push(...runRules({ ...ctx, ...opts }));
  if (errors.length || !ctx) return { errors };

  const facts = Object.assign({}, ...ctx.factFiles.map((f) => f.facts)) as Record<string, Fact>;
  const content = {
    dimensions: ctx.dimensions,
    sources: ctx.sources,
    facts,
    tasks: ctx.tasks.map(({ task }) => resolveTask(task, facts)),
  };
  const version = createHash('sha256').update(canonical(content)).digest('hex').slice(0, 12);
  return { bundle: { version, builtAt: opts.now.toISOString(), ...content } };
}

const DIMENSION_EXPORTS = {
  visa: ['VISA_TYPES', 'VisaType'],
  city: ['CITIES', 'City'],
  family: ['FAMILY_SITUATIONS', 'FamilySituation'],
  occupation: ['OCCUPATIONS', 'Occupation'],
} as const;

// Source of packages/types/dimensions.ts
export function dimensionsTs(dimensions: Dimensions): string {
  const blocks = Object.entries(DIMENSION_EXPORTS).map(([key, [constName, typeName]]) => {
    const values = dimensions[key as keyof Dimensions]?.values ?? [];
    const rows = values.map(([v, label]) => `  [${JSON.stringify(v)}, ${JSON.stringify(label)}],`).join('\n');
    return `export const ${constName} = [\n${rows}\n] as const;\nexport type ${typeName} = (typeof ${constName})[number][0];\n`;
  });
  return `// Generated by \`npm run content:build -w @landednz/api\` from apps/api/content/dimensions.yaml. Do not edit.\n\n${blocks.join('\n')}`;
}
