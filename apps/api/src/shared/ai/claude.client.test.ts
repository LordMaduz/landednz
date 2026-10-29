import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { config } from '../config.js';
import { streamGuideAnswer, type GuideAnswerRequest } from './claude.client.js';

// The SDK is faked so the live request shape and stream handling run offline
const sdk = vi.hoisted(() => ({ params: undefined as any, events: [] as unknown[] }));
vi.mock('@anthropic-ai/sdk', () => ({
  default: class {
    messages = {
      stream: (params: unknown) => {
        sdk.params = params;
        return (async function* () {
          yield* sdk.events;
        })();
      },
    };
  },
}));

const request = (history: GuideAnswerRequest['history']): GuideAnswerRequest => ({
  system: 'sys',
  history,
  aboutUser: 'About me',
  documents: [],
  question: 'How do I get an IRD number?',
});

describe('streamGuideAnswer (live request)', () => {
  const saved = { ...config };
  beforeEach(() => {
    Object.assign(config, { aiMode: 'live', anthropicModel: 'claude-sonnet-5-5', guideAnswerThinking: 'between_tools' });
    sdk.events = [];
  });
  afterEach(() => {
    Object.assign(config, saved);
  });

  test('sends the configured thinking only on Sonnet 5.5', async () => {
    await streamGuideAnswer(request([]), () => {}, new AbortController().signal);
    expect(sdk.params.thinking).toEqual({ type: 'between_tools' });

    config.anthropicModel = 'claude-haiku-5-5';
    await streamGuideAnswer(request([]), () => {}, new AbortController().signal);
    expect(sdk.params).not.toHaveProperty('thinking');
  });

  test('drops empty turns and leading assistant turns from history', async () => {
    await streamGuideAnswer(
      request([
        { role: 'assistant', content: 'Earlier reply' },
        { role: 'user', content: 'First question' },
        { role: 'assistant', content: '  ' },
        { role: 'user', content: 'Second question' },
        { role: 'assistant', content: 'A reply' },
      ]),
      () => {},
      new AbortController().signal,
    );
    const roles = sdk.params.messages.map((m: { role: string; content: unknown }) => [m.role, m.content]);
    expect(roles.slice(0, -1)).toEqual([
      ['user', 'First question'],
      ['user', 'Second question'],
      ['assistant', 'A reply'],
    ]);
  });

  test('resolves aborted when the signal aborts and the stream ends without throwing', async () => {
    const controller = new AbortController();
    controller.abort();
    const result = await streamGuideAnswer(request([]), () => {}, controller.signal);
    expect(result.stopReason).toBe('aborted');
  });
});
