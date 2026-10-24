import { describe, expect, it } from 'vitest'
import type { TaskDetailApiResponse } from './api'
import { suggestionsFor } from './suggestions'

const detail = (over: Partial<TaskDetailApiResponse>) =>
  ({ documentsRequired: [], processingTime: null, commonMistakes: [], ...over }) as TaskDetailApiResponse

describe('suggestionsFor', () => {
  it('all three apply: the first two', () => {
    expect(
      suggestionsFor(detail({ documentsRequired: ['Passport'], processingTime: '1–2 days', commonMistakes: ['Late'] })),
    ).toEqual(['What documents do I need?', 'How long does it take?'])
  })

  it('skips the ones without content', () => {
    expect(suggestionsFor(detail({ commonMistakes: ['Late'], documentsRequired: ['Passport'] }))).toEqual([
      'What documents do I need?',
      'What do people get wrong?',
    ])
  })

  it('none apply: none', () => {
    expect(suggestionsFor(detail({}))).toEqual([])
  })
})
