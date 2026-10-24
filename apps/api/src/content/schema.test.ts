import { describe, expect, test } from 'vitest';
import { taskSchema } from './schema.js';

const item = { id: 'i1', text: 'Do it', source: 'ird', checked: '2026-10-01', verified: true };
const task = {
  id: 't1', name: 'Task', phase: 1, priority: 5, boosts: [], urgency: [], duration: '1 day',
  appliesTo: 'all', dependsOn: [], retired: false,
  why: [item], steps: [item], documents: [], mistakes: [], watchOuts: [],
};

describe('taskSchema', () => {
  test('minimal task parses', () => {
    expect(taskSchema.safeParse(task).success).toBe(true);
  });
  test('parses condition shapes incl. unknown dimension keys', () => {
    const r = taskSchema.safeParse({ ...task, appliesTo: { any: [{ town: ['X'] }, { not: { city: ['A'] } }] } });
    expect(r.success).toBe(true);
  });
  test.each([
    ['any as dimension leaf', { ...task, appliesTo: { any: ['X'] } }],
    ['not as dimension leaf', { ...task, appliesTo: { not: ['X'] } }],
    ['item without source', { ...task, steps: [{ ...item, source: undefined }] }],
    ['bad checked date', { ...task, steps: [{ ...item, checked: '2026-13-01' }] }],
    ['phase 6', { ...task, phase: 6 }],
    ['numberType D', { ...task, steps: [{ ...item, numberType: 'D' }] }],
    ['unknown key', { ...task, extra: 1 }],
    ['bad dependsOn type', { ...task, dependsOn: [{ task: 'x', type: 'maybe' }] }],
  ])('rejects %s', (_n, bad) => {
    expect(taskSchema.safeParse(bad).success).toBe(false);
  });
});
