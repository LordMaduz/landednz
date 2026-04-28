"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Post-seed data integrity enforcer
// Run this after any seeding to ensure all family situations are supported
const db_1 = require("../src/shared/db");
async function enforceDataIntegrity() {
    console.log('🛡️  ENFORCING DATA INTEGRITY...');
    try {
        await db_1.db.$connect();
        // Ensure all tasks support all family situations
        const result = await db_1.db.task.updateMany({
            where: {
                applicableFamilySituations: {
                    not: '["SOLO","COUPLE_DUAL_WORK","COUPLE_CONSTRAINED","FAMILY_WITH_CHILDREN"]'
                }
            },
            data: {
                applicableFamilySituations: '["SOLO","COUPLE_DUAL_WORK","COUPLE_CONSTRAINED","FAMILY_WITH_CHILDREN"]'
            }
        });
        if (result.count > 0) {
            console.log(`🔧 Fixed ${result.count} tasks with incomplete family situation coverage`);
        }
        else {
            console.log('✅ All tasks already have complete family situation coverage');
        }
        // Validation
        const invalidTasks = await db_1.db.task.findMany({
            where: {
                applicableFamilySituations: {
                    not: '["SOLO","COUPLE_DUAL_WORK","COUPLE_CONSTRAINED","FAMILY_WITH_CHILDREN"]'
                }
            },
            select: { id: true, applicableFamilySituations: true }
        });
        if (invalidTasks.length === 0) {
            console.log('✅ 100% CONFIDENCE: All tasks support all family situations');
        }
        else {
            console.log(`❌ ${invalidTasks.length} tasks still have issues:`);
            invalidTasks.forEach(task => {
                console.log(`  ${task.id}: ${task.applicableFamilySituations}`);
            });
        }
    }
    finally {
        await db_1.db.$disconnect();
    }
}
enforceDataIntegrity();
//# sourceMappingURL=ensure-data-integrity.js.map