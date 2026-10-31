import { test, expect, type Page } from '@playwright/test'
import { askFromBar, holdAnswers, resetTestUser, signIn } from './test-user'

// Plan B Task 9.7: the settlement guide in the real app (AI_MODE=mock, real local auth)
test.beforeAll(resetTestUser)

async function signedIn(page: Page) {
  await page.setViewportSize({ width: 1440, height: 900 })
  await holdAnswers(page)
  await page.goto('/signin')
  await signIn(page)
  await expect(page).toHaveURL('/app')
}

// The bar is a box you type into from 1024 px; its label always starts "Ask about your" ("Ask about this" on Home and Roadmap is a button)
const askBar = (page: Page) => page.getByRole('textbox', { name: /^Ask about your / })
const pane = (page: Page) => page.getByRole('complementary', { name: 'Guide' })
const composer = (page: Page) => pane(page).getByRole('textbox', { name: 'Question' })

test('ask on a task: steps, limits, a source preview and the task card', async ({ page }) => {
  await signedIn(page)
  await page.goto('/app/roadmap?task=T08')
  await expect(askBar(page)).toHaveAccessibleName(/^Ask about your IRD number/)
  await askFromBar(page, 'Can I start work?')
  await expect(composer(page)).toBeFocused()

  const steps = pane(page).getByRole('list', { name: 'Steps' })
  await expect(steps.getByRole('listitem').first()).toContainText('Register for myIR first.')
  await expect(pane(page).getByText("What I can't tell you")).toBeVisible()
  // The title comes from the API's task_link part, rendered as it is
  await expect(pane(page).getByRole('link', { name: /IRD number/ })).toHaveAttribute('href', '/app/roadmap?task=T08')

  await pane(page).getByRole('button', { name: 'Source 1' }).click()
  const preview = page.getByRole('dialog')
  await expect(preview.getByRole('link', { name: /^Open on / })).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(preview).toBeHidden()
})

test('the ask bar is on Home, Roadmap and Task only; no header Ask anywhere', async ({ page }) => {
  await signedIn(page)
  for (const [path, label] of [
    ['/app', /^Ask about your first 90 days/],
    ['/app/roadmap', /^Ask about your roadmap/],
    ['/app/roadmap?task=T08', /^Ask about your IRD number/],
  ] as const) {
    await page.goto(path)
    await expect(askBar(page)).toHaveAccessibleName(label)
    await expect(page.getByRole('banner').getByRole('button', { name: /^Ask/ })).toHaveCount(0)
  }
  await page.goto('/settings')
  await expect(page.getByRole('heading', { level: 1, name: 'Your details' })).toBeVisible()
  await expect(askBar(page)).toHaveCount(0)
  await expect(page.getByRole('banner').getByRole('button', { name: /^Ask/ })).toHaveCount(0)
})

test('"/" focuses the bar; Enter on an empty bar only shows a note; Escape returns focus to the bar', async ({ page }) => {
  await signedIn(page)
  await page.goto('/app/roadmap?task=T08')
  await expect(page.getByRole('heading', { level: 1, name: 'Apply for your IRD number' })).toBeFocused()
  await page.keyboard.press('/')
  await expect(askBar(page)).toBeFocused()
  // focusing the sticky bar never scrolls the page (the bar cancels html's scroll-padding)
  expect(await page.evaluate(() => scrollY)).toBe(0)
  await askBar(page).press('Enter')
  await expect(page.getByRole('status').filter({ hasText: 'Type a question to start chatting.' })).toBeVisible()
  await expect(pane(page)).toHaveCount(0)
  await askFromBar(page, 'What do I need?')
  await expect(composer(page)).toBeFocused()
  const y = await page.evaluate(() => scrollY)
  await page.keyboard.press('Escape')
  await expect(pane(page)).toHaveCount(0)
  await expect(askBar(page)).toBeFocused()
  expect(await page.evaluate(() => scrollY)).toBe(y)
  // Tab back into the bar from the control before it: the page stays where it is
  await page.keyboard.press('Shift+Tab')
  const before = await page.evaluate(() => scrollY)
  await page.keyboard.press('Tab')
  await expect(askBar(page)).toBeFocused()
  expect(await page.evaluate(() => scrollY)).toBe(before)
  await expect(page.getByRole('complementary', { name: 'Task actions' })).toBeVisible()
})

