import { defineConfig, devices } from '@playwright/test'

process.loadEnvFile?.('.env.local')

export default defineConfig({
  testDir: './e2e',
  globalTeardown: './e2e/global-teardown.ts',
  fullyParallel: false,
  // Every spec resets the one shared e2e user
  workers: 1,
  forbidOnly: !!process.env.CI,
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  // Supabase must already be running (`supabase start`); the API and web app start here if not up.
  webServer: [
    {
      command: 'npm run dev -w @landednz/api',
      cwd: '../..',
      url: 'http://localhost:3001/health',
      reuseExistingServer: true,
    },
    {
      command: 'npm run dev',
      url: 'http://localhost:3000',
      reuseExistingServer: true,
    },
  ],
})
