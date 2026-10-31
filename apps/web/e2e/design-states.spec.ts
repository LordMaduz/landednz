import { test, expect, type Page } from '@playwright/test'
import { holdAnswers, resetTestUser, signIn } from './test-user'

// State layer (design system spec §5): hover and pressed mix a layer into the element's own background.
// Light surfaces darken, dark surfaces lighten; disabled controls never change. Fixtures: /dev/states (dev only).
const SIZES = [[1440, 900], [390, 844]] as const

// Relative luminance of the element's background as drawn over its backdrop (handles translucent layers)
async function luminance(page: Page, id: string) {
  return lum(page.getByTestId(id))
}

function lum(target: ReturnType<Page['locator']>) {
  return target.evaluate((el) => {
    // the nearest ancestor that paints a background
    let up = el.parentElement!
    while (up.parentElement && getComputedStyle(up).backgroundColor === 'rgba(0, 0, 0, 0)') up = up.parentElement
    const backdrop = getComputedStyle(up).backgroundColor
    const c = document.createElement('canvas').getContext('2d')!
    c.fillStyle = backdrop
    c.fillRect(0, 0, 1, 1)
    c.fillStyle = getComputedStyle(el).backgroundColor
    c.fillRect(0, 0, 1, 1)
    const [r, g, b] = Array.from(c.getImageData(0, 0, 1, 1).data).map((v) => {
      const s = v / 255
      return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
    })
    return 0.2126 * r + 0.7152 * g + 0.0722 * b
  })
}

async function states(page: Page, id: string) {
  await page.mouse.move(0, 0)
  const rest = await luminance(page, id)
  await page.getByTestId(id).hover()
  const hover = await luminance(page, id)
  await page.mouse.down()
  const pressed = await luminance(page, id)
  await page.mouse.up()
  return { rest, hover, pressed }
}

for (const [width, height] of SIZES) {
  test(`state layer at ${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height })
    await page.goto('/dev/states')

    for (const id of ['state-surface', 'state-sunken', 'state-transparent']) {
      const s = await states(page, id)
      expect(s.hover, `${id} hover darkens`).toBeLessThan(s.rest)
      expect(s.pressed, `${id} pressed darkens more`).toBeLessThan(s.hover)
    }
    for (const id of ['inverse-action', 'inverse-surface']) {
      const s = await states(page, id)
      expect(s.hover, `${id} hover lightens`).toBeGreaterThan(s.rest)
      expect(s.pressed, `${id} pressed lightens more`).toBeGreaterThan(s.hover)
    }
    const d = await states(page, 'state-disabled')
    expect(d.hover, 'disabled hover unchanged').toBe(d.rest)
    expect(d.pressed, 'disabled pressed unchanged').toBe(d.rest)
  })
}

// Phone tap areas (spec §7.1): every control is at least 44 × 44 px to the finger. Small controls keep their drawn
// size and reach 44 through an invisible ::after (composer remove 18, send 34).
async function smallTargets(page: Page) {
  return page.evaluate(() => {
    const out: string[] = []
    for (const el of document.querySelectorAll<HTMLElement>('button, a[href], [role=button], input:not([type=radio]):not([type=hidden])')) {
      const r = el.getBoundingClientRect()
      const cs = getComputedStyle(el)
      if (!r.width || !r.height || cs.visibility === 'hidden' || el.closest('[inert], [aria-hidden=true]')) continue
      if (el.closest('p, li') && el.tagName === 'A') continue // inline links in a sentence: WCAG 2.5.8 inline exception
      const a = getComputedStyle(el, '::after')
      const ext = a.content !== 'none' && a.position === 'absolute'
      const w = ext ? Math.max(r.width, r.width - parseFloat(a.left) - parseFloat(a.right)) : r.width
      const h = ext ? Math.max(r.height, r.height - parseFloat(a.top) - parseFloat(a.bottom)) : r.height
      if (w < 44 || h < 44) out.push(`${el.tagName.toLowerCase()} "${(el.getAttribute('aria-label') ?? el.textContent ?? '').trim().slice(0, 30)}" ${Math.round(w)}×${Math.round(h)}`)
    }
    return out
  })
}

test.describe('phone tap areas', () => {
  test.beforeAll(resetTestUser)

  test('every control on Home with the guide open is at least 44 × 44 at 390', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await holdAnswers(page)
    await page.goto('/signin')
    await signIn(page)
    await expect(page).toHaveURL('/app')
    expect(await smallTargets(page), 'Home').toEqual([])
    await page.getByRole('button', { name: /^Ask about your / }).click()
    const sheet = page.getByRole('dialog', { name: 'Guide' })
    await expect(sheet).toBeVisible()
    expect(await smallTargets(page), 'Home + guide sheet').toEqual([])
    const send = (await sheet.getByRole('button', { name: 'Send' }).boundingBox())!
    expect([Math.round(send.width), Math.round(send.height)], 'Send keeps its drawn 34 px').toEqual([34, 34])
  })
})

// The delete trigger sits on a white card at every width: hover and press darken it
test.describe('delete account trigger', () => {
  test.beforeAll(resetTestUser)

  test('hover darkens at 1440; pressed darkens at 390', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await holdAnswers(page)
    await page.goto('/signin')
    await signIn(page)
    await expect(page).toHaveURL('/app')
    await page.goto('/settings')
    await expect(page.getByRole('list', { name: 'Your answers' })).toBeVisible()
    const trigger = page.getByRole('button', { name: /^Delete account/ })
    await page.mouse.move(0, 0)
    const rest = await lum(trigger)
    await trigger.hover()
    expect(await lum(trigger), 'hover darker on white').toBeLessThan(rest)

    await page.setViewportSize({ width: 390, height: 844 })
    await page.mouse.move(0, 0)
    await trigger.scrollIntoViewIfNeeded()
    const restPhone = await lum(trigger)
    await trigger.hover()
    await page.mouse.down()
    expect(await lum(trigger), 'pressed darker on white').toBeLessThan(restPhone)
    await page.mouse.up()
  })
})
