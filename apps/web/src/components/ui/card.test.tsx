import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Card, CardHead } from './card'

describe('Card', () => {
  it('renders a section with the landing-card classes', () => {
    const { container } = render(<Card>x</Card>)
    expect(container.firstChild).toHaveClass('rounded-surface', 'border-hairline', 'bg-white', 'shadow-lift')
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
