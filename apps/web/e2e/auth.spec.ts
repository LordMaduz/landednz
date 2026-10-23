import { test, expect } from '@playwright/test'
import { TEST_USER } from './test-user'

test('email sign-in, route guard and sign-out', async ({ page }) => {
  await page.goto('/app')
  await expect(page).toHaveURL('/signin?redirect=%2Fapp')

  await page.getByLabel('Email').fill(TEST_USER.email)
  await page.getByLabel('Password').fill(TEST_USER.password)
  await page.getByRole('button', { name: 'Sign in' }).click()

  await expect(page).toHaveURL('/app')
  await expect(page.getByText(`Signed in as ${TEST_USER.email}`)).toBeVisible()
  await expect(page.getByText('No profile yet')).toBeVisible()

  await page.goto('/roadmap')
  await expect(page).toHaveURL('/app')

  await page.goto('/signin')
  await expect(page).toHaveURL('/app')

  await page.getByRole('button', { name: 'Sign out' }).click()
  await expect(page).toHaveURL('/signin')
  await page.goto('/app')
  await expect(page).toHaveURL('/signin?redirect=%2Fapp')
})
