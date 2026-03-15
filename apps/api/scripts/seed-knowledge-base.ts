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
// NOTE: Using console instead of logger to avoid DATABASE_URL import dependency
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

    // CONSEQUENCE_LINE — One sentence. Used in task card Layer 1.
    consequenceLine: string;

    // STEPS — Ordered array for task card Layer 2.
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

    // PROFESSIONAL_ADVICE_REQUIRED — If true, AI must surface this note in responses.
    professionalAdviceRequired: boolean;
    professionalAdviceNote: string | null;
  }[];
}

// URL replacements from AC-2-15 research (corrected broken Tier 1 URLs)
const urlReplacements: Record<string, string> = {
  'https://www.auckland.ac.nz/en/study/accommodation.html': 'https://www.auckland.ac.nz/en/on-campus/accommodation.html',
  'https://at.govt.nz/bus-train-ferry/at-metro/airport-transport/airport-link/': 'https://at.govt.nz/bus-train-ferry/bus-services/airport-services',
  'https://incometaxindia.gov.in/Pages/residential-status-for-the-purpose-of-income-tax-act.aspx': 'https://incometaxindia.gov.in/Documents/residential-status.htm',
  'https://www.ird.govt.nz/roles/individuals/transitional-resident/exemption': 'https://www.ird.govt.nz/roles/nz-tax-residents/exemption',
  'https://www.ird.govt.nz/international-tax/individuals/tax-residency-status-for-individuals/determining-your-tax-residency-status': 'https://www.ird.govt.nz/international-tax/individuals/tax-residency-status-for-individuals',
  'https://incometaxindia.gov.in/Documents/Income-Tax-Notification-India-New-Zealand-DTA.pdf': 'https://incometaxindia.gov.in/Charts%20%20Tables/Residence-in-India-for-the-purpose-of-Income-Tax-Act.htm',
  'https://www.ird.govt.nz/international-tax/individuals/coming-to-nz': 'https://www.ird.govt.nz/international-tax/individuals/tax-for-new-zealand-tax-residents',
  'https://www.health.govt.nz/system/files/documents/publications/primary-health-care-strategy-implementation.pdf': 'https://www.health.govt.nz/our-work/primary-health-care/about-primary-health-organisations',
  'https://www.rbnz.govt.nz/statistics/exchange-rates/foreign-exchange-rates': 'https://www.rbnz.govt.nz/statistics/series/exchange-and-interest-rates',
  'https://www.cbsl.gov.lk/en/statistics/exchange-rates': 'https://www.cbsl.gov.lk/en/rates-and-indicators/exchange-rates',
  'https://www.ird.govt.nz/kiwisaver/individuals/kiwisaver-switch': 'https://www.ird.govt.nz/kiwisaver/kiwisaver-individuals/making-changes-to-my-kiwisaver/changing-to-another-provider',
  'https://www.ird.govt.nz/kiwisaver/individuals/member-tax-credit': 'https://www.ird.govt.nz/kiwisaver/kiwisaver-individuals/growing-my-kiwisaver-account/getting-the-kiwisaver-government-contribution'
}

// Dependency graph from pre-analysis.md (canonical)
const dependencyGraph: Array<{ prerequisiteId: string; dependentId: string; dependencyType: "HARD" | "SOFT" }> = [
  { prerequisiteId: "T06", dependentId: "T07", dependencyType: "HARD" },
  { prerequisiteId: "T07", dependentId: "T08", dependencyType: "SOFT" },
  { prerequisiteId: "T07", dependentId: "T11", dependencyType: "HARD" },
  { prerequisiteId: "T07", dependentId: "T15", dependencyType: "HARD" },
  { prerequisiteId: "T07", dependentId: "T21", dependencyType: "HARD" },
  { prerequisiteId: "T08", dependentId: "T09", dependencyType: "HARD" },
  { prerequisiteId: "T08", dependentId: "T10", dependencyType: "SOFT" },
  { prerequisiteId: "T08", dependentId: "T20", dependencyType: "HARD" },
  { prerequisiteId: "T10", dependentId: "T20", dependencyType: "HARD" },
  { prerequisiteId: "T01", dependentId: "T11", dependencyType: "SOFT" },
  { prerequisiteId: "T11", dependentId: "T21", dependencyType: "SOFT" },
  { prerequisiteId: "T14", dependentId: "T11", dependencyType: "SOFT" }
]

