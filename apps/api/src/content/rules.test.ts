import { resolve } from 'node:path';
import { describe, expect, test } from 'vitest';
import { loadContent, runRules, type Ctx } from './build.js';

const FIXTURE = resolve(import.meta.dirname, '__fixtures__/valid');
const NOW = new Date('2026-10-24T00:00:00Z');

function fixture(allowUnverified = false): Ctx {
  const { ctx, errors } = loadContent(FIXTURE);
  expect(errors).toEqual([]);
  return { ...ctx!, now: NOW, allowUnverified };
}
const task = (c: Ctx, id: string) => c.tasks.find((t) => t.task.id === id)!.task;
const facts = (c: Ctx) => c.factFiles[0]!.facts;

function expectOne(c: Ctx, rule: string) {
  const errors = runRules(c);
  expect(errors.map((e) => e.rule)).toEqual([rule]);
}

describe('content rules', () => {
  test('valid fixture has no errors', () => {
    expect(runRules(fixture())).toEqual([]);
  });

  test('missing-source', () => {
    const c = fixture();
    task(c, 'T01').steps[0]!.source = 'nope';
    expectOne(c, 'missing-source');
  });

  test('domain', () => {
    const c = fixture();
    c.sources['ird-apply']!.url = 'https://example.com/ird';
    expectOne(c, 'domain');
  });

  test('provider-reason', () => {
    const c = fixture();
    delete c.sources['bank-fees']!.reason;
    expectOne(c, 'provider-reason');
  });

  test('provider-type', () => {
    const c = fixture();
    facts(c)['bank.account-fee']!.numberType = 'A';
    expectOne(c, 'provider-type');
  });

  test.each(['It costs $50.', 'It takes 10 days.', 'Up to 45% is withheld.'])('literal-figure: %s', (text) => {
    const c = fixture();
    task(c, 'T01').steps[0]!.text = text;
    expectOne(c, 'literal-figure');
  });

  test('literal-figure allows form names and phone numbers', () => {
    const c = fixture();
    task(c, 'T01').steps[0]!.text = 'Fill in form IR595 or call 0800 227 774.';
    expect(runRules(c)).toEqual([]);
  });

  test.each(['two weeks', '10 per cent', '5 hrs', 'a fortnight', 'by 31 March'])('literal-figure: words and units: %s', (figure) => {
    const c = fixture();
    task(c, 'T01').steps[0]!.text = `It takes ${figure}.`;
    expectOne(c, 'literal-figure');
  });

  test('literal-figure: form IR595 and 0800 377 774 pass', () => {
    const c = fixture();
    task(c, 'T01').steps[0]!.text = 'Use form IR595 or call 0800 377 774.';
    expect(runRules(c)).toEqual([]);
  });

  test('literal-figure: lowercase "may" is not a month', () => {
    const c = fixture();
    task(c, 'T01').steps[0]!.text = 'Step 2 may need a form.';
    expect(runRules(c)).toEqual([]);
  });

  test('provider-item', () => {
    const c = fixture();
    task(c, 'T01').steps[0]!.source = 'bank-fees';
    // a provider source may sit only behind type C facts, so the item itself is rejected
    expect(runRules(c).map((e) => e.rule)).toContain('provider-item');
  });

  test('provider-reason: uncited source', () => {
    const c = fixture();
    c.sources['unused'] = { url: 'https://unused.example.co.nz', title: 'Unused', agency: 'Unused', tier: 'provider' };
    expectOne(c, 'provider-reason');
  });

  test('provider-reason: source cited by three facts is one error', () => {
    const c = fixture();
    delete c.sources['bank-fees']!.reason;
    facts(c)['bank.a'] = { ...facts(c)['bank.account-fee']! };
    facts(c)['bank.b'] = { ...facts(c)['bank.account-fee']! };
    expectOne(c, 'provider-reason');
  });

  test('unknown-dimension: prototype keys', () => {
    const c = fixture();
    task(c, 'T01').steps[1]!.when = { constructor: ['X'] } as never;
    expectOne(c, 'unknown-dimension');
  });

  test('unknown-dimension (nested in any)', () => {
    const c = fixture();
    task(c, 'T01').steps[1]!.when = { any: [{ town: ['AUCKLAND'] } as never] };
    expectOne(c, 'unknown-dimension');
  });

  test('unknown-value (nested in not)', () => {
    const c = fixture();
    task(c, 'T02').appliesTo = { not: { city: ['DUNEDIN'] } };
    expectOne(c, 'unknown-value');
  });

  test('unknown-value in boosts', () => {
    const c = fixture();
    task(c, 'T01').boosts[0]!.when = { occupation: ['ASTRONAUT'] };
    expectOne(c, 'unknown-value');
  });

  test.each(['Priya applied online.', "Priya's employer pays monthly.", "Karthik's bank is open.", "Karthik’s bank is open.", "I'd apply early.", 'Then I apply.', 'We recommend applying.'])(
    'denylist: %s',
    (text) => {
      const c = fixture();
      task(c, 'T01').steps[0]!.text = text;
      expectOne(c, 'denylist');
    },
  );

  test.each(['Ask priyanka at the counter.', "If I'm late, call.", "Once I've landed, apply."])('denylist passes: %s', (text) => {
    const c = fixture();
    task(c, 'T01').steps[0]!.text = text;
    expect(runRules(c)).toEqual([]);
  });

  test('stale: type C fact checked 4 months ago', () => {
    const c = fixture();
    facts(c)['bank.account-fee']!.checked = '2026-06-24';
    expectOne(c, 'stale');
  });

  test('stale: type C fact at exactly 3 months passes', () => {
    const c = fixture();
    facts(c)['bank.account-fee']!.checked = '2026-07-24';
    expect(runRules(c)).toEqual([]);
  });

  test('stale: type B fact checked 7 months ago', () => {
    const c = fixture();
    Object.assign(facts(c)['ird.non-declaration-rate']!, { numberType: 'B', checked: '2026-03-24' });
    expectOne(c, 'stale');
  });

  test('stale: item checked 13 months ago', () => {
    const c = fixture();
    task(c, 'T01').steps[0]!.checked = '2025-09-24';
    expectOne(c, 'stale');
  });

  test('stale: month ends', () => {
    const c = fixture();
    c.now = new Date('2026-08-31T00:00:00Z');
    Object.assign(facts(c)['ird.non-declaration-rate']!, { numberType: 'B', checked: '2026-02-28' });
    expect(runRules(c)).toEqual([]);
    facts(c)['ird.non-declaration-rate']!.checked = '2026-02-27';
    expectOne(c, 'stale');
  });

  test('stale: NZ date', () => {
    const c = fixture();
    c.now = new Date('2026-10-24T20:00:00Z'); // 25 Oct in Auckland
    facts(c)['bank.account-fee']!.checked = '2026-07-25';
    expect(runRules(c)).toEqual([]);
    facts(c)['bank.account-fee']!.checked = '2026-07-24';
    expectOne(c, 'stale');
  });

  test('duplicate-id', () => {
    const c = fixture();
    task(c, 'T02').steps[0]!.id = 'T01.step.apply-online';
    expectOne(c, 'duplicate-id');
  });

  test('missing-dependency', () => {
    const c = fixture();
    task(c, 'T02').dependsOn = [{ task: 'T99', type: 'hard' }];
    expectOne(c, 'missing-dependency');
  });

  test('retired-dependency', () => {
    const c = fixture();
    task(c, 'T01').retired = true;
    expectOne(c, 'retired-dependency');
  });

  test('cycle', () => {
    const c = fixture();
    task(c, 'T01').dependsOn = [{ task: 'T02', type: 'soft' }];
    expectOne(c, 'cycle');
  });

  test('unresolved-fact', () => {
    const c = fixture();
    task(c, 'T01').steps[0]!.text = 'See {{nope}}.';
    expectOne(c, 'unresolved-fact');
  });

  test('unverified fails without allowUnverified', () => {
    const c = fixture();
    task(c, 'T01').steps[0]!.verified = false;
    expectOne(c, 'unverified');
  });

  test('unverified: fact used by a verified item', () => {
    const c = fixture();
    facts(c)['ird.non-declaration-rate']!.verified = false;
    const errors = runRules(c);
    expect(errors.map((e) => [e.rule, e.id])).toEqual([['unverified', 'ird.non-declaration-rate']]);
  });

  test.each([
    'acc.co.nz', 'sorted.org.nz', 'privacy.org.nz', 'hdc.org.nz', 'tikatangata.org.nz', 'hrc.co.nz', 'fireandemergency.nz',
    'nzblood.co.nz', 'publictrust.co.nz', 'teachingcouncil.nz', 'nursingcouncil.org.nz', 'pgdb.co.nz',
  ])('domain: crown allowlist: %s', (host) => {
    const c = fixture();
    c.sources['ird-apply']!.url = `https://www.${host}/page`;
    expect(runRules(c)).toEqual([]);
  });

  test('domain: example.org.nz is not Crown', () => {
    const c = fixture();
    c.sources['ird-apply']!.url = 'https://example.org.nz/page';
    expectOne(c, 'domain');
  });

  test('allowUnverified also skips literal-figure, provider-reason and stale for that item', () => {
    const c = fixture(true);
    c.sources['shop'] = { url: 'https://shop.example.co.nz', title: 'Shop', agency: 'Shop', tier: 'provider' };
    Object.assign(task(c, 'T01').steps[0]!, {
      verified: false, text: 'It costs $50.', source: 'shop', numberType: 'C', checked: '2024-01-01',
    });
    expect(runRules(c)).toEqual([]);
  });
});
