import { test, expect } from '@playwright/test'
import { ANSWERS, TEST_USER, resetTestUser, signIn } from './test-user'

test.beforeAll(resetTestUser)

// Spec §9: landing to a done-and-undone task, through onboarding, the preview, sign-in and the assistant (AI_MODE=mock)
test('journey: onboarding, save, sign in, ask, done and undo', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('link', { name: 'Build my roadmap' }).click()

  for (const label of ['Accredited Employer Work Visa (AEWV)', 'Auckland', 'Just me', 'Another job or profession']) {
    await page.getByLabel(label).check()
    await page.getByRole('button', { name: 'Continue' }).click()
  }
  await page.getByLabel('Arrival date').fill(ANSWERS.arrivalDate)
  await page.getByRole('button', { name: 'See my roadmap' }).click()

  await expect(page).toHaveURL('/onboarding/preview')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Your roadmap is ready')
  // 19 in total: 15 listed in the first legs (phases 1 to 3), 4 folded into "Month 1 and later"
  await expect(page.getByText(/^4 tasks: /)).toBeVisible()
  await expect(page.locator('main li.route-step')).toHaveCount(15)

  await page.getByRole('link', { name: 'Save my roadmap' }).click()
  await expect(page).toHaveURL(/\/signin\?redirect=/)
  await signIn(page)
  await expect(page).toHaveURL('/app')
  await expect(page.getByRole('heading', { level: 1 })).toContainText(TEST_USER.email.split('@')[0])

  await page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'Roadmap' }).click()
  await expect(page).toHaveURL('/app/roadmap')
  // The IRD number is an Arrival task (phase 2), and the Arrival leg is open on arrival day
  const arrival = page.getByRole('list', { name: 'Your route' }).getByRole('listitem').filter({ has: page.getByRole('heading', { name: /^Arrival/ }) })
  await arrival.getByRole('button', { name: /^Apply for your IRD number/ }).click()

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
