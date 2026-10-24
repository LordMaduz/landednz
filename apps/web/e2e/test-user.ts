import { expect, type Page } from '@playwright/test'

// Real local Supabase user shared by global setup, teardown and specs.
export const TEST_USER = {
  email: 'e2e-auth@example.com',
  password: 'TestPassword123!',
}

// What the journey answers: AEWV, Auckland, just me, technology, landing today
export const ANSWERS = {
  visaType: 'AEWV',
  city: 'AUCKLAND',
  familySituation: 'SOLO',
  occupation: 'TECHNOLOGY',
  arrivalDate: new Intl.DateTimeFormat('en-CA', { timeZone: 'Pacific/Auckland' }).format(new Date()),
}

export function adminFetch(path: string, init: RequestInit = {}) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SECRET_KEY
  if (!url || !key) throw new Error('NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY are required for e2e')
  return fetch(`${url}/auth/v1/admin${path}`, {
    ...init,
    headers: { apikey: key, 'Content-Type': 'application/json', ...init.headers },
  })
}

// Deletes through DELETE /account so the API's User row (and roadmap) goes too. Never admin-delete alone:
// that leaves a User row holding the email, and the next user with it cannot get a row of their own.
export async function deleteTestUser() {
  const res = await adminFetch(`/users?per_page=1000`)
  const { users } = (await res.json()) as { users: { id: string; email: string }[] }
  if (!users.some((u) => u.email === TEST_USER.email)) return
  const signIn = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '', 'Content-Type': 'application/json' },
    body: JSON.stringify(TEST_USER),
  })
  // 429: local Supabase allows 30 sign-ins per 5 minutes; wait and rerun
  if (!signIn.ok) throw new Error(`Signing in the e2e user to delete it failed: ${signIn.status} ${await signIn.text()}`)
  const { access_token } = (await signIn.json()) as { access_token: string }
  const del = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/account`, { method: 'DELETE', headers: { Authorization: `Bearer ${access_token}` } })
  if (!del.ok) throw new Error(`Deleting the e2e user failed: ${del.status} ${await del.text()}`)
}

export async function resetTestUser() {
  await deleteTestUser()
  const res = await adminFetch('/users', {
    method: 'POST',
    body: JSON.stringify({ ...TEST_USER, email_confirm: true }),
  })
  if (!res.ok) throw new Error(`Creating e2e user failed: ${res.status} ${await res.text()}`)
}

// Keeps the answers for /auth/complete, as onboarding does before "Save my roadmap"
export async function holdAnswers(page: Page) {
  const res = await page.request.post('/api/onboarding-answers', { data: ANSWERS })
  expect(res.status()).toBe(204)
}

// The password form on /signin (local and CI only; production is Google only)
export async function signIn(page: Page) {
  await page.getByLabel('Email').fill(TEST_USER.email)
  await page.getByLabel('Password').fill(TEST_USER.password)
  await page.getByRole('button', { name: 'Sign in' }).click()
}
