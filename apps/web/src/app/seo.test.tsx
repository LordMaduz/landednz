import { describe, expect, it, vi } from 'vitest'
// The root layout loads Geist through next/font, which only runs inside the Next build
vi.mock('geist/font/sans', () => ({ GeistSans: { variable: '' } }))
vi.mock('next/font/local', () => ({ default: () => ({ variable: '' }) }))
// The legal frame reads the session; the about page's own output is the JSON-LD
vi.mock('@/components/marketing/legal-page', () => ({ LegalPage: () => null }))

import { render } from '@testing-library/react'
import { BRAND } from '@/lib/brand'
import { ORG_ID } from '@/lib/brand-schema'
import { SITE_URL } from '@/lib/site'
import About, { metadata as about } from './about/page'
import { metadata as root } from './layout'
import { metadata as onboarding } from './onboarding/page'
import { metadata as preview } from './onboarding/preview/page'
import { metadata as home } from './page'
import { metadata as signin } from './signin/page'
import { guides } from '@/lib/guides'
import robots from './robots'
import sitemap from './sitemap'

describe('SEO routes', () => {
  it('sitemap lists the public pages', () => {
    expect(sitemap().map(entry => new URL(entry.url).pathname)).toEqual(['/', '/onboarding', '/guides', ...guides().map(g => `/guides/${g.slug}`), '/about', '/privacy', '/terms'])
  })

  it('robots keeps the signed-in app and the API out', () => {
    const rules = robots().rules
    const rule = Array.isArray(rules) ? rules[0] : rules
    expect(rule.disallow).toEqual(['/app', '/settings', '/api'])
    expect(robots().sitemap).toMatch(/\/sitemap\.xml$/)
  })

  it('robots has one wildcard group, so AI crawlers can read the guides and llms files', () => {
    const rules = robots().rules
    expect(Array.isArray(rules)).toBe(false)
    const rule = rules as { userAgent: string; allow: string; disallow: string[] }
    expect(rule.userAgent).toBe('*')
    expect(rule.allow).toBe('/')
    for (const open of ['/guides', '/llms.txt', '/llms-full.txt']) expect(rule.disallow.some(d => open.startsWith(d))).toBe(false)
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

  it('gives /about its title, canonical and the short bio', () => {
    expect(about.title).toEqual({ absolute: 'About LandedNZ' })
    expect(about.alternates?.canonical).toBe('/about')
    expect(about.description).toBe(BRAND.bioShort)
  })

  it('/about carries AboutPage JSON-LD pointing at the organization', () => {
    const { container } = render(<About />)
    const data = JSON.parse(container.querySelector('script[type="application/ld+json"]')!.textContent!)
    expect(data).toMatchObject({ '@type': 'AboutPage', url: `${SITE_URL}/about`, about: { '@id': ORG_ID } })
  })
})
