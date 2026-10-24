import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import Privacy, { metadata as privacyMeta } from './privacy/page'
import Terms, { metadata as termsMeta } from './terms/page'

const headings = (level: number) => screen.getAllByRole('heading', { level }).map(h => h.textContent)

describe('Privacy', () => {
  it('has the board title, date and five sections', () => {
    render(<Privacy />)
    expect(headings(1)).toEqual(['Privacy'])
    expect(screen.getByText('Last updated 24 October 2026')).toBeInTheDocument()
    expect(headings(2)).toEqual(['What LandedNZ keeps', 'How it is used', 'Who else handles it', 'Your rights', 'Contact'])
    expect(privacyMeta.title).toBe('Privacy')
  })

  it('marks the placeholders the owner fills in', () => {
    render(<Privacy />)
    expect(Array.from(document.querySelectorAll('.ph')).map(el => el.textContent)).toEqual([
      '[hosting provider and region]',
      '[privacy contact email]',
    ])
  })
})

describe('Terms', () => {
  it('uses the same template with its own sections', () => {
    render(<Terms />)
    expect(headings(1)).toEqual(['Terms'])
    expect(screen.getByText('Last updated 24 October 2026')).toBeInTheDocument()
    expect(headings(2)).toEqual([
      'What LandedNZ is',
      'General information, not advice',
      'Your account',
      'Acceptable use',
      'Changes',
      'Contact',
    ])
    expect(document.querySelectorAll('.ph').length).toBeGreaterThan(0)
    expect(termsMeta.title).toBe('Terms')
  })
})
