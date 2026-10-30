import { test, expect, type Page } from '@playwright/test'
import { holdAnswers, resetTestUser, signIn } from './test-user'

// Tall windows show the most empty space; 900 and 844 are the usual sizes
const SIZES = [[1440, 1600], [1440, 900], [390, 1200], [390, 844]]

// The footer is one fixed height and ends at the bottom of the page, however tall the window
// Signed-in footers on phones also hold 56 px of room for the tab bar; from 1024 px they stay at the window bottom (see app-frame.spec)
async function expectFooterAtBottom(page: Page, path: string, width: number, app = false) {
  await page.goto(path)
  await page.waitForLoadState('networkidle')
  if (app && width >= 1024) {
    // the in-flow spacer stands in for the fixed footer at the end of the page
    await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight))
    const bottom = await page.evaluate(() => Math.round(document.querySelector('footer')!.getBoundingClientRect().bottom - innerHeight))
    expect(bottom, `${path} at ${width}`).toBe(0)
    return
  }
  const m = await page.evaluate(() => {
    const top = document.querySelector("footer")!.getBoundingClientRect().top + scrollY
    // From the footer line to the end of the page: the footer itself, nothing under it
    return { height: Math.round(document.documentElement.scrollHeight - top) }
  })
  expect(m, `${path} at ${width}`).toEqual({ height: width > 561 ? 65 : app ? 93 : 37 })
}

test.beforeAll(resetTestUser)

for (const [width, height] of SIZES) {
  test(`footer sits at the bottom at ${width}x${height}`, async ({ page }) => {
    await page.setViewportSize({ width, height })
    for (const path of ['/', '/signin', '/privacy', '/terms', '/onboarding?step=1']) await expectFooterAtBottom(page, path, width)
    await holdAnswers(page)
    for (const path of ['/signin', '/onboarding/preview', '/onboarding?step=5']) await expectFooterAtBottom(page, path, width)
    await page.goto('/signin')
    await signIn(page)
    await expect(page).toHaveURL('/app')
    // The open task hides the footer on phones
    const paths = ['/app', '/app/roadmap', '/settings', '/settings?edit=arrivalDate', ...(width > 561 ? ['/app/roadmap?task=T08'] : [])]
    for (const path of paths) await expectFooterAtBottom(page, path, width, true)
  })
}
