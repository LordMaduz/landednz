import { describe, expect, test } from 'vitest';
import { loadConfig } from './config.js';

const MOCK_ENV = {
  DATABASE_URL: 'postgresql://postgres:postgres@127.0.0.1:54322/postgres',
  SUPABASE_URL: 'http://127.0.0.1:54321',
  SUPABASE_SECRET_KEY: 'sb_secret_test',
  AI_MODE: 'mock',
};

const LIVE_ENV = {
  ...MOCK_ENV,
  AI_MODE: 'live',
  ANTHROPIC_API_KEY: 'sk-ant-test',
  ANTHROPIC_MODEL: 'claude-haiku-5-5',
  OPENAI_API_KEY: 'sk-test',
};

describe('loadConfig', () => {
  test('config throws "Missing required environment variable: AI_MODE" when unset', () => {
    const { AI_MODE: _unset, ...env } = MOCK_ENV;
    expect(() => loadConfig(env)).toThrow('Missing required environment variable: AI_MODE');
  });

  test('config throws "AI_MODE must be live or mock" for "Mock"', () => {
    expect(() => loadConfig({ ...MOCK_ENV, AI_MODE: 'Mock' })).toThrow('AI_MODE must be live or mock');
  });

  test('guide settings default and validate', () => {
    const c = loadConfig(MOCK_ENV);
    expect(c.guideDailyCap).toBe(20);
    expect(c.guideRelevanceFloor).toBe(0.3);
    expect(c.guideAnswerThinking).toBe('between_tools');
    expect(() => loadConfig({ ...MOCK_ENV, GUIDE_RELEVANCE_FLOOR: '1.5' })).toThrow(
      'GUIDE_RELEVANCE_FLOOR must be a number from 0 to 1',
    );
    expect(() => loadConfig({ ...MOCK_ENV, GUIDE_ANSWER_THINKING: 'off' })).toThrow(
      'GUIDE_ANSWER_THINKING must be between_tools or adaptive',
    );
  });

  test('config throws "Missing required environment variable: SUPABASE_SECRET_KEY" when unset', () => {
    const { SUPABASE_SECRET_KEY: _unset, ...env } = MOCK_ENV;
    expect(() => loadConfig(env)).toThrow('Missing required environment variable: SUPABASE_SECRET_KEY');
  });

  test('mock mode does not require AI keys', () => {
    const config = loadConfig(MOCK_ENV);
    expect(config.aiMode).toBe('mock');
  });

  test('per-IP rate limit is 120 a minute unless RATE_LIMIT_PER_MINUTE says otherwise', () => {
    expect(loadConfig(MOCK_ENV).rateLimitPerMinute).toBe(120);
    expect(loadConfig({ ...MOCK_ENV, RATE_LIMIT_PER_MINUTE: '1000' }).rateLimitPerMinute).toBe(1000);
    expect(() => loadConfig({ ...MOCK_ENV, RATE_LIMIT_PER_MINUTE: '0' })).toThrow(
      'RATE_LIMIT_PER_MINUTE must be a positive integer',
    );
  });

  test('live mode requires ANTHROPIC_API_KEY', () => {
    const { ANTHROPIC_API_KEY: _unset, ...env } = LIVE_ENV;
    expect(() => loadConfig(env)).toThrow('Missing required environment variable: ANTHROPIC_API_KEY');
  });

  test('live mode loads AI keys and model', () => {
    const config = loadConfig(LIVE_ENV);
    expect(config.aiMode).toBe('live');
    expect(config.anthropicModel).toBe('claude-haiku-5-5');
    expect(config.openaiApiKey).toBe('sk-test');
  });

  test('trustProxy is false unless TRUST_PROXY is "true"', () => {
    expect(loadConfig(MOCK_ENV).trustProxy).toBe(false);
    expect(loadConfig({ ...MOCK_ENV, TRUST_PROXY: 'true' }).trustProxy).toBe(true);
  });

  test('sentryDsn and release are read from env and optional', () => {
    expect(loadConfig(MOCK_ENV).sentryDsn).toBeUndefined();
    const config = loadConfig({ ...MOCK_ENV, SENTRY_DSN: 'https://k@o.ingest.sentry.io/1', RAILWAY_GIT_COMMIT_SHA: 'abc' });
    expect(config.sentryDsn).toBe('https://k@o.ingest.sentry.io/1');
    expect(config.release).toBe('abc');
  });
});
