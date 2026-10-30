import { test, expect } from '@playwright/test'
import { ANSWERS, resetTestUser, signIn } from './test-user'

test.beforeAll(resetTestUser)

// Spec §9: landing to a done-and-undone task, through onboarding, the preview, sign-in and the assistant (AI_MODE=mock)
test('journey: onboarding, save, sign in, ask, done and undo', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('link', { name: 'Build my roadmap' }).click()

  for (const label of ['Accredited Employer Work Visa (AEWV)', 'Auckland', 'Just me', 'Another job or profession']) {
    await page.getByLabel(label).check()
    await page.getByRole('button', { name: 'Continue' }).click()
  }
  await page.locator('[role=gridcell][data-today]').click() // ANSWERS.arrivalDate is today
  await page.getByRole('button', { name: 'See my roadmap' }).click()

  await expect(page).toHaveURL('/onboarding/preview')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Your roadmap is ready')
  await expect(page.getByRole('heading', { level: 2, name: /^Before you fly · \d+ tasks?$/ })).toBeVisible()
  await expect(page.getByText(/^Start here/)).toBeVisible()
  await expect(page.getByRole('button', { name: 'Show Month 1 and later' })).toHaveAttribute('aria-expanded', 'false')

  await page.getByRole('link', { name: 'Save my roadmap' }).click()
  await expect(page).toHaveURL(/\/signin\?redirect=/)
  await signIn(page)
  await expect(page).toHaveURL('/app')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Welcome to Auckland')

  await page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'Roadmap' }).click()
  await expect(page).toHaveURL('/app/roadmap')
  // The IRD number (T08) sits behind Arrival's "Show n more"; open it from its link
  await page.goto('/app/roadmap?task=T08')
  await expect(page.getByRole('heading', { level: 1, name: 'Apply for your IRD number' })).toBeVisible()

  // Sources sit beside the steps; each opens in a new tab
  const source = page.getByRole('complementary').getByRole('region', { name: 'Sources' }).getByRole('link').first()
  await expect(source).toHaveAttribute('target', '_blank')
  const popup = page.waitForEvent('popup')
  await source.click()
  await (await popup).close()

  // The ask bar opens the guide beside the task; the answer names where it was checked
  await page.getByRole('button', { name: /^Ask about your IRD number/ }).click()
  const guide = page.getByRole('complementary', { name: 'Guide' })
  const ask = guide.getByRole('textbox', { name: 'Question' })
  await ask.fill('What documents do I need?')
  await ask.press('Enter')
  await expect(guide.getByText(/^(LandedNZ's checked guide|Official sites, checked today)$/)).toBeVisible()

  const today = new Intl.DateTimeFormat('en-NZ', { day: 'numeric', month: 'short', timeZone: 'Pacific/Auckland' }).format(new Date())
  await page.getByRole('button', { name: 'Mark as done' }).click()
  await expect(page.getByRole('img', { name: `Done ${today}` })).toBeVisible()
  await page.getByRole('button', { name: 'Undo' }).click()
  await expect(page.getByRole('img', { name: /^Done / })).toHaveCount(0)

  // The Next link in the task header goes to the next task in route order
  const nextLink = page.getByRole('navigation', { name: 'Tasks' }).getByRole('link', { name: /^Next task: / })
  const nextTitle = (await nextLink.getAttribute('aria-label'))!.replace(/^Next task: /, '')
  await nextLink.click()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(nextTitle)
})
