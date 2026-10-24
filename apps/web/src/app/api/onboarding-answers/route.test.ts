// @vitest-environment node
import { NextRequest } from 'next/server'
import { describe, expect, it } from 'vitest'
import { DELETE, POST } from './route'

const priya = {
  visaType: 'AEWV',
  city: 'AUCKLAND',
  familySituation: 'SOLO',
  occupation: 'TECHNOLOGY',
  arrivalDate: '2027-01-14',
}

const post = (body: string) =>
  POST(new NextRequest('http://localhost:3000/api/onboarding-answers', { method: 'POST', body }))

describe('/api/onboarding-answers', () => {
  it('POST valid answers → 204 and an httpOnly lax cookie for an hour', async () => {
    const res = await post(JSON.stringify(priya))
    expect(res.status).toBe(204)
    const cookie = res.headers.get('set-cookie') ?? ''
    expect(cookie).toMatch(/^lnz_answers=[\w-]+;/)
    expect(cookie).toMatch(/HttpOnly/i)
    expect(cookie).toMatch(/SameSite=Lax/i)
    expect(cookie).toMatch(/Max-Age=3600/)
    expect(cookie).toMatch(/Path=\//)
  })

  it('POST invalid answers or a body that is not JSON → 400, no cookie', async () => {
    for (const body of [JSON.stringify({ ...priya, city: 'SYDNEY' }), 'not json', '']) {
      const res = await post(body)
      expect(res.status).toBe(400)
      expect(res.headers.get('set-cookie')).toBeNull()
    }
  })

  it('DELETE clears the cookie', async () => {
    const res = await DELETE()
    expect(res.status).toBe(204)
    expect(res.headers.get('set-cookie')).toMatch(/^lnz_answers=;.*Max-Age=0/)
  })
})
