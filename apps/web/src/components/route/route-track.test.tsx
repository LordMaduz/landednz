import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { buildRouteView } from '@/lib/route-view'
import { priya } from '@/test/roadmap-fixtures'
import { routeProgress } from '@/lib/route-progress'
import { RouteTrack } from './route-track'

const NOW = new Date('2026-10-23T10:00:00+13:00')
const route = buildRouteView(priya(), '2026-10-21', NOW)

describe('RouteTrack', () => {
  it('exposes the progress as text, not the drawing', () => {
    const { container } = render(<RouteTrack route={route} arrivalDate="2026-10-21" now={NOW} height={96} />)
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
    expect(screen.getByText('Week 1')).toBeInTheDocument()
    expect(screen.getByText(routeProgress(route, '2026-10-21', NOW).summary)).toBeInTheDocument()
  })
})
