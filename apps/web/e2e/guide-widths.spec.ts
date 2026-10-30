import { test, expect, type Browser, type BrowserContext, type Page } from '@playwright/test'
import { holdAnswers, resetTestUser, signIn } from './test-user'

// Plan B Task 9.7 / ledger B2: the pane open beside Task, Home and Roadmap at every width band.
// No sideways scroll, no clipped text, Mark as done never under the pane, task steps ≥45 characters a line.
test.beforeAll(resetTestUser)

const PAGES = ['/app/roadmap?task=T08', '/app', '/app/roadmap']
const WIDTHS = [1024, 1180, 1280, 1366, 1440, 1536, 1600, 1680, 1920]
// Pane width by window band at a 16 px root (D12): 25 / 28.75 / 32.5 rem
const paneRem = (w: number) => (w >= 1680 ? 32.5 : w >= 1440 ? 28.75 : 25)

type Case = { width: number; height: number; rootPx?: number; zoom?: number }
const CASES: Case[] = [
  ...WIDTHS.map(width => ({ width, height: 900 })),
  { width: 1366, height: 768 },
  { width: 1280, height: 900, rootPx: 20 },
  { width: 1440, height: 900, zoom: 1.25 },
  { width: 1440, height: 900, zoom: 2 },
]

async function openGuide(page: Page, path: string, rootPx?: number) {
  await page.goto(path)
  if (rootPx) await page.addStyleTag({ content: `html { font-size: ${rootPx}px }` })
  await page.getByRole('button', { name: /^Ask about your / }).click()
}

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
  await openGuide(page, path, c.rootPx)

  expect.soft(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${label}: sideways scroll`).toBe(true)
  if (window < 1024) {
    await expect(page.getByRole('dialog', { name: 'Guide' }), `${label}: sheet`).toBeVisible()
    return
  }

  const paneBox = (await page.locator('#guide-pane > div').boundingBox())!
  expect.soft(Math.round(paneBox.width), `${label}: pane width`).toBe(paneRem(window) * (c.rootPx ?? 16))
  expect.soft(await clipped(page), `${label}: clipped text`).toEqual([])

  if (!path.includes('task=')) return
  const done = page.locator('main').getByRole('button', { name: 'Mark as done' }).locator('visible=true')
  await done.scrollIntoViewIfNeeded()
  const box = (await done.boundingBox())!
  const pane = (await page.locator('#guide-pane > div').boundingBox())!
  const overlaps = box.x < pane.x + pane.width && box.x + box.width > pane.x && box.y < pane.y + pane.height && box.y + box.height > pane.y
  expect.soft(overlaps, `${label}: Mark as done under the pane`).toBe(false)
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

test('pane open on Task, Home and Roadmap across the width matrix', async ({ page, browser }) => {
  test.setTimeout(300_000)
  await holdAnswers(page)
  await page.goto('/signin')
  await signIn(page)
  await expect(page).toHaveURL('/app')
  const state = await page.context().storageState()

  for (const c of CASES) {
    const { ctx, page: p } = await contextFor(browser, state, c)
    for (const path of PAGES) await test.step(`${path} ${c.width}${c.rootPx ? ' root20' : ''}${c.zoom ? ` zoom${c.zoom}` : ''}`, () => check(p, path, c))
    await ctx.close()
  }
})
