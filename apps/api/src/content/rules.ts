// Content rules (spec §3.6). Each rule is pure: (ctx) => RuleError[].
import type { Condition, Dimensions, Fact, Item, Source, TaskDef } from './types.js';

export type RuleError = { file: string; id?: string; rule: string; message: string };

export type Ctx = {
  dimensions: Dimensions;
  sources: Record<string, Source>;
  factFiles: { file: string; facts: Record<string, Fact> }[];
  tasks: { file: string; task: TaskDef }[];
  now: Date;
  allowUnverified: boolean;
};

const SOURCES_FILE = 'sources.yaml';
// Crown entities whose sites are not under govt.nz
const CROWN_DOMAINS = ['acc.co.nz', 'sorted.org.nz'];
export const FACT_RE = /\{\{\s*([\w.-]+)\s*\}\}/g;
// $ amounts, percentages, and a number followed by a time unit (durations, deadlines)
const FIGURE_RE = /\$\s?\d|\d\s?%|\b\d+(?:[.,]\d+)?\s*(?:business |working )?(?:minute|hour|day|week|month|year)s?\b/i;
// Names and phrases end at a plain word boundary (so `Priya's` is caught); bare `I` is not part of `I'm`/`I've`
const DENY_RE = /\b(?:priya|karthik|dbs|i['’]d|we recommend)\b|\bi(?!['’]?\w)/i;
const STALE_MONTHS = { A: 12, B: 6, C: 3 } as const;

export function taskItems(t: TaskDef): Item[] {
  return [...t.why, ...t.steps, ...t.documents, ...t.mistakes, ...t.watchOuts, ...(t.cost ? [t.cost] : []), ...(t.advice ? [t.advice] : [])];
}

const items = (ctx: Ctx) => ctx.tasks.flatMap(({ file, task }) => taskItems(task).map((item) => ({ file, item })));
const facts = (ctx: Ctx) => ctx.factFiles.flatMap(({ file, facts }) => Object.entries(facts).map(([id, fact]) => ({ file, id, fact })));
// Things that cite a source: every item and every fact
const citers = (ctx: Ctx) => [
  ...items(ctx).map(({ file, item }) => ({ file, id: item.id, x: item as Item | Fact })),
  ...facts(ctx).map(({ file, id, fact }) => ({ file, id, x: fact as Item | Fact })),
];
// Unverified content is let through locally (CONTENT_ALLOW_UNVERIFIED) and skips the content checks
const exempt = (ctx: Ctx, x: { verified: boolean }) => ctx.allowUnverified && !x.verified;

export function missingSource(ctx: Ctx): RuleError[] {
  return citers(ctx)
    .filter(({ x }) => !ctx.sources[x.source])
    .map(({ file, id, x }) => ({ file, id, rule: 'missing-source', message: `source "${x.source}" is not in sources.yaml` }));
}

export function domain(ctx: Ctx): RuleError[] {
  return Object.entries(ctx.sources)
    .filter(([, s]) => s.tier !== 'provider')
    .filter(([, s]) => {
      const host = URL.parse(s.url)?.hostname;
      return !host || !(host === 'govt.nz' || host.endsWith('.govt.nz') || CROWN_DOMAINS.some((d) => host === d || host.endsWith(`.${d}`)));
    })
    .map(([id, s]) => ({ file: SOURCES_FILE, id, rule: 'domain', message: `${s.tier} source ${s.url} is not on govt.nz or the Crown allowlist` }));
}

export function providerReason(ctx: Ctx): RuleError[] {
  return citers(ctx)
    .filter(({ x }) => ctx.sources[x.source]?.tier === 'provider' && !ctx.sources[x.source]!.reason && !exempt(ctx, x))
    .map(({ file, id, x }) => ({ file, id, rule: 'provider-reason', message: `provider source "${x.source}" has no reason` }));
}

export function providerType(ctx: Ctx): RuleError[] {
  return citers(ctx)
    .filter(({ x }) => ctx.sources[x.source]?.tier === 'provider' && x.numberType !== 'C')
    .map(({ file, id, x }) => ({ file, id, rule: 'provider-type', message: `provider source "${x.source}" may back only type C figures` }));
}

export function literalFigure(ctx: Ctx): RuleError[] {
  return items(ctx)
    .filter(({ item }) => !exempt(ctx, item) && FIGURE_RE.test(item.text.replace(FACT_RE, '')))
    .map(({ file, item }) => ({ file, id: item.id, rule: 'literal-figure', message: 'amounts, percentages and durations must come from a {{fact}}' }));
}

function conditions(t: TaskDef): { id: string; when: Condition }[] {
  return [
    { id: t.id, when: t.appliesTo },
    ...t.boosts.map((b) => ({ id: t.id, when: b.when })),
    ...taskItems(t).flatMap((i) => (i.when ? [{ id: i.id, when: i.when }] : [])),
  ];
}

function leaves(c: Condition): [string, string[]][] {
  if (c === 'all') return [];
  if ('any' in c) return (c.any as Condition[]).flatMap(leaves);
  if ('not' in c) return leaves(c.not as Condition);
  return Object.entries(c) as [string, string[]][];
}

const conditionLeaves = (ctx: Ctx) =>
  ctx.tasks.flatMap(({ file, task }) => conditions(task).flatMap(({ id, when }) => leaves(when).map(([key, values]) => ({ file, id, key, values }))));

