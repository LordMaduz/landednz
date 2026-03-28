import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Skeleton } from './Skeleton'

describe('Skeleton', () => {
  it('renders without crash', () => {
    render(<Skeleton />)
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('renders different variants', () => {
    render(<Skeleton variant="circle" />)
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('renders text-line variant', () => {
    render(<Skeleton variant="text-line" />)
    expect(screen.getByRole('status')).toBeInTheDocument()
  })
})