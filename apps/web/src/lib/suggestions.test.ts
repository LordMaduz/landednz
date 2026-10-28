import { describe, expect, it } from 'vitest'
import type { TaskDetailApiResponse } from './api'
import { suggestionsFor } from './suggestions'

const detail = (over: Partial<TaskDetailApiResponse>) =>
  ({ documentsRequired: [], processingTime: null, commonMistakes: [], ...over }) as TaskDetailApiResponse

describe('suggestionsFor', () => {
  it('processing time known: asks how long it takes', () => {
    expect(suggestionsFor(detail({ processingTime: '1–2 days' }))).toEqual(['How long does it take?'])
  })

  it('documents and mistakes are on the page already: no question for them', () => {
    expect(suggestionsFor(detail({ commonMistakes: ['Late'], documentsRequired: ['Passport'] }))).toEqual([])
  })
})
