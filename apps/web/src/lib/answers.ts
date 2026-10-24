// The five onboarding answers: questions as the Onboarding board words them, validation,
// and the short-lived cookie that carries them through sign-in.
import type { City, FamilySituation, OnboardingPreviewRequest, Occupation, VisaType } from '@landednz/types'
import { longDay } from './nz-date'

export type Answers = OnboardingPreviewRequest

export const ANSWERS_COOKIE = 'lnz_answers'
export const ANSWERS_MAX_AGE = 3600 // seconds

export const answersCookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  path: '/',
  maxAge: ANSWERS_MAX_AGE,
  secure: process.env.NODE_ENV === 'production',
} as const

type ChoiceKey = Exclude<keyof Answers, 'arrivalDate'>

export const QUESTIONS = [
  {
    key: 'visaType',
    title: 'What visa are you coming on?',
    options: [
      ['AEWV', 'Accredited Employer Work Visa (AEWV)'],
      ['GREEN_LIST_WORK', 'Green List, work to residence'],
      ['GREEN_LIST_RESIDENCE', 'Green List, straight to residence'],
      ['PARTNER_OF_STUDENT', 'Partner of a student'],
      ['OTHER', 'Something else'],
    ] satisfies [VisaType, string][],
  },
  {
    key: 'city',
    title: 'Where will you live?',
    options: [
      ['AUCKLAND', 'Auckland'],
      ['WELLINGTON', 'Wellington'],
      ['CHRISTCHURCH', 'Christchurch'],
      ['OTHER', 'Somewhere else'],
    ] satisfies [City, string][],
  },
  {
    key: 'familySituation',
    title: "Who's moving with you?",
    options: [
      ['SOLO', 'Just me'],
      ['COUPLE_DUAL_WORK', 'My partner, and we both work'],
      ['COUPLE_CONSTRAINED', "My partner, who can't work yet"],
      ['FAMILY_WITH_CHILDREN', 'My partner and our children'],
    ] satisfies [FamilySituation, string][],
  },
  {
    key: 'occupation',
    title: 'What work do you do?',
    options: [
      ['TECHNOLOGY', 'Technology'],
      ['HEALTHCARE', 'Healthcare'],
      ['EDUCATION', 'Education'],
      ['FINANCE', 'Finance'],
      ['TRADES', 'Trades'],
      ['OTHER_PROFESSIONAL', 'Another profession'],
      ['SEEKING_WORK', "I'm still looking for work"],
    ] satisfies [Occupation, string][],
  },
] as const satisfies { key: ChoiceKey; title: string; options: [string, string][] }[]

export const DATE_QUESTION = { key: 'arrivalDate', title: 'When do you land?' } as const

const label = (key: ChoiceKey, value: string) =>
  QUESTIONS.find(q => q.key === key)!.options.find(([v]) => v === value)?.[1] ?? ''

// A real calendar date in YYYY-MM-DD (rejects 2027-02-30)
function isCalendarDate(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const d = new Date(`${value}T00:00:00Z`)
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value
}

export function parseAnswers(raw: unknown): Answers | null {
  if (typeof raw !== 'object' || raw === null) return null
  const r = raw as Record<string, unknown>
  for (const q of QUESTIONS) {
    if (!q.options.some(([v]) => v === r[q.key])) return null
  }
  if (!isCalendarDate(r.arrivalDate)) return null
  return {
    visaType: r.visaType as VisaType,
    city: r.city as City,
    familySituation: r.familySituation as FamilySituation,
    occupation: r.occupation as Occupation,
    arrivalDate: r.arrivalDate,
  }
}

// base64url JSON with the time it was saved; server-side only (Buffer)
export function encodeAnswers(a: Answers): string {
  return Buffer.from(JSON.stringify({ ...a, savedAt: Date.now() })).toString('base64url')
}

export function decodeAnswers(cookie: string | undefined): Answers | null {
  if (!cookie) return null
  try {
    const raw = JSON.parse(Buffer.from(cookie, 'base64url').toString('utf8'))
    const age = Date.now() - raw?.savedAt
    if (typeof raw?.savedAt !== 'number' || !(age >= 0 && age <= ANSWERS_MAX_AGE * 1000)) return null
    return parseAnswers(raw)
  } catch {
    return null
  }
}

const WHO: Record<FamilySituation, string> = {
  SOLO: 'just you',
  COUPLE_DUAL_WORK: 'you and your partner, both working',
  COUPLE_CONSTRAINED: 'you and your partner',
  FAMILY_WITH_CHILDREN: 'you, your partner and your children',
}

// "Accredited Employer Work Visa (AEWV), Auckland, just you, technology, landing 14 January 2027"
export function answersSummary(a: Answers): string {
  const parts = [
    label('visaType', a.visaType),
    a.city === 'OTHER' ? '' : label('city', a.city),
    WHO[a.familySituation],
    label('occupation', a.occupation).toLowerCase(),
    `landing ${longDay(a.arrivalDate)}`,
  ]
  const text = parts.filter(Boolean).join(', ')
  return text.charAt(0).toUpperCase() + text.slice(1)
}
