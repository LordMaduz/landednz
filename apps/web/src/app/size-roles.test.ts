import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

// Control and bar heights live only in globals.css (size roles); components pick a role and never size them raw.
// Icons, hairlines and marks under 36 px stay raw: they don't set the app's density.
const SRC = join(__dirname, '..')
const files = (dir: string): string[] =>
  readdirSync(dir).flatMap(n => {
    const p = join(dir, n)
    return statSync(p).isDirectory() ? files(p) : /\.tsx?$/.test(n) && !/\.test\.|opengraph-image/.test(n) ? [p] : []
  })

// h-/min-h-/size- from 36 px (9) to 64 px (16), with any variant prefix; max-h- (scroll caps) is not a control size
const RAW = /(?<![\w-])(?:[\w@/*[\]&-]+:)*(?:min-)?(?:h|size)-(?:9|10|11|12|13|14|15|16)\b/

describe('size roles', () => {
  it('components size controls and bars through the roles only', () => {
    const hits = files(SRC).flatMap(f =>
      readFileSync(f, 'utf8').split('\n').flatMap((line, i) => (RAW.test(line) ? [`${f.slice(SRC.length + 1)}:${i + 1}`] : [])),
    )
    expect(hits).toEqual([])
  })

  it('catches raw sizes with and without prefixes', () => {
    for (const bad of ['min-h-11', 'max-narrow:min-h-11', 'pane:h-14', 'size-10', '*:min-h-9', 'max-pane:size-11'])
      expect(RAW.test(`className="${bad}"`), bad).toBe(true)
    for (const ok of ['min-h-control', 'h-header', 'size-4', 'max-h-16', 'min-h-6', 'size-target', 'h-px'])
      expect(RAW.test(`className="${ok}"`), ok).toBe(false)
  })

  it('globals.css gives every role a phone value and sizes the CSS components through roles', () => {
    const css = readFileSync(join(SRC, 'app/globals.css'), 'utf8')
    for (const role of ['header', 'footer', 'control', 'control-sm', 'control-lg', 'target', 'touch', 'row', 'row-lg', 'settings-row', 'ask-bar-height', 'avatar'])
      expect(css, role).toMatch(new RegExp(`--spacing-${role}:\\s*\\d+px`))
    expect(css.split('\n').filter(l => /^\s*min-height:\s*(3[6-9]|[4-6]\d)px/.test(l))).toEqual([])
  })

  it('no size role shares a name with a container width (w-<name> would read the height)', () => {
    const css = readFileSync(join(SRC, 'app/globals.css'), 'utf8')
    const names = (ns: string) => new Set([...css.matchAll(new RegExp(`--${ns}-([\\w-]+):`, 'g'))].map(m => m[1]))
    const containers = names('container')
    expect([...names('spacing')].filter(n => containers.has(n))).toEqual([])
  })
})
