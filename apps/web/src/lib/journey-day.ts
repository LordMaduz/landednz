import { nzCalendarDate } from './nz-date'

const DAY_MS = 86_400_000

// Day N of the journey on the NZ calendar: arrival day = 1. Before arrival the value is ≤ 0,
// and the days until landing are 1 - day.
export function journeyDay(arrivalDate: string, now: Date): number {
  const today = Date.parse(`${nzCalendarDate(now)}T00:00:00Z`)
  const arrival = Date.parse(`${arrivalDate}T00:00:00Z`)
  return Math.round((today - arrival) / DAY_MS) + 1
}
