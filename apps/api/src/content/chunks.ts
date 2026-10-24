// RAG chunks built from the bundle: per task, one chunk for its general items and one per distinct
// `when`, each listing its sources. Pure — scripts/sync-chunks.ts writes them to KnowledgeBaseChunk.
import { createHash } from 'node:crypto';
import type { Bundle, ResolvedItem } from './build.js';
import type { Condition } from './types.js';

export type Chunk = {
  chunkKey: string;
  taskId: string;
  when: Condition | null;
  content: string;
  itemIds: string[];
  sourceIds: string[];
  contentHash: string;
};

const SECTIONS = [
  ['why', 'Why'],
  ['steps', 'Steps'],
  ['documents', 'Documents'],
  ['mistakes', 'Common mistakes'],
  ['watchOuts', 'Watch outs'],
  ['cost', 'Cost'],
  ['advice', 'Advice'],
] as const;

const sha256 = (s: string) => createHash('sha256').update(s).digest('hex');

export function buildChunks(bundle: Bundle): Chunk[] {
  return bundle.tasks
    .filter((t) => !t.retired)
    .flatMap((task) => {
      const sections = SECTIONS.map(([key, heading]) => [heading, [task[key] ?? []].flat()] as const);
      const whens = new Map<string, Condition | null>([['general', null]]);
      for (const [, items] of sections)
        for (const i of items) if (i.when) whens.set(sha256(JSON.stringify(i.when)).slice(0, 8), i.when);

      return [...whens].flatMap(([suffix, when]) => {
        const json = JSON.stringify(when ?? undefined);
        const mine = (i: ResolvedItem) => JSON.stringify(i.when) === json;
        const parts = sections.map(([heading, items]) => [heading, items.filter(mine)] as const).filter(([, items]) => items.length);
        if (!parts.length) return [];
        const items = parts.flatMap(([, items]) => items);
        const sourceIds = [...new Set(items.flatMap((i) => [i.source, ...i.factIds.map((f) => bundle.facts[f]!.source)]))];
        const content = [
          task.name,
          ...parts.map(([heading, items]) => `${heading}:\n${items.map((i) => `- ${i.text}`).join('\n')}`),
          `Sources:\n${sourceIds.map((s) => `- ${bundle.sources[s]!.title} — ${bundle.sources[s]!.url}`).join('\n')}`,
        ].join('\n\n');
        return [{ chunkKey: `CHUNK_${task.id}_${suffix}`, taskId: task.id, when, content, itemIds: items.map((i) => i.id), sourceIds, contentHash: sha256(content) }];
      });
    });
}
