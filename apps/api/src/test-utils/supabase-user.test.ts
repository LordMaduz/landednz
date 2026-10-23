import { describe, expect, test } from 'vitest';
import { createTestUser, deleteTestUser } from './supabase-user.js';

describe('supabase test user helper', () => {
  test('creates a real user with a JWT, and deletes it', async () => {
    const user = await createTestUser('helper');
    expect(user.email).toMatch(/^helper-.+@example\.com$/);
    expect(user.jwt.split('.')).toHaveLength(3);

    await deleteTestUser(user.userId);

    const res = await fetch(`${process.env.SUPABASE_URL}/auth/v1/admin/users/${user.userId}`, {
      headers: { apikey: process.env.SUPABASE_SECRET_KEY ?? '' },
    });
    expect(res.status).toBe(404);
  });
});
