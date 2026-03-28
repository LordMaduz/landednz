import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { ProgressBar } from './ProgressBar'

describe('ProgressBar', () => {
  it('renders without crash', () => {
    render(<ProgressBar value={50} />)
    expect(screen.getByRole('progressbar')).toBeInTheDocument()
  })

  it('renders deterministic mode with value', () => {
    const { container } = render(<ProgressBar value={75} />)
    const progressbar = container.querySelector('[role="progressbar"]')
    expect(progressbar).toHaveAttribute('aria-valuenow', '75')
  })

  it('renders indeterminate mode', () => {
    render(<ProgressBar />)
    expect(screen.getByRole('progressbar')).toBeInTheDocument()
  })
})