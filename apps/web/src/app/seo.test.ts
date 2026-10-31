import { describe, expect, it, vi } from 'vitest'
// The root layout loads Geist through next/font, which only runs inside the Next build
vi.mock('geist/font/sans', () => ({ GeistSans: { variable: '' } }))
vi.mock('next/font/local', () => ({ default: () => ({ variable: '' }) }))

import { BRAND } from '@/lib/brand'
import { metadata as root } from './layout'
import { metadata as onboarding } from './onboarding/page'
import { metadata as preview } from './onboarding/preview/page'
import { metadata as home } from './page'
import { metadata as signin } from './signin/page'
import robots from './robots'
import sitemap from './sitemap'

describe('SEO routes', () => {
  it('sitemap lists the public pages', () => {
    expect(sitemap().map(entry => new URL(entry.url).pathname)).toEqual(['/', '/onboarding', '/privacy', '/terms'])
  })

  it('robots keeps the signed-in app and the API out', () => {
    const rules = robots().rules
    const rule = Array.isArray(rules) ? rules[0] : rules
    expect(rule.disallow).toEqual(['/app', '/settings', '/api'])
    expect(robots().sitemap).toMatch(/\/sitemap\.xml$/)
  })

  it('every page title carries the brand', () => {
    expect(root.title).toEqual({ default: 'LandedNZ', template: '%s · LandedNZ' })
    expect(root.applicationName).toBe('LandedNZ')
    expect(root.description).toBe(BRAND.bioShort)
  })

  it('home title is not double-branded', () => {
    expect(home.title).toEqual({ absolute: 'LandedNZ: your settling-in roadmap for New Zealand' })
  })

  it('keeps sign-in and the roadmap preview out of the index but follows their links', () => {
    expect(signin.robots).toEqual({ index: false, follow: true })
    expect(preview.robots).toEqual({ index: false, follow: true })
  })

  it('gives onboarding its own canonical', () => {
    expect(onboarding.alternates?.canonical).toBe('/onboarding')
  })
})
