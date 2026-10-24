import { describe, expect, it } from 'vitest'
import { stepParts } from './task-steps'

describe('stepParts', () => {
  it('a plain step is its own lead', () => {
    expect(stepParts('Apply online at ird.govt.nz.')).toEqual({ lead: 'Apply online at ird.govt.nz.', items: [] })
  })

  it('inline " - " items become a list under the lead', () => {
    expect(stepParts('You will need: - Your passport - Your visa details (type — expiry)')).toEqual({
      lead: 'You will need:',
      items: ['Your passport', 'Your visa details (type — expiry)'],
    })
  })

  it('drops markdown bold markers', () => {
    expect(stepParts('The answer: - **"M"** — your main income')).toEqual({ lead: 'The answer:', items: ['"M" — your main income'] })
  })

  it('keeps hyphens inside words and ranges', () => {
    expect(stepParts('Use a well-known 1-2 day service')).toEqual({ lead: 'Use a well-known 1-2 day service', items: [] })
  })
})
