import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { buildRouteView } from '@/lib/route-view'
import { priya } from '@/test/roadmap-fixtures'
import { RouteRail } from './route-rail'
import { RouteStrip } from './route-strip'

const view = buildRouteView(priya(), '2026-10-21')

describe('RouteRail', () => {
  it('folds done and locked legs behind a Show button named after the leg', () => {
    render(<RouteRail legs={view.legs} onOpen={() => {}} />)
    const show = screen.getByRole('button', { name: 'Show Before you flew tasks' })
    expect(show).toHaveAttribute('aria-expanded', 'false')
    expect(screen.getByRole('button', { name: 'Show Later tasks' })).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByText('Research Auckland suburbs')).toBeNull()

    fireEvent.click(show)
    expect(screen.getByRole('button', { name: 'Hide Before you flew tasks' })).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByText('Research Auckland suburbs')).toBeInTheDocument()
  })

  it('open legs show their tasks; each leg heading carries its count', () => {
    render(<RouteRail legs={view.legs} onOpen={() => {}} />)
    expect(screen.getByRole('heading', { name: 'Week 1: 0 of 3 done, to 28 Oct' })).toBeInTheDocument()
    expect(screen.getByText('Needs your IRD number first')).toBeInTheDocument()
  })

  it('waypoints are hidden from assistive tech', () => {
    const { container } = render(<RouteRail legs={view.legs} onOpen={() => {}} />)
    const dots = container.querySelectorAll('[data-waypoint]')
    expect(dots.length).toBeGreaterThan(0)
    dots.forEach(d => expect(d.closest('[aria-hidden="true"]')).not.toBeNull())
  })

  it('a row opens its task; the current task can render as a card', () => {
    const onOpen = vi.fn()
    render(<RouteRail legs={view.legs} onOpen={onOpen} renderCurrent={t => <p>Card for {t.taskId}</p>} />)
    expect(screen.getByText('Card for T08')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /Choose your KiwiSaver fund/ }))
    expect(onOpen).toHaveBeenCalledWith('T10')
  })

  it('marks the selected task row', () => {
    render(<RouteRail legs={view.legs} onOpen={() => {}} selectedTaskId="T10" />)
    expect(screen.getByRole('button', { name: /Choose your KiwiSaver fund/ })).toHaveAttribute('aria-current', 'true')
  })
})

describe('RouteStrip', () => {
  it('one bead per task, sr text per leg, only the current leg labelled on narrow screens', () => {
    const { container } = render(<RouteStrip legs={view.legs} />)
    expect(container.querySelectorAll('[data-waypoint]')).toHaveLength(view.total)
    const legs = screen.getAllByRole('listitem')
    expect(within(legs[2]).getByText('Week 1: 0 of 3 done')).toHaveClass('sr-only')
    expect(legs[2].querySelector('[data-leg-label]')).not.toHaveClass('max-narrow:hidden')
    expect(legs[0].querySelector('[data-leg-label]')).toHaveClass('max-narrow:hidden')
  })
})
