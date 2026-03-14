import { defineConfig } from 'vitest/config';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env.local for integration tests (DB connection, Supabase URL)
config({ path: resolve(__dirname, '.env.local') });

export default defineConfig({
  test: {
    environment: 'node',
  },
});