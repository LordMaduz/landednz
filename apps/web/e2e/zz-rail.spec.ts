import { test, expect } from '@playwright/test'
import { ANSWERS, askFromBar, resetTestUser, signIn } from './test-user'
// Throwaway capture for the guide-rail critique; delete after the redesign
test.beforeAll(resetTestUser)
const S = '/private/tmp/claude-501/-Users-ruchira-Development-NZ-Project/71d8d5b9-05e2-4754-890f-462373ee3e5a/scratchpad/rail-before'
const shoot = async (page: import('@playwright/test').Page, name: string) => {
  for (const w of [1440, 1280, 1024]) { await page.setViewportSize({ width: w, height: 900 }); await page.waitForTimeout(400); await page.screenshot({ path: S + '/' + w + '-' + name + '.png' }) }
}
test('rail', async ({ page }) => {
  test.setTimeout(180_000)
  await page.setViewportSize({ width: 1440, height: 900 })
  // Arrival 30 days out so the roadmap has its pre-arrival tasks too
  const arrivalDate = new Date(Date.now() + 30 * 864e5).toISOString().slice(0, 10)
  expect((await page.request.post('/api/onboarding-answers', { data: { ...ANSWERS, arrivalDate } })).status()).toBe(204); await page.goto('/signin'); await signIn(page); await page.waitForURL('/app')
  const qs: Record<string, string[]> = { T09: ['What should I do first for this?', 'What documents do I need?'], T28: ['How long does this take?'], T08: ['What should I do first for this?', 'Is there a cost?'] }
  for (const [t, list] of Object.entries(qs)) for (const q of list) {
    await page.goto('/app/roadmap?task=' + t); await expect(page.locator('#guide-ask')).toBeVisible()
    await askFromBar(page, q)
    const pane = page.getByRole('complementary', { name: 'Guide' })
    await expect(pane.getByRole('list', { name: 'Steps' }).last()).toBeVisible({ timeout: 30000 })
    await expect(pane.getByRole('button', { name: 'Stop' })).toHaveCount(0, { timeout: 30000 })
  }
  await page.goto('/app'); await page.getByRole('button', { name: 'Open conversation' }).click()
  await page.waitForTimeout(1200)
  const { writeFileSync } = await import('node:fs'); writeFileSync(S + '/rail.html', await page.locator('#guide-pane').innerHTML())
  await shoot(page, 'everything')
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.locator('nav[aria-label="This conversation, by task"] button').first().click()
  await shoot(page, 'task')
  await page.goto('/app/roadmap?task=T28'); await page.waitForTimeout(800)
  await page.screenshot({ path: S + '/1440-task-page.png' })
  await page.getByRole('button', { name: /Open conversation|Expand/ }).first().click().catch(() => {}); await page.waitForTimeout(800)
  await page.getByRole('button', { name: /Expand|Full/ }).first().click().catch(() => {}); await page.waitForTimeout(800)
  await shoot(page, 'from-task')
})
