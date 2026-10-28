import { routeProgress, stageLabels, terrainY, TRACK_FLAGS } from '@/lib/route-progress'
import type { RouteView } from '@/lib/route-view'

const pt = (x: number, y: number) => `${x},${y.toFixed(1)}`
const XS = Array.from({ length: 51 }, (_, i) => i * 20)

// Home's track: a hill profile with the walked part filled, a flag per stage and a "You" pin.
// It only draws; the SVG is aria-hidden and the progress is also written out as text.
export function RouteTrack({ route, arrivalDate, now, height }: { route: RouteView; arrivalDate: string; now: Date; height: 96 | 120 }) {
  const { x: dx, label, summary, passed } = routeProgress(route, arrivalDate, now)
  const profile = XS.map(x => [x, terrainY(x)] as const)
  const line = "M" + profile.map(([x, y]) => pt(x, y)).join(" L")
  const walked = "M" + [...profile.filter(([x]) => x <= dx), [dx, terrainY(dx)] as const].map(([x, y]) => pt(x, y)).join(" L")
  const contour = (off: number) => "M" + profile.map(([x, y]) => pt(x, y + off)).join(" L")
  const edge = dx > 900 ? "end" : dx < 100 ? "start" : undefined

  return (
    <div className="track">
      <div className="track-rv" style={{ height, marginTop: 18 }}>
        <svg aria-hidden="true" viewBox={`0 0 1000 ${height}`} preserveAspectRatio="none" height={height}>
          <defs>
            <linearGradient id="track-walk" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" className="track-grad" stopOpacity=".22" />
              <stop offset="1" className="track-grad" stopOpacity="0" />
            </linearGradient>
          </defs>
          {[12, 24].map(off => <path key={off} d={contour(off)} className="track-contour" />)}
          <path d={`${walked} L${dx},${height} L0,${height} Z`} fill="url(#track-walk)" />
          <path d={line} className="track-ahead" />
          <path d={walked} className="track-walked" />
        </svg>
        {TRACK_FLAGS.map((fx, i) => (
          <div key={fx} className="track-pin" style={{ left: `${fx / 10}%`, top: terrainY(fx) - 10 }}>
            <svg aria-hidden="true" width="10" height="20" viewBox="0 0 10 20">
              <path d="M1 20V1l8 4-8 4" className={passed[i] ? "track-flag track-flag-on" : "track-flag"} />
            </svg>
          </div>
        ))}
        <div className="track-pin track-you" data-edge={edge} style={{ left: `${dx / 10}%`, top: terrainY(dx) }}>
          <span className="track-you-tag">{label}</span>
          <span className="track-you-dot" />
        </div>
      </div>
      <ol className="track-stages">
        {stageLabels(route, arrivalDate, now).map((s, i) => (
          <li key={s.id} className={`track-stage${s.now ? "" : " track-stage-off"}${i === 0 || i === 4 ? " track-edge" : ""}`}>
            <span className="track-stage-name">{s.name}</span>
            <span className="text-muted">{s.state}</span>
          </li>
        ))}
      </ol>
      <p className="track-sum">{summary}</p>
    </div>
  )
}
