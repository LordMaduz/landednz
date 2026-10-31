import { describe, expect, it } from 'vitest'
import { BRAND } from './brand'
import { homeGraph, jsonLdScript, ORG_ID } from './brand-schema'
import { SITE_URL } from './site'

type Node = Record<string, unknown>
const g = homeGraph('d')['@graph'] as Node[]
const org = g.find(n => n['@type'] === 'Organization')!

describe('home structured data', () => {
  it('organization is complete', () => {
    expect(org).toMatchObject({
      '@id': ORG_ID, name: 'LandedNZ', alternateName: ['Landed NZ', 'LandedNZ.co.nz'], url: SITE_URL,
      description: BRAND.bioLong, email: BRAND.email, logo: { '@type': 'ImageObject', url: `${SITE_URL}/logo.png` },
    })
  })

  it('omits sameAs while no profile exists', () => {
    expect('sameAs' in org).toBe(BRAND.sameAs.length > 0)
  })

  it('website and app point at the org', () => {
    expect(g.find(n => n['@type'] === 'WebSite')).toMatchObject({ '@id': `${SITE_URL}/#website`, name: 'LandedNZ', alternateName: BRAND.alternateNames, url: SITE_URL, publisher: { '@id': ORG_ID } })
    expect(g.find(n => n['@type'] === 'WebApplication')).toMatchObject({ name: 'LandedNZ', description: 'd', applicationCategory: 'LifestyleApplication', operatingSystem: 'Any', publisher: { '@id': ORG_ID } })
  })

  it('schema URLs are absolute', () => {
    expect(ORG_ID).toMatch(/^https?:\/\//)
  })

  it('escapes <', () => {
    expect(jsonLdScript({ a: '</script>' })).not.toContain('</')
  })
})
