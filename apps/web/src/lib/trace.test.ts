import { describe, expect, it } from 'vitest'
import { traceFor } from './trace'

describe('traceFor', () => {
  it('names each NZ domain once, subdomains included', () => {
    expect(traceFor('Apply at ird.govt.nz or myir.ird.govt.nz, then ird.govt.nz again')).toBe(
      'Checked ird.govt.nz, myir.ird.govt.nz',
    )
  })

  it('no domains: the knowledge base', () => {
    expect(traceFor('Most people get it in two days.')).toBe('Answered from the LandedNZ knowledge base')
  })
})
