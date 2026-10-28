import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Calendar } from './calendar'

function setup(value: string | null = '2026-10-30') {
  const onChange = vi.fn()
  render(<><h2 id="lbl">When do you land?</h2><Calendar value={value} onChange={onChange} today="2026-10-29" labelledBy="lbl" /></>)
  return onChange
}
const cells = () => screen.getAllByRole('gridcell')

describe('Calendar', () => {
  it('has a grid with one tabbable cell, the chosen day, and no disabled cells', () => {
    setup()
    expect(screen.getByRole('grid')).toHaveAccessibleName('When do you land?')
    expect(cells()).toHaveLength(35)
    const tabbable = cells().filter(c => c.tabIndex === 0)
    expect(tabbable).toHaveLength(1)
    expect(tabbable[0]).toHaveAttribute('aria-selected', 'true')
    expect(tabbable[0]).toHaveTextContent('30')
    expect(cells().filter(c => c.getAttribute('aria-selected') === 'true')).toHaveLength(1)
    expect(cells().filter(c => c.hasAttribute('data-outside'))).toHaveLength(4)
    expect(cells().some(c => c.hasAttribute('aria-disabled'))).toBe(false)
    expect(screen.getByText('Friday 30 October 2026')).toBeInTheDocument()
    expect(screen.getByText('Tomorrow')).toBeInTheDocument()
  })

  it('arrow keys move focus and the roving tabindex; Enter selects', () => {
    const onChange = setup()
    const grid = screen.getByRole('grid')
    cells().find(c => c.tabIndex === 0)!.focus()
    fireEvent.keyDown(grid, { key: 'ArrowRight' })
    const now = cells().find(c => c.tabIndex === 0)!
    expect(now).toHaveTextContent('31')
    expect(now).toHaveFocus()
    fireEvent.keyDown(grid, { key: 'Enter' })
    expect(onChange).toHaveBeenCalledWith('2026-10-31')
  })

  it('the next-month button changes the heading and the live region', () => {
    setup()
    const heading = screen.getByText('October 2026')
    expect(heading).toHaveAttribute('aria-live', 'polite')
    fireEvent.click(screen.getByRole('button', { name: 'Next month' }))
    expect(heading).toHaveTextContent('November 2026')
  })

  it('no value: no landing row, today is the focus stop', () => {
    setup(null)
    expect(screen.queryByText(/You land on/)).toBeNull()
    expect(cells().find(c => c.tabIndex === 0)).toHaveTextContent('29')
  })
})
