"use strict";
/**
 * AC-2-15 URL Liveness Checker
 *
 * Invoked automatically by /rpi:research phase2 AC-2-15
 * Checks all Tier 1 source URLs from landednz_kb_master_COMPLETE_v1.md
 *
 * Usage: npx ts-node scripts/check-ac-2-15-urls.ts
 * Output: rpi/phase2-roadmap-engine/research/AC-2-15-url-report.json
 */
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
// Scripts don't have DB access — use console directly (not app logger which requires DATABASE_URL)
const log = {
    info: (obj, msg) => console.log(JSON.stringify({ level: 'info', ...(typeof obj === 'string' ? { msg: obj } : { ...obj, msg }) })),
    warn: (obj, msg) => console.warn(JSON.stringify({ level: 'warn', ...(typeof obj === 'string' ? { msg: obj } : { ...obj, msg }) })),
    error: (obj, msg) => console.error(JSON.stringify({ level: 'error', ...(typeof obj === 'string' ? { msg: obj } : { ...obj, msg }) })),
};
// KB format: tasks delimited by TASK_ID: Txx, sources under SOURCES: with url: "..." lines
function parseKnowledgeBase(kbPath) {
    const content = (0, fs_1.readFileSync)(kbPath, 'utf-8');
    const tasks = [];
    // Split on TASK_ID: T lines to get task blocks
    const taskPattern = /^TASK_ID: (T\d{2})$/m;
    const parts = content.split(taskPattern);
    // parts[0] = header, then alternating [taskId, taskContent, taskId, taskContent...]
    for (let i = 1; i < parts.length; i += 2) {
        const taskId = parts[i].trim();
        const taskContent = parts[i + 1] || '';
        // Extract task name from TASK_NAME: line
        const nameMatch = taskContent.match(/^TASK_NAME:\s*(.+)$/m);
        const taskName = nameMatch ? nameMatch[1].trim() : 'Unknown task';
        // Extract sources line-by-line from SOURCES: block
        // SOURCES is always the last section in a task block, so we scan from SOURCES: to end
        const sources = [];
        const sourcesStart = taskContent.indexOf('\nSOURCES:');
        if (sourcesStart !== -1) {
            const sourcesSection = taskContent.slice(sourcesStart);
            const lines = sourcesSection.split('\n');
            let currentTitle = '';
            let currentUrl = '';
            let currentTier = 3;
            for (const line of lines) {
                const titleMatch = line.match(/^\s+-\s+title:\s+"([^"]+)"/);
                const urlMatch = line.match(/^\s+url:\s+"([^"]+)"/);
                const tierMatch = line.match(/^\s+tier:\s+(\d+)/);
                if (titleMatch) {
                    // Save previous entry if complete
                    if (currentUrl) {
                        sources.push({ title: currentTitle, url: currentUrl, tier: currentTier });
                    }
                    currentTitle = titleMatch[1];
                    currentUrl = '';
                    currentTier = 3;
                }
                if (urlMatch)
                    currentUrl = urlMatch[1];
                if (tierMatch)
                    currentTier = parseInt(tierMatch[1]);
            }
            // Save last entry
            if (currentUrl) {
                sources.push({ title: currentTitle, url: currentUrl, tier: currentTier });
            }
        }
        tasks.push({ taskId, taskName, sources });
    }
    return tasks;
}
async function checkUrl(taskId, taskName, source) {
    const startTime = Date.now();
    try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 10000);
        const response = await fetch(source.url, {
            method: 'HEAD',
            headers: { 'User-Agent': 'LandedNZ-URLChecker/1.0 (AC-2-15 verification)' },
            signal: controller.signal,
            redirect: 'manual'
        });
        clearTimeout(timer);
        const responseTime = Date.now() - startTime;
        if (response.status >= 200 && response.status < 300) {
            return { taskId, taskName, ...source, status: 'success', statusCode: response.status, responseTime };
        }
        if (response.status >= 300 && response.status < 400) {
            const redirectUrl = response.headers.get('location') || 'Unknown redirect';
            return { taskId, taskName, ...source, status: 'redirect', statusCode: response.status, redirectUrl, responseTime };
        }
        return { taskId, taskName, ...source, status: 'error', statusCode: response.status, errorMessage: `HTTP ${response.status}`, responseTime };
    }
    catch (error) {
        const responseTime = Date.now() - startTime;
        const isTimeout = error instanceof Error && error.name === 'AbortError';
        return {
            taskId,
            taskName,
            ...source,
            status: isTimeout ? 'timeout' : 'error',
            errorMessage: isTimeout ? 'Timeout after 10s' : (error instanceof Error ? error.message : 'Unknown error'),
            responseTime
        };
    }
}
async function main() {
    const kbPath = `${process.cwd()}/../../landednz_kb_master_COMPLETE_v1.md`;
    log.info({ kbPath }, 'Starting AC-2-15 URL liveness check');
    const tasks = parseKnowledgeBase(kbPath);
    log.info({ taskCount: tasks.length }, 'Tasks parsed from KB');
    const results = [];
    // Check URLs sequentially — one task at a time, one URL at a time
    for (const task of tasks) {
        const tier1Sources = task.sources.filter(s => s.tier === 1);
        for (const source of tier1Sources) {
            log.info({ taskId: task.taskId, url: source.url }, `Checking ${task.taskId} Tier 1 URL`);
            const result = await checkUrl(task.taskId, task.taskName, source);
            results.push(result);
            await new Promise(resolve => setTimeout(resolve, 300)); // be polite to govt servers
        }
    }
    const summary = {
        success: results.filter(r => r.status === 'success').length,
        error: results.filter(r => r.status === 'error').length,
        redirect: results.filter(r => r.status === 'redirect').length,
        timeout: results.filter(r => r.status === 'timeout').length
    };
    const tier1Issues = results.filter(r => r.tier === 1 && r.status !== 'success');
    const report = {
        checkedAt: new Date().toISOString(),
        totalTasks: tasks.length,
        totalUrlsChecked: results.length,
        summary,
        tier1Issues,
        results
    };
    const outputPath = `${process.cwd()}/../../rpi/phase2-roadmap-engine/research/AC-2-15-url-report.json`;
    (0, fs_1.writeFileSync)(outputPath, JSON.stringify(report, null, 2));
    log.info({ summary, tier1IssueCount: tier1Issues.length, outputPath }, 'URL check complete');
    if (tier1Issues.length > 0) {
        log.warn('--- TIER 1 URL ISSUES (require action before seeding) ---');
        tier1Issues.forEach(issue => {
            log.warn({ taskId: issue.taskId, url: issue.url, status: issue.status, error: issue.errorMessage || issue.redirectUrl }, issue.taskId);
        });
    }
    else {
        log.info('All Tier 1 URLs returned HTTP 200 — no blockers found');
    }
}
main().catch(error => {
    log.error(error, 'URL check script failed');
    process.exit(1);
});
//# sourceMappingURL=check-ac-2-15-urls.js.map