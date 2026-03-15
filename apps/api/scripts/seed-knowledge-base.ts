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

// Production-grade parsing with comprehensive error handling and validation
import fs from 'fs'
import path from 'path'

interface ParsedTaskData {
  taskEntry: TaskSeedEntry
  knowledgeBaseChunks: Array<{
    chunkKey: string
    taskId: string
    personaKey: string
    content: string
    sourceUrl: string
    sourceName: string
  }>
}

interface ValidationError {
  taskId: string
  field: string
  issue: string
}

function parseKnowledgeBase(): { tasks: TaskSeedEntry[], knowledgeBaseChunks: Array<any>, errors: ValidationError[] } {
  const kbPath = path.join(__dirname, '../../../landednz_kb_master_COMPLETE_v1.md')

  if (!fs.existsSync(kbPath)) {
    throw new Error(`Knowledge base file not found: ${kbPath}`)
  }

  const content = fs.readFileSync(kbPath, 'utf-8')
  const tasks: TaskSeedEntry[] = []
  const knowledgeBaseChunks: Array<any> = []
  const errors: ValidationError[] = []

  // Split content by task boundaries with robust parsing
  const taskSections = content.split(/---\nTASK_ID: /).slice(1) // Remove header section

  console.log(`📚 Found ${taskSections.length} task sections in knowledge base`)

  for (const section of taskSections) {
    const lines = section.split('\n')
    const taskId = lines[0].trim() // First line is the task ID

    // Validate task ID format
    if (!taskId.match(/^T\d{2}$/)) {
      console.log(`⚠️  Skipping invalid task ID: ${taskId}`)
      continue
    }

    console.log(`📋 Parsing task: ${taskId}`)

    try {
      // Extract task metadata and content sections with validation
      const parsedData = parseTaskSectionProduction(lines, taskId)
      if (parsedData) {
        tasks.push(parsedData.taskEntry)
        knowledgeBaseChunks.push(...parsedData.knowledgeBaseChunks)
      }
    } catch (error) {
      console.error(`💥 Error parsing task ${taskId}:`, error)
      errors.push({
        taskId,
        field: 'general',
        issue: error instanceof Error ? error.message : 'Unknown parsing error'
      })
    }
  }

  // Validate we have all expected tasks T01-T21
  const expectedTasks = Array.from({ length: 21 }, (_, i) => `T${String(i + 1).padStart(2, '0')}`)
  const foundTasks = tasks.map(t => t.id).sort()
  const missingTasks = expectedTasks.filter(t => !foundTasks.includes(t))

  if (missingTasks.length > 0) {
    errors.push({
      taskId: 'MISSING',
      field: 'task_coverage',
      issue: `Missing tasks: ${missingTasks.join(', ')}`
    })
  }

  console.log(`✅ Parsed ${tasks.length} tasks, generated ${knowledgeBaseChunks.length} knowledge base chunks`)
  if (errors.length > 0) {
    console.log(`⚠️  ${errors.length} validation errors found`)
  }

  return { tasks, knowledgeBaseChunks, errors }
}

