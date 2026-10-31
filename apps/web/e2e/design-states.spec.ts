import { test, expect, type Page } from '@playwright/test'

// State layer (design system spec §5): hover and pressed mix a layer into the element's own background.
// Light surfaces darken, dark surfaces lighten; disabled controls never change. Fixtures: /dev/states (dev only).
const SIZES = [[1440, 900], [390, 844]] as const

// Relative luminance of the element's background as drawn over its backdrop (handles translucent layers)
async function luminance(page: Page, id: string) {
  return page.getByTestId(id).evaluate((el) => {
    const backdrop = getComputedStyle(el.parentElement!).backgroundColor
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
