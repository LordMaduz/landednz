import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { buildRouteView } from '@/lib/route-view'
import { priya } from '@/test/roadmap-fixtures'
import { StageList } from './stage-list'

const view = buildRouteView(priya(), '2026-10-21', new Date('2026-10-23T10:00:00+13:00'))

describe('StageList', () => {
  it('waypoints are hidden from assistive tech', () => {
    const { container } = render(<StageList legs={view.legs} onOpen={() => {}} />)
    const dots = container.querySelectorAll('[data-waypoint]')
    expect(dots.length).toBeGreaterThan(0)
    dots.forEach(d => expect(d.closest('[aria-hidden="true"]') ?? d.getAttribute('aria-hidden')).toBeTruthy())
  })

  it('with no current stage, every stage is under Other stages', () => {
    render(<StageList legs={view.legs.map(l => ({ ...l, state: 'open' as const }))} onOpen={() => {}} />)
    expect(screen.getAllByRole('button', { name: /^Show / })).toHaveLength(view.legs.length)
    expect(screen.queryByText('Up next')).toBeNull()
  })
})
