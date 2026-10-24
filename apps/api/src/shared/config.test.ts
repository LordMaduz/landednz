import { describe, expect, test } from 'vitest';
import { loadConfig } from './config.js';

const MOCK_ENV = {
  DATABASE_URL: 'postgresql://postgres:postgres@127.0.0.1:54322/postgres',
  SUPABASE_URL: 'http://127.0.0.1:54321',
  SUPABASE_SECRET_KEY: 'sb_secret_test',
  AI_MODE: 'mock',
  CHAT_DAILY_CAP: '50',
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

  test('config throws for CHAT_DAILY_CAP that is not a positive integer', () => {
    for (const value of ['0', '-3', '1.5', 'fifty']) {
      expect(() => loadConfig({ ...MOCK_ENV, CHAT_DAILY_CAP: value })).toThrow(
        'CHAT_DAILY_CAP must be a positive integer',
      );
    }
  });

  test('config throws "Missing required environment variable: CHAT_DAILY_CAP" when unset', () => {
    const { CHAT_DAILY_CAP: _unset, ...env } = MOCK_ENV;
    expect(() => loadConfig(env)).toThrow('Missing required environment variable: CHAT_DAILY_CAP');
  });

  test('config throws "Missing required environment variable: SUPABASE_SECRET_KEY" when unset', () => {
    const { SUPABASE_SECRET_KEY: _unset, ...env } = MOCK_ENV;
    expect(() => loadConfig(env)).toThrow('Missing required environment variable: SUPABASE_SECRET_KEY');
  });

  test('mock mode does not require AI keys', () => {
    const config = loadConfig(MOCK_ENV);
    expect(config.aiMode).toBe('mock');
    expect(config.chatDailyCap).toBe(50);
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
});