function parseTaskSectionProduction(lines: string[], taskId: string): ParsedTaskData | null {
  try {
    // Find section boundaries with comprehensive mapping
    const sectionStarts = new Map<string, number>()
    lines.forEach((line, index) => {
      const trimmed = line.trim()
      if (['METADATA:', 'SUMMARY:', 'WHAT_AND_WHY:', 'HOW_TO:', 'KEY_FACTS:', 'NUMBER_TYPES:',
           'PERSONA_CONSTRAINED_COUPLE:', 'PERSONA_SOLO_AEWV:', 'CROSS_REFERENCES:',
           'WATCH_OUTS:', 'SOURCES:'].includes(trimmed)) {
        sectionStarts.set(trimmed.replace(':', ''), index)
      }
    })

    // Validate required sections exist
    const requiredSections = ['METADATA', 'SUMMARY', 'WHAT_AND_WHY', 'HOW_TO', 'SOURCES']
    const missingSections = requiredSections.filter(section => !sectionStarts.has(section))
    if (missingSections.length > 0) {
      throw new Error(`Missing required sections: ${missingSections.join(', ')}`)
    }

    // Extract task name from header
    const taskNameLine = lines.find(line => line.startsWith('TASK_NAME:'))
    if (!taskNameLine) {
      throw new Error('TASK_NAME not found')
    }
    const taskName = taskNameLine.replace('TASK_NAME:', '').trim()

    // Parse all content sections comprehensively
    const metadata = extractMetadataProduction(lines, sectionStarts)
    const summary = extractSection(lines, sectionStarts, 'SUMMARY', 'WHAT_AND_WHY')
    const whatAndWhy = extractSection(lines, sectionStarts, 'WHAT_AND_WHY', 'HOW_TO')
    const howTo = extractHowToStepsProduction(lines, sectionStarts)
    const keyFacts = extractKeyFactsProduction(lines, sectionStarts)
    const numberTypes = extractNumberTypesProduction(lines, sectionStarts)
    const personaConstrainedCouple = extractPersonaSection(lines, sectionStarts, 'PERSONA_CONSTRAINED_COUPLE')
    const personaSoloAewv = extractPersonaSection(lines, sectionStarts, 'PERSONA_SOLO_AEWV')
    const watchOuts = extractWatchOutsProduction(lines, sectionStarts)
    const sources = extractSourcesProduction(lines, sectionStarts)
    const documentsRequired = extractDocumentsFromContent(howTo, whatAndWhy)
    const commonMistakes = extractCommonMistakesFromWatchOuts(watchOuts)

    // Validate parsed content
    validateParsedContent(taskId, {
      taskName, summary, whatAndWhy, howTo, keyFacts, sources
    })

    // Get dependencies for this task
    const taskDependencies = dependencyGraph
      .filter(dep => dep.dependentId === taskId)
      .map(dep => ({
        prerequisiteId: dep.prerequisiteId,
        dependencyType: dep.dependencyType
      }))

    // Map metadata to database types
    const phase = mapPhaseToNumber(metadata.phase)
    const taskType = metadata.task_type === 'Free' ? 'FREE' as const : 'PREMIUM' as const
    const estimatedDuration = metadata.time_required || '15 minutes'
    const basePriority = metadata.priority_score || 50

    // Extract processing time if available from content
    const processingTime = extractProcessingTimeFromContent(whatAndWhy, howTo)

    // Primary government source with URL correction
    const primarySource = sources[0]
    if (!primarySource) {
      throw new Error(`No sources found for task ${taskId}`)
    }

    // Create enhanced consequence lines based on persona content
    const constrainedCoupleConsequence = createConsequenceLine(taskName, personaConstrainedCouple, keyFacts)
    const soloAewvConsequence = createConsequenceLine(taskName, personaSoloAewv, keyFacts)

    // Base task entry
    const taskEntry: TaskSeedEntry = {
      id: taskId,
      name: taskName,
      phase,
      basePriority,
      estimatedDuration,
      processingTime,
      governmentSourceUrl: applyUrlReplacements(primarySource.url),
      taskType,
      applicableVisaTypes: "ALL", // Default for MVP
      applicableFamilySituations: ["COUPLE_CONSTRAINED", "SOLO"], // Default for MVP
      applicableOccupations: "ALL", // Default for MVP
      dependencies: taskDependencies,
      contentVariants: [
        {
          personaKey: "constrained_couple",
          consequenceLine: constrainedCoupleConsequence,
          steps: howTo,
          documentsRequired: documentsRequired,
          commonMistakes: commonMistakes,
          watchOuts: watchOuts,
          cost: extractCostFromContent(whatAndWhy, keyFacts),
          sourceUrl: applyUrlReplacements(primarySource.url),
          professionalAdviceRequired: metadata.professional_advice_required,
          professionalAdviceNote: metadata.professional_advice_note
        },
        {
          personaKey: "solo_aewv",
          consequenceLine: soloAewvConsequence,
          steps: howTo,
          documentsRequired: documentsRequired,
          commonMistakes: commonMistakes,
          watchOuts: watchOuts,
          cost: extractCostFromContent(whatAndWhy, keyFacts),
          sourceUrl: applyUrlReplacements(primarySource.url),
          professionalAdviceRequired: metadata.professional_advice_required,
          professionalAdviceNote: metadata.professional_advice_note
        }
      ]
    }

    // Create KnowledgeBase chunks for AI/RAG (per knowledge-base-schema)
    const knowledgeBaseChunks = [
      {
        chunkKey: `CHUNK_${taskId}_constrained_couple`,
        taskId,
        personaKey: 'constrained_couple',
        content: buildChunkContent(summary, whatAndWhy, keyFacts, howTo, watchOuts, personaConstrainedCouple),
        sourceUrl: applyUrlReplacements(primarySource.url),
        sourceName: primarySource.title
      },
      {
        chunkKey: `CHUNK_${taskId}_solo_aewv`,
        taskId,
        personaKey: 'solo_aewv',
        content: buildChunkContent(summary, whatAndWhy, keyFacts, howTo, watchOuts, personaSoloAewv),
        sourceUrl: applyUrlReplacements(primarySource.url),
        sourceName: primarySource.title
      }
    ]

    return { taskEntry, knowledgeBaseChunks }

  } catch (error) {
    console.error(`💥 Error parsing task ${taskId}:`, error)
    throw error // Re-throw to surface parsing errors
  }
}

