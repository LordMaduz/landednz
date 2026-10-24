// One-off: turn the legacy kb-master.md into unverified YAML content (deleted in Plan 2 once every task is verified).
// Writes sources.yaml, facts/legacy.yaml and tasks/T01..T21.yaml. dimensions.yaml is committed by hand and never touched.
import { mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { stringify } from 'yaml';
import { DENY_RE, isGovernmentHost } from '../src/content/rules.js';
import type { Condition, Item, Source, TaskDef } from '../src/content/types.js';
import { PERSONA_WEIGHTS } from '../src/core/priority/scoring.js';
import { ensureCompleteFamilySituations, parseKnowledgeBase } from './seed-knowledge-base.js';

const CHECKED = '2026-03-03'; // the legacy KB's LAST_VERIFIED
const FAMILY = {
  constrained_couple: 'COUPLE_CONSTRAINED',
  family_with_children: 'FAMILY_WITH_CHILDREN',
  dual_work_couple: 'COUPLE_DUAL_WORK',
  solo_aewv: 'SOLO',
} as const;
const URGENCY: Record<string, TaskDef['urgency']> = {
  T06: [{ fromDay: 1, toDay: 3, by: 30 }],
  T07: [{ fromDay: 1, toDay: 3, by: 30 }],
  T08: [{ fromDay: 4, toDay: 14, by: 25 }, { months: [2, 3], afterFirstYear: true, by: 25 }],
  T09: [{ months: [2, 3], afterFirstYear: true, by: 25 }],
  T16: [{ fromDay: 275, toDay: 336, by: 30 }],
};

export function convertKbMaster(outDir: string): { dropped: number; droppedByTask: Record<string, number> } {
  const { tasks, errors } = parseKnowledgeBase();
  if (errors.length) throw new Error(`kb-master.md did not parse: ${JSON.stringify(errors)}`);

  const sources: Record<string, Source> = {};
  const droppedByTask: Record<string, number> = {};
  const sourceKey = (url: string): string => {
    const u = new URL(url);
    const key = `${u.hostname}${u.pathname}`.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').toLowerCase();
    sources[key] ??= isGovernmentHost(u.hostname)
      ? { url, title: u.hostname, agency: u.hostname, tier: 'government' }
      : { url, title: u.hostname, agency: u.hostname, tier: 'provider', reason: 'legacy, unverified' };
    return key;
  };

  mkdirSync(join(outDir, 'tasks'), { recursive: true });
  mkdirSync(join(outDir, 'facts'), { recursive: true });
  for (const t of tasks) {
    const v = t.contentVariants.find((c) => c.personaKey === 'solo_aewv')!;
    const source = sourceKey(v.sourceUrl || t.governmentSourceUrl);
    const mk = (section: string, texts: (string | null)[]): Item[] =>
      texts
        .filter((x): x is string => !!x?.trim())
        .filter((x) => !DENY_RE.test(x) || ((droppedByTask[t.id] = (droppedByTask[t.id] ?? 0) + 1), false))
        .map((text, i) => ({
          id: `${t.id}.${section}.${i + 1}`,
          text,
          source,
          checked: CHECKED,
          verified: false,
          // a provider source may back only type C figures (rules.providerType)
          ...(sources[source]!.tier === 'provider' ? { numberType: 'C' as const } : {}),
        }));
    const [cost] = mk('cost', [v.cost]);
    const [advice] = v.professionalAdviceRequired ? mk('advice', [v.professionalAdviceNote]) : [];
    const weights = PERSONA_WEIGHTS as Record<string, Record<string, number>>;
    const family = ensureCompleteFamilySituations(t.applicableFamilySituations);
    const task: TaskDef = {
      id: t.id,
      name: t.name,
      phase: t.phase,
      priority: t.basePriority,
      boosts: Object.entries(FAMILY).flatMap(([persona, fam]) => {
        const by = weights[persona]?.[t.id];
        return by ? [{ when: { family: [fam] }, by }] : [];
      }),
      urgency: URGENCY[t.id] ?? [],
      duration: t.estimatedDuration,
      ...(t.processingTime ? { processingTime: t.processingTime } : {}),
      appliesTo: allOrKeys({ visa: t.applicableVisaTypes, family, occupation: t.applicableOccupations }),
      dependsOn: t.dependencies.map((d) => ({ task: d.prerequisiteId, type: d.dependencyType === 'HARD' ? 'hard' : 'soft' })),
      retired: false,
      why: mk('why', [v.consequenceLine]),
      steps: mk('steps', v.steps),
      documents: mk('documents', v.documentsRequired),
      mistakes: mk('mistakes', v.commonMistakes),
      watchOuts: mk('watchOuts', v.watchOuts),
      ...(cost ? { cost } : {}),
      ...(advice ? { advice: { ...advice, required: true } } : {}),
    };
    writeFileSync(join(outDir, 'tasks', `${t.id}.yaml`), stringify(task, { lineWidth: 0 }));
  }
  writeFileSync(join(outDir, 'sources.yaml'), stringify(sources, { lineWidth: 0 }));
  writeFileSync(join(outDir, 'facts', 'legacy.yaml'), '{}\n');
  const dropped = Object.values(droppedByTask).reduce((a, b) => a + b, 0);
  return { dropped, droppedByTask };
}

// "ALL" on every dimension is the whole-population condition
function allOrKeys(dims: Record<string, string[] | 'ALL'>): Condition {
  const limited = Object.entries(dims).filter((e): e is [string, string[]] => e[1] !== 'ALL');
  return limited.length ? Object.fromEntries(limited) : 'all';
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  const report = convertKbMaster(process.env.CONTENT_DIR ? resolve(process.env.CONTENT_DIR) : resolve(import.meta.dirname, '../content'));
  console.log(`dropped ${report.dropped} denylisted items`, report.droppedByTask);
}
