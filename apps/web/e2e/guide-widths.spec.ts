import { test, expect, type Browser, type BrowserContext, type Page } from '@playwright/test'
import { askFromBar, holdAnswers, resetTestUser, signIn } from './test-user'

// Chat window (2026-10-31): the guide open on Task, Home and Roadmap at every width band. Task: the chat takes the
// 400 px right column and the card never moves; Home and Roadmap: the full view. No sideways scroll, no clipped text,
// Mark as done in view, task steps ≥45 characters a line.
test.beforeAll(resetTestUser)

const PAGES = ['/app/roadmap?task=T08', '/app', '/app/roadmap']
const WIDTHS = [1024, 1180, 1280, 1366, 1440, 1536, 1600, 1680, 1920]
const COLUMN = 400 // --grid-template-columns-task, px at every width and root size
const BACK: Record<string, string> = { '/app': 'Back to Home', '/app/roadmap': 'Back to your roadmap' }

type Case = { width: number; height: number; rootPx?: number; zoom?: number }
const CASES: Case[] = [
  ...WIDTHS.map(width => ({ width, height: 900 })),
  { width: 1366, height: 768 },
  { width: 1280, height: 900, rootPx: 20 },
  { width: 1440, height: 900, zoom: 1.25 },
  { width: 1440, height: 900, zoom: 2 },
]

// The conversation exists (asked once in the test), so the bar's mark opens it without spending a question (D9)
async function openGuide(page: Page, wide: boolean) {
  if (wide) {
    // a real mouse click: locator.click() first scrolls the sticky bar's flow position into view, which no user does
    const b = (await page.getByRole('button', { name: 'Open conversation' }).boundingBox())!
    await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2)
  }
  else await page.getByRole('button', { name: /^Ask about your / }).click()
}

// The card's position on screen: it must not move, sideways or up, when the chat opens (D5)
const cardAt = (page: Page) =>
  page.evaluate(() => {
    const r = document.querySelector('main .grid > div')!.getBoundingClientRect()
    return { left: Math.round(r.left), top: Math.round(r.top) }
  })

// Text cut off: wider than a box that hides overflow, or running past the page area into the pane.
// Deliberate ellipsis (.truncate) and sr-only are skipped.
const clipped = (page: Page) =>
  page.evaluate(() => {
    const mainRight = document.querySelector('main')!.getBoundingClientRect().right
    return [...document.querySelectorAll('main *, #guide-pane *')]
      .filter((el): el is HTMLElement => el instanceof HTMLElement && el.offsetParent !== null)
      .filter(el => [...el.childNodes].some(n => n.nodeType === Node.TEXT_NODE && n.textContent!.trim()))
      .filter(el => !el.closest('.truncate, .sr-only'))
      .filter(
        el =>
          (getComputedStyle(el).overflowX !== 'visible' && el.scrollWidth > el.clientWidth + 1) ||
          (el.closest('main') && el.getBoundingClientRect().left + el.scrollWidth > mainRight + 1),
      )
      .map(el => `${el.tagName.toLowerCase()} "${el.textContent!.trim().slice(0, 40)}" ${el.scrollWidth}>${el.clientWidth}`)
  })

// Characters per rendered line of the longest task step (desktop layout); characters ÷ lines (D16)
const stepCharsPerLine = (page: Page) =>
  page.evaluate(() => {
    const steps = [...document.querySelectorAll<HTMLElement>('main section ol > li > div')].filter(el => el.offsetParent !== null)
    const longest = steps.sort((a, b) => b.textContent!.length - a.textContent!.length)[0]
    if (!longest) return null
    // lines from height ÷ line-height (client rects split at the raised citation numbers)
    const lines = Math.round(longest.getBoundingClientRect().height / parseFloat(getComputedStyle(longest).lineHeight))
    return longest.textContent!.trim().length / Math.max(lines, 1)
  })

async function check(page: Page, path: string, c: Case) {
  const label = `${path} @ ${c.width}×${c.height}${c.rootPx ? ` root ${c.rootPx}px` : ''}${c.zoom ? ` zoom ${c.zoom * 100}%` : ''}`
  const window = c.zoom ? Math.round(c.width / c.zoom) : c.width
  const task = path.includes('task=')
  await page.goto(path)
  if (c.rootPx) await page.addStyleTag({ content: `html { font-size: ${c.rootPx}px }` })
  await expect(page.locator('main h1').first()).toBeVisible()
  const closed = task && window >= 1024 ? await cardAt(page) : null
  await openGuide(page, window >= 1024)

  expect.soft(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${label}: sideways scroll`).toBe(true)
  if (window < 1024) {
    await expect(page.getByRole('dialog', { name: 'Guide' }), `${label}: sheet`).toBeVisible()
    return
  }
  const guide = page.locator('#guide-pane')
  await expect(guide).toBeVisible()
  expect.soft(await clipped(page), `${label}: clipped text`).toEqual([])

  if (!task) {
    await expect.soft(page.getByRole('button', { name: BACK[path] }), `${label}: full view`).toBeVisible()
    const composer = (await page.locator('#guide-composer').boundingBox())!
    expect.soft(composer.y + composer.height <= page.viewportSize()!.height, `${label}: composer on screen`).toBe(true)
    return
  }

  await expect(page.locator('#guide-composer')).toBeFocused()
  expect.soft(await cardAt(page), `${label}: card moved`).toEqual(closed)
  expect.soft(Math.round((await guide.boundingBox())!.width), `${label}: column width`).toBe(COLUMN)
  const done = guide.getByRole('button', { name: 'Mark as done' })
  const box = (await done.boundingBox())!
  const vh = page.viewportSize()!.height
  expect.soft(box.y >= 0 && box.y + box.height <= vh, `${label}: Mark as done in view`).toBe(true)
  expect.soft(await stepCharsPerLine(page), `${label}: step characters per line`).toBeGreaterThanOrEqual(45)
}

async function contextFor(browser: Browser, state: Awaited<ReturnType<BrowserContext['storageState']>>, c: Case) {
  const ctx = await browser.newContext({
    storageState: state,
    viewport: c.zoom ? { width: Math.round(c.width / c.zoom), height: Math.round(c.height / c.zoom) } : { width: c.width, height: c.height },
    deviceScaleFactor: c.zoom ?? 1,
  })
  return { ctx, page: await ctx.newPage() }
}

test('guide open on Task, Home and Roadmap across the width matrix', async ({ page, browser }) => {
  test.setTimeout(300_000)
  await holdAnswers(page)
  await page.goto('/signin')
  await signIn(page)
  await expect(page).toHaveURL('/app')
  // one question, so every case below can reopen the conversation for free
  await askFromBar(page, 'Can I apply before I have a bank account?')
  await expect(page.getByText("What I can't tell you").first()).toBeVisible({ timeout: 20_000 })
  const state = await page.context().storageState()

  for (const c of CASES) {
    const { ctx, page: p } = await contextFor(browser, state, c)
    for (const path of PAGES) await test.step(`${path} ${c.width}${c.rootPx ? ' root20' : ''}${c.zoom ? ` zoom${c.zoom}` : ''}`, () => check(p, path, c))
    await ctx.close()
  }
})
