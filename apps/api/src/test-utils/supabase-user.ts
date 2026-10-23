// Real Supabase auth users for integration tests — auth is never mocked.
// Reads SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY and SUPABASE_SECRET_KEY from env (.env.local).

const TEST_PASSWORD = 'TestPassword123!';

function env(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

export async function createTestUser(prefix: string): Promise<{ userId: string; jwt: string; email: string }> {
  const email = `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.com`;
  const res = await fetch(`${env('SUPABASE_URL')}/auth/v1/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', apikey: env('SUPABASE_PUBLISHABLE_KEY') },
    body: JSON.stringify({ email, password: TEST_PASSWORD }),
  });
  if (!res.ok) throw new Error(`Supabase signup failed for ${email}: ${res.status} ${await res.text()}`);

  const data = (await res.json()) as { user: { id: string }; access_token: string };
  return { userId: data.user.id, jwt: data.access_token, email };
}

export async function deleteTestUser(userId: string): Promise<void> {
  const res = await fetch(`${env('SUPABASE_URL')}/auth/v1/admin/users/${userId}`, {
    method: 'DELETE',
    headers: { apikey: env('SUPABASE_SECRET_KEY') },
  });
  if (!res.ok) throw new Error(`Supabase user delete failed for ${userId}: ${res.status} ${await res.text()}`);
}
