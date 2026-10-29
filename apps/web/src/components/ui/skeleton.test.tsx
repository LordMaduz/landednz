import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ApiDown } from '@/components/chrome/api-down'
import { Skeleton } from './skeleton'

describe('Skeleton', () => {
  it('is a hidden-until-300ms wash block', () => {
    const { container } = render(<Skeleton className="h-4" />)
    expect(container.firstChild).toHaveClass('skeleton', 'bg-wash', 'h-4')
    expect(container.firstChild).toHaveAttribute('aria-hidden', 'true')
  })
})

describe('ApiDown', () => {
  it('is a Card with role=alert and one way forward', () => {
    render(<ApiDown onRetry={() => {}} />)
    const alert = screen.getByRole('alert')
    expect(alert).toHaveClass('bg-white', 'shadow-lift')
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent("Can't reach LandedNZ")
    expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument()
  })
})
