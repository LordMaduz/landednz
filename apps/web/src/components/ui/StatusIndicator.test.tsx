import React from 'react'
import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { StatusIndicator } from './StatusIndicator'

describe('StatusIndicator', () => {
  it('renders without crash', () => {
    render(<StatusIndicator state="complete" />)
    // StatusIndicator renders an inline SVG, so we check for svg element
    expect(document.querySelector('svg')).toBeInTheDocument()
  })

  it('renders different states', () => {
    render(<StatusIndicator state="in_progress" size="sm" />)
    expect(document.querySelector('svg')).toBeInTheDocument()
  })

  it('renders loading state', () => {
    render(<StatusIndicator state="loading" />)
    expect(document.querySelector('svg')).toBeInTheDocument()
  })
})