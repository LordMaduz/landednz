import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Card, CardHead } from './card'

describe('Card', () => {
  it('is raised by default: card radius, subtle border, surface, raised shadow', () => {
    const { container } = render(<Card>x</Card>)
    expect(container.firstChild).toHaveClass('rounded-card', 'border-border-subtle', 'bg-surface', 'p-card-padding', 'shadow-raised')
  })

  it('plain drops the shadow', () => {
    const { container } = render(<Card variant="plain">x</Card>)
    expect(container.firstChild).toHaveClass('rounded-card', 'border-border-subtle', 'bg-surface')
    expect(container.firstChild).not.toHaveClass('shadow-raised')
  })

  it('labels the section by its head title', () => {
    render(
      <Card aria-labelledby="plan-title">
        <CardHead title="Your plan" titleId="plan-title" />
      </Card>,
    )
    expect(screen.getByRole('region', { name: 'Your plan' })).toBeInTheDocument()
  })
})
