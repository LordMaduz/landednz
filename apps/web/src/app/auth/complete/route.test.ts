// @vitest-environment node
import { NextRequest } from 'next/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { encodeAnswers, type Answers } from '@/lib/answers'

const auth = { getUser: vi.fn(), getSession: vi.fn() }
vi.mock('@/lib/supabase/server', () => ({ createClient: async () => ({ auth }) }))
const submitOnboardingProfile = vi.fn()
vi.mock('@/lib/api', () => ({ submitOnboardingProfile: (...args: unknown[]) => submitOnboardingProfile(...args) }))

const { GET } = await import('./route')

const priya: Answers = {
  visaType: 'AEWV',
  city: 'AUCKLAND',
  familySituation: 'SOLO',
  occupation: 'TECHNOLOGY',
  arrivalDate: '2027-01-14',
}

function request(redirect: string, cookie?: string) {
  const req = new NextRequest(`http://localhost:3000/auth/complete?redirect=${encodeURIComponent(redirect)}`)
  if (cookie !== undefined) req.cookies.set('lnz_answers', cookie)
  return req
}

const location = (res: Response) => new URL(res.headers.get('location')!)
const cleared = (res: Response) => /lnz_answers=;.*Max-Age=0/.test(res.headers.get('set-cookie') ?? '')

function signedIn() {
  auth.getUser.mockResolvedValue({ data: { user: { id: 'u1' } } })
  auth.getSession.mockResolvedValue({ data: { session: { access_token: 'tok' } } })
}

beforeEach(() => {
  vi.clearAllMocks()
  submitOnboardingProfile.mockResolvedValue({ success: true })
})

describe('GET /auth/complete', () => {
  it('no session → sign in, coming back here', async () => {
    auth.getUser.mockResolvedValue({ data: { user: null } })
    const res = await GET(request('/app', encodeAnswers(priya)))
    expect(location(res).pathname).toBe('/signin')
    expect(location(res).searchParams.get('redirect')).toBe('/app')
    expect(submitOnboardingProfile).not.toHaveBeenCalled()
  })

  it('session + valid cookie → submits the profile once, clears the cookie, goes to redirect', async () => {
    signedIn()
    const res = await GET(request('/app/roadmap', encodeAnswers(priya)))
    expect(submitOnboardingProfile).toHaveBeenCalledTimes(1)
    expect(submitOnboardingProfile).toHaveBeenCalledWith(priya, 'tok')
    expect(cleared(res)).toBe(true)
    expect(location(res).pathname).toBe('/app/roadmap')
  })

  it('Review Focus 1: an existing profile (409) still lands on /app with the cookie cleared', async () => {
    signedIn()
    submitOnboardingProfile.mockResolvedValue({ success: false, isExisting: true })
    const res = await GET(request('/app', encodeAnswers(priya)))
    expect(location(res).pathname).toBe('/app')
    expect(cleared(res)).toBe(true)
  })

  it('Review Focus 2: an invalid cookie → no submit, cookie cleared', async () => {
    signedIn()
    const res = await GET(request('/app', 'garbage'))
    expect(submitOnboardingProfile).not.toHaveBeenCalled()
    expect(cleared(res)).toBe(true)
    expect(location(res).pathname).toBe('/app')
  })

  it('no cookie → straight to redirect', async () => {
    signedIn()
    const res = await GET(request('/app'))
    expect(submitOnboardingProfile).not.toHaveBeenCalled()
    expect(location(res).pathname).toBe('/app')
  })

  it('an unsafe redirect falls back to /app', async () => {
    signedIn()
    const res = await GET(request('//evil.com'))
    expect(location(res).origin).toBe('http://localhost:3000')
    expect(location(res).pathname).toBe('/app')
  })

  it('the API failing keeps the answers and returns to the preview to try again', async () => {
    signedIn()
    submitOnboardingProfile.mockRejectedValue(new Error('Profile submission failed: 500'))
    const res = await GET(request('/app', encodeAnswers(priya)))
    expect(location(res).pathname).toBe('/onboarding/preview')
    expect(location(res).searchParams.get('save')).toBe('failed')
    expect(res.headers.get('set-cookie')).toBeNull()
  })
})
