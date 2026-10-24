import { test, expect } from '@playwright/test'
import { TEST_USER, holdAnswers, resetTestUser, signIn } from './test-user'

test.beforeAll(resetTestUser)

test('email sign-in, route guard and sign-out', async ({ page }) => {
  await page.goto('/app')
  await expect(page).toHaveURL('/signin?redirect=%2Fapp')

  await holdAnswers(page)
  await signIn(page)
  await expect(page).toHaveURL('/app')
  await expect(page.getByRole('heading', { level: 1 })).toContainText(TEST_USER.email.split('@')[0])

  await page.goto('/roadmap')
  await expect(page).toHaveURL('/app/roadmap')

  await page.goto('/signin')
  await expect(page).toHaveURL('/app')

  await page.getByRole('button', { name: /^Account, / }).click()
  await page.getByRole('menuitem', { name: 'Sign out' }).click()
  await expect(page).toHaveURL('/')
  await page.goto('/app')
  await expect(page).toHaveURL('/signin?redirect=%2Fapp')
})
