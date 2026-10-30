import { test, expect, type Page } from '@playwright/test'
import { askFromBar, holdAnswers, resetTestUser, signIn } from './test-user'

// Signed-in pages from 1024 px: the header and footer stay on screen and only the content between them scrolls.
// The Guide chat in Task's right column fits between them at every scroll position.
test.beforeAll(resetTestUser)

const box = (page: Page, sel: string) =>
  page.locator(sel).first().evaluate(e => {
    const b = e.getBoundingClientRect()
    return { top: Math.round(b.top), bottom: Math.round(b.bottom), vh: innerHeight }
  })

async function expectFrame(page: Page, label: string) {
  const header = await box(page, 'header')
  const footer = await box(page, 'footer')
  expect(header.top, `${label} header`).toBe(0)
  expect(footer.bottom, `${label} footer`).toBe(footer.vh)
}

test('header and footer stay on screen; the Task pane fits between them', async ({ page }) => {
  test.setTimeout(120_000)
  await holdAnswers(page)
  await page.goto('/signin')
  await signIn(page)
  await expect(page).toHaveURL('/app')
  for (const width of [1024, 1440, 1920]) {
    await page.setViewportSize({ width, height: 860 })
    for (const path of ['/app', '/app/roadmap', '/settings', '/app/roadmap?task=T08']) {
      await page.goto(path)
      await page.waitForLoadState('networkidle')
      await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight))
      await expectFrame(page, `${path} at ${width}`)
    }
    // Chat open on Task, scrolled to the end: its header row (Back to task, Expand) is between the page header and footer
    await page.evaluate(() => scrollTo(0, 0))
    await askFromBar(page, 'What do I need?')
    // let the column's fade-in finish (and the composer take focus) before measuring
    await page.locator('#guide-pane').evaluate(e => Promise.all(e.getAnimations().map(a => a.finished)))
    await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight))
    await page.waitForTimeout(100)
    const header = await box(page, 'header')
    const footer = await box(page, 'footer')
    const expand = await box(page, '#guide-pane button[aria-label="Expand"]')
    const composer = await box(page, '#guide-composer')
    expect(expand.top, `pane top row at ${width}`).toBeGreaterThanOrEqual(header.bottom)
    expect(composer.bottom, `composer at ${width}`).toBeLessThanOrEqual(footer.top)
    await expectFrame(page, `task pane at ${width}`)
    await page.getByRole('button', { name: 'Back to task' }).click()
  }
})
