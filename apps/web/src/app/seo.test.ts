import { describe, expect, it } from 'vitest'
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
})
