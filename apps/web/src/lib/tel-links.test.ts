import { describe, expect, it } from 'vitest'
import { linkPhones } from './tel-links'

describe('linkPhones', () => {
  it('splits a 0800 number out of the text', () => {
    expect(linkPhones('Call Healthline on 0800 611 116.')).toEqual([
      'Call Healthline on ',
      { tel: '0800611116', text: '0800 611 116' },
      '.',
    ])
  })

  it('reads the 2-2-2 grouping and 0508 numbers', () => {
    expect(linkPhones('0800 28 29 26')).toEqual([{ tel: '0800282926', text: '0800 28 29 26' }])
    expect(linkPhones('Try 0508 123 456')).toEqual(['Try ', { tel: '0508123456', text: '0508 123 456' }])
  })

  it('a text with no number comes back whole', () => {
    expect(linkPhones('Apply online at ird.govt.nz.')).toEqual(['Apply online at ird.govt.nz.'])
  })
})
