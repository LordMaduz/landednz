// Stage 0 dimension changes (Review Focus 2). The migration's answer mapping is replayed on a throwaway
// schema (dropped enum values can't be inserted into the migrated DB), then real local users holding the
// mapped values load their profile and roadmap through the API. Auth is never mocked.

import { readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { db } from '../../shared/db.js';
import { buildApp } from '../../server.js';
import { createTestUser, deleteTestUser } from '../../test-utils/supabase-user.js';
import { createProfile } from './onboarding.service.js';

const migrations = resolve(import.meta.dirname, '../../../prisma/migrations');
const migrationSql = readFileSync(resolve(migrations, readdirSync(migrations).find((d) => d.endsWith('_dimension_changes'))!, 'migration.sql'), 'utf8');
const statements = migrationSql
  .replace(/^--.*$/gm, '')
  .split(/;\s*$/m)
  .map((s) => s.trim())
  .filter((s) => s && !/^(BEGIN|COMMIT)$/i.test(s)); // the test's own transaction wraps them

const SCHEMA = `dimension_test_${Date.now()}`;

// Pre-migration enums: one row per old value, [id, visaType, occupation]
const PRE_MIGRATION = [
  `CREATE TYPE "VisaType" AS ENUM ('AEWV', 'PARTNER_OF_STUDENT', 'GREEN_LIST_WORK', 'GREEN_LIST_RESIDENCE', 'OTHER')`,
  `CREATE TYPE "City" AS ENUM ('AUCKLAND', 'WELLINGTON', 'CHRISTCHURCH', 'OTHER')`,
  `CREATE TYPE "FamilySituation" AS ENUM ('SOLO', 'COUPLE_DUAL_WORK', 'COUPLE_CONSTRAINED', 'FAMILY_WITH_CHILDREN')`,
  `CREATE TYPE "Occupation" AS ENUM ('TECHNOLOGY', 'HEALTHCARE', 'EDUCATION', 'FINANCE', 'TRADES', 'OTHER_PROFESSIONAL', 'SEEKING_WORK')`,
  `CREATE TABLE "UserProfile" ("id" TEXT PRIMARY KEY, "visaType" "VisaType" NOT NULL, "city" "City" NOT NULL,
     "familySituation" "FamilySituation" NOT NULL, "occupation" "Occupation" NOT NULL)`,
];
const ROWS = [
  ['v-aewv', 'AEWV', 'HEALTHCARE'],
  ['v-glw', 'GREEN_LIST_WORK', 'HEALTHCARE'],
  ['v-glr', 'GREEN_LIST_RESIDENCE', 'HEALTHCARE'],
  ['v-pos', 'PARTNER_OF_STUDENT', 'HEALTHCARE'],
  ['v-other', 'OTHER', 'HEALTHCARE'],
  ['o-tech', 'AEWV', 'TECHNOLOGY'],
  ['o-edu', 'AEWV', 'EDUCATION'],
  ['o-fin', 'AEWV', 'FINANCE'],
  ['o-trades', 'AEWV', 'TRADES'],
  ['o-other', 'AEWV', 'OTHER_PROFESSIONAL'],
  ['o-seek', 'AEWV', 'SEEKING_WORK'],
] as const;
// stage-0.md § Answer mapping
const EXPECTED: Record<string, { visaType: string; occupation: string }> = {
  'v-aewv': { visaType: 'AEWV', occupation: 'HEALTHCARE' },
  'v-glw': { visaType: 'AEWV', occupation: 'HEALTHCARE' },
  'v-glr': { visaType: 'STRAIGHT_TO_RESIDENCE', occupation: 'HEALTHCARE' },
  'v-pos': { visaType: 'PARTNER_WORK', occupation: 'HEALTHCARE' },
  'v-other': { visaType: 'OTHER', occupation: 'HEALTHCARE' },
  'o-tech': { visaType: 'AEWV', occupation: 'OTHER_PROFESSIONAL' },
  'o-edu': { visaType: 'AEWV', occupation: 'EDUCATION' },
  'o-fin': { visaType: 'AEWV', occupation: 'OTHER_PROFESSIONAL' },
  'o-trades': { visaType: 'AEWV', occupation: 'TRADES' },
  'o-other': { visaType: 'AEWV', occupation: 'OTHER_PROFESSIONAL' },
  'o-seek': { visaType: 'AEWV', occupation: 'SEEKING_WORK' },
};

type Mapped = { id: string; visaType: string; occupation: string };
let mapped: Mapped[];

describe('dimension_changes migration', () => {
  beforeAll(async () => {
    mapped = await db.$transaction(async (tx) => {
      await tx.$executeRawUnsafe(`CREATE SCHEMA "${SCHEMA}"`);
      await tx.$executeRawUnsafe(`SET LOCAL search_path TO "${SCHEMA}"`);
      for (const s of PRE_MIGRATION) await tx.$executeRawUnsafe(s);
      for (const [id, visa, occupation] of ROWS)
        await tx.$executeRawUnsafe(`INSERT INTO "UserProfile" VALUES ('${id}', '${visa}', 'AUCKLAND', 'SOLO', '${occupation}')`);
      for (const s of statements) await tx.$executeRawUnsafe(s);
      const rows = await tx.$queryRawUnsafe<Mapped[]>(
        `SELECT "id", "visaType"::text AS "visaType", "occupation"::text AS "occupation" FROM "UserProfile" ORDER BY "id"`,
      );
      await tx.$executeRawUnsafe(`DROP SCHEMA "${SCHEMA}" CASCADE`);
      return rows;
    });
  });

  test('maps every old value per the answer mapping', () => {
    expect(Object.fromEntries(mapped.map(({ id, ...rest }) => [id, rest]))).toEqual(EXPECTED);
  });
});

describe('a user holding mapped values', () => {
  let app: FastifyInstance;
  let userId: string;
  let jwt: string;

  beforeAll(async () => {
    let email: string;
    ({ userId, jwt, email } = await createTestUser('test-dimensions'));
    await db.user.create({ data: { id: userId, email } });
    app = await buildApp();
  });

  afterAll(async () => {
    await db.user.deleteMany({ where: { id: userId } });
    await deleteTestUser(userId);
    await app.close();
    await db.$disconnect();
  });

  const get = (url: string) => app.inject({ method: 'GET', url, headers: { Authorization: `Bearer ${jwt}` } });

  test.each(Object.entries(EXPECTED))('%s: profile and roadmap load', async (_id, { visaType, occupation }) => {
    await db.userRoadmapEntry.deleteMany({ where: { userId } });
    await db.userProfile.deleteMany({ where: { userId } });
    const answers = { visaType, city: 'AUCKLAND', familySituation: 'SOLO', occupation, arrivalDate: '2026-11-20' } as Parameters<typeof createProfile>[1];
    await createProfile(userId, answers);

    const profile = await get('/onboarding/profile');
    expect(profile.statusCode).toBe(200);
    expect(profile.json()).toMatchObject({ visaType, occupation });

    const roadmap = await get('/roadmap');
    expect(roadmap.statusCode).toBe(200);
    expect(roadmap.json().phases.flatMap((p: { tasks: unknown[] }) => p.tasks)).not.toHaveLength(0);
  });
});
