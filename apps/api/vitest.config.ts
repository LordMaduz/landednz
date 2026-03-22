import { defineConfig } from 'vitest/config';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env.local for integration tests (DB connection, Supabase URL)
config({ path: resolve(__dirname, '.env.local') });

export default defineConfig({
  test: {
    environment: 'node',
    // Integration tests share canonical task IDs in the DB — run files sequentially
    // to prevent concurrent CREATE conflicts between test files.
    fileParallelism: false,
    // Include RAG golden examples (not named *.test.ts — named per spec convention)
    include: ['**/*.{test,spec}.{ts,js}', 'golden-examples/**/*.ts'],
  },
});