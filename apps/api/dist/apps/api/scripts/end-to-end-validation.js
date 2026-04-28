#!/usr/bin/env ts-node
"use strict";
/**
 * Comprehensive end-to-end validation of knowledge base seeding
 * Validates all aspects of the seeded data for production readiness
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.endToEndValidation = endToEndValidation;
const db_1 = require("../src/shared/db");
async function endToEndValidation() {
    console.log('🔍 COMPREHENSIVE END-TO-END DATA VALIDATION');
    console.log('================================================');
    try {
        await db_1.db.$connect();
        // 1. Verify all T01-T21 tasks exist with correct metadata
        const tasks = await db_1.db.task.findMany({ orderBy: { id: 'asc' } });
        console.log('\n📋 TASK VALIDATION:');
        console.log('   Total tasks:', tasks.length, '/ 21 required');
        const expectedTaskIds = Array.from({ length: 21 }, (_, i) => `T${String(i + 1).padStart(2, '0')}`);
        const missingTasks = expectedTaskIds.filter(id => !tasks.find(t => t.id === id));
        if (missingTasks.length > 0) {
            console.log('   ❌ Missing tasks:', missingTasks);
        }
        else {
            console.log('   ✅ All T01-T21 tasks present');
        }
        // Check phases distribution
        const phaseDistribution = {};
        tasks.forEach(task => {
            phaseDistribution[task.phase] = (phaseDistribution[task.phase] || 0) + 1;
        });
        console.log('   Phase distribution:', phaseDistribution);
        // 2. Verify dependency graph integrity
        console.log('\n🔗 DEPENDENCY VALIDATION:');
        const dependencies = await db_1.db.taskDependency.findMany({
            include: { prerequisite: true, dependent: true }
        });
        console.log('   Total dependencies:', dependencies.length, '/ 12 expected');
        // Critical dependencies validation
        const criticalDeps = [
            { prereq: 'T06', dep: 'T07', type: 'HARD' },
            { prereq: 'T08', dep: 'T09', type: 'HARD' },
            { prereq: 'T07', dep: 'T08', type: 'SOFT' }
        ];
        let depErrors = 0;
        criticalDeps.forEach(expected => {
            const found = dependencies.find(d => d.prerequisiteId === expected.prereq &&
                d.dependentId === expected.dep &&
                d.dependencyType === expected.type);
            if (found) {
                console.log('   ✅', `${expected.prereq} → ${expected.dep} (${expected.type})`);
            }
            else {
                console.log('   ❌', `${expected.prereq} → ${expected.dep} (${expected.type}) MISSING`);
                depErrors++;
            }
        });
        // 3. Verify content variant completeness
        console.log('\n📝 CONTENT VARIANT VALIDATION:');
        const variants = await db_1.db.taskContentVariant.findMany();
        console.log('   Total variants:', variants.length, '/ 42 required');
        // Check persona coverage
        const personaCoverage = {};
        variants.forEach(v => {
            if (!personaCoverage[v.taskId])
                personaCoverage[v.taskId] = [];
            personaCoverage[v.taskId].push(v.personaKey);
        });
        let variantErrors = 0;
        expectedTaskIds.forEach(taskId => {
            const personas = personaCoverage[taskId] || [];
            const hasCouple = personas.includes('constrained_couple');
            const hasSolo = personas.includes('solo_aewv');
            if (!hasCouple || !hasSolo) {
                console.log('   ❌', taskId, 'missing personas:', !hasCouple ? 'constrained_couple' : '', !hasSolo ? 'solo_aewv' : '');
                variantErrors++;
            }
        });
        if (variantErrors === 0) {
            console.log('   ✅ All tasks have both persona variants');
        }
        // 4. Verify knowledge base chunks for AI/RAG
        console.log('\n🧠 AI/RAG CHUNK VALIDATION:');
        const chunks = await db_1.db.knowledgeBaseChunk.findMany();
        console.log('   Total chunks:', chunks.length, '/ 42 required');
        // Sample chunk quality check
        const sampleChunk = chunks.find(c => c.taskId === 'T08' && c.personaKey === 'constrained_couple');
        if (sampleChunk) {
            console.log('   Sample chunk quality (T08):');
            console.log('     - Content length:', sampleChunk.content.length, 'chars');
            console.log('     - Has summary content:', sampleChunk.content.includes('IRD number') ? '✅' : '❌');
            console.log('     - Has step content:', sampleChunk.content.includes('Step') || sampleChunk.content.includes('1.') ? '✅' : '❌');
            console.log('     - Has watch-outs:', sampleChunk.content.includes('⚠️') ? '✅' : '❌');
            console.log('     - Source attribution:', sampleChunk.sourceName ? '✅' : '❌');
        }
        // 5. Data integrity spot checks
        console.log('\n🔍 DATA INTEGRITY SPOT CHECKS:');
        // Check for required fields
        const emptyConsequenceLines = await db_1.db.taskContentVariant.count({
            where: { consequenceLine: '' }
        });
        console.log('   Empty consequence lines:', emptyConsequenceLines, '(should be 0)');
        const emptySteps = await db_1.db.taskContentVariant.count({
            where: { OR: [{ steps: '' }, { steps: '[]' }] }
        });
        console.log('   Empty steps:', emptySteps, '(should be 0)');
        const emptySourceUrls = await db_1.db.taskContentVariant.count({
            where: { sourceUrl: '' }
        });
        console.log('   Empty source URLs:', emptySourceUrls, '(should be 0)');
        // 6. URL correction verification
        console.log('\n🔗 URL CORRECTION VERIFICATION:');
        const irdUrls = await db_1.db.taskContentVariant.count({
            where: { sourceUrl: { contains: 'ird.govt.nz' } }
        });
        console.log('   IRD URLs (corrected):', irdUrls);
        const legacyUrls = await db_1.db.taskContentVariant.count({
            where: { sourceUrl: { contains: '/0120/' } }
        });
        console.log('   Legacy format URLs (should be 0):', legacyUrls);
        // 7. Professional advice validation
        const professionalAdviceCount = await db_1.db.taskContentVariant.count({
            where: { professionalAdviceRequired: true }
        });
        console.log('   Tasks requiring professional advice:', professionalAdviceCount);
        // Final validation summary
        console.log('\n🎯 FINAL VALIDATION SUMMARY:');
        const totalErrors = depErrors + variantErrors + emptyConsequenceLines + emptySteps + emptySourceUrls + legacyUrls;
        if (totalErrors === 0 && tasks.length === 21 && variants.length === 42 && chunks.length === 42) {
            console.log('   🏆 ALL VALIDATIONS PASSED - PRODUCTION READY');
            console.log('   ✅ Data integrity: Perfect');
            console.log('   ✅ Coverage: Complete T01-T21');
            console.log('   ✅ AI/RAG ready: Full content chunks');
            console.log('   ✅ Phase 4/5 ready: No blockers');
        }
        else {
            console.log('   ❌ VALIDATION FAILURES DETECTED:', totalErrors, 'issues');
            process.exit(1);
        }
    }
    catch (error) {
        console.error('💥 Validation failed:', error);
        process.exit(1);
    }
    finally {
        await db_1.db.$disconnect();
    }
}
// Run validation
if (require.main === module) {
    endToEndValidation()
        .catch((error) => {
        console.error('End-to-end validation failed:', error);
        process.exit(1);
    });
}
//# sourceMappingURL=end-to-end-validation.js.map