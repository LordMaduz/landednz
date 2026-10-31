import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { LegalLayout } from '@/components/marketing/legal-page'
import { metadata as privacyMeta } from './privacy/page'
import { metadata as termsMeta } from './terms/page'

const headings = (level: number) => screen.getAllByRole('heading', { level }).map(h => h.textContent)
const USER = { name: 'Aroha Ngata', initials: 'AN', email: 'a@example.com' }

describe('Privacy', () => {
  it('has the board title, date and five sections', () => {
    render(<LegalLayout title="Privacy" updated="24 October 2026" file="privacy" user={null} />)
    expect(headings(1)).toEqual(['Privacy'])
    expect(screen.getByText('Last updated 24 October 2026')).toBeInTheDocument()
    expect(headings(2)).toEqual(['What LandedNZ keeps', 'How it is used', 'Who else handles it', 'Your rights', 'Contact'])
    expect(privacyMeta.title).toBe('Privacy')
  })

  it('has no placeholders left: production shows it', () => {
    render(<LegalLayout title="Privacy" updated="24 October 2026" file="privacy" user={null} />)
    expect(document.querySelectorAll('.ph')).toHaveLength(0)
    expect(screen.getByRole('link', { name: 'privacy@landednz.co.nz' })).toHaveAttribute('href', 'mailto:privacy@landednz.co.nz')
  })
})

describe('Terms', () => {
  it('uses the same template with its own sections', () => {
    render(<LegalLayout title="Terms" updated="24 October 2026" file="terms" user={null} />)
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
    expect(document.querySelectorAll('.ph')).toHaveLength(0)
    expect(termsMeta.title).toBe('Terms')
  })
})

describe('signed in', () => {
  it('uses the app frame: nav and account, no Sign in, no footer', () => {
    render(<LegalLayout title="Privacy" updated="24 October 2026" file="privacy" user={USER} />)
    expect(screen.getAllByRole('navigation', { name: 'Main' })).toHaveLength(2) // desktop nav + phone tab bar
    expect(screen.getByRole('button', { name: 'Account, Aroha Ngata' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Sign in' })).toBeNull()
    expect(document.querySelector('footer')).toBeNull()
    expect(headings(1)).toEqual(['Privacy'])
  })

  it('has a rail: section links and the other document', () => {
    render(<LegalLayout title="Privacy" updated="24 October 2026" file="privacy" user={USER} />)
    expect(screen.getByRole('link', { name: 'Your rights' })).toHaveAttribute('href', '#your-rights')
    expect(document.getElementById('your-rights')?.tagName).toBe('H2')
    expect(screen.getByRole('link', { name: 'Terms' })).toHaveAttribute('href', '/terms')
  })
})

describe('signed out', () => {
  it('keeps the public page', () => {
    render(<LegalLayout title="Privacy" updated="24 October 2026" file="privacy" user={null} />)
    expect(screen.getByRole('link', { name: 'Sign in' })).toBeInTheDocument()
    expect(screen.queryByRole('navigation', { name: 'Main' })).toBeNull()
  })
})
