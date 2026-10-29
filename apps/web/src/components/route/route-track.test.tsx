import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { buildRouteView } from '@/lib/route-view'
import { apiTask, priya, roadmap } from '@/test/roadmap-fixtures'
import { routeProgress } from '@/lib/route-progress'
import { RouteTrack } from './route-track'

const ARRIVAL = '2026-10-21'
const NOW = new Date('2026-10-23T10:00:00+13:00') // day 3, Fri 23 Oct
const route = buildRouteView(priya(), ARRIVAL, NOW)
const draw = (variant: 'compact' | 'tall', r = route, now = NOW) =>
  render(<RouteTrack route={r} arrivalDate={ARRIVAL} now={now} variant={variant} />)

describe('RouteTrack', () => {
  it('gives each track its own gradient id', () => {
    const { container } = render(<>{(['compact', 'tall'] as const).map(v => <RouteTrack key={v} route={route} arrivalDate={ARRIVAL} now={NOW} variant={v} />)}</>)
    expect(new Set([...container.querySelectorAll('linearGradient')].map(g => g.id)).size).toBe(2)
  })

  it('exposes the progress as text, not the drawing', () => {
    const { container } = draw('compact')
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
    const p = container.querySelector('.track-sum')!
    expect(p).toHaveTextContent(routeProgress(route, ARRIVAL, NOW).summary)
    expect(p.querySelector('b')).toHaveTextContent('Week 1')
  })

  it('tall draws an arc per task the next one unlocks, with the note', () => {
    const { container } = draw('tall')
    expect(container.querySelectorAll('path.track-arc')).toHaveLength(2)
    expect(screen.getByText('Dotted lines: unlocked by your IRD number')).toBeInTheDocument()
  })

  it('tall without unlocks has neither', () => {
    const r = buildRouteView(roadmap([apiTask('T08')]), ARRIVAL, NOW)
    const { container } = draw('tall', r)
    expect(container.querySelectorAll('path.track-arc')).toHaveLength(0)
    expect(screen.queryByText(/Dotted lines/)).toBeNull()
  })

  it('compact never draws arcs', () => {
    const { container } = draw('compact')
    expect(container.querySelectorAll('path.track-arc')).toHaveLength(0)
    expect(screen.queryByText(/Dotted lines/)).toBeNull()
  })

  it('labels Today on the road only after arrival', () => {
    draw('tall')
    expect(screen.getByText('Today · Fri 23 Oct')).toBeInTheDocument()
  })

  it('has no Today label before arrival and counts the days to go', () => {
    const before = new Date('2026-10-19T10:00:00+13:00')
    const r = buildRouteView(priya(), ARRIVAL, before)
    const { container } = draw('tall', r, before)
    expect(screen.queryByText(/^Today/)).toBeNull()
    expect(container.querySelector('.track-today')).toBeNull()
    expect(screen.getByText('You · 2 days to go')).toBeInTheDocument()
  })

  it('draws one dot per task with its state', () => {
    const { container } = draw('compact')
    const dots = [...container.querySelectorAll('.track-dot')]
    expect(dots).toHaveLength(20)
    expect(new Set(dots.map(d => d.getAttribute('data-state')))).toEqual(new Set(['done', 'blocked', 'open']))
  })

  it('compact phone row: behind, now, Roadmap link', () => {
    const { container } = draw('compact')
    const row = container.querySelector('.track-phone')!
    expect(row).toHaveTextContent('Arrival ✓')
    expect(row).toHaveTextContent('Week 1 · now')
    expect(row.querySelector('a')).toHaveAttribute('href', '/app/roadmap')
    expect(row).toHaveTextContent('Roadmap')
  })

  it('tall phone row: days left and what is next', () => {
    const { container } = draw('tall')
    const row = container.querySelector('.track-phone')!
    expect(row).toHaveTextContent('Week 1 · 5 days left')
    expect(row).toHaveTextContent('Month 1')
    expect(row.querySelector('a')).toBeNull()
  })
})
