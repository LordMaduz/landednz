"use client"

import { useEffect, useRef, useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { fullDay, landChip, monthGrid, monthTitle, moveDate, type CalendarKey } from "@/lib/calendar"
import { cn } from "@/lib/utils"

const KEYS = ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End"]
const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
const NAV = "grid size-9 cursor-pointer place-items-center rounded-control border border-border-subtle bg-surface text-fg state state-base-surface max-narrow:size-11"

// Month grid for picking a day (WAI-ARIA date grid): ISO dates in and out, no limits.
export function Calendar({ value, onChange, today, labelledBy }: { value: string | null; onChange(v: string): void; today: string; labelledBy: string }) {
  const [focus, setFocus] = useState(value ?? today)
  const month = focus.slice(0, 7)
  const gridRef = useRef<HTMLDivElement>(null)
  const refocus = useRef(false)

  // Keyboard moves carry DOM focus to the new cell once it has rendered
  useEffect(() => {
    if (!refocus.current) return
    refocus.current = false
    gridRef.current?.querySelector<HTMLElement>(`[data-date="${focus}"]`)?.focus()
  }, [focus])

  const days = monthGrid(month)
  const weeks = Array.from({ length: days.length / 7 }, (_, i) => days.slice(i * 7, i * 7 + 7))

  function onKeyDown(e: React.KeyboardEvent) {
    if (KEYS.includes(e.key)) {
      e.preventDefault()
      refocus.current = true
      setFocus(moveDate(focus, e.key as CalendarKey))
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      onChange(focus)
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-card border border-border-subtle bg-surface p-4 max-narrow:p-3">
        <div className="flex items-center justify-between pb-3">
          <button type="button" aria-label="Previous month" className={NAV} onClick={() => setFocus(moveDate(focus, "PageUp"))}>
            <ChevronLeft aria-hidden="true" size={16} strokeWidth={1.5} />
          </button>
          <b aria-live="polite" className="font-semibold">{monthTitle(month)}</b>
          <button type="button" aria-label="Next month" className={NAV} onClick={() => setFocus(moveDate(focus, "PageDown"))}>
            <ChevronRight aria-hidden="true" size={16} strokeWidth={1.5} />
          </button>
        </div>
        <div ref={gridRef} role="grid" aria-labelledby={labelledBy} onKeyDown={onKeyDown} className="flex flex-col gap-1 tabular-nums">
          <div role="row" className="grid grid-cols-7 text-center">
            {WEEKDAYS.map(w => (
              <span key={w} role="columnheader" className="grid h-7 place-items-center text-small font-medium text-fg-muted">{w}</span>
            ))}
          </div>
          {weeks.map(week => (
            <div key={week[0]} role="row" className="grid grid-cols-7 text-center">
              {week.map(d => (
                <div
                  key={d}
                  role="gridcell"
                  data-date={d}
                  data-outside={d.slice(0, 7) !== month ? "" : undefined}
                  data-today={d === today ? "" : undefined}
                  aria-selected={d === value}
                  aria-label={fullDay(d)}
                  tabIndex={d === focus ? 0 : -1}
                  onClick={() => { refocus.current = true; setFocus(d); onChange(d) }}
                  className={cn(
                    "grid h-11 cursor-pointer place-items-center rounded-control state data-outside:text-fg-muted data-today:font-semibold data-today:shadow-today",
                    d === value && "bg-surface-selected font-semibold text-fg shadow-chosen state-base-surface-selected",
                  )}
                >
                  {Number(d.slice(8))}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
      {value && (
        <div className="flex items-center justify-between gap-3 rounded-card border border-avatar bg-surface-sunken px-4 py-4">
          <span>
            <span className="text-small text-fg-muted">You land on</span>
            <br />
            <b className="font-semibold">{fullDay(value)}</b>
          </span>
          <span className="inline-flex h-6.5 items-center rounded-full border border-avatar bg-surface px-3 text-small font-semibold text-fg-accent">{landChip(value, today)}</span>
        </div>
      )}
    </div>
  )
}
