import { test, expect, type Page } from '@playwright/test'
import { holdAnswers, resetTestUser } from './test-user'

// text-hero 48, title 24, 22 (title/hero on phones), section 18, body 15, small 13, citation 12
export const TYPE_SET = ['48px', '24px', '22px', '18px', '15px', '13px', '12px']
const SIZES = [[1440, 900], [390, 844]]

// Visible elements with their own text node whose font size is outside the type set
export async function expectTypeScale(page: Page, path: string) {
  await page.goto(path)
  await page.waitForLoadState('networkidle')
  const offenders = await page.evaluate((allowed) => {
    const out: string[] = []
    for (const el of document.body.querySelectorAll('*')) {
      if (!Array.from(el.childNodes).some((n) => n.nodeType === 3 && n.textContent?.trim())) continue
      if (['SCRIPT', 'STYLE', 'NOSCRIPT'].includes(el.tagName)) continue
      const r = el.getBoundingClientRect()
      const cs = getComputedStyle(el)
      if (!r.width || !r.height || cs.visibility === 'hidden' || cs.display === 'none') continue
      if (allowed.includes(cs.fontSize)) continue
      const text = (el.textContent ?? '').trim().slice(0, 30)
      out.push(`${el.tagName.toLowerCase()}.${String(el.className).slice(0, 60)} "${text}" ${cs.fontSize}`)
    }
    return out
  }, TYPE_SET)
  expect(offenders, `${path} font sizes outside the type set`).toEqual([])
}

test.beforeAll(resetTestUser)

for (const [width, height] of SIZES) {
  test(`pre-sign-in pages use the type scale at ${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height })
    for (const path of ['/', '/signin', '/onboarding?step=1']) await expectTypeScale(page, path)

    await page.goto('/')
    await expect(page.getByRole('heading', { level: 1 })).toHaveCSS('font-size', width === 1440 ? '48px' : '22px')

    // With held answers /signin is the "Save your roadmap" screen
    await holdAnswers(page)
    await expectTypeScale(page, '/signin')
    await expectTypeScale(page, '/onboarding/preview')
  })
}
