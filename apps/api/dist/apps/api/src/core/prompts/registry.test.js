"use strict";
// Unit tests for core/prompts/registry.ts
// TDD for buildChatOpeningMessage() — all 4 entry points covered
// TDD for buildChatSystemPrompt() — all 7 components + token count
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const registry_1 = require("./registry");
// Mock user data for tests
const mockUser = {
    name: 'Alex Chen',
    profile: {
        visaType: 'AEWV',
        familySituation: 'COUPLE_CONSTRAINED',
        city: 'AUCKLAND',
        occupation: 'TECHNOLOGY',
    },
    completedTaskCount: 5,
};
const mockTaskContext = {
    taskName: 'IRD number application',
};
(0, vitest_1.describe)('buildChatOpeningMessage()', () => {
    (0, vitest_1.test)('TASK_CARD → contains task name and no generic greeting', () => {
        const result = (0, registry_1.buildChatOpeningMessage)('TASK_CARD', mockUser, mockTaskContext);
        // Contains task name
        (0, vitest_1.expect)(result.toLowerCase()).toContain('ird number application');
        // No generic greeting
        (0, vitest_1.expect)(result.toLowerCase()).not.toContain('hi! how can i help');
        (0, vitest_1.expect)(result.toLowerCase()).not.toContain('hello');
        // Contains persona context (family/visa situation)
        (0, vitest_1.expect)(result.toLowerCase()).toContain('partner visa');
    });
    (0, vitest_1.test)('EMAIL_DEEPLINK → same as TASK_CARD (task-specific)', () => {
        const result = (0, registry_1.buildChatOpeningMessage)('EMAIL_DEEPLINK', mockUser, mockTaskContext);
        (0, vitest_1.expect)(result.toLowerCase()).toContain('ird number application');
        (0, vitest_1.expect)(result.toLowerCase()).not.toContain('hi! how can i help');
        (0, vitest_1.expect)(result.toLowerCase()).toContain('partner visa');
    });
    (0, vitest_1.test)('ROADMAP → contains completion count and no generic greeting', () => {
        const result = (0, registry_1.buildChatOpeningMessage)('ROADMAP', mockUser, null);
        // Contains name
        (0, vitest_1.expect)(result.toLowerCase()).toContain('alex chen');
        // Contains completion count
        (0, vitest_1.expect)(result).toContain('5');
        // Contains city
        (0, vitest_1.expect)(result.toLowerCase()).toContain('auckland');
        // No generic greeting
        (0, vitest_1.expect)(result.toLowerCase()).not.toContain('hi! how can i help');
        (0, vitest_1.expect)(result.toLowerCase()).not.toContain('hello');
    });
    (0, vitest_1.test)('NAVIGATION → same as ROADMAP (completion-based)', () => {
        const result = (0, registry_1.buildChatOpeningMessage)('NAVIGATION', mockUser, null);
        (0, vitest_1.expect)(result.toLowerCase()).toContain('alex chen');
        (0, vitest_1.expect)(result).toContain('5');
        (0, vitest_1.expect)(result.toLowerCase()).toContain('auckland');
        (0, vitest_1.expect)(result.toLowerCase()).not.toContain('hi! how can i help');
    });
    (0, vitest_1.test)('TASK_CARD with T08 → contains "IRD" or "tax" (AC-4-01 verification)', () => {
        const t08Context = { taskName: 'IRD number application' };
        const result = (0, registry_1.buildChatOpeningMessage)('TASK_CARD', mockUser, t08Context);
        const lowercaseResult = result.toLowerCase();
        const containsIrdOrTax = lowercaseResult.includes('ird') || lowercaseResult.includes('tax');
        (0, vitest_1.expect)(containsIrdOrTax).toBe(true);
    });
    (0, vitest_1.test)('TASK_CARD without task context → handles gracefully', () => {
        const result = (0, registry_1.buildChatOpeningMessage)('TASK_CARD', mockUser, null);
        // Should not crash, but format might vary without task name
        (0, vitest_1.expect)(typeof result).toBe('string');
        (0, vitest_1.expect)(result.length).toBeGreaterThan(0);
    });
});
// Mock data for buildChatSystemPrompt() tests
const mockSystemPromptParams = {
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
function estimateTokenCount(text) {
    return Math.ceil(text.length / 4);
}
(0, vitest_1.describe)('buildChatSystemPrompt()', () => {
    (0, vitest_1.test)('Token count between 800 and 3,500', () => {
        const result = (0, registry_1.buildChatSystemPrompt)(mockSystemPromptParams);
        const tokenCount = estimateTokenCount(result);
        (0, vitest_1.expect)(tokenCount).toBeGreaterThanOrEqual(800);
        (0, vitest_1.expect)(tokenCount).toBeLessThanOrEqual(3500);
    });
    (0, vitest_1.test)('Contains user profile data (name, visa, family, city, arrival)', () => {
        const result = (0, registry_1.buildChatSystemPrompt)(mockSystemPromptParams);
        (0, vitest_1.expect)(result).toContain('Alex Chen');
        (0, vitest_1.expect)(result).toContain('AEWV');
        (0, vitest_1.expect)(result).toContain('COUPLE_CONSTRAINED');
        (0, vitest_1.expect)(result).toContain('AUCKLAND');
        (0, vitest_1.expect)(result).toContain('45 days ago');
    });
    (0, vitest_1.test)('All 7 components present in correct order', () => {
        const result = (0, registry_1.buildChatSystemPrompt)(mockSystemPromptParams);
        // Component 1: Identity
        (0, vitest_1.expect)(result).toMatch(/You are LandedNZ/);
        // Component 2: User profile injection
        (0, vitest_1.expect)(result).toMatch(/THE PERSON YOU ARE HELPING:/);
        // Component 3: Persona anchor TOP
        (0, vitest_1.expect)(result).toMatch(/PERSONA ANCHOR — READ BEFORE EVERY RESPONSE:/);
        // Component 4: Behavioural constraints
        (0, vitest_1.expect)(result).toMatch(/BEHAVIOURAL CONSTRAINTS:/);
        (0, vitest_1.expect)(result).toMatch(/1\. GROUNDING:/);
        // Component 5: Scope boundaries
        (0, vitest_1.expect)(result).toMatch(/SCOPE BOUNDARIES:/);
        // Component 6: Retrieved KB chunks
        (0, vitest_1.expect)(result).toMatch(/RETRIEVED KNOWLEDGE BASE CONTENT:/);
        // Component 7: Persona anchor BOTTOM
        (0, vitest_1.expect)(result).toMatch(/FINAL REMINDER: You are speaking with/);
    });
    (0, vitest_1.test)('Both persona anchors present with user name', () => {
        const result = (0, registry_1.buildChatSystemPrompt)(mockSystemPromptParams);
        // TOP anchor
        (0, vitest_1.expect)(result).toMatch(/PERSONA ANCHOR — READ BEFORE EVERY RESPONSE:.*Alex Chen/s);
        // BOTTOM anchor
        (0, vitest_1.expect)(result).toMatch(/FINAL REMINDER: You are speaking with Alex Chen/);
    });
    (0, vitest_1.test)('COUPLE_CONSTRAINED includes partner visa and 20hr work limit text', () => {
        const result = (0, registry_1.buildChatSystemPrompt)(mockSystemPromptParams);
        (0, vitest_1.expect)(result).toMatch(/Partner situation:.*student visa.*20hr work limit/s);
        (0, vitest_1.expect)(result).toMatch(/Income constraint:.*Single income/);
    });
    (0, vitest_1.test)('Guardrail augmentations appended when non-empty', () => {
        const paramsWithAugmentations = {
            ...mockSystemPromptParams,
            guardrailAugmentations: [
                'CRISIS RESOURCE — RESPOND WITH THIS FIRST: Lifeline NZ is available 24/7: 0800 543 354',
            ],
        };
        const result = (0, registry_1.buildChatSystemPrompt)(paramsWithAugmentations);
        (0, vitest_1.expect)(result).toMatch(/BEHAVIOURAL CONSTRAINTS:.*8\. NEVER FABRICATE:.*CRISIS RESOURCE/s);
    });
    (0, vitest_1.test)('Empty guardrail augmentations does not affect structure', () => {
        const result = (0, registry_1.buildChatSystemPrompt)(mockSystemPromptParams);
        // Should still have all 8 behavioural rules, just no augmentations after
        (0, vitest_1.expect)(result).toMatch(/8\. NEVER FABRICATE:/);
        (0, vitest_1.expect)(result).not.toMatch(/CRISIS RESOURCE/);
    });
    (0, vitest_1.test)('TASK_CARD entry point includes task context block', () => {
        const result = (0, registry_1.buildChatSystemPrompt)(mockSystemPromptParams);
        (0, vitest_1.expect)(result).toMatch(/CURRENT TASK CONTEXT:/);
        (0, vitest_1.expect)(result).toMatch(/Task: IRD number application/);
        (0, vitest_1.expect)(result).toMatch(/Without this, first paycheck taxed at 45%/);
    });
    (0, vitest_1.test)('ROADMAP entry point excludes task context block', () => {
        const roadmapParams = {
            ...mockSystemPromptParams,
            entryPoint: 'ROADMAP',
            taskName: null,
            consequenceLine: null,
        };
        const result = (0, registry_1.buildChatSystemPrompt)(roadmapParams);
        (0, vitest_1.expect)(result).not.toMatch(/CURRENT TASK CONTEXT:/);
    });
    (0, vitest_1.test)('KB chunks formatted correctly', () => {
        const result = (0, registry_1.buildChatSystemPrompt)(mockSystemPromptParams);
        (0, vitest_1.expect)(result).toMatch(/\[CHUNK 1 — T08-constrained_couple — constrained_couple\]/);
        (0, vitest_1.expect)(result).toMatch(/Apply for IRD number within first week/);
        (0, vitest_1.expect)(result).toMatch(/Source: IRD number application — https:\/\/ird\.govt\.nz/);
    });
    (0, vitest_1.test)('Components appear in correct order: Identity → Profile → AnchorTop → Constraints → Scope → KB → AnchorBottom', () => {
        const result = (0, registry_1.buildChatSystemPrompt)(mockSystemPromptParams);
        const idxIdentity = result.indexOf('You are LandedNZ');
        const idxProfile = result.indexOf('THE PERSON YOU ARE HELPING:');
        const idxAnchorTop = result.indexOf('PERSONA ANCHOR — READ BEFORE EVERY RESPONSE:');
        const idxConstraints = result.indexOf('BEHAVIOURAL CONSTRAINTS:');
        const idxScope = result.indexOf('SCOPE BOUNDARIES:');
        const idxKb = result.indexOf('RETRIEVED KNOWLEDGE BASE CONTENT:');
        const idxAnchorBottom = result.indexOf('FINAL REMINDER: You are speaking with');
        (0, vitest_1.expect)(idxIdentity).toBeLessThan(idxProfile);
        (0, vitest_1.expect)(idxProfile).toBeLessThan(idxAnchorTop);
        (0, vitest_1.expect)(idxAnchorTop).toBeLessThan(idxConstraints);
        (0, vitest_1.expect)(idxConstraints).toBeLessThan(idxScope);
        (0, vitest_1.expect)(idxScope).toBeLessThan(idxKb);
        (0, vitest_1.expect)(idxKb).toBeLessThan(idxAnchorBottom);
    });
    (0, vitest_1.test)('AC-4-10: entry-point-specific messages — no generic "Hi! How can I help?"', () => {
        // TASK_CARD → task name reference
        const taskCardResult = (0, registry_1.buildChatOpeningMessage)('TASK_CARD', mockUser, mockTaskContext);
        (0, vitest_1.expect)(taskCardResult.toLowerCase()).toContain('ird number application');
        (0, vitest_1.expect)(taskCardResult.toLowerCase()).not.toContain('hi! how can i help');
        // ROADMAP → completion count reference
        const roadmapResult = (0, registry_1.buildChatOpeningMessage)('ROADMAP', mockUser, null);
        (0, vitest_1.expect)(roadmapResult).toContain('5'); // completedTaskCount
        (0, vitest_1.expect)(roadmapResult.toLowerCase()).not.toContain('hi! how can i help');
        // All results should be contextual, never generic
        (0, vitest_1.expect)(taskCardResult.toLowerCase()).not.toContain('hello');
        (0, vitest_1.expect)(roadmapResult.toLowerCase()).not.toContain('hello');
    });
    (0, vitest_1.test)('AC-4-09: COUPLE_CONSTRAINED user — all 5 profile fields injected correctly', () => {
        const result = (0, registry_1.buildChatSystemPrompt)(mockSystemPromptParams); // familySituation: COUPLE_CONSTRAINED
        // All 5 required fields
        (0, vitest_1.expect)(result).toContain('Alex Chen'); // name
        (0, vitest_1.expect)(result).toContain('AEWV'); // visaType
        (0, vitest_1.expect)(result).toContain('COUPLE_CONSTRAINED'); // familySituation
        (0, vitest_1.expect)(result).toContain('AUCKLAND'); // city
        (0, vitest_1.expect)(result).toContain('45 days ago'); // arrivalDaysAgo
        // COUPLE_CONSTRAINED-specific conditional content
        (0, vitest_1.expect)(result).toMatch(/Partner situation:.*student visa.*20hr work limit/s);
        (0, vitest_1.expect)(result).toMatch(/Income constraint:.*Single income/);
    });
});
//# sourceMappingURL=registry.test.js.map