// Per-task review page: every answer combination's visible items, grouped, for the owner to approve before `verified`.
import type { Bundle, ResolvedItem, ResolvedTask } from './build.js';
import { itemsFor } from './index.js';
import { matches } from './matches.js';
import type { DimensionKey, Profile } from './types.js';

const FIELD: Record<DimensionKey, keyof Profile> = { visa: 'visaType', city: 'city', family: 'familySituation', occupation: 'occupation' };
const KEYS = Object.keys(FIELD) as DimensionKey[];
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const find = (bundle: Bundle, taskId: string): ResolvedTask => {
  const t = bundle.tasks.find((t) => t.id === taskId);
  if (!t) throw new Error(`Unknown task: ${taskId}`);
  return t;
};

const allProfiles = (bundle: Bundle): Profile[] =>
  KEYS.reduce<Record<string, string>[]>(
    (acc, k) => acc.flatMap((p) => (bundle.dimensions[k]?.values ?? []).map(([v]) => ({ ...p, [FIELD[k]]: v }))),
    [{}],
  ) as Profile[];

type Items = ReturnType<typeof itemsFor>;
const flat = (i: Items): ResolvedItem[] =>
  [i.why, ...i.steps, ...i.documents, ...i.mistakes, ...i.watchOuts, i.cost, i.advice].filter((x): x is ResolvedItem => !!x);

export function variants(bundle: Bundle, taskId: string): { profiles: Profile[]; items: Items }[] {
  const t = find(bundle, taskId);
  const groups = new Map<string, { profiles: Profile[]; items: Items }>();
  for (const p of allProfiles(bundle).filter((p) => matches(t.appliesTo, p))) {
    const items = itemsFor(t, p);
    const key = flat(items).map((i) => i.id).join('|');
    const g = groups.get(key);
    if (g) g.profiles.push(p);
    else groups.set(key, { profiles: [p], items });
  }
  return [...groups.values()];
}

export function reviewHtml(bundle: Bundle, taskId: string): string {
  const t = find(bundle, taskId);
  const label = (k: DimensionKey, v: string) => bundle.dimensions[k]?.values.find(([x]) => x === v)?.[1] ?? v;
  const row = (kind: string, i: ResolvedItem) => {
    const s = bundle.sources[i.source];
    const src = s ? `<a href="${esc(s.url)}">${esc(s.title)}</a>` : esc(i.source);
    return `<li><span class="k">${kind}</span> ${esc(i.text)}<div class="m">${src} · checked ${esc(i.checked)} · <b class="${i.verified ? 'ok' : 'no'}">${i.verified ? 'verified' : 'unverified'}</b> · ${esc(i.id)}</div></li>`;
  };
  const section = (g: { profiles: Profile[]; items: Items }, n: number) => {
    const { items } = g;
    const rows = [
      ...(items.why ? [row('Why', items.why)] : ['<li class="gap">No why item</li>']),
      ...(items.steps.length ? items.steps.map((i) => row('Step', i)) : ['<li class="gap">No steps</li>']),
      ...items.documents.map((i) => row('Document', i)),
      ...items.mistakes.map((i) => row('Mistake', i)),
      ...items.watchOuts.map((i) => row('Watch out', i)),
      ...(items.cost ? [row('Cost', items.cost)] : []),
      ...(items.advice ? [row(items.advice.required ? 'Advice (required)' : 'Advice', items.advice)] : []),
    ];
    const who = g.profiles
      .map((p) => esc(KEYS.map((k) => label(k, p[FIELD[k]])).join(' / ')))
      .map((l) => `<li>${l}</li>`)
      .join('');
    return `<section><h2>Variant ${n + 1} <small>${g.profiles.length} combination(s)</small></h2><ul class="items">${rows.join('')}</ul><details><summary>Shown to</summary><ul>${who}</ul></details></section>`;
  };
  const css = 'body{font:15px/1.5 system-ui,sans-serif;max-width:50rem;margin:2rem auto;padding:0 1rem;color:#111}h2{margin-top:2rem;border-top:1px solid #ddd;padding-top:1rem}small{color:#666;font-weight:400}ul.items{padding:0;list-style:none}ul.items li{margin:.75rem 0;white-space:pre-line}.m{white-space:normal}.k{font-size:12px;text-transform:uppercase;color:#555;margin-right:.5rem}.m{font-size:13px;color:#555}.ok{color:#176b2c}.no{color:#b3261e}.gap{color:#b3261e}';
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>${esc(t.id)} review</title><style>${css}</style></head><body><h1>${esc(t.id)} ${esc(t.name)}</h1><p class="m">Content ${esc(bundle.version)} · built ${esc(bundle.builtAt)}</p>${variants(bundle, taskId).map(section).join('')}</body></html>`;
}
