// Sentence gate: turns the streamed, cited answer into finished-sentence parts; no half sentences, task IDs or chunk IDs leave it.
import type { ReplyPart } from '@landednz/types';
import type { AnswerEvent } from '../../shared/ai/claude.client.js';
import type { Passage, ReleasedSentence } from './types.js';

export type SentenceGate = {
  push(e: AnswerEvent): void;
  end(): ReleasedSentence[];
  dropTail(): void;
  sentTextCount(): number;
};

const ABBREVIATIONS = new Set(['e.g', 'i.e', 'etc', 'st', 'mt', 'no']);
// closers: quotes, brackets and Markdown bold/italic ("**Step one.**")
const BOUNDARY = /[.!?]["')*_]*(?=\s|$)|\n/g;
const LIMITS_HEADING = /^what i can['’]t tell you$/i;

export function createSentenceGate(opts: {
  passages: Passage[];
  taskTitles: Map<string, string>;
  emit: (part: ReplyPart) => void;
}): SentenceGate {
  let buf = '';
  let pending: ReleasedSentence['citations'] = [];
  const released: ReleasedSentence[] = [];
  const sourceIndex = new Map<number, number>();
  const linked = new Set<string>();
  // Answer shape for the UI (spec §4.1: the UI never parses text): numbered lines are steps, the "What I can't tell you" heading starts a limits block
  let lineStart = true;
  let step: number | null = null;
  let limits = false;

  // End offset of the first finished sentence in buf, or -1. Buffer end only counts once the block is over.
  const nextEnd = (blockOver: boolean): number => {
    for (const m of buf.matchAll(BOUNDARY)) {
      const end = m.index + m[0].length;
      if (m[0] === '\n') return end;
      if (end === buf.length && !blockOver) return -1;
      const before = buf.slice(0, m.index);
      const word = (/(\S+)$/.exec(before)?.[1] ?? '').replace(/^["'(]+/, '');
      const isAbbreviation =
        m[0].startsWith('.') &&
        (ABBREVIATIONS.has(word.toLowerCase()) || /^[A-Z]$/.test(word) || (/^\d+$/.test(word) && /(^|\n)\s*\d+$/.test(before)));
      if (!isAbbreviation) return end;
    }
    return -1;
  };

  const release = (raw: string): void => {
    const atLineStart = lineStart;
    lineStart = /\n\s*$/.test(raw);
    if (atLineStart) {
      if (LIMITS_HEADING.test(raw.trim().replace(/[*#_]/g, '').replace(/:$/, '').trim())) {
        limits = true;
        return;
      }
      const marker = /^\s*(\d+)[.)]\s+/.exec(raw);
      step = marker ? Number(marker[1]) : null;
      if (marker) raw = raw.slice(marker[0].length);
    }
    const lineStep = step;
    if (lineStart) step = null;
    const links: ReplyPart[] = [];
    const text = raw
      .replace(/\bT\d{2,3}\b/g, (id) => {
        const title = opts.taskTitles.get(id);
        if (!title) return '';
        if (!linked.has(id)) {
          linked.add(id);
          links.push({ type: 'task_link', taskKey: id, title });
        }
        return title;
      })
      .replace(/CHUNK_\w+/g, '')
      .replace(/\*\*/g, '') // Markdown bold: the UI shows plain text (spec §4.1)
      .replace(/ {2,}/g, ' ')
      .replace(/ +([.,!?])/g, '$1')
      .trim();
    if (!text) return; // keep waiting citations for the next real sentence
    const citations = pending;
    pending = [];

    // shortcut: a citation that arrives before a multi-sentence chunk attaches to its first sentence; cited blocks are usually one claim — revisit if live answers show mis-attached sources
    const indexes: number[] = [];
    for (const c of citations) {
      const passage = opts.passages[c.passageIndex];
      if (!passage) continue;
      let index = sourceIndex.get(c.passageIndex);
      if (index === undefined) {
        index = sourceIndex.size + 1;
        sourceIndex.set(c.passageIndex, index);
        opts.emit({ type: 'source', index, title: passage.title, url: passage.url, origin: passage.origin, checkedAt: passage.checkedAt });
      }
      if (!indexes.includes(index)) indexes.push(index);
    }
    const block = lineStep !== null ? { block: 'step' as const, step: lineStep } : limits ? { block: 'limits' as const } : {};
    opts.emit({ type: 'text', text, citations: indexes, ...block });
    links.forEach(opts.emit);
    released.push({ text, citations });
  };

  const drain = (blockOver: boolean): void => {
    for (let end = nextEnd(blockOver); end >= 0; end = nextEnd(blockOver)) {
      const raw = buf.slice(0, end);
      buf = buf.slice(end);
      release(raw);
    }
  };

  return {
    push(e) {
      if (e.type === 'text') {
        buf += e.text;
        drain(false);
      } else if (e.type === 'citation') {
        pending.push({ passageIndex: e.documentIndex, citedText: e.citedText });
      } else {
        // Only a finished sentence is released here: the next block's citation can arrive before its text
        drain(true);
        limits = false;
      }
    },
    end() {
      drain(true);
      // Nothing follows now, so an excepted ending ("etc.", "So do I.") is a finished sentence; a bare "2." is not
      const tail = buf.trim();
      if (/[.!?]["')]*$/.test(tail) && !/(^|\n)\s*\d+\.$/.test(tail)) {
        buf = '';
        release(tail);
      }
      return released;
    },
    dropTail() {
      buf = '';
      pending = [];
    },
    sentTextCount: () => released.length,
  };
}
