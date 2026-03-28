import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Badge } from './Badge'

describe('Badge', () => {
  it('renders without crash', () => {
    render(<Badge variant="phase">Phase Badge</Badge>)
    expect(screen.getByText('Phase Badge')).toBeInTheDocument()
  })

  it('renders premium variant with icon', () => {
    render(<Badge variant="premium">Premium</Badge>)
    expect(screen.getByText('Premium')).toBeInTheDocument()
  })

  it('renders difficulty variants', () => {
    render(<Badge variant="difficulty-easy">Easy</Badge>)
    expect(screen.getByText('Easy')).toBeInTheDocument()
  })
})