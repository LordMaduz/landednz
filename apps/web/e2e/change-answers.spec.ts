import { test, expect } from '@playwright/test'

// "Change my answers" on the preview reopens step 1 with the saved answers, and Continue works
test('change my answers keeps the answers editable', async ({ page }) => {
  await page.goto('/onboarding')
  for (const label of ['Accredited Employer Work Visa (AEWV)', 'Auckland', 'Just me', 'Another job or profession']) {
    await page.getByLabel(label).check()
    await page.getByRole('button', { name: 'Continue' }).click()
  }
  await page.locator('[role=gridcell][data-today]').click() // ANSWERS.arrivalDate is today
  await page.getByRole('button', { name: 'See my roadmap' }).click()
  await expect(page).toHaveURL('/onboarding/preview')

  await page.getByRole('link', { name: 'Change my answers' }).click()
  await expect(page).toHaveURL('/onboarding?step=1')
  await expect(page.getByLabel('Accredited Employer Work Visa (AEWV)')).toBeChecked()
  await page.getByLabel('Straight to Residence Visa (Green List Tier 1)').check()
  await expect(page.getByRole('button', { name: 'Continue' })).toBeEnabled()
})