// Parse T01-T21 content from landednz_kb_master_COMPLETE_v1.md
import fs from 'fs'
import path from 'path'

function parseKnowledgeBase(): TaskSeedEntry[] {
  const kbPath = path.join(__dirname, '../../../landednz_kb_master_COMPLETE_v1.md')
  const content = fs.readFileSync(kbPath, 'utf-8')
  const tasks: TaskSeedEntry[] = []

  // Split content by task boundaries
  const taskSections = content.split(/---\nTASK_ID: /).slice(1) // Remove header section

  for (const section of taskSections) {
    const lines = section.split('\n')
    const taskId = lines[0].trim() // First line is the task ID

    // Skip if this isn't a valid T01-T21 task
    if (!taskId.match(/^T\d{2}$/)) continue

    console.log(`📋 Parsing task: ${taskId}`)

    // Extract task metadata and content sections
    const taskData = parseTaskSection(lines, taskId)
    if (taskData) {
      tasks.push(taskData)
    }
  }

  return tasks
}

function parseTaskSection(lines: string[], taskId: string): TaskSeedEntry | null {
  try {
    // Find section boundaries
    const sectionStarts = new Map<string, number>()
    lines.forEach((line, index) => {
      const trimmed = line.trim()
      if (['METADATA:', 'SUMMARY:', 'WHAT_AND_WHY:', 'HOW_TO:', 'KEY_FACTS:', 'NUMBER_TYPES:',
           'PERSONA_CONSTRAINED_COUPLE:', 'PERSONA_SOLO_AEWV:', 'CROSS_REFERENCES:',
           'WATCH_OUTS:', 'SOURCES:'].includes(trimmed)) {
        sectionStarts.set(trimmed.replace(':', ''), index)
      }
    })

    // Extract task name from header
    const taskNameLine = lines.find(line => line.startsWith('TASK_NAME:'))
    const taskName = taskNameLine?.replace('TASK_NAME:', '').trim() || ''

    // Parse metadata
    const metadata = extractMetadata(lines, sectionStarts)

    // Parse content sections
    const howTo = extractHowToSteps(lines, sectionStarts)
    const watchOuts = extractWatchOuts(lines, sectionStarts)
    const sources = extractSources(lines, sectionStarts)

    // Get dependencies for this task
    const taskDependencies = dependencyGraph
      .filter(dep => dep.dependentId === taskId)
      .map(dep => ({
        prerequisiteId: dep.prerequisiteId,
        dependencyType: dep.dependencyType
      }))

    // Map metadata to our types
    const phase = metadata.phase === 'Pre-Arrival' ? 1 : metadata.phase === 'Arrival' ? 2 : 3
    const taskType = metadata.task_type === 'Free' ? 'FREE' as const : 'PREMIUM' as const

    // Base task entry
    const taskEntry: TaskSeedEntry = {
      id: taskId,
      name: taskName,
      phase,
      basePriority: metadata.priority_score,
      estimatedDuration: metadata.time_required,
      processingTime: null, // Will be filled from content if available
      governmentSourceUrl: sources[0]?.url || '',
      taskType,
      applicableVisaTypes: "ALL", // Default for MVP
      applicableFamilySituations: ["COUPLE_CONSTRAINED", "SOLO"], // Default for MVP
      applicableOccupations: "ALL", // Default for MVP
      dependencies: taskDependencies,
      contentVariants: [
        {
          personaKey: "constrained_couple",
          consequenceLine: `${taskName} completion affects your settlement timeline and access to services`,
          steps: howTo,
          documentsRequired: [], // Will extract if detailed in content
          commonMistakes: [], // Will extract from watch outs if detailed
          watchOuts: watchOuts,
          cost: null, // Default free unless specified in metadata
          sourceUrl: applyUrlReplacements(sources[0]?.url || ''),
          professionalAdviceRequired: metadata.professional_advice_required,
          professionalAdviceNote: metadata.professional_advice_note
        },
        {
          personaKey: "solo_aewv",
          consequenceLine: `${taskName} completion affects your settlement timeline and access to services`,
          steps: howTo,
          documentsRequired: [],
          commonMistakes: [],
          watchOuts: watchOuts,
          cost: null,
          sourceUrl: applyUrlReplacements(sources[0]?.url || ''),
          professionalAdviceRequired: metadata.professional_advice_required,
          professionalAdviceNote: metadata.professional_advice_note
        }
      ]
    }

    return taskEntry

  } catch (error) {
    console.error(`💥 Error parsing task ${taskId}:`, error)
    return null
  }
}

