import AxeBuilder from '@axe-core/playwright'
import { test, expect, type Page } from '@playwright/test'
import { holdAnswers, resetTestUser, signIn } from './test-user'

const PUBLIC = ['/', '/onboarding?step=1', '/signin', '/privacy', '/terms']
const SIGNED_IN = ['/app', '/app/roadmap', '/app/roadmap?task=T08', '/settings']

async function expectNoViolations(page: Page, path: string) {
  await page.goto(path)
  await page.waitForLoadState('networkidle')
  const { violations } = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze()
  expect(violations.map(v => `${path}: ${v.id} (${v.nodes.map(n => n.target.join(' ')).join(', ')})`)).toEqual([])
}

test.beforeAll(resetTestUser)

for (const [width, height] of [[1440, 900], [390, 844]]) {
  test(`axe on every page at ${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height })
    for (const path of PUBLIC) await expectNoViolations(page, path)

    await holdAnswers(page)
    await expectNoViolations(page, '/onboarding/preview')

    await page.goto('/signin')
    await signIn(page)
    await expect(page).toHaveURL('/app')
    for (const path of SIGNED_IN) await expectNoViolations(page, path)
  })
}
