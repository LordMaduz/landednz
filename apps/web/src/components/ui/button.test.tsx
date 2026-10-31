import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Button } from './button'

describe('Button', () => {
  it('defaults to primary: action fill with the inverse state layer, control role height (44 phone, 40 tablet, 36 desktop)', () => {
    render(<Button>Start</Button>)
    expect(screen.getByRole('button', { name: 'Start' })).toHaveClass('bg-action', 'text-fg-on-action', 'state-inverse', 'min-h-control')
  })

  it('secondary is the surface with a border and the ink state layer', () => {
    render(<Button variant="secondary">Ask</Button>)
    expect(screen.getByRole('button', { name: 'Ask' })).toHaveClass('bg-surface', 'border-border', 'state')
  })

  it('danger fills with the danger colour and the inverse layer', () => {
    render(<Button variant="danger">Delete</Button>)
    expect(screen.getByRole('button', { name: 'Delete' })).toHaveClass('bg-danger', 'state-inverse')
  })

  it('text is a link-coloured action with no state layer', () => {
    render(<Button variant="text">Change</Button>)
    const button = screen.getByRole('button', { name: 'Change' })
    expect(button).toHaveClass('text-link')
    expect(button).not.toHaveClass('state', 'state-inverse')
  })

  it('disabled is muted, takes no state layer and ignores clicks', () => {
    const onClick = vi.fn()
    render(<Button disabled onClick={onClick}>Continue</Button>)
    const button = screen.getByRole('button', { name: 'Continue' })
    expect(button).toBeDisabled()
    expect(button).toHaveClass('text-fg-muted')
    expect(button).not.toHaveClass('state')
    expect(button).not.toHaveClass('state-inverse')
    fireEvent.click(button)
    expect(onClick).not.toHaveBeenCalled()
  })

  it('size sm takes the small control role', () => {
    render(<Button size="sm">Edit</Button>)
    expect(screen.getByRole('button', { name: 'Edit' })).toHaveClass('min-h-control-sm', 'px-3')
  })

  it('size lg takes the large control role', () => {
    render(<Button size="lg">Build my roadmap</Button>)
    expect(screen.getByRole('button', { name: 'Build my roadmap' })).toHaveClass('min-h-control-lg', 'px-6')
  })

  it('size icon is a square control (44 px on phones)', () => {
    render(<Button size="icon" variant="ghost" aria-label="Close">×</Button>)
    expect(screen.getByRole('button', { name: 'Close' })).toHaveClass('size-control')
  })

  it('render keeps the link it is given', () => {
    render(<Button render={<a href="/x" />} nativeButton={false}>Go</Button>)
    // Base UI gives a non-native button role="button"; the href stays
    expect(screen.getByText('Go').closest('a')).toHaveAttribute('href', '/x')
  })
})
