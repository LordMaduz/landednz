import { test, expect } from '@playwright/test'
import { ANSWERS } from './test-user'

// "Change my answers" on the preview reopens step 1 with the saved answers, and Continue works
test('change my answers keeps the answers editable', async ({ page }) => {
  await page.goto('/onboarding')
  for (const label of ['Accredited Employer Work Visa (AEWV)', 'Auckland', 'Just me', 'Technology']) {
    await page.getByLabel(label).check()
    await page.getByRole('button', { name: 'Continue' }).click()
  }
  await page.getByLabel('Arrival date').fill(ANSWERS.arrivalDate)
  await page.getByRole('button', { name: 'See my roadmap' }).click()
  await expect(page).toHaveURL('/onboarding/preview')

  await page.getByRole('link', { name: 'Change my answers' }).click()
  await expect(page).toHaveURL('/onboarding?step=1')
  await expect(page.getByLabel('Accredited Employer Work Visa (AEWV)')).toBeChecked()
  await page.getByLabel('Green List, work to residence').check()
  await expect(page.getByRole('button', { name: 'Continue' })).toBeEnabled()
})