// The mock never remembers anything, so the memory API is stood in for here; its real behaviour is covered by the API tests
test('Settings → Memory: edit and delete', async ({ page }) => {
  let memories = [{ id: 'm1', text: 'You start work on 9 November.', createdAt: '2026-10-30T01:00:00.000Z', updatedAt: '2026-10-30T01:00:00.000Z' }]
  await page.route('**/guide/memories', route => route.fulfill({ json: memories }))
  await page.route('**/guide/memories/m1', async route => {
    if (route.request().method() === 'DELETE') {
      memories = []
      return route.fulfill({ status: 204 })
    }
    memories = [{ ...memories[0], text: (route.request().postDataJSON() as { text: string }).text }]
    return route.fulfill({ json: memories[0] })
  })
  await signedIn(page)
  await page.goto('/settings')
  await expect(page.getByText('1 thing the guide remembers')).toBeVisible()
  await page.getByRole('link', { name: /^Manage/ }).click()
  await expect(page).toHaveURL('/settings?edit=memory')
  await page.getByRole('button', { name: 'Edit', exact: true }).click()
  await page.getByRole('textbox', { name: 'Memory' }).fill('You start work on 16 November.')
  await page.getByRole('button', { name: 'Save', exact: true }).click()
  await expect(page.getByText('You start work on 16 November.')).toBeVisible()
  await page.getByRole('button', { name: 'Delete', exact: true }).click()
  await expect(page.getByText("The guide hasn't remembered anything yet.")).toBeVisible()
})

test('daily cap: the limit message and a disabled composer', async ({ page }) => {
  await signedIn(page)
  await page.route('**/guide/messages', route =>
    route.request().method() === 'POST'
      ? route.fulfill({
          status: 429,
          json: { error: 'CHAT_DAILY_CAP_REACHED', message: 'Daily limit reached', resetAt: new Date(Date.now() + 3_600_000).toISOString() },
        })
      : route.continue(),
  )
  await page.goto('/app/roadmap')
  await askFromBar(page, 'What next?')
  await expect(pane(page).getByText("That's the 20 questions for today. You can ask again after midnight.")).toBeVisible()
  await expect(composer(page)).toBeDisabled()
})

test('distress: the crisis card comes first with three tel: links', async ({ page }) => {
  await signedIn(page)
  await page.goto('/app')
  await askFromBar(page, "I can't go on like this")
  const card = pane(page).getByRole('region', { name: 'Support' })
  await expect(card).toBeVisible()
  await expect(card.getByRole('link')).toHaveCount(3)
  for (const tel of ['tel:1737', 'tel:0800543354', 'tel:111']) await expect(card.locator(`a[href="${tel}"]`)).toBeVisible()
})

// The full view belongs to the page it was opened on: a header link closes it, and while open the header shows Guide as current
test('header links leave the full view; the Guide tab shows only while it is open', async ({ page }) => {
  await signedIn(page)
  const nav = page.getByRole('navigation', { name: 'Main' }).first()
  await askFromBar(page, 'Where do I start?')
  await expect(pane(page)).toBeVisible()
  await expect(nav.getByText('Guide')).toHaveAttribute('aria-current', 'page')
  await expect(nav.getByRole('link', { name: 'Home' })).not.toHaveAttribute('aria-current')

  await nav.getByRole('link', { name: 'Roadmap' }).click()
  await expect(page).toHaveURL('/app/roadmap')
  await expect(pane(page)).toBeHidden()
  await expect(page.locator('main h1').first()).toBeVisible()
  await expect(nav.getByText('Guide')).toHaveCount(0)
  await expect(nav.getByRole('link', { name: 'Roadmap' })).toHaveAttribute('aria-current', 'page')

  // the tab you are already on also leaves the full view
  await page.getByRole('button', { name: 'Open conversation' }).click()
  await expect(pane(page)).toBeVisible()
  await nav.getByRole('link', { name: 'Roadmap' }).click()
  await expect(pane(page)).toBeHidden()
})
