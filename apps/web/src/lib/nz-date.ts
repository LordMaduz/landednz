// Dates as LandedNZ shows them: en-NZ, Pacific/Auckland ("22 Oct", "21 October 2026").

// A calendar date (YYYY-MM-DD) plus n days, as YYYY-MM-DD. Calendar arithmetic in UTC, no DST drift.
export function addDays(date: string, days: number): string {
  const d = new Date(`${date}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}

// "21 Oct" for a calendar date
export function shortDay(date: string): string {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString('en-NZ', { day: 'numeric', month: 'short', timeZone: 'UTC' })
}

