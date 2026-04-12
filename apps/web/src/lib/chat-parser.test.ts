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
})

describe('parseResponse — steps detection', () => {
  it('detects numbered list "1. item" → StepsResponse', () => {
    const text = `To get an IRD number:\n\n1. Complete the IR742 form\n2. Submit to IRD\n3. Wait 8-10 days`
    const result = parseResponse(text)
    expect(result.content.type).toBe('steps')
    if (result.content.type === 'steps') {
      expect(result.content.steps).toHaveLength(3)
      expect(result.content.steps[0].text).toBe('Complete the IR742 form')
      expect(result.content.intro).toBe('To get an IRD number:')
    }
  })

  it('detects "1) item" format → StepsResponse', () => {
    const text = '1) Apply online\n2) Provide ID\n3) Confirm'
    const result = parseResponse(text)
    expect(result.content.type).toBe('steps')
  })

  it('detects "Step 1: item" format → StepsResponse', () => {
    const text = 'Step 1: Apply for IRD\nStep 2: Get bank account'
    const result = parseResponse(text)
    expect(result.content.type).toBe('steps')
  })

  it('strips markdown from step text', () => {
    const text = '1. Complete the **IR742** form\n2. Visit *ird.govt.nz*'
    const result = parseResponse(text)
    if (result.content.type === 'steps') {
      expect(result.content.steps[0].text).toBe('Complete the IR742 form')
      expect(result.content.steps[1].text).toBe('Visit ird.govt.nz')
    }
  })

  it('single list item does NOT trigger steps (needs 2+)', () => {
    const text = '1. Just one step'
    const result = parseResponse(text)
    expect(result.content.type).toBe('plain')
  })
})

describe('parseResponse — checklist detection', () => {
  it('detects bullet list + document keywords → ChecklistResponse', () => {
    const text = `You need the following documents:\n\n- Passport\n- NZ visa\n- Proof of address`
    const result = parseResponse(text)
    expect(result.content.type).toBe('checklist')
    if (result.content.type === 'checklist') {
      expect(result.content.items).toHaveLength(3)
      expect(result.content.items[0].text).toBe('Passport')
    }
  })

  it('marks items as required by default', () => {
    const text = '- Passport\n- Bank statement\nyou need these documents'
    const result = parseResponse(text)
    if (result.content.type === 'checklist') {
      expect(result.content.items[0].required).toBe(true)
    }
  })

  it('marks items as optional when keywords present', () => {
    const text = 'Documents required:\n- Passport\n- Reference letter (optional)\n- Bank statement'
    const result = parseResponse(text)
    if (result.content.type === 'checklist') {
      const optional = result.content.items.find(i => i.text.includes('Reference letter'))
      expect(optional?.required).toBe(false)
    }
  })

  it('bullet list WITHOUT document keywords → StepsResponse', () => {
    const text = 'Here is what to do:\n- Call IRD first\n- Then visit in person\n- Bring your ID'
    const result = parseResponse(text)
    expect(result.content.type).toBe('steps')
  })
})

describe('parseResponse — alert detection', () => {
  it('short urgency response → AlertResponse', () => {
    const text = 'Your visa expires soon. You must apply for renewal immediately to avoid overstay penalties.'
    const result = parseResponse(text)
    expect(result.content.type).toBe('alert')
  })

  it('long response with urgency keywords → NOT alert (uses list/plain instead)', () => {
    const text = `To renew your visa before it expires:\n\n1. Log into Immigration Online\n2. Select visa renewal\n3. Pay the fee\n4. Submit and wait\n\nApply immediately to avoid delays.`
    const result = parseResponse(text)
    // Should be steps, not alert — urgency is just context, not the primary content
    expect(result.content.type).toBe('steps')
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

describe('parseResponse — sources', () => {
  it('extracts NZ domains from response text', () => {
    const text = 'Apply at ird.govt.nz or visit immigration.govt.nz for details.'
    const result = parseResponse(text)
    expect(result.sources).toContain('ird.govt.nz')
    expect(result.sources).toContain('immigration.govt.nz')
  })

  it('deduplicates sources', () => {
    const text = 'Visit ird.govt.nz to apply. More info at ird.govt.nz.'
    const result = parseResponse(text)
    expect(result.sources.filter(s => s === 'ird.govt.nz')).toHaveLength(1)
  })

  it('returns empty sources when none found', () => {
    const text = 'ACC covers all NZ residents.'
    const result = parseResponse(text)
    expect(result.sources).toHaveLength(0)
  })
})