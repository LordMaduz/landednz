import { test, expect } from '@playwright/test'

const AUTH_COOKIE = { name: 'sb-dev', value: '1', domain: 'localhost', path: '/' }

test.describe('App routes — sidebar layout', () => {
  test.beforeEach(async ({ page }) => {
    await page.context().addCookies([AUTH_COOKIE])
  })

  for (const route of ['/roadmap', '/chat', '/settings']) {
    test(`${route} sidebar visibility`, async ({ page, viewport }) => {
      await page.goto(route)
      const isMobile = viewport ? viewport.width < 768 : false
      if (isMobile) {
        // Mobile: sidebar hidden via CSS (still in DOM), hamburger visible
        await expect(page.locator('aside')).not.toBeVisible()
      } else {
        // Tablet + desktop: sidebar visible
        await expect(page.locator('aside')).toBeVisible()
      }
    })
  }
})

test.describe('Marketing routes — no sidebar', () => {
  for (const route of ['/', '/onboarding', '/auth/signin']) {
    test(`${route} has no sidebar`, async ({ page }) => {
      await page.goto(route)
      await expect(page.locator('aside')).not.toBeAttached()
    })
  }
})

test.describe('Auth middleware', () => {
  test('unauthenticated /roadmap redirects to /auth/signin', async ({ page }) => {
    await page.goto('/roadmap')
    await expect(page).toHaveURL(/\/auth\/signin/)
  })
})
