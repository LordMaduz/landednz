import { test, expect } from '@playwright/test'

// Public guides (approved board docs/design/guides/board.html): no sideways scroll, the app's type roles,
// a Guides link in the footer, and the one Start free link reachable within two screens.
const SIZES = [{ width: 390, height: 844, title: 24 }, { width: 1440, height: 900, title: 22 }]

for (const { width, height, title } of SIZES) {
  test.describe(`${width}px`, () => {
    test.use({ viewport: { width, height } })

    test('/guides lists every guide, no sideways scroll', async ({ page }) => {
      await page.goto('/guides')
      await expect(page.getByRole('heading', { level: 1, name: 'Guides' })).toBeVisible()
      expect(await page.getByRole('main').getByRole('link').count()).toBe(27)
      expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBe(0)
      await expect(page.getByRole('navigation', { name: 'Legal' }).getByRole('link', { name: 'Guides' })).toBeVisible()
    })

    test('a guide uses the title role and shows Start free within two screens', async ({ page }) => {
      await page.goto('/guides/get-ird-number')
      const h1 = page.getByRole('heading', { level: 1, name: 'Get your IRD number' })
      expect(await h1.evaluate(e => getComputedStyle(e).fontSize)).toBe(`${title}px`)
      expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBe(0)
      const start = page.getByRole('link', { name: 'Start free' })
      await expect(start).toHaveCount(1)
      expect((await start.boundingBox())!.y).toBeLessThan(height * 2)
      expect(await page.getByRole('heading', { level: 2 }).allTextContents()).toEqual(['Why it matters', 'Steps', "Documents you'll need", 'Common mistakes', 'Watch out for', 'Sources'])
    })
  })
}

// Next sends 200 when the page streams first and 404 when cached (docs: not-found); both carry noindex, so search engines drop it
test('an unknown guide is not indexed and shows no guide', async ({ page }) => {
  const html = await (await page.goto('/guides/nope'))!.text()
  expect(html).toMatch(/<meta name="robots" content="noindex"/)
  await expect(page.getByRole('heading', { level: 1, name: 'Get your IRD number' })).toHaveCount(0)
})
