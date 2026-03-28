import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Tooltip } from './Tooltip'

describe('Tooltip', () => {
  it('renders without crash', () => {
    render(
      <Tooltip content="Test tooltip">
        <button>Hover me</button>
      </Tooltip>
    )
    expect(screen.getByRole('button')).toBeInTheDocument()
    expect(screen.getByText('Hover me')).toBeInTheDocument()
  })

  it('renders with different positions', () => {
    render(
      <Tooltip content="Bottom tooltip" position="bottom">
        <span>Test trigger</span>
      </Tooltip>
    )
    expect(screen.getByText('Test trigger')).toBeInTheDocument()
  })
})