// Helper functions for parsing content sections
function extractMetadata(lines: string[], sectionStarts: Map<string, number>) {
  const metadataStart = sectionStarts.get('METADATA') || 0
  const metadataEnd = sectionStarts.get('SUMMARY') || lines.length

  const metadata: any = {} // any: Dynamic metadata parsing from unstructured markdown with variable key-value pairs
  for (let i = metadataStart + 1; i < metadataEnd; i++) {
    const line = lines[i].trim()
    if (line.includes(':')) {
      const [key, value] = line.split(':').map(s => s.trim())
      metadata[key] = value === 'null' ? null : (value === 'true' ? true : value === 'false' ? false : value)
    }
  }

  return metadata
}

function extractSection(lines: string[], sectionStarts: Map<string, number>, sectionName: string, nextSection: string): string {
  const start = sectionStarts.get(sectionName)
  const end = sectionStarts.get(nextSection) || lines.length

  if (!start) return ''

  const sectionLines = lines.slice(start + 1, end)
    .filter(line => line.trim() && !line.startsWith('---'))
    .map(line => line.trim())

  return sectionLines.join(' ').trim()
}

function extractHowToSteps(lines: string[], sectionStarts: Map<string, number>): string[] {
  const start = sectionStarts.get('HOW_TO')
  const end = sectionStarts.get('KEY_FACTS') || lines.length

  if (!start) return []

  const steps: string[] = []
  for (let i = start + 1; i < end; i++) {
    const line = lines[i].trim()
    if (line.startsWith('**Step ')) {
      steps.push(line.replace(/^\*\*Step \d+[^*]*\*\*/, '').trim())
    } else if (line && !line.startsWith('---') && steps.length > 0) {
      // Continuation of previous step
      steps[steps.length - 1] += ' ' + line
    }
  }

  return steps
}


function extractWatchOuts(lines: string[], sectionStarts: Map<string, number>): string[] {
  const start = sectionStarts.get('WATCH_OUTS')
  const end = sectionStarts.get('SOURCES') || lines.length

  if (!start) return []

  const watchOuts: string[] = []
  for (let i = start + 1; i < end; i++) {
    const line = lines[i].trim()
    if (line.startsWith('- ') && !line.startsWith('---')) {
      watchOuts.push(line.substring(2).trim())
    }
  }

  return watchOuts
}

