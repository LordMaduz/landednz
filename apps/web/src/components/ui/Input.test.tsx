import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Input } from './Input'

describe('Input', () => {
  it('renders text input without crash', () => {
    render(<Input placeholder="Test input" />)
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })

  it('renders textarea variant', () => {
    render(<Input variant="textarea" placeholder="Test textarea" />)
    expect(screen.getByDisplayValue('')).toBeInTheDocument() // textarea is also a textbox role, use different selector
  })

  it('renders with label', () => {
    render(<Input label="Email" placeholder="test@example.com" />)
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
  })
})