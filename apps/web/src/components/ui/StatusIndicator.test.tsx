import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { StatusIndicator } from './StatusIndicator'

describe('StatusIndicator', () => {
  it('renders without crash', () => {
    render(<StatusIndicator state="complete" />)
    expect(screen.getByRole('img')).toBeInTheDocument()
  })

  it('renders different states', () => {
    render(<StatusIndicator state="in_progress" size="sm" />)
    expect(screen.getByRole('img')).toBeInTheDocument()
  })

  it('renders loading state', () => {
    render(<StatusIndicator state="loading" />)
    expect(screen.getByRole('img')).toBeInTheDocument()
  })
})
