import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import {
  getRedirectUrl,
  unstable_doesMiddlewareMatch,
  unstable_getResponseFromNextConfig,
} from 'next/experimental/testing/server'
import nextConfig from '../next.config'

// Unit level only: the e2e suite signs in against real local Supabase.
let user: { email: string } | null = null
let refreshedCookie: { name: string; value: string } | null = null
type CookieOptions = { cookies: { setAll(c: { name: string; value: string; options: object }[]): void } }
vi.mock('@supabase/ssr', () => ({
  createServerClient: (_url: string, _key: string, { cookies }: CookieOptions) => ({
    auth: {
      getUser: async () => {
        // getUser() writes rotated session cookies when it refreshes the token
        if (refreshedCookie) cookies.setAll([{ ...refreshedCookie, options: {} }])
        return { data: { user } }
      },
    },
  }),
}))

const { proxy, config } = await import('./proxy')
const { encodeAnswers } = await import('./lib/answers')
const origin = 'http://localhost:3000'

describe('proxy', () => {
  beforeEach(() => {
    user = null
    refreshedCookie = null
  })

  it.each(['/app', '/settings'])('sends a signed-out user on %s to /signin with redirect', async (path) => {
    const res = await proxy(new NextRequest(`${origin}${path}`))
    expect(res.status).toBe(307)
    expect(getRedirectUrl(res)).toBe(`${origin}/signin?redirect=${encodeURIComponent(path)}`)
  })

  it('sends a signed-in user on /signin to /app', async () => {
    user = { email: 'a@b.nz' }
    const res = await proxy(new NextRequest(`${origin}/signin`))
    expect(getRedirectUrl(res)).toBe(`${origin}/app`)
  })

  it('keeps refreshed session cookies on its redirect', async () => {
    user = { email: 'a@b.nz' }
    refreshedCookie = { name: 'sb-auth-token', value: 'rotated' }
    const res = await proxy(new NextRequest(`${origin}/signin`))
    expect(getRedirectUrl(res)).toBe(`${origin}/app`)
    expect(res.cookies.get('sb-auth-token')?.value).toBe('rotated')
  })

  it('lets a signed-in user through to /app', async () => {
    user = { email: 'a@b.nz' }
    const res = await proxy(new NextRequest(`${origin}/app`))
    expect(getRedirectUrl(res)).toBeNull()
  })

  it('keeps the query in the sign-in redirect', async () => {
    const res = await proxy(new NextRequest(`${origin}/app/roadmap?task=T08`))
    expect(getRedirectUrl(res)).toBe(`${origin}/signin?redirect=%2Fapp%2Froadmap%3Ftask%3DT08`)
  })

  it('passes / through for a signed-out user', async () => {
    const res = await proxy(new NextRequest(`${origin}/`))
    expect(getRedirectUrl(res)).toBeNull()
  })
})

describe('proxy on /onboarding/preview (Review Focus 2)', () => {
  const priya = { visaType: 'AEWV', city: 'AUCKLAND', familySituation: 'SOLO', occupation: 'TECHNOLOGY', arrivalDate: '2027-01-14' } as const
  const preview = (cookie?: string) => {
    const req = new NextRequest(`${origin}/onboarding/preview`)
    if (cookie !== undefined) req.cookies.set('lnz_answers', cookie)
    return proxy(req)
  }

  it('passes fresh, valid answers through', async () => {
    const res = await preview(encodeAnswers(priya))
    expect(getRedirectUrl(res)).toBeNull()
  })

  it.each([
    ['missing', undefined],
    ['tampered', 'garbage'],
    ['stale', Buffer.from(JSON.stringify({ ...priya, savedAt: Date.now() - 3601_000 })).toString('base64url')],
  ])('%s answers → step 1 with the cookie cleared', async (_name, cookie) => {
    const res = await preview(cookie)
    expect(getRedirectUrl(res)).toBe(`${origin}/onboarding?step=1`)
    expect(res.headers.get('set-cookie')).toMatch(/^lnz_answers=;.*Max-Age=0/)
  })
})

describe('proxy matcher', () => {
  it.each(['/', '/onboarding', '/privacy', '/terms'])('skips public page %s', (path) => {
    expect(unstable_doesMiddlewareMatch({ config, url: `${origin}${path}` })).toBe(false)
  })

  it.each(['/app', '/app/roadmap', '/settings', '/signin', '/onboarding/preview'])('runs on %s', (path) => {
    expect(unstable_doesMiddlewareMatch({ config, url: `${origin}${path}` })).toBe(true)
  })
})

describe('next.config redirects', () => {
  it.each([
    ['/roadmap', '/app/roadmap'],
    ['/chat', '/app'],
    ['/auth/signin', '/signin'],
  ])('%s permanently redirects to %s', async (from, to) => {
    const res = await unstable_getResponseFromNextConfig({ url: `${origin}${from}`, nextConfig })
    expect(res.status).toBe(308)
    expect(getRedirectUrl(res)).toBe(`${origin}${to}`)
  })
})
