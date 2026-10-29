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
    baseURL: process.env.BASE_URL ?? process.env.E2E_WEB_URL ?? 'http://localhost:3000',
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  // BASE_URL = a deployed target, so nothing starts locally. Otherwise Supabase must already be running
  // (`supabase start`); the API and web app start here if not up.
  webServer: process.env.BASE_URL ? undefined : [
    {
      command: 'npm run dev -w @landednz/api',
      cwd: '../..',
      url: `${process.env.E2E_API_URL ?? 'http://localhost:3001'}/health`,
      reuseExistingServer: true,
    },
    {
      command: 'npm run dev',
      url: process.env.E2E_WEB_URL ?? 'http://localhost:3000',
      reuseExistingServer: true,
    },
  ],
})
