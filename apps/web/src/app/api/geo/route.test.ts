// @vitest-environment node
import { NextRequest } from 'next/server'
import { describe, expect, it } from 'vitest'
import { GET } from './route'

const get = (headers: Record<string, string> = {}) =>
  GET(new NextRequest('http://localhost:3000/api/geo', { headers }))

describe('GET /api/geo', () => {
  it('returns the Vercel country code, uncached', async () => {
    const res = get({ 'x-vercel-ip-country': 'NZ' })
    expect(await res.json()).toEqual({ country: 'NZ' })
    expect(res.headers.get('cache-control')).toBe('no-store')
  })

  it('returns null without the header (local dev)', async () => {
    expect(await get().json()).toEqual({ country: null })
  })

  it('rejects anything that is not a two-letter code', async () => {
    expect(await get({ 'x-vercel-ip-country': '<script>' }).json()).toEqual({ country: null })
  })
})
