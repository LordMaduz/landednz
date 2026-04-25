import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: 'list',
  globalSetup: './e2e/global-setup.ts',
  globalTeardown: './e2e/global-teardown.ts',
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: true,
  },
  use: {
    baseURL: 'http://localhost:3000',
  },
  projects: [
    // ── Viewport projects for layout + visual regression tests ──
    {
      name: 'desktop-1440',
      testMatch: /layout\.spec\.ts|visual\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1440, height: 900 },
      },
    },
    {
      name: 'desktop-1280',
      testMatch: /layout\.spec\.ts|visual\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 800 },
      },
    },
    {
      name: 'tablet-1024',
      testMatch: /layout\.spec\.ts|visual\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1024, height: 768 },
      },
    },
    {
      name: 'tablet-768',
      testMatch: /layout\.spec\.ts|visual\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 768, height: 1024 },
      },
    },
    {
      name: 'mobile-375',
      testMatch: /layout\.spec\.ts|visual\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 375, height: 812 },
      },
    },
    // ── E2E journey test — desktop-1280 only, uses saved auth state ──
    {
      name: 'e2e-journey',
      testMatch: /journey\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 800 },
        storageState: './e2e/playwright-auth.json',
      },
    },
  ],
})
