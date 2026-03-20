import { describe, expect, test } from 'vitest';
import { runLevel2Guardrail } from './level2';

describe('runLevel2Guardrail — MISSING_CITATION', () => {
  test('response without "Source:" fires MISSING_CITATION', () => {
    const result = runLevel2Guardrail("You should open a bank account as soon as possible.");
    expect(result.flags).toContain('MISSING_CITATION');
  });

  test('response with "Source: https://..." does NOT fire', () => {
    const result = runLevel2Guardrail(
      "You can register online. Source: https://ird.govt.nz/registration"
    );
    expect(result.flags).not.toContain('MISSING_CITATION');
  });

  test('"Source:" without URL still fires MISSING_CITATION', () => {
    const result = runLevel2Guardrail("See the IRD website. Source: see ird.govt.nz");
    expect(result.flags).toContain('MISSING_CITATION');
  });

  test('empty response fires MISSING_CITATION', () => {
    const result = runLevel2Guardrail('');
    expect(result.flags).toContain('MISSING_CITATION');
  });

  test('URL before "Source:" still fires — URL must be after Source:', () => {
    const result = runLevel2Guardrail(
      "Visit https://ird.govt.nz for details. Also check the registration process."
    );
    expect(result.flags).toContain('MISSING_CITATION');
  });
});

describe('runLevel2Guardrail — SPECIFIC_NUMBER', () => {
  test('response with "%" fires SPECIFIC_NUMBER', () => {
    const result = runLevel2Guardrail("The GST rate is 15%. Source: https://ird.govt.nz");
    expect(result.flags).toContain('SPECIFIC_NUMBER');
  });

  test('response with "$" fires SPECIFIC_NUMBER', () => {
    const result = runLevel2Guardrail("The fee is $200. Source: https://ird.govt.nz");
    expect(result.flags).toContain('SPECIFIC_NUMBER');
  });

  test('response with "NZD" fires SPECIFIC_NUMBER', () => {
    const result = runLevel2Guardrail("The threshold is NZD 14,000. Source: https://ird.govt.nz");
    expect(result.flags).toContain('SPECIFIC_NUMBER');
  });

  test('response with "working days" fires SPECIFIC_NUMBER', () => {
    const result = runLevel2Guardrail(
      "Processing takes 8–15 working days. Source: https://ird.govt.nz"
    );
    expect(result.flags).toContain('SPECIFIC_NUMBER');
  });

  test('normal response without numbers does NOT fire', () => {
    const result = runLevel2Guardrail(
      "You should open a bank account early. Source: https://sorted.org.nz"
    );
    expect(result.flags).not.toContain('SPECIFIC_NUMBER');
  });
});

describe('runLevel2Guardrail — multiple flags', () => {
  test('response with "$" but no "Source:" fires both flags', () => {
    const result = runLevel2Guardrail("The fee is $200 to process your application.");
    expect(result.flags).toContain('MISSING_CITATION');
    expect(result.flags).toContain('SPECIFIC_NUMBER');
    expect(result.flags).toHaveLength(2);
  });

  test('clean response fires no flags', () => {
    const result = runLevel2Guardrail(
      "Open your bank account early in your settlement journey. Source: https://sorted.org.nz"
    );
    expect(result.flags).toHaveLength(0);
  });
});