// Production-grade helper functions with comprehensive error handling

function extractMetadataProduction(lines: string[], sectionStarts: Map<string, number>) {
  const metadataStart = sectionStarts.get('METADATA')
  const metadataEnd = sectionStarts.get('SUMMARY')

  if (!metadataStart || !metadataEnd) {
    throw new Error('METADATA or SUMMARY section not found')
  }

  const metadata: any = {} // any: Dynamic metadata parsing from unstructured markdown with variable key-value pairs
  for (let i = metadataStart + 1; i < metadataEnd; i++) {
    const line = lines[i].trim()
    if (line && line.includes(':') && !line.startsWith('---')) {
      const [key, ...valueParts] = line.split(':')
      const value = valueParts.join(':').trim()

      // Parse different value types
      if (value === 'null') metadata[key.trim()] = null
      else if (value === 'true') metadata[key.trim()] = true
      else if (value === 'false') metadata[key.trim()] = false
      else if (!isNaN(Number(value))) metadata[key.trim()] = Number(value)
      else metadata[key.trim()] = value
    }
  }

  // Validate required metadata fields
  const requiredFields = ['phase', 'priority_score', 'task_type', 'professional_advice_required']
  const missingFields = requiredFields.filter(field => metadata[field] === undefined)
  if (missingFields.length > 0) {
    throw new Error(`Missing metadata fields: ${missingFields.join(', ')}`)
  }

  return metadata
}

function mapPhaseToNumber(phase: string): 1 | 2 | 3 {
  if (phase === 'Pre-Arrival') return 1
  if (phase === 'Arrival') return 2
  return 3 // Week 1, Month 1-2, Month 2-6 all map to 3
}

function validateParsedContent(taskId: string, content: any) {
  const requiredFields = ['taskName', 'summary', 'whatAndWhy', 'howTo', 'sources']
  const missingFields = requiredFields.filter(field => !content[field] || content[field].length === 0)

  if (missingFields.length > 0) {
    throw new Error(`Task ${taskId} missing required content: ${missingFields.join(', ')}`)
  }

  // Validate summary length (should be 2-3 sentences)
  const sentences = content.summary.split(/[.!?]+/).filter((s: string) => s.trim().length > 0)
  if (sentences.length < 2) {
    throw new Error(`Task ${taskId} summary too short - needs 2-3 sentences`)
  }

  // Validate howTo has steps
  if (!Array.isArray(content.howTo) || content.howTo.length === 0) {
    throw new Error(`Task ${taskId} missing howTo steps`)
  }

  // Validate sources
  if (!Array.isArray(content.sources) || content.sources.length === 0) {
    throw new Error(`Task ${taskId} missing sources`)
  }
}

