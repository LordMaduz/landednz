import { describe, expect, test } from 'vitest';
import { runLevel1Guardrail } from './level1';

describe('runLevel1Guardrail — CRISIS_SIGNAL', () => {
  test('exact AC test input fires CRISIS_SIGNAL', () => {
    const result = runLevel1Guardrail("I can't cope with all this");
    expect(result.triggered).toBe(true);
    expect(result.flags).toContain('CRISIS_SIGNAL');
    expect(result.augmentations).toHaveLength(1);
    expect(result.augmentations[0]).toContain('0800 543 354');
    expect(result.augmentations[0]).toContain('RESPOND WITH THIS FIRST');
  });

  test('"I want to give up" fires CRISIS_SIGNAL', () => {
    const result = runLevel1Guardrail("I want to give up");
    expect(result.triggered).toBe(true);
    expect(result.flags).toContain('CRISIS_SIGNAL');
  });

  test('"I am overwhelmed" fires CRISIS_SIGNAL', () => {
    const result = runLevel1Guardrail("I am overwhelmed");
    expect(result.triggered).toBe(true);
    expect(result.flags).toContain('CRISIS_SIGNAL');
  });

  test('case-insensitive — "I CAN\'T COPE" fires CRISIS_SIGNAL', () => {
    const result = runLevel1Guardrail("I CAN'T COPE with all this");
    expect(result.triggered).toBe(true);
    expect(result.flags).toContain('CRISIS_SIGNAL');
  });

  test('normal message does not fire', () => {
    const result = runLevel1Guardrail("What documents do I need for my IRD application?");
    expect(result.triggered).toBe(false);
    expect(result.flags).toHaveLength(0);
    expect(result.augmentations).toHaveLength(0);
  });

  test('triggered is false when no flags fire', () => {
    const result = runLevel1Guardrail("How do I open a bank account?");
    expect(result.triggered).toBe(false);
  });
});