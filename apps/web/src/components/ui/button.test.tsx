import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Button } from './button'

describe('Button', () => {
  it('defaults to primary: ink fill, 40 px target (44 on phones)', () => {
    render(<Button>Start</Button>)
    expect(screen.getByRole('button', { name: 'Start' })).toHaveClass('bg-ink', 'min-h-10', 'max-narrow:min-h-11')
  })

  it('quiet has the border colour', () => {
    render(<Button variant="quiet">Ask</Button>)
    expect(screen.getByRole('button', { name: 'Ask' })).toHaveClass('border-border', 'bg-white')
  })

  it('disabled primary is wash with muted text', () => {
    render(<Button disabled>Continue</Button>)
    const button = screen.getByRole('button', { name: 'Continue' })
    expect(button).toBeDisabled()
    expect(button).toHaveClass('bg-wash', 'text-muted')
    expect(button).not.toHaveClass('bg-ink')
  })

  it('size sm is 32 px tall', () => {
    render(<Button size="sm">Edit</Button>)
    expect(screen.getByRole('button', { name: 'Edit' })).toHaveClass('min-h-8', 'px-3')
  })

  it('size lg is 48 px tall', () => {
    render(<Button size="lg">Build my roadmap</Button>)
    expect(screen.getByRole('button', { name: 'Build my roadmap' })).toHaveClass('min-h-12', 'px-6')
  })
})
