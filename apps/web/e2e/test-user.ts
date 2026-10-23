// Real local Supabase user shared by global setup, teardown and specs.
export const TEST_USER = {
  email: 'e2e-auth@example.com',
  password: 'TestPassword123!',
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

export async function deleteTestUser() {
  const res = await adminFetch(`/users?per_page=1000`)
  const { users } = (await res.json()) as { users: { id: string; email: string }[] }
  for (const user of users.filter((u) => u.email === TEST_USER.email)) {
    const del = await adminFetch(`/users/${user.id}`, { method: 'DELETE' })
    if (!del.ok) throw new Error(`Deleting e2e user failed: ${del.status} ${await del.text()}`)
  }
}
