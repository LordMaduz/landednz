import { describe, expect, test } from 'vitest';
import * as registry from './registry.js';
import {
  GUIDE_CRISIS_TEXT,
  GUIDE_SYSTEM_PROMPT,
  buildFollowUp,
  buildGuideAboutUser,
  buildStarters,
  buildUnverifiedNote,
  buildWhereYouAre,
} from './registry.js';
import { GUIDE_AGENCIES, type GuideContext } from '../../features/guide/types.js';

const soloContext: GuideContext = {
  userName: 'Ana',
  profile: {
    visaType: 'AEWV',
    city: 'WELLINGTON',
    familySituation: 'SOLO',
    occupation: 'HEALTHCARE',
    arrivalDate: new Date('2026-10-01T00:00:00Z'),
  },
  daysSinceArrival: 28,
  doneTasks: [{ taskKey: 'T01', title: 'Get your IRD number' }],
  nextTasks: [{ taskKey: 'T02', title: 'Open a bank account' }],
  totalTasks: 12,
  currentTask: { taskKey: 'T03', title: 'Enrol with a GP' },
  memories: [{ id: 'm1', text: 'Starts work on 10 November' }],
  taskTitles: new Map([
    ['T01', 'Get your IRD number'],
    ['T02', 'Open a bank account'],
    ['T03', 'Enrol with a GP'],
  ]),
};

describe('GUIDE_SYSTEM_PROMPT', () => {
  test('is long enough to be cached', () => {
    expect(GUIDE_SYSTEM_PROMPT.length).toBeGreaterThanOrEqual(2200);
  });

  test('forbids internal IDs', () => {
    expect(GUIDE_SYSTEM_PROMPT).toContain('Never mention internal IDs');
  });
});

describe('buildGuideAboutUser', () => {
  test('a SOLO profile mentions no partner or second income', () => {
    const text = buildGuideAboutUser(soloContext).toLowerCase();
    for (const word of ['partner', 'spouse', 'single income']) expect(text).not.toContain(word);
  });

  test('names every task by title and never by key', () => {
    const text = buildGuideAboutUser(soloContext);
    for (const title of soloContext.taskTitles.values()) expect(text).toContain(title);
    expect(text).not.toMatch(/\bT\d{2}\b/);
  });

  test('includes saved memories', () => {
    expect(buildGuideAboutUser(soloContext)).toContain('Starts work on 10 November');
  });
});

describe('guide copy', () => {
  test('crisis text leads with Lifeline then 1737', () => {
    expect(GUIDE_CRISIS_TEXT.startsWith('Lifeline NZ: 0800 543 354')).toBe(true);
    expect(GUIDE_CRISIS_TEXT).toContain('Need to Talk? Free call or text 1737.');
  });

  test('unverified note names the host, or drops the last sentence without one', () => {
    expect(buildUnverifiedNote('the fee', 'ird.govt.nz')).toBe(
      "I couldn't confirm the fee against an official source. Check ird.govt.nz.",
    );
    expect(buildUnverifiedNote('the fee', null)).toBe("I couldn't confirm the fee against an official source.");
  });

  test('follow-ups', () => {
    expect(buildFollowUp('more')).toBe('Want the rest?');
    expect(buildFollowUp('task', 'Open a bank account')).toBe('What\'s involved in "Open a bank account"?');
  });

  test('where-you-are line counts progress and names the next task', () => {
    const line = buildWhereYouAre(3, 12, 'Open a bank account');
    expect(line).toContain('3');
    expect(line).toContain('12');
    expect(line).toContain('Open a bank account');
  });

  test('buildStarters returns at most 3', () => {
    const titles = ['A', 'B', 'C', 'D', 'E'];
    for (const kind of ['home', 'roadmap', 'task'] as const) {
      expect(buildStarters({ kind, taskKey: 'T01' }, titles).length).toBeLessThanOrEqual(3);
    }
  });

  test('no registry export string contains a task key', () => {
    const strings = (Object.values(registry) as unknown[]).filter((v): v is string => typeof v === 'string');
    expect(strings.length).toBeGreaterThan(0);
    for (const s of strings) expect(s).not.toMatch(/\bT\d{2,3}\b/);
    const builtFromTask = [
      ...buildStarters({ kind: 'task', taskKey: 'T01' }, ['Get your IRD number']),
      registry.GUIDE_OUT_OF_SCOPE_REPLY('immigration'),
      registry.GUIDE_NOTHING_FOUND_REPLY(null),
    ];
    for (const s of builtFromTask) expect(s).not.toMatch(/\bT\d{2,3}\b/);
  });

  test('redirect replies use vetted copy with a website for every agency', () => {
    for (const agency of GUIDE_AGENCIES) {
      for (const reply of [registry.GUIDE_OUT_OF_SCOPE_REPLY(agency), registry.GUIDE_NOTHING_FOUND_REPLY(agency)]) {
        expect(reply).toMatch(/\b[a-z]+\.(govt|org)\.nz\b/);
        expect(reply).toMatch(/(^|\. )[A-Z]/);
        expect(reply).not.toMatch(/\. [a-z]/);
      }
      expect(registry.GUIDE_UNDERSTAND_PROMPT).toContain(`"${agency}"`);
    }
    expect(registry.GUIDE_NOTHING_FOUND_REPLY(null)).toBe(
      "I couldn't find this in checked sources. The government agency that handles it is the right place to ask.",
    );
  });
});
