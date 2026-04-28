"use strict";
/**
 * AC-2-15 Verification Report Template Generator
 *
 * Invoked automatically by /rpi:research phase2 AC-2-15 after URL check runs.
 * Parses landednz_kb_master_COMPLETE_v1.md and creates structured verification checklist.
 *
 * Usage: npx ts-node scripts/generate-ac-2-15-template.ts
 * Output: rpi/phase2-roadmap-engine/research/AC-2-15-verification-report.md
 *
 * Run AFTER check-ac-2-15-urls.ts so URL status is pre-filled in template.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
// Scripts don't have DB access — use console directly (not app logger which requires DATABASE_URL)
const logger = {
    info: (obj, msg) => console.log(JSON.stringify({ level: 'info', ...(typeof obj === 'string' ? { msg: obj } : { ...obj, msg }) })),
    warn: (obj, msg) => console.warn(JSON.stringify({ level: 'warn', ...(typeof obj === 'string' ? { msg: obj } : { ...obj, msg }) })),
    error: (obj, msg) => console.error(JSON.stringify({ level: 'error', ...(typeof obj === 'string' ? { msg: obj } : { ...obj, msg }) })),
};
function parseKnowledgeBase(kbPath) {
    const content = (0, fs_1.readFileSync)(kbPath, 'utf-8');
    const tasks = [];
    const taskPattern = /^TASK_ID: (T\d{2})$/m;
    const parts = content.split(taskPattern);
    for (let i = 1; i < parts.length; i += 2) {
        const taskId = parts[i].trim();
        const taskContent = parts[i + 1] || '';
        const nameMatch = taskContent.match(/^TASK_NAME:\s*(.+)$/m);
        const taskName = nameMatch ? nameMatch[1].trim() : 'Unknown task';
        // Extract Tier 1 sources — line-by-line from SOURCES: to end of task block
        const tier1Sources = [];
        const sourcesStart = taskContent.indexOf('\nSOURCES:');
        if (sourcesStart !== -1) {
            const lines = taskContent.slice(sourcesStart).split('\n');
            let currentTitle = '', currentUrl = '', currentTier = 3;
            const flush = () => { if (currentUrl && currentTier === 1)
                tier1Sources.push({ title: currentTitle, url: currentUrl }); };
            for (const line of lines) {
                const titleMatch = line.match(/^\s+-\s+title:\s+"([^"]+)"/);
                const urlMatch = line.match(/^\s+url:\s+"([^"]+)"/);
                const tierMatch = line.match(/^\s+tier:\s+(\d+)/);
                if (titleMatch) {
                    flush();
                    currentTitle = titleMatch[1];
                    currentUrl = '';
                    currentTier = 3;
                }
                if (urlMatch)
                    currentUrl = urlMatch[1];
                if (tierMatch)
                    currentTier = parseInt(tierMatch[1]);
            }
            flush();
        }
        // Extract Type B numbers — line-by-line from NUMBER_TYPES: section
        const typeBNumbers = [];
        const numTypesStart = taskContent.indexOf('\nNUMBER_TYPES:');
        if (numTypesStart !== -1) {
            // Find end of NUMBER_TYPES block (next top-level section)
            const afterNumTypes = taskContent.slice(numTypesStart + 1);
            const nextSection = afterNumTypes.search(/\n[A-Z][A-Z_]+:/);
            const numTypesBlock = nextSection !== -1 ? afterNumTypes.slice(0, nextSection) : afterNumTypes;
            const lines = numTypesBlock.split('\n');
            let currentFigure = '', currentType = '';
            for (const line of lines) {
                const figMatch = line.match(/^\s+-\s+figure:\s+"([^"]+)"/);
                const typeMatch = line.match(/^\s+type:\s+([ABC])/);
                if (figMatch) {
                    currentFigure = figMatch[1];
                    currentType = '';
                }
                if (typeMatch) {
                    currentType = typeMatch[1];
                    if (currentType === 'B' && currentFigure)
                        typeBNumbers.push(currentFigure);
                }
            }
        }
        const hasProfessionalAdvice = /professional_advice_required:\s*true/.test(taskContent);
        const hasConstrained = taskContent.includes('PERSONA_CONSTRAINED_COUPLE:');
        const hasSolo = taskContent.includes('PERSONA_SOLO_AEWV:');
        tasks.push({ taskId, taskName, tier1Sources, typeBNumbers, hasProfessionalAdvice, hasConstrained, hasSolo });
    }
    return tasks;
}
function loadUrlResults(reportPath) {
    if (!(0, fs_1.existsSync)(reportPath))
        return {};
    try {
        const report = JSON.parse((0, fs_1.readFileSync)(reportPath, 'utf-8'));
        const byTask = {};
        for (const result of report.results || []) {
            if (!byTask[result.taskId])
                byTask[result.taskId] = [];
            byTask[result.taskId].push(result);
        }
        return byTask;
    }
    catch {
        return {};
    }
}
function urlStatusIcon(status) {
    if (status === 'success')
        return '✅';
    if (status === 'redirect')
        return '⚠️';
    if (status === 'error')
        return '❌';
    if (status === 'timeout')
        return '⏱️';
    return '❓';
}
function generateTemplate(tasks, urlResults) {
    const issueCount = Object.values(urlResults).flat().filter(r => r.status !== 'success').length;
    const urlTable = tasks.map(task => {
        const results = urlResults[task.taskId] || [];
        if (results.length === 0)
            return `| ${task.taskId} | ❓ unchecked | — | ${task.tier1Sources[0]?.url || 'No Tier 1 URL'} |`;
        return results.map(r => {
            const note = r.errorMessage || r.redirectUrl || r.statusCode || '';
            return `| ${task.taskId} | ${urlStatusIcon(r.status)} ${r.status} | ${r.title || '—'} | ${r.url} | ${note} |`;
        }).join('\n');
    }).join('\n');
    const taskSections = tasks.map(task => {
        const results = urlResults[task.taskId] || [];
        const urlStatuses = task.tier1Sources.map(source => {
            const result = results.find(r => r.url === source.url);
            const status = result ? `${urlStatusIcon(result.status)} ${result.status}` : '❓ unchecked';
            return `  - ${source.title}: ${status}\n    URL: ${source.url}`;
        }).join('\n');
        const typeBChecks = task.typeBNumbers.length > 0
            ? task.typeBNumbers.map(n => `  - ☐ "${n}" — confirmed against live source`).join('\n')
            : '  - No Type B numbers in this task';
        const personaChecks = [
            task.hasConstrained ? '  - ☐ constrained_couple variant: complete and accurate' : null,
            task.hasSolo ? '  - ☐ solo_aewv variant: complete and accurate' : null,
            !task.hasConstrained && !task.hasSolo ? '  - ⚠️ No persona variants found — check KB' : null
        ].filter(Boolean).join('\n');
        const adviceCheck = task.hasProfessionalAdvice
            ? '  - ☐ professionalAdviceNote is non-null and accurate'
            : '  - N/A (professional_advice_required: false)';
        const urlIssues = results.filter(r => r.status !== 'success');
        const urgencyFlag = urlIssues.length > 0 ? ' ⚠️ URL ISSUE — resolve before seeding' : '';
        return `
### ${task.taskId} — ${task.taskName}${urgencyFlag}

**Manual verification status:** ☐ PENDING / ☐ PASS / ☐ FAIL

**Tier 1 URL status (auto-checked):**
${urlStatuses || '  - No Tier 1 sources found'}

**Content verification:**
- ☐ WHAT_AND_WHY facts match live government page
- ☐ HOW_TO steps are current and complete
- ☐ Source content has not materially changed since 2026-03-03

**Type B numbers requiring verification:**
${typeBChecks}

**Persona variants:**
${personaChecks}

**Professional advice:**
${adviceCheck}

**Verification notes:**
> *[Record any discrepancies, outdated content, or dead URL workarounds here]*

---`;
    }).join('\n');
    return `# AC-2-15 Verification Report
*Generated: ${new Date().toISOString()}*
*KB source: landednz_kb_master_COMPLETE_v1.md (written 2026-03-03)*
*Status: ☐ TEMPLATE — human must complete manual verification*

---

## Pre-check Summary

| Item | Result |
|------|--------|
| Tasks in KB | ${tasks.length} / 21 expected |
| Tier 1 URLs auto-checked | ${Object.values(urlResults).flat().length} |
| URL issues found | ${issueCount === 0 ? '✅ None' : `❌ ${issueCount} — see table below`} |
| Ready to proceed | ${issueCount === 0 ? '☐ Pending manual verification' : '❌ Resolve URL issues first'} |

---

## Tier 1 URL Liveness Results

| Task | Status | Source Title | URL | Notes |
|------|--------|--------------|-----|-------|
${urlTable}

---

## Task-by-Task Verification Checklist

Complete each section sequentially T01 → T21. Do not skip tasks.
Mark PASS only when all checkboxes in a section are confirmed.
${taskSections}

---

## Final Sign-off

**Tasks verified PASS:** _____ / 21
**Tasks with issues:** _____
**Issue resolution notes:**
> *[Describe any content updates made, URLs that needed workarounds, or Type B numbers that could not be confirmed]*

**Overall status:** ☐ ALL 21 TASKS VERIFIED — READY TO SEED / ☐ ISSUES OUTSTANDING

**Human reviewer:** _______________
**Date reviewed:** _______________

---

*When all 21 tasks are verified PASS, present this report and STOP.*
*Do not run the seed script until the human confirms this report.*
`;
}
async function main() {
    const kbPath = `${process.cwd()}/../../landednz_kb_master_COMPLETE_v1.md`;
    const urlReportPath = `${process.cwd()}/../../rpi/phase2-roadmap-engine/research/AC-2-15-url-report.json`;
    const outputPath = `${process.cwd()}/../../rpi/phase2-roadmap-engine/research/AC-2-15-verification-report.md`;
    logger.info('Generating AC-2-15 verification report template');
    const tasks = parseKnowledgeBase(kbPath);
    logger.info({ taskCount: tasks.length }, 'Parsed tasks from KB');
    const urlResults = loadUrlCheckResults(urlReportPath);
    const urlResultCount = Object.values(urlResults).flat().length;
    logger.info({ urlResultCount }, urlResultCount > 0 ? 'Loaded URL check results' : 'No URL results found — template will show unchecked status');
    const template = generateTemplate(tasks, urlResults);
    (0, fs_1.writeFileSync)(outputPath, template);
    logger.info({ outputPath }, 'Verification report template written');
    console.log(`\nTemplate written to: ${outputPath}`);
    console.log(`Tasks: ${tasks.length} | URL results loaded: ${urlResultCount}`);
}
// Name alias used inside generateTemplate
function loadUrlCheckResults(reportPath) {
    if (!(0, fs_1.existsSync)(reportPath))
        return {};
    try {
        const report = JSON.parse((0, fs_1.readFileSync)(reportPath, 'utf-8'));
        const byTask = {};
        for (const result of report.results || []) {
            if (!byTask[result.taskId])
                byTask[result.taskId] = [];
            byTask[result.taskId].push(result);
        }
        return byTask;
    }
    catch {
        return {};
    }
}
main().catch(error => {
    logger.error(error, 'Template generation failed');
    process.exit(1);
});
//# sourceMappingURL=generate-ac-2-15-template.js.map