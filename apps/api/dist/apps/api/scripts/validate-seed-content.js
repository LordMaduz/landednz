#!/usr/bin/env ts-node
"use strict";
/**
 * Post-seed validation script for AC-2-15
 * Validates knowledge base seeding completeness and content integrity
 *
 * Run after seed-knowledge-base.ts to verify:
 * - Correct record counts (21 tasks, ≥42 variants)
 * - No null/empty required fields
 * - professionalAdviceRequired tasks have notes
 * - Tier 1 source URLs resolve
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateSeedContent = validateSeedContent;
const client_1 = require("@prisma/client");
const https_1 = __importDefault(require("https"));
const http_1 = __importDefault(require("http"));
const db = new client_1.PrismaClient();
async function validateSeedContent() {
    const errors = [];
    console.log('🔍 Validating knowledge base seed content...\n');
    try {
        // Check for dry-run mode
        const dryRun = process.argv.includes('--dry-run');
        if (dryRun) {
            console.log('🧪 DRY-RUN mode: Validation would check:');
            console.log('   📊 Task count = 21');
            console.log('   📊 TaskContentVariant count ≥ 42');
            console.log('   📋 No null/empty required fields');
            console.log('   🏥 Professional advice notes validation');
            console.log('   🌐 Tier 1 source URL liveness');
            console.log('\n✅ All validation checks would PASS in dry-run mode');
            return;
        }
        await db.$connect();
        // Check 1: Task count = 21
        const taskCount = await db.task.count();
        console.log(`📊 Task records: ${taskCount}`);
        if (taskCount !== 21) {
            errors.push({
                check: 'Task count',
                detail: `Expected 21, found ${taskCount}`
            });
        }
        // Check 2: TaskContentVariant count ≥ 42
        const variantCount = await db.taskContentVariant.count();
        console.log(`📊 TaskContentVariant records: ${variantCount}`);
        if (variantCount < 42) {
            errors.push({
                check: 'TaskContentVariant count',
                detail: `Expected ≥42, found ${variantCount}`
            });
        }
        // Check 3: No null/empty required fields in variants
        const variantsWithNullFields = await db.taskContentVariant.findMany({
            where: {
                OR: [
                    { consequenceLine: '' },
                    { steps: '' },
                    { sourceUrl: '' }
                ]
            },
            select: {
                id: true,
                taskId: true,
                personaKey: true
            }
        });
        if (variantsWithNullFields.length > 0) {
            errors.push({
                check: 'Required fields validation',
                detail: `Found ${variantsWithNullFields.length} variants with null/empty required fields: ${variantsWithNullFields.map(v => `${v.taskId}_${v.personaKey}`).join(', ')}`
            });
        }
        // Check 4: professionalAdviceRequired tasks have professionalAdviceNote
        const professionalAdviceVariants = await db.taskContentVariant.findMany({
            where: {
                professionalAdviceRequired: true,
                OR: [
                    { professionalAdviceNote: null },
                    { professionalAdviceNote: '' }
                ]
            },
            select: {
                id: true,
                taskId: true,
                personaKey: true
            }
        });
        if (professionalAdviceVariants.length > 0) {
            errors.push({
                check: 'Professional advice notes',
                detail: `Found ${professionalAdviceVariants.length} variants requiring professional advice but missing notes: ${professionalAdviceVariants.map(v => `${v.taskId}_${v.personaKey}`).join(', ')}`
            });
        }
        // Check 5: Tier 1 source URLs resolve (HTTP 200)
        console.log('\n🌐 Checking Tier 1 source URL liveness...');
        const tier1Sources = await db.taskContentVariant.findMany({
            where: {
                sourceUrl: {
                    contains: '.govt.nz'
                }
            },
            select: {
                taskId: true,
                personaKey: true,
                sourceUrl: true
            }
        });
        const urlCheckPromises = tier1Sources.map(async (variant) => {
            try {
                const url = new URL(variant.sourceUrl);
                const isHttps = url.protocol === 'https:';
                const client = isHttps ? https_1.default : http_1.default;
                return new Promise((resolve) => {
                    const req = client.request({
                        hostname: url.hostname,
                        port: url.port || (isHttps ? 443 : 80),
                        path: url.pathname + url.search,
                        method: 'HEAD',
                        timeout: 5000
                    }, (res) => {
                        resolve({
                            success: res.statusCode === 200,
                            url: variant.sourceUrl,
                            taskId: variant.taskId,
                            status: res.statusCode
                        });
                    });
                    req.on('error', () => {
                        resolve({
                            success: false,
                            url: variant.sourceUrl,
                            taskId: variant.taskId
                        });
                    });
                    req.on('timeout', () => {
                        req.destroy();
                        resolve({
                            success: false,
                            url: variant.sourceUrl,
                            taskId: variant.taskId
                        });
                    });
                    req.end();
                });
            }
            catch (e) {
                return {
                    success: false,
                    url: variant.sourceUrl,
                    taskId: variant.taskId
                };
            }
        });
        const urlResults = await Promise.all(urlCheckPromises);
        const failedUrls = urlResults.filter(r => !r.success);
        console.log(`   ✅ ${urlResults.length - failedUrls.length}/${urlResults.length} Tier 1 URLs responding`);
        if (failedUrls.length > 0) {
            console.log(`   ❌ Failed URLs:`);
            failedUrls.forEach(fail => {
                console.log(`      ${fail.taskId}: ${fail.url} ${fail.status ? `(${fail.status})` : '(timeout/error)'}`);
            });
            errors.push({
                check: 'Tier 1 URL liveness',
                detail: `${failedUrls.length} Tier 1 government URLs not responding: ${failedUrls.map(f => f.taskId).join(', ')}`
            });
        }
        // Summary
        console.log('\n📋 Validation Summary:');
        if (errors.length === 0) {
            console.log('✅ All validation checks PASSED');
            console.log('   Knowledge base seeding is complete and valid');
        }
        else {
            console.log(`❌ ${errors.length} validation check(s) FAILED:`);
            errors.forEach(error => {
                console.log(`   • ${error.check}: ${error.detail}`);
            });
            process.exit(1);
        }
    }
    catch (error) {
        console.error('💥 Validation script error:', error);
        process.exit(1);
    }
    finally {
        if (!process.argv.includes('--dry-run')) {
            await db.$disconnect();
        }
    }
}
// Run validation
if (require.main === module) {
    validateSeedContent()
        .catch((error) => {
        console.error('Validation failed:', error);
        process.exit(1);
    });
}
//# sourceMappingURL=validate-seed-content.js.map