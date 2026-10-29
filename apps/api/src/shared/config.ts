// Validates all required environment variables at startup.
// Process exits immediately if any required var is missing — fail fast, never silently.

import { z } from 'zod';

type Env = Record<string, string | undefined>;

function requireEnv(env: Env, name: string): string {
  const value = env[name]
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value
}

function parseEnv<T>(env: Env, name: string, schema: z.ZodType<T>, message: string): T {
  const result = schema.safeParse(requireEnv(env, name))
  if (!result.success) {
    throw new Error(message)
  }
  return result.data
}

export function loadConfig(env: Env = process.env) {
  // live = real Claude + OpenAI; mock = deterministic replies and embeddings (shared/ai/mock.ts)
  const aiMode = parseEnv(env, 'AI_MODE', z.enum(['live', 'mock']), 'AI_MODE must be live or mock')
  // AI keys are only needed when the real SDKs are called
  const requireLive = (name: string) => (aiMode === 'live' ? requireEnv(env, name) : env[name])

  return {
    databaseUrl: requireEnv(env, 'DATABASE_URL'),
    supabaseUrl: requireEnv(env, 'SUPABASE_URL'),
    // Server-only admin key: deletes Supabase auth users (DELETE /account)
    supabaseSecretKey: requireEnv(env, 'SUPABASE_SECRET_KEY'),
    port: parseInt(env['PORT'] ?? '3000', 10),
    nodeEnv: env['NODE_ENV'] ?? 'development',
    // CORS origins — comma-separated list, defaults to localhost for development
    corsOrigin: env['CORS_ORIGIN']?.split(',') ?? ['http://localhost:3000', 'http://127.0.0.1:3000'],
    // Optional — if set, POST /admin/recalculate requires X-Admin-Key header to match.
    // If not set (local dev), the check is skipped.
    adminApiKey: env['ADMIN_API_KEY'],
    aiMode,
    // Global per-IP requests a minute; e2e raises it, one IP drives the whole journey
    rateLimitPerMinute: parseEnv(
      { RATE_LIMIT_PER_MINUTE: '120', ...env },
      'RATE_LIMIT_PER_MINUTE',
      z.coerce.number().int().positive(),
      'RATE_LIMIT_PER_MINUTE must be a positive integer',
    ),
    // Per-user chat messages per NZ day
    chatDailyCap: parseEnv(env, 'CHAT_DAILY_CAP', z.coerce.number().int().positive(), 'CHAT_DAILY_CAP must be a positive integer'),
    // Settlement guide: questions per NZ day, retrieval relevance floor, answer thinking mode
    guideDailyCap: parseEnv(
      { GUIDE_DAILY_CAP: '20', ...env },
      'GUIDE_DAILY_CAP',
      z.coerce.number().int().positive(),
      'GUIDE_DAILY_CAP must be a positive integer',
    ),
    guideRelevanceFloor: parseEnv(
      { GUIDE_RELEVANCE_FLOOR: '0.3', ...env },
      'GUIDE_RELEVANCE_FLOOR',
      z.coerce.number().min(0).max(1),
      'GUIDE_RELEVANCE_FLOOR must be a number from 0 to 1',
    ),
    guideAnswerThinking: parseEnv(
      { GUIDE_ANSWER_THINKING: 'between_tools', ...env },
      'GUIDE_ANSWER_THINKING',
      z.enum(['between_tools', 'adaptive']),
      'GUIDE_ANSWER_THINKING must be between_tools or adaptive',
    ),
    // Anthropic API — required for chat advisor (Job B) in live mode
    anthropicApiKey: requireLive('ANTHROPIC_API_KEY'),
    anthropicModel: requireLive('ANTHROPIC_MODEL'),
    // OpenAI API — required for RAG embeddings (text-embedding-3-small, 1536 dims) in live mode
    openaiApiKey: requireLive('OPENAI_API_KEY'),
    // Beta mode — if true, bypasses all subscription checks (all users get premium access)
    betaMode: env['BETA_MODE'] === 'true',
    // Behind Render/Railway's proxy, so req.ip (and the rate limit) use X-Forwarded-For
    trustProxy: env['TRUST_PROXY'] === 'true',
    // Sentry is off without a DSN
    sentryDsn: env['SENTRY_DSN'] || undefined,
    release: env['RENDER_GIT_COMMIT'] ?? env['RAILWAY_GIT_COMMIT_SHA'],
  }
}

export const config = loadConfig()
