import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Card } from './Card'

describe('Card', () => {
  it('renders without crash', () => {
    render(<Card>Test Content</Card>)
    expect(screen.getByText('Test Content')).toBeInTheDocument()
  })

  it('renders with different states', () => {
    render(<Card state="selected">Selected Card</Card>)
    expect(screen.getByText('Selected Card')).toBeInTheDocument()
  })

  it('renders with different padding variants', () => {
    render(<Card padding="compact">Compact Card</Card>)
    expect(screen.getByText('Compact Card')).toBeInTheDocument()
  })
})