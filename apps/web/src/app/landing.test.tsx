import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import Landing, { metadata } from './page'

describe('Landing', () => {
  it('has one h1, one primary CTA to onboarding and a quiet sign-in link', () => {
    render(<Landing />)
    expect(screen.getAllByRole('heading', { level: 1 }).map(h => h.textContent)).toEqual(['Know what to do next in New Zealand'])
    expect(screen.getAllByRole('link', { name: 'Build my roadmap' })).toHaveLength(1)
    expect(screen.getByRole('link', { name: 'Build my roadmap' })).toHaveAttribute('href', '/onboarding')
    expect(screen.getByRole('link', { name: 'Sign in' })).toHaveAttribute('href', '/signin')
    expect(document.querySelectorAll('a.bg-ink')).toHaveLength(1)
  })

  it('has the three feature headings', () => {
    render(<Landing />)
    expect(screen.getAllByRole('heading', { level: 2 }).map(h => h.textContent)).toEqual([
      'In the right order',
      'From official sources',
      'Answers about your roadmap',
    ])
  })

  it('labels the preview figure and hides its contents', () => {
    render(<Landing />)
    const figure = screen.getByRole('figure', { name: 'Example: a roadmap on day 3' })
    const children = Array.from(figure.children)
    expect(children.length).toBeGreaterThan(0)
    for (const child of children) expect(child).toHaveAttribute('aria-hidden', 'true')
    expect(within(figure).getByText('7 of 20 tasks done')).toBeInTheDocument()
  })

  it('sets title, description and WebApplication JSON-LD', () => {
    expect(metadata.title).toBe('LandedNZ: your settling-in roadmap for New Zealand')
    expect(metadata.description).toBe(
      'Answer five questions and get a step-by-step roadmap for your first months in New Zealand, checked against official sources.',
    )
    render(<Landing />)
    const ld = document.querySelector('script[type="application/ld+json"]')
    expect(JSON.parse(ld?.textContent ?? '{}')['@type']).toBe('WebApplication')
  })
})