export function unknownDimension(ctx: Ctx): RuleError[] {
  return conditionLeaves(ctx)
    .filter(({ key }) => !(key in ctx.dimensions))
    .map(({ file, id, key }) => ({ file, id, rule: 'unknown-dimension', message: `"${key}" is not a dimension in dimensions.yaml` }));
}

export function unknownValue(ctx: Ctx): RuleError[] {
  return conditionLeaves(ctx).flatMap(({ file, id, key, values }) => {
    const dim = ctx.dimensions[key as keyof Dimensions];
    if (!dim) return [];
    return values
      .filter((v) => !dim.values.some(([known]) => known === v))
      .map((v) => ({ file, id, rule: 'unknown-value', message: `"${v}" is not a ${key} value in dimensions.yaml` }));
  });
}

export function denylist(ctx: Ctx): RuleError[] {
  return ctx.tasks.flatMap(({ file, task }) =>
    [{ id: task.id, text: task.name }, ...taskItems(task)].flatMap(({ id, text }) => {
      const hit = DENY_RE.exec(text);
      return hit ? [{ file, id, rule: 'denylist', message: `"${hit[0]}" is not allowed (case-study names, first person)` }] : [];
    }),
  );
}

export function stale(ctx: Ctx): RuleError[] {
  return citers(ctx).flatMap(({ file, id, x }) => {
    if (exempt(ctx, x)) return [];
    const months = STALE_MONTHS[x.numberType ?? 'A'];
    const n = ctx.now;
    const cutoff = new Date(Date.UTC(n.getUTCFullYear(), n.getUTCMonth() - months, n.getUTCDate())).toISOString().slice(0, 10);
    return x.checked < cutoff
      ? [{ file, id, rule: 'stale', message: `checked ${x.checked} is older than ${months} months` }]
      : [];
  });
}

export function duplicateId(ctx: Ctx): RuleError[] {
  const seen = new Set<string>();
  const ids = [
    ...ctx.tasks.flatMap(({ file, task }) => [{ file, id: task.id }, ...taskItems(task).map((i) => ({ file, id: i.id }))]),
    ...facts(ctx).map(({ file, id }) => ({ file, id })),
  ];
  return ids.flatMap(({ file, id }) => {
    if (!seen.has(id)) return (seen.add(id), []);
    return [{ file, id, rule: 'duplicate-id', message: `id "${id}" is used more than once` }];
  });
}

const taskById = (ctx: Ctx) => new Map(ctx.tasks.map(({ task }) => [task.id, task]));

export function missingDependency(ctx: Ctx): RuleError[] {
  const byId = taskById(ctx);
  return ctx.tasks.flatMap(({ file, task }) =>
    task.dependsOn
      .filter((d) => !byId.has(d.task))
      .map((d) => ({ file, id: task.id, rule: 'missing-dependency', message: `depends on unknown task ${d.task}` })),
  );
}

export function retiredDependency(ctx: Ctx): RuleError[] {
  const byId = taskById(ctx);
  return ctx.tasks.flatMap(({ file, task }) =>
    task.dependsOn
      .filter((d) => byId.get(d.task)?.retired)
      .map((d) => ({ file, id: task.id, rule: 'retired-dependency', message: `depends on retired task ${d.task}` })),
  );
}

export function cycle(ctx: Ctx): RuleError[] {
  const byId = taskById(ctx);
  const fileOf = new Map(ctx.tasks.map(({ file, task }) => [task.id, file]));
  const state = new Map<string, 'visiting' | 'done'>();
  const errors: RuleError[] = [];
  const visit = (id: string, path: string[]) => {
    if (state.get(id) === 'done') return;
    if (state.get(id) === 'visiting') {
      const loop = [...path.slice(path.indexOf(id)), id];
      errors.push({ file: fileOf.get(id)!, id, rule: 'cycle', message: `dependency cycle ${loop.join(' → ')}` });
      return;
    }
    state.set(id, 'visiting');
    for (const d of byId.get(id)!.dependsOn) if (byId.has(d.task)) visit(d.task, [...path, id]);
    state.set(id, 'done');
  };
  for (const id of byId.keys()) visit(id, []);
  return errors;
}

export function unresolvedFact(ctx: Ctx): RuleError[] {
  const known = new Set(facts(ctx).map(({ id }) => id));
  return items(ctx).flatMap(({ file, item }) =>
    [...item.text.matchAll(FACT_RE)]
      .filter(([, id]) => !known.has(id!))
      .map(([, id]) => ({ file, id: item.id, rule: 'unresolved-fact', message: `{{${id}}} is not in facts/` })),
  );
}

export function unverified(ctx: Ctx): RuleError[] {
  if (ctx.allowUnverified) return [];
  return citers(ctx)
    .filter(({ x }) => !x.verified)
    .map(({ file, id }) => ({ file, id, rule: 'unverified', message: 'verified: false (set CONTENT_ALLOW_UNVERIFIED=true locally only)' }));
}

export const RULES = [
  missingSource, domain, providerReason, providerType, literalFigure, unknownDimension, unknownValue,
  denylist, stale, duplicateId, missingDependency, retiredDependency, cycle, unresolvedFact, unverified,
];
