import { TEST_USER, adminFetch, deleteTestUser } from './test-user'

export default async function globalSetup() {
  await deleteTestUser()
  const res = await adminFetch('/users', {
    method: 'POST',
    body: JSON.stringify({ ...TEST_USER, email_confirm: true }),
  })
  if (!res.ok) throw new Error(`Creating e2e user failed: ${res.status} ${await res.text()}`)
}
