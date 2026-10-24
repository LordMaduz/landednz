// DELETE /account (spec §4.3 amendment) — real local Supabase users; auth is never mocked.
import { describe, expect, test, beforeAll, afterAll } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { db } from '../../shared/db.js';
import { buildApp } from '../../server.js';
import { createTestUser, deleteTestUser } from '../../test-utils/supabase-user.js';
import { createProfile } from '../onboarding/onboarding.service.js';
import { deleteAccount } from './account.service.js';

const ANSWERS = {
  visaType: 'AEWV',
  city: 'AUCKLAND',
  familySituation: 'SOLO',
  occupation: 'TECHNOLOGY',
  arrivalDate: '2026-10-21',
} as const;

async function authUserExists(userId: string): Promise<boolean> {
  const res = await fetch(`${process.env.SUPABASE_URL}/auth/v1/admin/users/${userId}`, {
    headers: { apikey: process.env.SUPABASE_SECRET_KEY!, Authorization: `Bearer ${process.env.SUPABASE_SECRET_KEY}` },
  });
  return res.ok;
}

async function userWithData(prefix: string) {
  const user = await createTestUser(prefix);
  await db.user.create({ data: { id: user.userId, email: user.email } });
  await createProfile(user.userId, ANSWERS);
  await db.chatSession.create({ data: { userId: user.userId, entryPoint: 'TASK_CARD', taskContext: 'T08' } });
  return user;
}

async function rowsFor(userId: string) {
  return {
    user: await db.user.count({ where: { id: userId } }),
    profile: await db.userProfile.count({ where: { userId } }),
    roadmap: await db.userRoadmapEntry.count({ where: { userId } }),
    chat: await db.chatSession.count({ where: { userId } }),
  };
}

const created: string[] = [];
let app: FastifyInstance;

beforeAll(async () => {
  app = await buildApp();
});

afterAll(async () => {
  for (const id of created) {
    await db.user.deleteMany({ where: { id } });
    if (await authUserExists(id)) await deleteTestUser(id);
  }
  await app.close();
  await db.$disconnect();
});

describe('deleteAccount()', () => {
  test('removes every row for the user and their Supabase auth user', async () => {
    const { userId } = await userWithData('test-account-svc');
    created.push(userId);
    expect(await rowsFor(userId)).toMatchObject({ user: 1, profile: 1, chat: 1 });

    await deleteAccount(userId);

    expect(await rowsFor(userId)).toEqual({ user: 0, profile: 0, roadmap: 0, chat: 0 });
    expect(await authUserExists(userId)).toBe(false);
  });
});

describe('DELETE /account', () => {
  test('no Authorization header → 401', async () => {
    const res = await app.inject({ method: 'DELETE', url: '/account' });
    expect(res.statusCode).toBe(401);
  });

  test('with a token → 204; the same token again → 401', async () => {
    const { userId, jwt } = await userWithData('test-account-route');
    created.push(userId);
    const headers = { authorization: `Bearer ${jwt}` };

    const first = await app.inject({ method: 'DELETE', url: '/account', headers });
    expect(first.statusCode).toBe(204);
    expect(await rowsFor(userId)).toEqual({ user: 0, profile: 0, roadmap: 0, chat: 0 });

    const second = await app.inject({ method: 'DELETE', url: '/account', headers });
    expect(second.statusCode).toBe(401);
  });
});
