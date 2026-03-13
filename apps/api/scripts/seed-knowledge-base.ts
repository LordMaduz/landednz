/**
 * Knowledge Base Seed Script
 *
 * PHASE 1: Scaffold only — empty data arrays, establishes structure for Phase 2
 * PHASE 2: Will populate with complete T01–T21 content (AC-2-15)
 *
 * Requirements:
 * - DATABASE_URL must be set in environment (Prisma connection)
 * - Run from apps/api/ directory: npx ts-node scripts/seed-knowledge-base.ts
 */

import { db } from '../src/shared/db'
import { logger } from '../src/shared/logger'
import type { VisaType, FamilySituation, Occupation } from '../src/shared/types'

// TaskSeedEntry interface per spec §2.3
interface TaskSeedEntry {
  // ── Task-level fields (maps to Task table) ──
  id: string;                         // "T08"
  name: string;                       // "Apply for your IRD number"
  phase: 1 | 2 | 3;
  basePriority: number;               // 0–100
  estimatedDuration: string;          // "15 minutes"
  processingTime: string | null;      // "8–15 working days" | null
  governmentSourceUrl: string;
  taskType: "FREE" | "PREMIUM";
  applicableVisaTypes: VisaType[] | "ALL";
  applicableFamilySituations: FamilySituation[];
  applicableOccupations: Occupation[] | "ALL";

  // ── Dependencies (maps to TaskDependency table) ──
  dependencies: {
    prerequisiteId: string;           // "T07"
    dependencyType: "HARD" | "SOFT";
  }[];

  // ── Content variants (maps to TaskContentVariant table) ──
  // Exactly 2 variants at MVP: constrained_couple + solo_aewv
  contentVariants: {
    personaKey: "constrained_couple" | "solo_aewv";

    // SUMMARY — Dense 2–3 sentences. Written for RAG retrieval.
    summary: string;

    // WHAT_AND_WHY — 150–300 words. NZ-specific system explanation.
    whatAndWhy: string;

    // HOW_TO — Numbered steps. What to bring, where to go, what to expect.
    howTo: string[];

    // KEY_FACTS — 5–10 bullets. Most important facts. Tagged with number type inline.
    keyFacts: string[];

    // NUMBER_TYPES — Machine-readable table of all figures in this task.
    numberTypes: {
      figure: string;                 // "4 weeks rent" | "NZD $445" | "$20–50"
      type: "A" | "B" | "C";
      typeLabel: "Statutory" | "Administrative" | "Market";
      source: string;                 // "Residential Tenancies Act 1986" | "NZQA" | "Market rate"
      caveat: string;                 // What AI says when presenting this number
      lastConfirmed: string;          // "YYYY-MM-DD"
    }[];

    // CONSEQUENCE_LINE — One sentence. Used in task card Layer 1.
    consequenceLine: string;

    // STEPS — Same content as howTo but as ordered array (for task card Layer 2).
    steps: string[];

    // DOCUMENTS_REQUIRED — Specific to this persona + visa type.
    documentsRequired: string[];

    // COMMON_MISTAKES — Migrant-specific risk flags.
    commonMistakes: string[];

    // WATCH_OUTS — Differences from home country expectations.
    watchOuts: string[];

    // COST — null if free.
    cost: string | null;

    // SOURCE — Primary authoritative source for this content.
    sourceUrl: string;
    sourceName: string;

    // CROSS_REFERENCES — Related tasks.
    relatedTasks: {
      taskId: string;
      relationship: string;           // "IRD number required before completing this task"
    }[];

    // PROFESSIONAL_ADVICE_REQUIRED — If true, AI must surface this note in responses.
    professionalAdviceRequired: boolean;
    professionalAdviceNote: string | null;

    // NEXT_REVIEW_TRIGGER — Plain English condition, not a date.
    nextReviewTrigger: string;
  }[];
}

// PHASE 1: Empty tasks array — Phase 2 (AC-2-15) will populate with T01–T21
const tasks: TaskSeedEntry[] = []
// TODO: Phase 2 — populate with complete T01–T21 content per spec §2.2

async function main() {
  logger.info('Starting knowledge base seed script')

  try {
    // Connect to database
    await db.$connect()
    logger.info('Database connection established')

    // Process tasks (empty array at Phase 1)
    let taskCount = 0
    let contentVariantCount = 0

    for (const task of tasks) {
      // NOTE: At Phase 1, this loop runs 0 times (empty array)
      // Phase 2 implementation will upsert Task and TaskContentVariant records here

      logger.info({ taskId: task.id }, `Processing task: ${task.name}`)
      taskCount++
      contentVariantCount += task.contentVariants.length
    }

    logger.info({
      taskCount,
      contentVariantCount,
    }, 'Knowledge base seed completed')

    logger.info(`Task records: ${taskCount}`)
    logger.info(`TaskContentVariant records: ${contentVariantCount}`)

  } catch (error) {
    logger.error(error, 'Knowledge base seed failed')
    throw error
  } finally {
    // Always disconnect
    await db.$disconnect()
    logger.info('Database connection closed')
  }
}

// Execute main function with error handling
main().catch((error) => {
  logger.error(error, 'Seed script failed')
  process.exit(1)
})