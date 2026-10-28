import { describe, expect, test } from 'vitest';
import type { Bundle, ResolvedItem } from './build.js';
import { reviewHtml, variants } from './review.js';

const item = (id: string, text: string, extra: Partial<ResolvedItem> = {}): ResolvedItem => ({
  id, text, source: 'ird', checked: '2026-09-01', verified: true, factIds: [], ...extra,
});
const bundle: Bundle = {
  version: 'v1',
  builtAt: '2026-10-25T00:00:00.000Z',
  dimensions: {
    visa: { label: 'Visa', values: [['AEWV', 'Work visa'], ['PR', 'Resident']] },
    city: { label: 'City', values: [['AKL', 'Auckland']] },
    family: { label: 'Family', values: [['SOLO', 'Solo'], ['CHILDREN', 'With children']] },
    occupation: { label: 'Occupation', values: [['TECH', 'Tech']] },
  },
  sources: { ird: { url: 'https://www.ird.govt.nz/apply', title: 'IRD apply', agency: 'IRD', tier: 'government' } },
  facts: {},
  tasks: [{
    id: 'T01', name: 'Get an IRD number', phase: 1, priority: 1, boosts: [], urgency: [], duration: '1 day',
    appliesTo: 'all', dependsOn: [], retired: false, checkedAt: '2026-09-01',
    why: [item('T01.why', 'Tax matters <b>a lot</b>')],
    steps: [item('T01.s1', 'Apply online'), item('T01.s2', 'Add child details', { when: { family: ['CHILDREN'] }, verified: false, checked: '2026-08-15' })],
    documents: [], mistakes: [], watchOuts: [],
  }],
};

describe('variants', () => {
  test('groups combinations by identical visible items', () => {
    const v = variants(bundle, 'T01');
    expect(v).toHaveLength(2);
    const kids = v.find((g) => g.items.steps.some((s) => s.id === 'T01.s2'))!;
    expect(kids.profiles).toHaveLength(2);
  });
  test('leaves out combinations where the task does not apply', () => {
    const b = { ...bundle, tasks: [{ ...bundle.tasks[0]!, appliesTo: { visa: ['PR'] } }] };
    expect(variants(b, 'T01').flatMap((g) => g.profiles).every((p) => p.visaType === 'PR')).toBe(true);
  });
});

describe('reviewHtml', () => {
  const html = reviewHtml(bundle, 'T01');
  test('shows items with source link, checked date and verified state', () => {
    for (const t of ['Apply online', 'Add child details']) expect(html).toContain(t);
    expect(html).toContain('<a href="https://www.ird.govt.nz/apply">IRD apply</a>');
    expect(html).toContain('2026-08-15');
    expect(html).toContain('unverified');
    expect(html).toContain('verified');
  });
  test('lists profiles by label', () => {
    expect(html).toContain('With children');
    expect(html).toContain('Work visa');
  });
  test('escapes item text', () => {
    expect(html).toContain('&lt;b&gt;a lot&lt;/b&gt;');
    expect(html).not.toContain('<b>a lot');
  });
});