function extractDocumentsFromContent(howTo: string[], whatAndWhy: string): string[] {
  const documents: string[] = []
  const content = [...howTo, whatAndWhy].join(' ')

  // Common document patterns in NZ settlement
  const docPatterns = [
    /passport/gi,
    /visa/gi,
    /birth certificate/gi,
    /marriage certificate/gi,
    /qualification[s]? documents?/gi,
    /bank statement[s]?/gi,
    /employment letter/gi,
    /offer of employment/gi,
    /driver[']?s? licen[cs]e/gi,
    /medical certificate/gi,
    /police clearance/gi,
    /character certificate/gi,
    /proof of funds/gi,
    /rental agreement/gi,
    /bond receipt/gi,
    /IRD number/gi,
    /tax code/gi
  ]

  docPatterns.forEach(pattern => {
    const matches = content.match(pattern)
    if (matches) {
      matches.forEach(match => {
        const cleanMatch = match.trim().toLowerCase()
        if (!documents.includes(cleanMatch)) {
          documents.push(cleanMatch)
        }
      })
    }
  })

  return documents.slice(0, 10) // Limit to top 10 most relevant
}

function extractCommonMistakesFromWatchOuts(watchOuts: string[]): string[] {
  // Transform watch-outs into common mistakes format
  return watchOuts.map(watchOut => {
    // Convert watch-out to mistake format
    if (watchOut.toLowerCase().includes('do not')) {
      return watchOut
    } else {
      return `Failing to understand: ${watchOut}`
    }
  }).slice(0, 5) // Limit to top 5
}

function createConsequenceLine(taskName: string, personaContent: string, keyFacts: string[]): string {
  // Use persona content if available, otherwise derive from key facts
  if (personaContent && personaContent.length > 50) {
    // Extract first sentence from persona content
    const firstSentence = personaContent.split(/[.!?]/)[0]
    if (firstSentence && firstSentence.length > 20) {
      return firstSentence.trim() + '.'
    }
  }

  // Fallback to key facts based consequence
  if (keyFacts.length > 0) {
    const firstFact = keyFacts[0]
    if (firstFact.includes('without')) {
      return firstFact
    }
  }

  // Generic fallback
  return `${taskName} directly impacts your settlement timeline and access to essential services.`
}

function extractCostFromContent(whatAndWhy: string, keyFacts: string[]): string | null {
  const content = [whatAndWhy, ...keyFacts].join(' ')

  // Look for cost patterns
  const costPatterns = [
    /free/gi,
    /no cost/gi,
    /NZD?\s*\$[\d,]+/gi,
    /\$[\d,]+/gi,
    /[\d,]+\s*dollars?/gi
  ]

  for (const pattern of costPatterns) {
    const match = content.match(pattern)
    if (match) {
      const cost = match[0].toLowerCase()
      if (cost.includes('free') || cost.includes('no cost')) {
        return null // Free
      } else {
        return match[0] // Return first cost found
      }
    }
  }

  return null // Default to free
}

function extractProcessingTimeFromContent(whatAndWhy: string, howTo: string[]): string | null {
  const content = [whatAndWhy, ...howTo].join(' ')

  // Look for processing time patterns
  const timePatterns = [
    /\d+[-–]\d+\s+working days/gi,
    /\d+[-–]\d+\s+days/gi,
    /\d+[-–]\d+\s+weeks/gi,
    /\d+\s+weeks/gi,
    /\d+\s+working days/gi,
    /up to \d+\s+weeks/gi,
    /within \d+\s+weeks/gi
  ]

  for (const pattern of timePatterns) {
    const match = content.match(pattern)
    if (match) {
      return match[0]
    }
  }

  return null // No processing time specified
}

function buildChunkContent(summary: string, whatAndWhy: string, keyFacts: string[], howTo: string[], watchOuts: string[], personaContent: string): string {
  // Build chunk content per knowledge-base-schema: summary + whatAndWhy + keyFacts + howTo + watchOuts
  const sections = [
    summary,
    whatAndWhy,
    keyFacts.map(fact => `• ${fact}`).join('\n'),
    howTo.map((step, index) => `${index + 1}. ${step}`).join('\n'),
    watchOuts.map(wo => `⚠️ ${wo}`).join('\n')
  ].filter(section => section && section.trim().length > 0)

  // Add persona-specific content if available
  if (personaContent && personaContent.trim().length > 0) {
    sections.push(`\nPersona-specific guidance:\n${personaContent}`)
  }

  return sections.join('\n\n')
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

function extractHowToStepsProduction(lines: string[], sectionStarts: Map<string, number>): string[] {
  const start = sectionStarts.get('HOW_TO')
  const end = sectionStarts.get('KEY_FACTS') || sectionStarts.get('NUMBER_TYPES') || lines.length

  if (!start) {
    throw new Error('HOW_TO section not found')
  }

  const steps: string[] = []
  let currentStep = ''

  for (let i = start + 1; i < end; i++) {
    const line = lines[i].trim()

    // Skip empty lines and section dividers
    if (!line || line.startsWith('---')) {
      continue
    }

    // New step detection (enhanced patterns)
    if (line.match(/^\*\*Step \d+/i) || line.match(/^\d+\./)) {
      // Save previous step if exists
      if (currentStep.trim()) {
        steps.push(currentStep.trim())
      }

      // Start new step, removing formatting
      currentStep = line
        .replace(/^\*\*Step \d+[^*]*\*\*/, '')
        .replace(/^\d+\./, '')
        .trim()
    } else if (currentStep) {
      // Continue current step
      currentStep += ' ' + line
    } else {
      // First line of steps section without explicit step marker
      currentStep = line
    }
  }

  // Don't forget the last step
  if (currentStep.trim()) {
    steps.push(currentStep.trim())
  }

  // Validate we have steps
  if (steps.length === 0) {
    throw new Error('No HOW_TO steps found')
  }

  // Clean up and validate steps
  const cleanSteps = steps
    .map(step => step.replace(/\s+/g, ' ').trim())
    .filter(step => step.length > 10) // Filter out too-short steps

  if (cleanSteps.length === 0) {
    throw new Error('No valid HOW_TO steps after cleaning')
  }

  return cleanSteps
}

function extractKeyFactsProduction(lines: string[], sectionStarts: Map<string, number>): string[] {
  const start = sectionStarts.get('KEY_FACTS')
  const end = sectionStarts.get('NUMBER_TYPES') || sectionStarts.get('PERSONA_CONSTRAINED_COUPLE') || lines.length

  if (!start) {
    throw new Error('KEY_FACTS section not found')
  }

  const facts: string[] = []
  for (let i = start + 1; i < end; i++) {
    const line = lines[i].trim()
    if (line.startsWith('- ') && !line.startsWith('---')) {
      const fact = line.substring(2).trim()
      if (fact.length > 10) { // Filter out too-short facts
        facts.push(fact)
      }
    }
  }

  if (facts.length === 0) {
    throw new Error('No KEY_FACTS found')
  }

  return facts
}

function extractNumberTypesProduction(lines: string[], sectionStarts: Map<string, number>): Array<{
  figure: string; type: "A" | "B" | "C"; typeLabel: "Statutory" | "Administrative" | "Market";
  source: string; caveat: string; lastConfirmed: string;
}> {
  const start = sectionStarts.get('NUMBER_TYPES')
  const end = sectionStarts.get('PERSONA_CONSTRAINED_COUPLE') || lines.length

  if (!start) {
    return [] // NUMBER_TYPES is optional
  }

  const numberTypes: any[] = []
  let currentEntry: any = {}

  for (let i = start + 1; i < end; i++) {
    const line = lines[i].trim()

    if (line.startsWith('- figure:')) {
      if (Object.keys(currentEntry).length > 0) {
        // Validate previous entry before adding
        if (currentEntry.figure && currentEntry.type && currentEntry.typeLabel) {
          numberTypes.push(currentEntry)
        }
      }
      currentEntry = { figure: line.replace('- figure:', '').replace(/"/g, '').trim() }
    } else if (line.includes(':') && Object.keys(currentEntry).length > 0) {
      const [key, ...valueParts] = line.split(':')
      const value = valueParts.join(':').replace(/"/g, '').trim()
      const cleanKey = key.trim().replace('type_label', 'typeLabel').replace('last_confirmed', 'lastConfirmed')
      currentEntry[cleanKey] = value
    }
  }

  // Don't forget the last entry
  if (Object.keys(currentEntry).length > 0 && currentEntry.figure && currentEntry.type && currentEntry.typeLabel) {
    numberTypes.push(currentEntry)
  }

  return numberTypes
}

function extractPersonaSection(lines: string[], sectionStarts: Map<string, number>, persona: string): string {
  const start = sectionStarts.get(persona)
  const nextPersona = persona === 'PERSONA_CONSTRAINED_COUPLE' ? 'PERSONA_SOLO_AEWV' : 'CROSS_REFERENCES'
  const end = sectionStarts.get(nextPersona) || sectionStarts.get('WATCH_OUTS') || lines.length

  if (!start) {
    return '' // Persona sections are optional
  }

  const sectionLines = []
  for (let i = start + 1; i < end; i++) {
    const line = lines[i].trim()
    if (line && !line.startsWith('---')) {
      sectionLines.push(line)
    }
  }

  return sectionLines.join(' ').trim()
}

function extractWatchOutsProduction(lines: string[], sectionStarts: Map<string, number>): string[] {
  const start = sectionStarts.get('WATCH_OUTS')
  const end = sectionStarts.get('SOURCES') || lines.length

  if (!start) {
    return [] // WATCH_OUTS is optional
  }

  const watchOuts: string[] = []
  for (let i = start + 1; i < end; i++) {
    const line = lines[i].trim()
    if (line.startsWith('- ') && !line.startsWith('---')) {
      const watchOut = line.substring(2).trim()
      if (watchOut.length > 10) { // Filter out too-short watch-outs
        watchOuts.push(watchOut)
      }
    }
  }

  return watchOuts
}

function extractSourcesProduction(lines: string[], sectionStarts: Map<string, number>): Array<{title: string; url: string; tier: number}> {
  const start = sectionStarts.get('SOURCES')

  if (!start) {
    throw new Error('SOURCES section not found')
  }

  const sources: any[] = []
  let currentSource: any = {}

  for (let i = start + 1; i < lines.length; i++) {
    const line = lines[i].trim()

    // Stop at next task
    if (line.startsWith('TASK_ID:')) {
      break
    }

    if (line.startsWith('- title:')) {
      if (Object.keys(currentSource).length > 0) {
        // Validate previous source before adding
        if (currentSource.title && currentSource.url) {
          sources.push(currentSource)
        }
      }
      currentSource = { title: line.replace('- title:', '').replace(/"/g, '').trim() }
    } else if (line.includes(':') && Object.keys(currentSource).length > 0) {
      const [key, ...valueParts] = line.split(':')
      const value = valueParts.join(':').replace(/"/g, '').trim()
      currentSource[key.trim()] = value
    }
  }

  // Don't forget the last source
  if (Object.keys(currentSource).length > 0 && currentSource.title && currentSource.url) {
    sources.push(currentSource)
  }

  if (sources.length === 0) {
    throw new Error('No valid sources found')
  }

  return sources
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

// Parse knowledge base with production validation
const { tasks, knowledgeBaseChunks, errors } = parseKnowledgeBase()

// Handle parsing errors
if (errors.length > 0) {
  console.error(`💥 ${errors.length} parsing errors found:`)
  errors.forEach(error => {
    console.error(`   ${error.taskId}: ${error.field} - ${error.issue}`)
  })
  throw new Error('Knowledge base parsing failed - see errors above')
}

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

    // Process tasks and knowledge base chunks
    let taskCount = 0
    let dependencyCount = 0
    let contentVariantCount = 0
    let knowledgeBaseChunkCount = 0

    // Find chunks for this task
    const getChunksForTask = (taskId: string) =>
      knowledgeBaseChunks.filter(chunk => chunk.taskId === taskId)

    if (dryRun) {
      // Dry run mode
      for (const task of tasks) {
        const taskChunks = getChunksForTask(task.id)
        console.log(`📋 Processing task: ${task.id} - ${task.name}`)
        console.log(`   📝 Would upsert Task: ${task.id}`)
        console.log(`   📝 Would upsert ${task.dependencies.length} dependencies`)
        console.log(`   📝 Would upsert ${task.contentVariants.length} content variants`)
        console.log(`   📝 Would upsert ${taskChunks.length} knowledge base chunks`)
        taskCount++
        dependencyCount += task.dependencies.length
        contentVariantCount += task.contentVariants.length
        knowledgeBaseChunkCount += taskChunks.length
      }
    } else {
      // Production mode - phased approach for foreign key constraints
      console.log('📋 Phase 1: Creating all Task records...')

      // PHASE 1: Create all tasks first
      for (const task of tasks) {
        console.log(`   Creating Task: ${task.id} - ${task.name}`)
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
      }

      console.log('📋 Phase 2: Creating TaskDependency records...')
      // PHASE 2: Create all dependencies (all tasks now exist)
      for (const task of tasks) {
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
      }

      console.log('📋 Phase 3: Creating TaskContentVariant records...')
      // PHASE 3: Create content variants
      for (const task of tasks) {
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
        for (const variant of task.contentVariants) {
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

      console.log('📋 Phase 4: Creating KnowledgeBaseChunk records for AI/RAG...')
      // PHASE 4: Create knowledge base chunks
      for (const chunk of knowledgeBaseChunks) {
        await db.knowledgeBaseChunk.upsert({
          where: { chunkKey: chunk.chunkKey },
          update: {
            taskId: chunk.taskId,
            personaKey: chunk.personaKey,
            chunkType: 'TASK_CONTENT',
            content: chunk.content,
            sourceUrl: chunk.sourceUrl,
            sourceName: chunk.sourceName
          },
          create: {
            chunkKey: chunk.chunkKey,
            taskId: chunk.taskId,
            personaKey: chunk.personaKey,
            chunkType: 'TASK_CONTENT',
            content: chunk.content,
            sourceUrl: chunk.sourceUrl,
            sourceName: chunk.sourceName
          }
        })
        knowledgeBaseChunkCount++
      }
    }

    console.log('✅ Knowledge base seed completed')
    console.log(`📊 Task records: ${taskCount}`)
    console.log(`📊 TaskDependency records: ${dependencyCount}`)
    console.log(`📊 TaskContentVariant records: ${contentVariantCount}`)
    console.log(`📊 KnowledgeBaseChunk records: ${knowledgeBaseChunkCount}`)

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