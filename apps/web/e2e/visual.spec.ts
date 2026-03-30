import { test, expect } from '@playwright/test'

const AUTH_COOKIE = { name: 'sb-dev', value: '1', domain: 'localhost', path: '/' }

test.describe('Visual regression — marketing routes', () => {
  test('landing page /', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await expect(page).toHaveScreenshot('landing-page.png')
  })

  test('onboarding /onboarding', async ({ page }) => {
    await page.goto('/onboarding')
    await page.waitForLoadState('networkidle')
    await expect(page).toHaveScreenshot('onboarding-page.png')
  })

  test('auth /auth/signin', async ({ page }) => {
    await page.goto('/auth/signin')
    await page.waitForLoadState('networkidle')
    await expect(page).toHaveScreenshot('auth-page.png')
  })
})

test.describe('Visual regression — app routes', () => {
  test.beforeEach(async ({ page }) => {
    await page.context().addCookies([AUTH_COOKIE])
  })

  test('roadmap /roadmap', async ({ page }) => {
    await page.goto('/roadmap')
    await page.waitForLoadState('networkidle')
    await expect(page).toHaveScreenshot('roadmap-page.png')
  })

  test('chat /chat', async ({ page }) => {
    await page.goto('/chat')
    await page.waitForLoadState('networkidle')
    await expect(page).toHaveScreenshot('chat-page.png')
  })

  test('settings /settings', async ({ page }) => {
    await page.goto('/settings')
    await page.waitForLoadState('networkidle')
    await expect(page).toHaveScreenshot('settings-page.png')
  })
})