function extractSources(lines: string[], sectionStarts: Map<string, number>): Array<{title: string; url: string; tier: number}> {
  const start = sectionStarts.get('SOURCES')

  if (!start) return []

  const sources: any[] = [] // any: Dynamic source structure with variable fields parsed from markdown
  let currentSource: any = {} // any: Accumulator for source object with unknown structure during parsing

  for (let i = start + 1; i < lines.length; i++) {
    const line = lines[i].trim()

    if (line.startsWith('- title:')) {
      if (Object.keys(currentSource).length > 0) {
        sources.push(currentSource)
      }
      currentSource = { title: line.replace('- title:', '').replace(/"/g, '').trim() }
    } else if (line.includes(':') && Object.keys(currentSource).length > 0) {
      const [key, value] = line.split(':').map(s => s.trim())
      currentSource[key] = value.replace(/"/g, '').trim()
    } else if (line.startsWith('TASK_ID:')) {
      // Hit next task, stop parsing
      break
    }
  }

  if (Object.keys(currentSource).length > 0) {
    sources.push(currentSource)
  }

  return sources
}


function applyUrlReplacements(url: string): string {
  return urlReplacements[url] || url
}

// Parse and populate tasks array
const tasks = parseKnowledgeBase()

async function main() {
  console.log('📦 Starting knowledge base seed script')

  try {
    // Check for dry-run mode
    const dryRun = process.argv.includes('--dry-run')
    if (dryRun) {
      console.log('🧪 Running in DRY-RUN mode (no database operations)')
    } else {
      // Connect to database
      await db.$connect()
      console.log('🔗 Database connection established')
    }

    // Process tasks
    let taskCount = 0
    let dependencyCount = 0
    let contentVariantCount = 0

    for (const task of tasks) {
      console.log(`📋 Processing task: ${task.id} - ${task.name}`)

      if (dryRun) {
        console.log(`   📝 Would upsert Task: ${task.id}`)
        console.log(`   📝 Would upsert ${task.dependencies.length} dependencies`)
        console.log(`   📝 Would upsert ${task.contentVariants.length} content variants`)
        taskCount++
        dependencyCount += task.dependencies.length
        contentVariantCount += task.contentVariants.length
        continue
      }

      // 1. Upsert Task record
      await db.task.upsert({
        where: { id: task.id },
        update: {
          name: task.name,
          phase: task.phase,
          basePriority: task.basePriority,
          estimatedDuration: task.estimatedDuration,
          processingTime: task.processingTime,
          governmentSourceUrl: task.governmentSourceUrl,
          taskType: task.taskType,
          applicableVisaTypes: JSON.stringify(task.applicableVisaTypes),
          applicableFamilySituations: JSON.stringify(task.applicableFamilySituations),
          applicableOccupations: JSON.stringify(task.applicableOccupations)
        },
        create: {
          id: task.id,
          name: task.name,
          phase: task.phase,
          basePriority: task.basePriority,
          estimatedDuration: task.estimatedDuration,
          processingTime: task.processingTime,
          governmentSourceUrl: task.governmentSourceUrl,
          taskType: task.taskType,
          applicableVisaTypes: JSON.stringify(task.applicableVisaTypes),
          applicableFamilySituations: JSON.stringify(task.applicableFamilySituations),
          applicableOccupations: JSON.stringify(task.applicableOccupations)
        }
      })
      taskCount++

      // 2. Upsert TaskDependency records
      for (const dependency of task.dependencies) {
        await db.taskDependency.upsert({
          where: {
            prerequisiteId_dependentId: {
              prerequisiteId: dependency.prerequisiteId,
              dependentId: task.id
            }
          },
          update: {
            dependencyType: dependency.dependencyType
          },
          create: {
            prerequisiteId: dependency.prerequisiteId,
            dependentId: task.id,
            dependencyType: dependency.dependencyType
          }
        })
        dependencyCount++
      }

      // 3. Upsert TaskContentVariant records
      for (const variant of task.contentVariants) {
        const variantId = `${task.id}_${variant.personaKey}`

        await db.taskContentVariant.upsert({
          where: {
            taskId_personaKey: {
              taskId: task.id,
              personaKey: variant.personaKey
            }
          },
          update: {
            consequenceLine: variant.consequenceLine,
            steps: JSON.stringify(variant.steps),
            documentsRequired: JSON.stringify(variant.documentsRequired),
            commonMistakes: JSON.stringify(variant.commonMistakes),
            watchOuts: JSON.stringify(variant.watchOuts),
            cost: variant.cost,
            sourceUrl: variant.sourceUrl,
            professionalAdviceRequired: variant.professionalAdviceRequired,
            professionalAdviceNote: variant.professionalAdviceNote
          },
          create: {
            taskId: task.id,
            personaKey: variant.personaKey,
            consequenceLine: variant.consequenceLine,
            steps: JSON.stringify(variant.steps),
            documentsRequired: JSON.stringify(variant.documentsRequired),
            commonMistakes: JSON.stringify(variant.commonMistakes),
            watchOuts: JSON.stringify(variant.watchOuts),
            cost: variant.cost,
            sourceUrl: variant.sourceUrl,
            professionalAdviceRequired: variant.professionalAdviceRequired,
            professionalAdviceNote: variant.professionalAdviceNote
          }
        })
        contentVariantCount++
      }
    }

    console.log('✅ Knowledge base seed completed')
    console.log(`📊 Task records: ${taskCount}`)
    console.log(`📊 TaskDependency records: ${dependencyCount}`)
    console.log(`📊 TaskContentVariant records: ${contentVariantCount}`)

  } catch (error) {
    console.error('💥 Knowledge base seed failed:', error)
    throw error
  } finally {
    // Always disconnect (unless dry run)
    if (!process.argv.includes('--dry-run')) {
      await db.$disconnect()
      console.log('🔌 Database connection closed')
    }
  }
}

// Execute main function with error handling
main().catch((error) => {
  console.error('💥 Seed script failed:', error)
  process.exit(1)
})