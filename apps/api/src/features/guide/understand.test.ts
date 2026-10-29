import { afterEach, describe, expect, it, vi } from 'vitest';
import { setMockStructured } from '../../shared/ai/mock.js';
import type { GuideContext } from './types.js';

// Lets one test make the Haiku call hang; every other test goes through the real mock path.
const hang = vi.hoisted(() => ({ on: false }));
vi.mock('../../shared/ai/claude.client.js', async (importOriginal) => {
  const orig = await importOriginal<typeof import('../../shared/ai/claude.client.js')>();
  return {
    ...orig,
    structuredHaiku: (...args: Parameters<typeof orig.structuredHaiku>) =>
      hang.on ? new Promise(() => {}) : orig.structuredHaiku(...args),
  };
});

const { understand, hasCrisisSignal, understandingSchema } = await import('./understand.js');

const ctx: GuideContext = {
  userName: 'Sam',
  profile: {
    visaType: 'SKILLED_MIGRANT_RESIDENT',
    city: 'AUCKLAND',
    familySituation: 'SOLO',
    occupation: 'OTHER_PROFESSIONAL',
    arrivalDate: new Date('2026-09-01'),
  },
  daysSinceArrival: 58,
  doneTasks: [],
  nextTasks: [],
  totalTasks: 0,
  currentTask: null,
  memories: [],
  taskTitles: new Map(),
};

const haikuResult = {
  searchQuery: 'How do I get an IRD number',
  scope: 'in',
  redirectAgency: null,
  needsLive: false,
  distress: false,
  memoryCandidates: [{ text: 'Partner starts work in March', sensitive: false, explicit: false }],
};

afterEach(() => {
  setMockStructured(null);
  hang.on = false;
  vi.useRealTimers();
});

describe('understand', () => {
  it('passes the Haiku result through', async () => {
    setMockStructured(() => haikuResult);
    expect(await understand('how do I get one?', [], ctx)).toEqual(haikuResult);
  });

  it('uses the question when Haiku returns a blank searchQuery', async () => {
    setMockStructured(() => ({ ...haikuResult, searchQuery: '  ' }));
    expect((await understand('how do I get one?', [], ctx)).searchQuery).toBe('how do I get one?');
  });

  it('falls back to the raw question when Haiku throws', async () => {
    setMockStructured(() => {
      throw new Error('boom');
    });
    expect(await understand('Where do I enrol with a GP?', [], ctx)).toEqual({
      searchQuery: 'Where do I enrol with a GP?',
      scope: 'in',
      redirectAgency: null,
      needsLive: false,
      distress: false,
      memoryCandidates: [],
    });
  });

  it('falls back within 1.2 s when Haiku hangs', async () => {
    vi.useFakeTimers();
    hang.on = true;
    const result = understand('What is KiwiSaver?', [], ctx);
    await vi.advanceTimersByTimeAsync(1_200);
    await expect(result).resolves.toMatchObject({ searchQuery: 'What is KiwiSaver?', scope: 'in' });
  });

  it('turns distress on from the keyword check when Haiku says no', async () => {
    setMockStructured(() => haikuResult);
    expect((await understand('I want to end my life', [], ctx)).distress).toBe(true);
  });

  it('keeps distress on in the fallback when the question has a crisis signal', async () => {
    expect((await understand('I feel suicidal', [], ctx)).distress).toBe(true);
  });

  it('truncates loose Haiku output after parse', async () => {
    const long = 'x'.repeat(300);
    setMockStructured(() => ({
      ...haikuResult,
      memoryCandidates: Array.from({ length: 5 }, () => ({ text: long, sensitive: false, explicit: false })),
    }));
    const { memoryCandidates } = await understand('q', [], ctx);
    expect(memoryCandidates).toHaveLength(3);
    expect(memoryCandidates.every((m) => m.text.length === 200)).toBe(true);
  });

  it('rejects an unknown redirect agency', () => {
    expect(understandingSchema.safeParse({ ...haikuResult, redirectAgency: 'police' }).success).toBe(false);
  });
});

describe('hasCrisisSignal', () => {
  it.each(['I want to end my life', 'SUICIDAL thoughts', "I can't go on", 'thinking about self-harm', 'I will take my own life', 'I just want to end it all', "I don't want to be here", 'I dont want to be here', 'I don’t want to be here'])(
    'flags %s',
    (text) => expect(hasCrisisSignal(text)).toBe(true),
  );

  it('ignores ordinary phrases', () => {
    expect(hasCrisisSignal('Can I kill two birds with one stone and get IRD and a bank account?')).toBe(false);
  });
});
