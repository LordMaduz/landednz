import { test, expect } from '@playwright/test'
import { ANSWERS, TEST_USER, resetTestUser, signIn } from './test-user'

test.beforeAll(resetTestUser)

// Spec §9: landing to a done-and-undone task, through onboarding, the preview, sign-in and the assistant (AI_MODE=mock)
test('journey: onboarding, save, sign in, ask, done and undo', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('link', { name: 'Build my roadmap' }).click()

  for (const label of ['Accredited Employer Work Visa (AEWV)', 'Auckland', 'Just me', 'Technology']) {
    await page.getByLabel(label).check()
    await page.getByRole('button', { name: 'Continue' }).click()
  }
  await page.getByLabel('Arrival date').fill(ANSWERS.arrivalDate)
  await page.getByRole('button', { name: 'See my roadmap' }).click()

  await expect(page).toHaveURL('/onboarding/preview')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Your roadmap is ready')
  // 20 in total: 10 listed in the first legs, 10 folded into "Month 1 and later"
  await expect(page.getByText(/^10 tasks: /)).toBeVisible()
  await expect(page.locator('main li.route-step')).toHaveCount(10)

  await page.getByRole('link', { name: 'Save my roadmap' }).click()
  await expect(page).toHaveURL(/\/signin\?redirect=/)
  await signIn(page)
  await expect(page).toHaveURL('/app')
  await expect(page.getByRole('heading', { level: 1 })).toContainText(TEST_USER.email.split('@')[0])

  await page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'Roadmap' }).click()
  await expect(page).toHaveURL('/app/roadmap')
  await page.getByRole('button', { name: 'Show Week 1 tasks' }).click()
  await page.getByRole('button', { name: /^Apply for your IRD number/ }).click()

  const ask = page.getByRole('textbox', { name: /^Ask about / })
  await ask.fill('What documents do I need?')
  await ask.press('Enter')
  await expect(page.getByText('Answered from the LandedNZ knowledge base')).toBeVisible()

  const today = new Intl.DateTimeFormat('en-NZ', { day: 'numeric', month: 'short', timeZone: 'Pacific/Auckland' }).format(new Date())
  await page.getByRole('button', { name: 'Mark as done' }).click()
  await expect(page.getByRole('img', { name: `Done ${today}` })).toBeVisible()
  await page.getByRole('button', { name: 'Undo' }).click()
  await expect(page.getByRole('img', { name: /^Done / })).toHaveCount(0)
})
