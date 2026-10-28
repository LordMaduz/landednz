import { useId } from 'react'
import Link from 'next/link'
import { phoneStages, routeProgress, stageLabels, taskDots, terrainY, TRACK_FLAGS } from '@/lib/route-progress'
import { nzCalendarDate, weekdayDay } from '@/lib/nz-date'
import { unlocksOf, type RouteView } from '@/lib/route-view'

const pt = (x: number, y: number) => `${x},${y.toFixed(1)}`
const XS = Array.from({ length: 51 }, (_, i) => i * 20)
// Desktop road heights (the phone heights are in globals.css); the SVG scales to its box, so all marks sit at a % of it
const HEIGHT = { compact: 112, tall: 104 }

// The road: a hill profile with the walked part filled, a flag per stage, a dot per task, the Today line and a "You" pin.
// Tall also arcs from You to what the next task unlocks. It only draws; the SVG is aria-hidden and the progress is also written out as text.
export function RouteTrack({ route, arrivalDate, now, variant }: { route: RouteView; arrivalDate: string; now: Date; variant: 'compact' | 'tall' }) {
  const gid = `track-walk-${useId().replace(/:/g, '')}`
  const h = HEIGHT[variant]
  const { x: dx, walked, todayX, label, summary, passed } = routeProgress(route, arrivalDate, now)
  const phone = phoneStages(route, arrivalDate, now)
  const profile = XS.map(x => [x, terrainY(x)] as const)
  const line = "M" + profile.map(([x, y]) => pt(x, y)).join(" L")
  const walkedPath = "M" + [...profile.filter(([x]) => x <= walked), [walked, terrainY(walked)] as const].map(([x, y]) => pt(x, y)).join(" L")
  const contour = (off: number) => "M" + profile.map(([x, y]) => pt(x, y + off)).join(" L")
  const [stage, ...more] = summary.split(' · ') // the board bolds the stage name
  const edge = dx > 900 ? "end" : dx < 100 ? "start" : undefined
  const top = (y: number) => `${(y / h) * 100}%`

  const dots = taskDots(route)
  const next = route.current
  const unlocks = variant === 'tall' && next ? unlocksOf(route, next.taskId) : []
  const arcs = unlocks.flatMap(t => {
    const d = dots.find(o => o.taskId === t.taskId)
    if (!d) return []
    const [ya, yb] = [terrainY(dx), terrainY(d.x)]
    return [`M${pt(dx, ya)} Q${pt((dx + d.x) / 2, Math.min(ya, yb) - 10 - Math.abs(d.x - dx) / 25)} ${pt(d.x, yb)}`]
  })

  return (
    <div className="track" data-variant={variant}>
      <div className="track-rv">
        <svg aria-hidden="true" viewBox={`0 0 1000 ${h}`} preserveAspectRatio="none">
          <defs>
            <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" className="track-grad" stopOpacity=".22" />
              <stop offset="1" className="track-grad" stopOpacity="0" />
            </linearGradient>
          </defs>
          {[12, 24].map(off => <path key={off} d={contour(off)} className="track-contour" />)}
          <path d={`${walkedPath} L${walked},${h} L0,${h} Z`} fill={`url(#${gid})`} />
          <path d={line} className="track-ahead" />
          <path d={walkedPath} className="track-walked" />
          {todayX !== null && <path d={`M${todayX} 0 V${h}`} className="track-today" />}
          {arcs.map(d => <path key={d} d={d} className="track-arc" />)}
        </svg>
        {TRACK_FLAGS.map((fx, i) => (
          <div key={fx} className="track-pin" style={{ left: `${fx / 10}%`, top: top(terrainY(fx) - 10) }}>
            <svg aria-hidden="true" width="10" height="20" viewBox="0 0 10 20">
              <path d="M1 20V1l8 4-8 4" className={passed[i] ? "track-flag track-flag-on" : "track-flag"} />
            </svg>
          </div>
        ))}
        {dots.map(d => (
          <span key={d.taskId} aria-hidden="true" className="track-dot" data-state={d.state} style={{ left: `${d.x / 10}%`, top: top(terrainY(d.x)) }} />
        ))}
        {todayX !== null && (
          <span className="track-today-label" data-edge={todayX > 800 ? "end" : undefined} style={{ left: `${todayX / 10}%` }}>
            Today · {weekdayDay(nzCalendarDate(now))}
          </span>
        )}
        <div className="track-pin track-you" data-edge={edge} style={{ left: `${dx / 10}%`, top: top(terrainY(dx)) }}>
          <span className="track-you-tag">{label}</span>
          <span className="track-you-dot" />
        </div>
        {arcs.length > 0 && next && (
          <span className="track-note">Dotted lines: unlocked by {next.topic}</span>
        )}
      </div>
      <ol className="track-stages" style={{ gridTemplateColumns: TRACK_FLAGS.map((fx, i) => `minmax(0, ${fx - (i ? TRACK_FLAGS[i - 1] : 0)}fr)`).join(" ") }}>
        {stageLabels(route, arrivalDate, now).map(s => (
          <li key={s.id} className={`track-stage${s.now ? "" : " track-stage-off"}`}>
            <span className="track-stage-name">{s.name}{s.now ? " · now" : s.open ? " · still open" : ""}</span>
            <span className="text-muted">
              {s.state.split(" · ").map((part, i, all) => <span key={part} className="whitespace-nowrap">{part}{i < all.length - 1 && " · "} </span>)}
            </span>
          </li>
        ))}
      </ol>
      <div className="track-phone">
        <span className="text-muted">{phone.prev && <>{phone.prev.name} <span>{phone.prev.state}</span></>}</span>
        <span className="font-semibold text-teal-text">
          {phone.cur.name} · {variant === 'compact' || !phone.cur.daysLeft ? 'now' : `${phone.cur.daysLeft} ${phone.cur.daysLeft === 1 ? 'day' : 'days'} left`}
        </span>
        {variant === 'compact'
          ? <Link href="/app/roadmap" className="inline-flex min-h-6 items-center font-semibold">Roadmap</Link>
          : <span className="text-muted">{phone.next}</span>}
      </div>
      <p className="track-sum sr-only"><b className="font-semibold">{stage}</b> <span>· {more.join(" · ")}</span></p>
    </div>
  )
}
