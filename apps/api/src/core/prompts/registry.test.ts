// Unit tests for core/prompts/registry.ts
// TDD for buildChatOpeningMessage() — all 4 entry points covered
// TDD for buildChatSystemPrompt() — all 7 components + token count

import { describe, expect, test } from 'vitest';
import { buildChatOpeningMessage, buildChatSystemPrompt } from './registry';
import type { ChatEntryPoint } from '@landednz/types';
import type { BuildSystemPromptParams, ChatKbChunk } from '../../features/chat/chat.types';

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

// Mock data for buildChatSystemPrompt() tests
const mockSystemPromptParams: BuildSystemPromptParams = {
  user: {
    name: 'Alex Chen',
    visaType: 'AEWV',
    familySituation: 'COUPLE_CONSTRAINED',
    city: 'AUCKLAND',
    occupation: 'TECHNOLOGY',
    arrivalDaysAgo: 45,
    personaKey: 'constrained_couple',
    recentCompletions: ['NZ SIM card', 'Bank account', 'IRD number application'],
  },
  entryPoint: 'TASK_CARD',
  taskName: 'IRD number application',
  consequenceLine: 'Without this, first paycheck taxed at 45%',
  kbChunks: [
    {
      chunkKey: 'T08-constrained_couple',
      personaKey: 'constrained_couple',
      content: 'Apply for IRD number within first week. Bring passport and bank details.',
      sourceName: 'IRD number application',
      sourceUrl: 'https://ird.govt.nz/individual/ird-numbers',
    },
  ],
  guardrailAugmentations: [],
};

// Helper function to count approximate tokens (rough estimation: 1 token ≈ 4 chars)
function estimateTokenCount(text: string): number {
  return Math.ceil(text.length / 4);
}

