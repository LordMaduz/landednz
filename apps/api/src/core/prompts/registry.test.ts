// Unit tests for core/prompts/registry.ts
// TDD for buildChatOpeningMessage() — all 4 entry points covered

import { describe, expect, test } from 'vitest';
import { buildChatOpeningMessage } from './registry';
import type { ChatEntryPoint } from '@landednz/types';

// Mock user data for tests
const mockUser = {
  name: 'Alex Chen',
  profile: {
    visaType: 'AEWV' as const,
    familySituation: 'COUPLE_CONSTRAINED' as const,
    city: 'AUCKLAND' as const,
    occupation: 'TECHNOLOGY' as const,
  },
  completedTaskCount: 5,
};

const mockTaskContext = {
  taskName: 'IRD number application',
};

describe('buildChatOpeningMessage()', () => {
  test('TASK_CARD → contains task name and no generic greeting', () => {
    const result = buildChatOpeningMessage('TASK_CARD', mockUser, mockTaskContext);

    // Contains task name
    expect(result.toLowerCase()).toContain('ird number application');

    // No generic greeting
    expect(result.toLowerCase()).not.toContain('hi! how can i help');
    expect(result.toLowerCase()).not.toContain('hello');

    // Contains persona context (family/visa situation)
    expect(result.toLowerCase()).toContain('partner visa');
  });

  test('EMAIL_DEEPLINK → same as TASK_CARD (task-specific)', () => {
    const result = buildChatOpeningMessage('EMAIL_DEEPLINK', mockUser, mockTaskContext);

    expect(result.toLowerCase()).toContain('ird number application');
    expect(result.toLowerCase()).not.toContain('hi! how can i help');
    expect(result.toLowerCase()).toContain('partner visa');
  });

  test('ROADMAP → contains completion count and no generic greeting', () => {
    const result = buildChatOpeningMessage('ROADMAP', mockUser, null);

    // Contains name
    expect(result.toLowerCase()).toContain('alex chen');

    // Contains completion count
    expect(result).toContain('5');

    // Contains city
    expect(result.toLowerCase()).toContain('auckland');

    // No generic greeting
    expect(result.toLowerCase()).not.toContain('hi! how can i help');
    expect(result.toLowerCase()).not.toContain('hello');
  });

  test('NAVIGATION → same as ROADMAP (completion-based)', () => {
    const result = buildChatOpeningMessage('NAVIGATION', mockUser, null);

    expect(result.toLowerCase()).toContain('alex chen');
    expect(result).toContain('5');
    expect(result.toLowerCase()).toContain('auckland');
    expect(result.toLowerCase()).not.toContain('hi! how can i help');
  });

  test('TASK_CARD with T08 → contains "IRD" or "tax" (AC-4-01 verification)', () => {
    const t08Context = { taskName: 'IRD number application' };
    const result = buildChatOpeningMessage('TASK_CARD', mockUser, t08Context);

    const lowercaseResult = result.toLowerCase();
    const containsIrdOrTax = lowercaseResult.includes('ird') || lowercaseResult.includes('tax');

    expect(containsIrdOrTax).toBe(true);
  });

  test('TASK_CARD without task context → handles gracefully', () => {
    const result = buildChatOpeningMessage('TASK_CARD', mockUser, null);

    // Should not crash, but format might vary without task name
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });
});