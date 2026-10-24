// Account deletion (spec §4.3 amendment): the user's rows (cascade) and their Supabase auth user.

import { db } from '../../shared/db.js';
import { logger } from '../../shared/logger.js';
import { AppError } from '../../shared/errors.js';
import { config } from '../../shared/config.js';

const authAdminUser = (userId: string) => `${config.supabaseUrl}/auth/v1/admin/users/${userId}`;
const adminHeaders = { apikey: config.supabaseSecretKey };

export async function deleteAccount(userId: string): Promise<void> {
  // JWTs are verified locally and stay valid until they expire, so check the auth user still exists
  const existing = await fetch(authAdminUser(userId), { headers: adminHeaders });
  if (existing.status === 404) {
    throw new AppError('INVALID_TOKEN', 'This account no longer exists', 401);
  }
  if (!existing.ok) {
    throw new Error(`Supabase user lookup failed: ${existing.status}`);
  }

  // Profile, roadmap, chat sessions (and their messages) and subscription cascade from User
  await db.user.deleteMany({ where: { id: userId } });

  const res = await fetch(authAdminUser(userId), { method: 'DELETE', headers: adminHeaders });
  if (!res.ok) {
    // DB rows are already gone; the user can retry, and the next sign-in recreates an empty user
    logger.error({ userId, status: res.status }, 'Supabase auth user delete failed after DB delete');
    throw new Error(`Supabase user delete failed: ${res.status}`);
  }

  logger.info({ userId }, 'Account deleted');
}
