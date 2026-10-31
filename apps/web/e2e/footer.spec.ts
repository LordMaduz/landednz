import { test, expect, type Page } from '@playwright/test'
import { holdAnswers, resetTestUser, signIn } from './test-user'

// Tall windows show the most empty space; 900 and 844 are the usual sizes
const SIZES = [[1440, 1600], [1440, 900], [390, 1200], [390, 844]]

// Signed-out pages: the footer is one fixed height and ends at the bottom of the page, however tall the window
async function expectFooterAtBottom(page: Page, path: string, width: number) {
  await page.goto(path)
  await page.waitForLoadState('networkidle')
  const m = await page.evaluate(() => {
    const top = document.querySelector("footer")!.getBoundingClientRect().top + scrollY
    // From the footer line to the end of the page: the footer itself, nothing under it
    return { height: Math.round(document.documentElement.scrollHeight - top) }
  })
  // footer role 36 / 56 / 44 (desktop) + its 1 px top border
  expect(m, `${path} at ${width}`).toEqual({ height: width >= 1024 ? 45 : width > 561 ? 57 : 37 })
}

test.beforeAll(resetTestUser)

// The landing header stays on screen while the page scrolls
test('landing header sticks', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')
  await page.evaluate(() => scrollTo(0, 600))
  expect(await page.locator('header').evaluate(e => Math.round(e.getBoundingClientRect().top))).toBe(0)
})

for (const [width, height] of SIZES) {
  test(`footer sits at the bottom at ${width}x${height}`, async ({ page }) => {
    await page.setViewportSize({ width, height })
    for (const path of ['/', '/signin', '/privacy', '/terms']) await expectFooterAtBottom(page, path, width)
    // Onboarding has no footer, question steps or preview (owner, 2026-11-01)
    await page.goto('/onboarding?step=1')
    await expect(page.locator('footer')).toHaveCount(0)
    await holdAnswers(page)
    await page.goto('/onboarding/preview')
    await expect(page.locator('footer')).toHaveCount(0)
    await expectFooterAtBottom(page, '/signin', width)
    await page.goto('/signin')
    await signIn(page)
    await expect(page).toHaveURL('/app')
    // Signed-in pages have no footer; on phones the page ends with 56 px of room for the tab bar
    for (const path of ['/app', '/app/roadmap', '/settings']) {
      await page.goto(path)
      await page.waitForLoadState('networkidle')
      await expect(page.locator('footer'), `${path} at ${width}`).toHaveCount(0)
    }
  })
}
