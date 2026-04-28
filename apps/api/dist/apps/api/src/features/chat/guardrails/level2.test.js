"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const level2_1 = require("./level2");
(0, vitest_1.describe)('runLevel2Guardrail — MISSING_CITATION', () => {
    (0, vitest_1.test)('response without "Source:" fires MISSING_CITATION', () => {
        const result = (0, level2_1.runLevel2Guardrail)("You should open a bank account as soon as possible.");
        (0, vitest_1.expect)(result.flags).toContain('MISSING_CITATION');
    });
    (0, vitest_1.test)('response with "Source: https://..." does NOT fire', () => {
        const result = (0, level2_1.runLevel2Guardrail)("You can register online. Source: https://ird.govt.nz/registration");
        (0, vitest_1.expect)(result.flags).not.toContain('MISSING_CITATION');
    });
    (0, vitest_1.test)('"Source:" without URL still fires MISSING_CITATION', () => {
        const result = (0, level2_1.runLevel2Guardrail)("See the IRD website. Source: see ird.govt.nz");
        (0, vitest_1.expect)(result.flags).toContain('MISSING_CITATION');
    });
    (0, vitest_1.test)('empty response fires MISSING_CITATION', () => {
        const result = (0, level2_1.runLevel2Guardrail)('');
        (0, vitest_1.expect)(result.flags).toContain('MISSING_CITATION');
    });
    (0, vitest_1.test)('URL before "Source:" still fires — URL must be after Source:', () => {
        const result = (0, level2_1.runLevel2Guardrail)("Visit https://ird.govt.nz for details. Also check the registration process.");
        (0, vitest_1.expect)(result.flags).toContain('MISSING_CITATION');
    });
});
(0, vitest_1.describe)('runLevel2Guardrail — SPECIFIC_NUMBER', () => {
    (0, vitest_1.test)('response with "%" fires SPECIFIC_NUMBER', () => {
        const result = (0, level2_1.runLevel2Guardrail)("The GST rate is 15%. Source: https://ird.govt.nz");
        (0, vitest_1.expect)(result.flags).toContain('SPECIFIC_NUMBER');
    });
    (0, vitest_1.test)('response with "$" fires SPECIFIC_NUMBER', () => {
        const result = (0, level2_1.runLevel2Guardrail)("The fee is $200. Source: https://ird.govt.nz");
        (0, vitest_1.expect)(result.flags).toContain('SPECIFIC_NUMBER');
    });
    (0, vitest_1.test)('response with "NZD" fires SPECIFIC_NUMBER', () => {
        const result = (0, level2_1.runLevel2Guardrail)("The threshold is NZD 14,000. Source: https://ird.govt.nz");
        (0, vitest_1.expect)(result.flags).toContain('SPECIFIC_NUMBER');
    });
    (0, vitest_1.test)('response with "working days" fires SPECIFIC_NUMBER', () => {
        const result = (0, level2_1.runLevel2Guardrail)("Processing takes 8–15 working days. Source: https://ird.govt.nz");
        (0, vitest_1.expect)(result.flags).toContain('SPECIFIC_NUMBER');
    });
    (0, vitest_1.test)('normal response without numbers does NOT fire', () => {
        const result = (0, level2_1.runLevel2Guardrail)("You should open a bank account early. Source: https://sorted.org.nz");
        (0, vitest_1.expect)(result.flags).not.toContain('SPECIFIC_NUMBER');
    });
});
(0, vitest_1.describe)('runLevel2Guardrail — multiple flags', () => {
    (0, vitest_1.test)('response with "$" but no "Source:" fires both flags', () => {
        const result = (0, level2_1.runLevel2Guardrail)("The fee is $200 to process your application.");
        (0, vitest_1.expect)(result.flags).toContain('MISSING_CITATION');
        (0, vitest_1.expect)(result.flags).toContain('SPECIFIC_NUMBER');
        (0, vitest_1.expect)(result.flags).toHaveLength(2);
    });
    (0, vitest_1.test)('clean response fires no flags', () => {
        const result = (0, level2_1.runLevel2Guardrail)("Open your bank account early in your settlement journey. Source: https://sorted.org.nz");
        (0, vitest_1.expect)(result.flags).toHaveLength(0);
    });
});
//# sourceMappingURL=level2.test.js.map