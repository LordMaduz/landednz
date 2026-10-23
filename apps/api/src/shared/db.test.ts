import { describe, expect, test, afterAll } from 'vitest';
import { Prisma } from '../generated/prisma/client.js';
import { db } from './db.js';

const USER_ID = `test-db-p2002-${Date.now()}`;

afterAll(async () => {
  await db.user.deleteMany({ where: { id: USER_ID } });
  await db.$disconnect();
});

// auth.service treats P2002 as "user already exists"; the pg driver adapter must keep that contract.
describe('db (Prisma 7 + pg adapter)', () => {
  test('duplicate user raises PrismaClientKnownRequestError P2002', async () => {
    await db.user.create({ data: { id: USER_ID, email: `${USER_ID}@example.com` } });
    const error = await db.user.create({ data: { id: USER_ID, email: `${USER_ID}@example.com` } }).catch(e => e);
    expect(error).toBeInstanceOf(Prisma.PrismaClientKnownRequestError);
    expect(error.code).toBe('P2002');
  });
});
