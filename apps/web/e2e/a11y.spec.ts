import AxeBuilder from '@axe-core/playwright'
import { test, expect, type Page } from '@playwright/test'
import { askFromBar, holdAnswers, resetTestUser, signIn } from './test-user'

const PUBLIC = ['/', '/onboarding?step=1', '/signin', '/privacy', '/terms']
const SIGNED_IN = ['/app', '/app/roadmap', '/app/roadmap?task=T08', '/settings', '/settings?edit=arrivalDate', '/settings?edit=city']

async function expectNoViolations(page: Page, path: string) {
  await page.goto(path)
  await page.waitForLoadState('networkidle')
  // the floating ask bar overlaps whatever scrolls under it; at the bottom it rests below the content
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
  await expectAxe(page, path)
}

async function expectAxe(page: Page, path: string) {
  // axe reads colours and boxes mid-animation wrongly; scan once everything has settled
  await page.waitForFunction(() => document.getAnimations().every(a => a.playState !== 'running'))
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
    await page.goto('/onboarding')
    for (const label of ['Accredited Employer Work Visa (AEWV)', 'Auckland', 'Just me', 'Another job or profession']) {
      await page.getByLabel(label).check()
      await page.getByRole('button', { name: 'Continue' }).click()
    }
    await expect(page.getByRole('heading', { level: 1, name: 'When do you land?' })).toBeVisible() // /onboarding?step=5 with answers
    await page.locator('[role=gridcell][data-today]').click()
    await expectAxe(page, '/onboarding?step=5')
    await page.goto('/signin')
    await expect(page.getByRole('heading', { level: 1, name: 'Save your roadmap' })).toBeVisible()
    await expectNoViolations(page, '/signin') // with held answers: "Save your roadmap"

    await page.goto('/signin')
    await signIn(page)
    await expect(page).toHaveURL('/app')
    for (const path of SIGNED_IN) await expectNoViolations(page, path)

    // The empty-Enter note above the ask bar (from 1024)
    if (width >= 1024) {
      await page.goto('/app')
      await page.locator('#guide-ask').press('Enter')
      await expect(page.getByText('Type a question to start chatting.')).toBeVisible()
      await expectAxe(page, '/app + empty-Enter note')
    }

    // The guide open on a task: the chat in the right column from 1024, the sheet on a phone (its Ask is in the task's action bar)
    await page.goto('/app/roadmap?task=T08')
    if (width >= 1024) await askFromBar(page, 'What do I need?')
    else await page.getByRole('group', { name: 'Task actions' }).getByRole('button', { name: 'Ask', exact: true }).click()
    await expect(page.getByRole(width >= 1024 ? 'complementary' : 'dialog', { name: 'Guide' })).toBeVisible()
    await expectAxe(page, '/app/roadmap?task=T08 + guide')
  })
}
