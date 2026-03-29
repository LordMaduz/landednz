// Mock roadmap data for Stage 3 (static screens).
// Shape must match TaskListItem from @/types/web exactly (CW05).

import type { TaskListItem, RoadmapPhase } from '@/types/web'

const MOCK_TASKS: TaskListItem[] = [
  // ── Phase 1: Before you start working ──────────────────────────────────
  {
    taskId: 'T01',
    taskName: 'Open a bank account',
    consequenceLine: 'Required before your first paycheck can be deposited',
    estimatedDuration: '1–2 hours',
    phase: 1,
    cardState: 'complete',
    completedAt: 'Mar 12',
    isPremium: false,
    difficulty: 'Easy',
  },
  {
    taskId: 'T02',
    taskName: 'Get an IRD number',
    consequenceLine: 'Without this you pay emergency tax rate (45%) on all income',
    estimatedDuration: '30 min',
    phase: 1,
    cardState: 'complete',
    completedAt: 'Mar 14',
    isPremium: false,
    difficulty: 'Easy',
  },
  {
    taskId: 'T03',
    taskName: 'Register with a GP',
    consequenceLine: 'Without a GP you pay full consultation fees ($80–150)',
    estimatedDuration: '20 min',
    phase: 1,
    cardState: 'in_progress',
    isPremium: false,
    difficulty: 'Easy',
  },
  {
    taskId: 'T04',
    taskName: 'Get a SIM card and NZ number',
    consequenceLine: 'Most services require NZ phone number for verification',
    estimatedDuration: '30 min',
    phase: 1,
    cardState: 'not_started',
    isPremium: false,
    difficulty: 'Easy',
  },
  {
    taskId: 'T05',
    taskName: 'Find rental accommodation',
    consequenceLine: 'Staying in temporary housing costs 3–4x more per week',
    estimatedDuration: '1–3 weeks',
    phase: 1,
    cardState: 'blocked',
    blockedBy: { taskId: 'T04', taskName: 'Get a SIM card and NZ number' },
    isPremium: false,
    difficulty: 'Hard',
  },
  // ── Phase 2: First 2 weeks ──────────────────────────────────────────────
  {
    taskId: 'T06',
    taskName: 'Set up KiwiSaver',
    consequenceLine: "Miss the 3% employer contribution — free money left unclaimed",
    estimatedDuration: '20 min',
    phase: 2,
    cardState: 'not_started',
    isPremium: false,
    difficulty: 'Easy',
  },
  {
    taskId: 'T07',
    taskName: 'Get a NZ driver licence',
    consequenceLine: 'Foreign licence valid only 12 months — fines apply after expiry',
    estimatedDuration: '2 hours',
    phase: 2,
    cardState: 'not_started',
    isPremium: false,
    difficulty: 'Medium',
  },
  {
    taskId: 'T08',
    taskName: 'Enrol children in school',
    consequenceLine: 'Missing enrolment windows means waiting another term',
    estimatedDuration: '1–2 hours',
    phase: 2,
    cardState: 'not_started',
    isPremium: false,
    difficulty: 'Medium',
  },
  {
    taskId: 'T09',
    taskName: 'Apply for Working for Families',
    consequenceLine: 'Eligible families miss $100–400/week in tax credits',
    estimatedDuration: '45 min',
    phase: 2,
    cardState: 'not_started',
    isPremium: false,
    difficulty: 'Medium',
  },
  // ── Phase 3: Settling in (Premium) ─────────────────────────────────────
  {
    taskId: 'T10',
    taskName: 'Apply for permanent residency',
    consequenceLine: 'Delays can affect travel rights and employment options',
    estimatedDuration: '3–5 hours',
    phase: 3,
    cardState: 'premium_locked',
    isPremium: true,
    difficulty: 'Hard',
  },
  {
    taskId: 'T11',
    taskName: 'Superannuation & retirement planning',
    consequenceLine: 'Missing voluntary KiwiSaver contributions costs thousands long-term',
    estimatedDuration: '1 hour',
    phase: 3,
    cardState: 'premium_locked',
    isPremium: true,
    difficulty: 'Medium',
  },
]

export const MOCK_PHASES: RoadmapPhase[] = [
  {
    num: 1,
    name: 'Before you start working',
    timeline: 'Before you arrive',
    isPremium: false,
    tasks: MOCK_TASKS.filter((t) => t.phase === 1),
  },
  {
    num: 2,
    name: 'First 2 weeks',
    timeline: 'Weeks 1–2',
    isPremium: false,
    tasks: MOCK_TASKS.filter((t) => t.phase === 2),
  },
  {
    num: 3,
    name: 'Settling in',
    timeline: 'Months 1–3',
    isPremium: true,
    tasks: MOCK_TASKS.filter((t) => t.phase === 3),
  },
]

export const MOCK_TASKS_FLAT: TaskListItem[] = MOCK_TASKS
