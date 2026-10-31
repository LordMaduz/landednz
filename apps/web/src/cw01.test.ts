// CW01: no raw hex, px or arbitrary Tailwind values in apps/web/src outside globals.css; components use the design roles only
// (palette names, Tailwind's own colours, off-grid spacing, non-role radius/shadow and hand-written <button> outside components/ui fail).
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { describe, expect, it } from 'vitest'

const SRC = import.meta.dirname
const RULES: [string, RegExp][] = [
  ['raw hex colour', /#[0-9a-fA-F]{3,8}\b/],
  ['arbitrary length', /\[-?[\d.]+(px|rem|em)\]/],
  // utility-[value] (arbitrary variants such as data-[state=open]: are allowed)
  ['arbitrary value', /(?<![\w-])[a-z][a-z0-9-]*-\[[^\]\s]+\](?!:)/],
  ['inline style colour', /style=\{\{[^}]*(#[0-9a-fA-F]{3,8}|rgba?\(|hsla?\(|oklch\()/],
  // old token names, palette names and Tailwind's default colours: use a role (fg, surface, accent, …)
  ['not a colour role', /(?<![\w-])(?:bg|text|border|ring|fill|stroke|outline|divide|decoration|placeholder|caret|from|to|via|shadow)-(?:ink|ink-hover|muted|control|hairline|wash|teal|teal-text|teal-hover|tint|tint-border|mark|white|black|toast-action|rail-text|rail-label|danger-on-ink|palette-[\w-]+|(?:gray|slate|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|cyan|sky|blue|indigo|violet|purple|pink|rose)-\d{2,3})(?![\w-])/],
  ['not a radius role', /(?<![\w-])rounded(?:-[trblse]{1,2})?-(?:xs|sm|md|lg|xl|2xl|3xl|4xl|surface|pane|bar)(?![\w-])/],
  ['not a shadow role', /(?<![\w-])shadow-(?:xs|sm|md|lg|xl|2xl|lift|bar|pane|pop|sheet|field-error|rail-ring|pin-halo)(?![\w-])/],
]

// Spacing (padding, margin, gap, space, inset) on the 4 px grid or a spacing role; sizes and positions are not checked
const STEPS = new Set(['0', '0.5', '1', '2', '3', '4', '5', '6', '8', '10', '12', '16', '24'])
const SPACING = /(?<![\w.-])-?(?:p[xytrblse]?|m[xytrblse]?|gap(?:-[xy])?|space-[xy]|inset(?:-[xy])?)-(\d+(?:\.\d+)?)(?![\w.])/g
const offGrid = (line: string) => [...line.matchAll(SPACING)].some(m => !STEPS.has(m[1]))
// Every control is a kit component; <button> is written only inside components/ui
// (the state-layer fixture page tests the raw utility; Google's button is its branding exception)
const handButton = (path: string, line: string) =>
  /<button\b/.test(line) && !path.startsWith('components/ui/') && !path.startsWith('app/dev/') && !/className="gsi\b/.test(line)

// ImageResponse renders outside the page CSS, so the OG image and the logo mark can only take literal colours
const EXEMPT = ['app/opengraph-image.tsx', 'lib/logo-mark.tsx']

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap(name => {
    const path = join(dir, name)
    if (statSync(path).isDirectory()) return sourceFiles(path)
    if (EXEMPT.includes(relative(SRC, path))) return []
    return /\.(ts|tsx)$/.test(name) && !/\.test\.(ts|tsx)$/.test(name) ? [path] : []
  })
}

export function cw01Violations(files: { path: string; text: string }[]): string[] {
  return files.flatMap(({ path, text }) =>
    text.split('\n').flatMap((line, i) =>
      [
        ...RULES.filter(([, re]) => re.test(line)).map(([rule]) => rule),
        ...(offGrid(line) ? ['off-grid spacing'] : []),
        ...(handButton(path, line) ? ['hand-written <button>'] : []),
      ].map(rule => `${path}:${i + 1} ${rule}: ${line.trim()}`),
    ),
  )
}

describe('CW01', () => {
  it('flags hex, arbitrary px and inline colour styles', () => {
    expect(
      cw01Violations([
        { path: 'a.tsx', text: '<p className="text-[#0F2A3A]" />' },
        { path: 'b.tsx', text: '<p className="mt-[13px]" />' },
        { path: 'c.tsx', text: "<p style={{ color: 'rgba(0,0,0,.5)' }} />" },
        { path: 'd.tsx', text: '<p className="text-fg mt-4 data-[state=open]:bg-surface-sunken" />' },
        { path: 'e.tsx', text: '<p className="shadow-[inset_0_0_0_1px_red]" />' },
      ]).map(v => v.split(' ')[0]),
    ).toEqual(['a.tsx:1', 'a.tsx:1', 'b.tsx:1', 'b.tsx:1', 'c.tsx:1', 'e.tsx:1'])
  })

  it('flags old names, palette and default colours; allows roles', () => {
    const hits = (text: string) => cw01Violations([{ path: 'x.tsx', text }]).length
    for (const bad of ['bg-ink', 'text-wash', 'border-hairline', 'bg-palette-teal-600', 'bg-gray-100', 'text-slate-500', 'hover:text-white'])
      expect(hits(`<p className="${bad}" />`), bad).toBe(1)
    for (const ok of ['bg-surface', 'text-fg-muted', 'border-border-subtle', 'text-link-hover', 'bg-surface-inverse/40', 'bg-avatar'])
      expect(hits(`<p className="${ok}" />`), ok).toBe(0)
  })

  it('flags off-grid spacing; allows grid steps, spacing roles and sizes', () => {
    const hits = (text: string) => cw01Violations([{ path: 'x.tsx', text }]).length
    for (const bad of ['p-1.5', 'gap-3.5', 'mt-0.75', 'px-7', 'space-y-9', '-ml-2.5', 'max-narrow:py-9'])
      expect(hits(`<p className="${bad}" />`), bad).toBe(1)
    for (const ok of ['p-4', 'gap-0.5', 'px-page-gutter', 'size-4.5', '-mx-3', 'top-7'])
      expect(hits(`<p className="${ok}" />`), ok).toBe(0)
  })

  it('flags non-role radius and shadow', () => {
    const hits = (text: string) => cw01Violations([{ path: 'x.tsx', text }]).length
    for (const bad of ['rounded-md', 'rounded-surface', 'shadow-lift', 'shadow-sm'])
      expect(hits(`<p className="${bad}" />`), bad).toBe(1)
    for (const ok of ['rounded-card', 'rounded-full', 'shadow-raised', 'shadow-none'])
      expect(hits(`<p className="${ok}" />`), ok).toBe(0)
  })

  it('flags <button> outside components/ui only', () => {
    expect(cw01Violations([{ path: 'components/guide/x.tsx', text: '<button type="button">' }])).toHaveLength(1)
    expect(cw01Violations([{ path: 'components/ui/x.tsx', text: '<button type="button">' }])).toHaveLength(0)
  })

  it('globals.css has no raw colour outside the palette block (Google sign-in excepted)', () => {
    let css = readFileSync(join(SRC, 'app/globals.css'), 'utf8')
    css = css.slice(0, css.indexOf('/* palette */')) + css.slice(css.indexOf('/* end palette */'))
    css = css.slice(0, css.indexOf('/* Google sign-in button')) + css.slice(css.indexOf('.gsi::before'))
    expect(css.split('\n').filter(l => /#[0-9a-fA-F]{3,8}\b|rgba?\(/.test(l))).toEqual([])
  })

  it('apps/web/src has no violations', () => {
    const files = sourceFiles(SRC).map(path => ({ path: relative(SRC, path), text: readFileSync(path, 'utf8') }))
    expect(cw01Violations(files)).toEqual([])
  })
})
