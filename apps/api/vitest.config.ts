import { defineConfig } from 'vitest/config';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env.local for integration tests (DB connection, Supabase URL)
config({ path: resolve(import.meta.dirname, '.env.local'), quiet: true });

export default defineConfig({
  test: {
    environment: 'node',
    // Free deterministic AI by default; `AI_MODE=live npm run test:run` runs against real Claude + OpenAI
    // BETA_MODE off and the default rate limit here: these tests cover the gates that dev, e2e and R0 deploys relax
    env: { AI_MODE: process.env.AI_MODE ?? 'mock', BETA_MODE: 'false', RATE_LIMIT_PER_MINUTE: '120' },
    // Integration tests share canonical task IDs in the DB — run files sequentially
    // to prevent concurrent CREATE conflicts between test files.
    fileParallelism: false,
    // Include RAG golden examples (not named *.test.ts — named per spec convention)
    include: ['**/*.{test,spec}.{ts,js}', 'golden-examples/**/*.ts'],
  },
});