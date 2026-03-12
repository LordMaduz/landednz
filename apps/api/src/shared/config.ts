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
  port: parseInt(process.env['PORT'] ?? '3000', 10),
  nodeEnv: process.env['NODE_ENV'] ?? 'development',
}