describe('buildChatSystemPrompt()', () => {
  test('Token count between 800 and 3,500', () => {
    const result = buildChatSystemPrompt(mockSystemPromptParams);
    const tokenCount = estimateTokenCount(result);

    expect(tokenCount).toBeGreaterThanOrEqual(800);
    expect(tokenCount).toBeLessThanOrEqual(3500);
  });

  test('Contains user profile data (name, visa, family, city, arrival)', () => {
    const result = buildChatSystemPrompt(mockSystemPromptParams);

    expect(result).toContain('Alex Chen');
    expect(result).toContain('AEWV');
    expect(result).toContain('COUPLE_CONSTRAINED');
    expect(result).toContain('AUCKLAND');
    expect(result).toContain('45 days ago');
  });

  test('All 7 components present in correct order', () => {
    const result = buildChatSystemPrompt(mockSystemPromptParams);

    // Component 1: Identity
    expect(result).toMatch(/You are LandedNZ/);

    // Component 2: User profile injection
    expect(result).toMatch(/THE PERSON YOU ARE HELPING:/);

    // Component 3: Persona anchor TOP
    expect(result).toMatch(/PERSONA ANCHOR — READ BEFORE EVERY RESPONSE:/);

    // Component 4: Behavioural constraints
    expect(result).toMatch(/BEHAVIOURAL CONSTRAINTS:/);
    expect(result).toMatch(/1\. GROUNDING:/);

    // Component 5: Scope boundaries
    expect(result).toMatch(/SCOPE BOUNDARIES:/);

    // Component 6: Retrieved KB chunks
    expect(result).toMatch(/RETRIEVED KNOWLEDGE BASE CONTENT:/);

    // Component 7: Persona anchor BOTTOM
    expect(result).toMatch(/FINAL REMINDER: You are speaking with/);
  });

  test('Both persona anchors present with user name', () => {
    const result = buildChatSystemPrompt(mockSystemPromptParams);

    // TOP anchor
    expect(result).toMatch(/PERSONA ANCHOR — READ BEFORE EVERY RESPONSE:.*Alex Chen/s);

    // BOTTOM anchor
    expect(result).toMatch(/FINAL REMINDER: You are speaking with Alex Chen/);
  });

  test('COUPLE_CONSTRAINED includes partner visa and 20hr work limit text', () => {
    const result = buildChatSystemPrompt(mockSystemPromptParams);

    expect(result).toMatch(/Partner situation:.*student visa.*20hr work limit/s);
    expect(result).toMatch(/Income constraint:.*Single income/);
  });

  test('Guardrail augmentations appended when non-empty', () => {
    const paramsWithAugmentations: BuildSystemPromptParams = {
      ...mockSystemPromptParams,
      guardrailAugmentations: [
        'CRISIS RESOURCE — RESPOND WITH THIS FIRST: Lifeline NZ is available 24/7: 0800 543 354',
      ],
    };

    const result = buildChatSystemPrompt(paramsWithAugmentations);

    expect(result).toMatch(/BEHAVIOURAL CONSTRAINTS:.*8\. NEVER FABRICATE:.*CRISIS RESOURCE/s);
  });

  test('Empty guardrail augmentations does not affect structure', () => {
    const result = buildChatSystemPrompt(mockSystemPromptParams);

    // Should still have all 8 behavioural rules, just no augmentations after
    expect(result).toMatch(/8\. NEVER FABRICATE:/);
    expect(result).not.toMatch(/CRISIS RESOURCE/);
  });

  test('TASK_CARD entry point includes task context block', () => {
    const result = buildChatSystemPrompt(mockSystemPromptParams);

    expect(result).toMatch(/CURRENT TASK CONTEXT:/);
    expect(result).toMatch(/Task: IRD number application/);
    expect(result).toMatch(/Without this, first paycheck taxed at 45%/);
  });

  test('ROADMAP entry point excludes task context block', () => {
    const roadmapParams: BuildSystemPromptParams = {
      ...mockSystemPromptParams,
      entryPoint: 'ROADMAP',
      taskName: null,
      consequenceLine: null,
    };

    const result = buildChatSystemPrompt(roadmapParams);

    expect(result).not.toMatch(/CURRENT TASK CONTEXT:/);
  });

  test('KB chunks formatted correctly', () => {
    const result = buildChatSystemPrompt(mockSystemPromptParams);

    expect(result).toMatch(/\[CHUNK 1 — T08-constrained_couple — constrained_couple\]/);
    expect(result).toMatch(/Apply for IRD number within first week/);
    expect(result).toMatch(/Source: IRD number application — https:\/\/ird\.govt\.nz/);
  });

  test('Components appear in correct order: Identity → Profile → AnchorTop → Constraints → Scope → KB → AnchorBottom', () => {
    const result = buildChatSystemPrompt(mockSystemPromptParams);

    const idxIdentity     = result.indexOf('You are LandedNZ');
    const idxProfile      = result.indexOf('THE PERSON YOU ARE HELPING:');
    const idxAnchorTop    = result.indexOf('PERSONA ANCHOR — READ BEFORE EVERY RESPONSE:');
    const idxConstraints  = result.indexOf('BEHAVIOURAL CONSTRAINTS:');
    const idxScope        = result.indexOf('SCOPE BOUNDARIES:');
    const idxKb           = result.indexOf('RETRIEVED KNOWLEDGE BASE CONTENT:');
    const idxAnchorBottom = result.indexOf('FINAL REMINDER: You are speaking with');

    expect(idxIdentity).toBeLessThan(idxProfile);
    expect(idxProfile).toBeLessThan(idxAnchorTop);
    expect(idxAnchorTop).toBeLessThan(idxConstraints);
    expect(idxConstraints).toBeLessThan(idxScope);
    expect(idxScope).toBeLessThan(idxKb);
    expect(idxKb).toBeLessThan(idxAnchorBottom);
  });

  test('AC-4-09: COUPLE_CONSTRAINED user — all 5 profile fields injected correctly', () => {
    const result = buildChatSystemPrompt(mockSystemPromptParams); // familySituation: COUPLE_CONSTRAINED

    // All 5 required fields
    expect(result).toContain('Alex Chen');               // name
    expect(result).toContain('AEWV');                    // visaType
    expect(result).toContain('COUPLE_CONSTRAINED');      // familySituation
    expect(result).toContain('AUCKLAND');                // city
    expect(result).toContain('45 days ago');             // arrivalDaysAgo

    // COUPLE_CONSTRAINED-specific conditional content
    expect(result).toMatch(/Partner situation:.*student visa.*20hr work limit/s);
    expect(result).toMatch(/Income constraint:.*Single income/);
  });
});