import { describe, it, expect } from 'vitest'
import { parseResponse, stripMarkdown } from './chat-parser'

describe('stripMarkdown', () => {
  it('removes bold markers', () => {
    expect(stripMarkdown('Visit **ird.govt.nz** today')).toBe('Visit ird.govt.nz today')
  })
  it('removes italic markers', () => {
    expect(stripMarkdown('*important* note')).toBe('important note')
  })
  it('removes inline code markers', () => {
    expect(stripMarkdown('use `IR742` form')).toBe('use IR742 form')
  })
  it('handles no markdown', () => {
    expect(stripMarkdown('plain text')).toBe('plain text')
  })

  it('removes headers and horizontal rules', () => {
    expect(stripMarkdown('# Main Title\n\n## Subtitle\n\n---\n\nContent here')).toBe('Main Title Subtitle Content here')
  })

  it('removes complex markdown formatting', () => {
    expect(stripMarkdown('## What I can tell you\n\n---\n\n- Point **one**\n- Point *two*')).toBe('What I can tell you - Point one - Point two')
  })
})

describe('parseResponse — JSON parsing', () => {
  it('parses valid JSON StepsResponse', () => {
    const jsonText = JSON.stringify({
      type: 'steps',
      intro: 'To get an IRD number',
      steps: [
        { text: 'Complete the IR742 form' },
        { text: 'Submit to IRD' },
        { text: 'Wait 8-10 days' }
      ],
      sources: ['ird.govt.nz']
    })
    const result = parseResponse(jsonText)
    expect(result.content.type).toBe('steps')
    if (result.content.type === 'steps') {
      expect(result.content.steps).toHaveLength(3)
      expect(result.content.steps[0].text).toBe('Complete the IR742 form')
      expect(result.content.intro).toBe('To get an IRD number')
    }
    expect(result.sources).toEqual(['ird.govt.nz'])
  })

  it('parses valid JSON ChecklistResponse', () => {
    const jsonText = JSON.stringify({
      type: 'checklist',
      intro: 'Documents required',
      items: [
        { text: 'Passport', required: true },
        { text: 'Reference letter', required: false }
      ],
      sources: ['immigration.govt.nz']
    })
    const result = parseResponse(jsonText)
    expect(result.content.type).toBe('checklist')
    if (result.content.type === 'checklist') {
      expect(result.content.items).toHaveLength(2)
      expect(result.content.items[0].text).toBe('Passport')
      expect(result.content.items[0].required).toBe(true)
      expect(result.content.items[1].required).toBe(false)
    }
  })

  it('parses valid JSON AlertResponse', () => {
    const jsonText = JSON.stringify({
      type: 'alert',
      severity: 'warning',
      title: 'Urgent',
      message: 'Your visa expires soon',
      sources: ['immigration.govt.nz']
    })
    const result = parseResponse(jsonText)
    expect(result.content.type).toBe('alert')
    if (result.content.type === 'alert') {
      expect(result.content.severity).toBe('warning')
      expect(result.content.title).toBe('Urgent')
      expect(result.content.message).toBe('Your visa expires soon')
    }
  })

  it('parses valid JSON PlainResponse', () => {
    const jsonText = JSON.stringify({
      type: 'plain',
      text: 'ACC is the Accident Compensation Corporation',
      sources: ['acc.co.nz']
    })
    const result = parseResponse(jsonText)
    expect(result.content.type).toBe('plain')
    if (result.content.type === 'plain') {
      expect(result.content.text).toBe('ACC is the Accident Compensation Corporation')
    }
  })

  it('adds default header when missing', () => {
    const jsonText = JSON.stringify({
      type: 'plain',
      text: 'Some content'
    })
    const result = parseResponse(jsonText)
    if (result.content.type === 'plain') {
      expect(result.content.header).toBe('Based on official NZ sources')
    }
  })

  it('falls back to plain text for invalid JSON', () => {
    const invalidText = 'This is not JSON markdown text'
    const result = parseResponse(invalidText)
    expect(result.content.type).toBe('plain')
    if (result.content.type === 'plain') {
      expect(result.content.text).toBe('This is not JSON markdown text')
      expect(result.content.header).toBe('Based on official NZ sources')
    }
  })
})

describe('parseResponse — plain text fallback', () => {
  it('plain Q&A → PlainTextResponse', () => {
    const text = 'ACC is the Accident Compensation Corporation. It provides injury cover for everyone in New Zealand, including migrants on work visas.'
    const result = parseResponse(text)
    expect(result.content.type).toBe('plain')
  })

  it('strips markdown from plain text', () => {
    const text = 'ACC stands for **Accident Compensation Corporation**. It covers *all* residents.'
    const result = parseResponse(text)
    if (result.content.type === 'plain') {
      expect(result.content.text).toBe('ACC stands for Accident Compensation Corporation. It covers all residents.')
    }
  })
})

describe('parseResponse — fallback markdown parsing', () => {
  it('extracts NZ domains from markdown fallback text', () => {
    const text = 'Apply at ird.govt.nz or visit immigration.govt.nz for details.'
    const result = parseResponse(text)
    expect(result.sources).toContain('ird.govt.nz')
    expect(result.sources).toContain('immigration.govt.nz')
  })

  it('deduplicates sources in fallback mode', () => {
    const text = 'Visit ird.govt.nz to apply. More info at ird.govt.nz.'
    const result = parseResponse(text)
    expect(result.sources.filter(s => s === 'ird.govt.nz')).toHaveLength(1)
  })

  it('handles empty sources in fallback', () => {
    const text = 'ACC covers all NZ residents.'
    const result = parseResponse(text)
    expect(result.content.type).toBe('plain')
    expect(result.sources).toHaveLength(0)
  })
})