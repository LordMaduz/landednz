// Validates all required environment variables at startup.
// Process exits immediately if any required var is missing — fail fast, never silently.

function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value
}

export const config = {
  databaseUrl: requireEnv('DATABASE_URL'),
  supabaseUrl: requireEnv('SUPABASE_URL'),
  port: parseInt(process.env['PORT'] ?? '3000', 10),
  nodeEnv: process.env['NODE_ENV'] ?? 'development',
  // CORS origins — comma-separated list, defaults to localhost for development
  corsOrigin: process.env['CORS_ORIGIN']?.split(',') ?? ['http://localhost:3000', 'http://127.0.0.1:3000'],
  // Optional — if set, POST /admin/recalculate requires X-Admin-Key header to match.
  // If not set (local dev), the check is skipped.
  adminApiKey: process.env['ADMIN_API_KEY'],
  // Anthropic API — required for chat advisor (Job B)
  anthropicApiKey: requireEnv('ANTHROPIC_API_KEY'),
  anthropicModel: requireEnv('ANTHROPIC_MODEL'),
  // OpenAI API — required for RAG embeddings (text-embedding-3-small, 1536 dims)
  openaiApiKey: requireEnv('OPENAI_API_KEY'),
  // Beta mode — if true, bypasses all subscription checks (all users get premium access)
  betaMode: process.env['BETA_MODE'] === 'true',
}
