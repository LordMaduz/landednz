import { afterEach, describe, expect, it, vi } from 'vitest'
import { answersSummary, decodeAnswers, encodeAnswers, parseAnswers, type Answers } from './answers'

const priya: Answers = {
  visaType: 'AEWV',
  city: 'AUCKLAND',
  familySituation: 'SOLO',
  occupation: 'TECHNOLOGY',
  arrivalDate: '2027-01-14',
}

afterEach(() => vi.useRealTimers())

describe('parseAnswers', () => {
  it('accepts the five valid answers', () => {
    expect(parseAnswers({ ...priya })).toEqual(priya)
  })

  it('rejects unknown enum values and missing fields', () => {
    expect(parseAnswers({ ...priya, visaType: 'TOURIST' })).toBeNull()
    expect(parseAnswers({ ...priya, city: 'auckland' })).toBeNull()
    expect(parseAnswers({ ...priya, familySituation: undefined })).toBeNull()
    expect(parseAnswers({ ...priya, occupation: 'PILOT' })).toBeNull()
    expect(parseAnswers({ ...priya, city: undefined })).toBeNull()
    expect(parseAnswers(null)).toBeNull()
    expect(parseAnswers('AEWV')).toBeNull()
  })

  it('rejects an arrival date that is not YYYY-MM-DD or not a real date', () => {
    expect(parseAnswers({ ...priya, arrivalDate: '14/01/2027' })).toBeNull()
    expect(parseAnswers({ ...priya, arrivalDate: '2027-1-14' })).toBeNull()
    expect(parseAnswers({ ...priya, arrivalDate: '2027-02-30' })).toBeNull()
    expect(parseAnswers({ ...priya, arrivalDate: 20270114 })).toBeNull()
  })

  it('drops extra fields', () => {
    expect(parseAnswers({ ...priya, savedAt: 1, admin: true })).toEqual(priya)
  })
})

describe('decodeAnswers (Review Focus 2)', () => {
  it('round-trips a fresh cookie', () => {
    expect(decodeAnswers(encodeAnswers(priya))).toEqual(priya)
  })

  it('is null for a missing, not-base64, not-JSON or invalid cookie', () => {
    expect(decodeAnswers(undefined)).toBeNull()
    expect(decodeAnswers('%%%not base64%%%')).toBeNull()
    expect(decodeAnswers(Buffer.from('not json').toString('base64url'))).toBeNull()
    const bad = Buffer.from(JSON.stringify({ ...priya, visaType: 'TOURIST', savedAt: Date.now() })).toString('base64url')
    expect(decodeAnswers(bad)).toBeNull()
    const noSavedAt = Buffer.from(JSON.stringify(priya)).toString('base64url')
    expect(decodeAnswers(noSavedAt)).toBeNull()
  })

  it('is null once the cookie is older than 3600 s', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-10-24T00:00:00Z'))
    const cookie = encodeAnswers(priya)
    vi.setSystemTime(new Date('2026-10-24T01:00:00Z'))
    expect(decodeAnswers(cookie)).toEqual(priya)
    vi.setSystemTime(new Date('2026-10-24T01:00:01Z'))
    expect(decodeAnswers(cookie)).toBeNull()
  })
})

describe('answersSummary', () => {
  it('reads the answers back in one sentence', () => {
    expect(answersSummary(priya)).toBe(
      'Accredited Employer Work Visa (AEWV), Auckland, just you, technology, landing 14 January 2027',
    )
  })

  it('leaves out a city of "somewhere else"', () => {
    expect(answersSummary({ ...priya, city: 'OTHER', familySituation: 'FAMILY_WITH_CHILDREN' })).toBe(
      'Accredited Employer Work Visa (AEWV), you, your partner and your children, technology, landing 14 January 2027',
    )
  })
})
