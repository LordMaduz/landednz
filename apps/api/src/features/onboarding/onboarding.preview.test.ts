// Public roadmap preview (spec §4.3 amendment): the five answers in, the filtered task list out.
// Re-seeds first because other integration tests delete and recreate canonical tasks.
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { db } from '../../shared/db.js';
import { buildApp } from '../../server.js';
import { seedKnowledgeBase } from '../../../scripts/seed-knowledge-base.js';
import { previewRoadmap } from './onboarding.preview.js';

const ANSWERS = {
  visaType: 'AEWV',
  city: 'AUCKLAND',
  familySituation: 'SOLO',
  occupation: 'TECHNOLOGY',
  arrivalDate: '2026-10-21',
} as const;

let app: FastifyInstance;

beforeAll(async () => {
  await seedKnowledgeBase();
  app = await buildApp();
}, 120_000);

afterAll(async () => {
  await app.close();
  await db.$disconnect();
});

describe('previewRoadmap()', () => {
  it('solo mover → 20 tasks in id order, no T21', async () => {
    const { tasks } = await previewRoadmap(ANSWERS);
    expect(tasks).toHaveLength(20);
    expect(tasks[0]).toMatchObject({ taskId: 'T01', name: expect.any(String), estimatedDuration: expect.any(String), phase: expect.any(Number) });
    expect(tasks.map(t => t.taskId)).not.toContain('T21');
    expect(tasks.map(t => t.taskId)).toEqual([...tasks.map(t => t.taskId)].sort());
  });

  it('family with children → 21 tasks', async () => {
    const { tasks } = await previewRoadmap({ ...ANSWERS, familySituation: 'FAMILY_WITH_CHILDREN' });
    expect(tasks).toHaveLength(21);
  });
});

describe('POST /onboarding/preview', () => {
  it('no token, valid body → 200', async () => {
    const res = await app.inject({ method: 'POST', url: '/onboarding/preview', payload: ANSWERS });
    expect(res.statusCode).toBe(200);
    expect(res.json().tasks).toHaveLength(20);
  });

  it('unknown visa type → 400 VALIDATION_ERROR', async () => {
    const res = await app.inject({ method: 'POST', url: '/onboarding/preview', payload: { ...ANSWERS, visaType: 'NOPE' } });
    expect(res.statusCode).toBe(400);
    expect(res.json().error).toBe('VALIDATION_ERROR');
  });

  it('impossible arrival date → 400', async () => {
    for (const arrivalDate of ['2026-13-40', '2026-02-30', '21/10/2026']) {
      const res = await app.inject({ method: 'POST', url: '/onboarding/preview', payload: { ...ANSWERS, arrivalDate } });
      expect(res.statusCode).toBe(400);
    }
  });

  it('missing field → 400', async () => {
    const { occupation: _omit, ...rest } = ANSWERS;
    const res = await app.inject({ method: 'POST', url: '/onboarding/preview', payload: rest });
    expect(res.statusCode).toBe(400);
  });
});
