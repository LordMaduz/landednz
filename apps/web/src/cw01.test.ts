// CW01: no raw hex, px or arbitrary Tailwind values in apps/web/src outside globals.css.
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
]

// ImageResponse renders outside the page CSS, so the OG image can only take literal colours
const EXEMPT = ['app/opengraph-image.tsx']

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
      RULES.filter(([, re]) => re.test(line)).map(([rule]) => `${path}:${i + 1} ${rule}: ${line.trim()}`),
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
        { path: 'd.tsx', text: '<p className="text-ink mt-4 data-[state=open]:bg-wash" />' },
        { path: 'e.tsx', text: '<p className="shadow-[inset_0_0_0_1px_red]" />' },
      ]).map(v => v.split(' ')[0]),
    ).toEqual(['a.tsx:1', 'a.tsx:1', 'b.tsx:1', 'b.tsx:1', 'c.tsx:1', 'e.tsx:1'])
  })

  it('apps/web/src has no violations', () => {
    const files = sourceFiles(SRC).map(path => ({ path: relative(SRC, path), text: readFileSync(path, 'utf8') }))
    expect(cw01Violations(files)).toEqual([])
  })
})
