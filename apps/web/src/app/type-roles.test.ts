import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

// Type sizes live only in globals.css (@theme roles); components pick a role and never size text themselves.
const SRC = join(__dirname, '..')
const files = (dir: string): string[] =>
  readdirSync(dir).flatMap(n => {
    const p = join(dir, n)
    return statSync(p).isDirectory() ? files(p) : /\.tsx?$/.test(n) && !/\.test\.|opengraph-image/.test(n) ? [p] : [] // the share image is a 1200×630 picture, not UI
  })

const BANNED = [
  /\btext-(xs|sm|base|lg|[2-9]?xl)\b/, // Tailwind's own scale
  /\btext-\[\d/, // arbitrary sizes
  /\btext-(citation|reading-focus)\b/, // retired roles
  /fontSize\s*:/, // inline sizes
  /\bmax-(?!compact:text-title)[a-z-]+:text-(hero|title|featured|section|body|ui|small|reading)\b/, // per-width sizes (landing hero excepted)
]

describe('type roles', () => {
  it('components use the roles in globals.css only', () => {
    const hits = files(SRC).flatMap(f =>
      readFileSync(f, 'utf8').split('\n').flatMap((line, i) =>
        BANNED.some(r => r.test(line)) ? [`${f.slice(SRC.length + 1)}:${i + 1}`] : [],
      ),
    )
    expect(hits).toEqual([])
  })

  it('globals.css sizes text through the role tokens', () => {
    const css = readFileSync(join(SRC, 'app/globals.css'), 'utf8')
    const raw = css.split('\n').filter(l => /font-size:\s*\d/.test(l))
    expect(raw).toEqual(['    font-size: 15px;']) // the Google sign-in button: Google's branding rule
  })
})
