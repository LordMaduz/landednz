// Date-grid maths for the Calendar: ISO YYYY-MM-DD strings, UTC arithmetic, weeks start on Monday.
import { addDays } from './nz-date'

export type CalendarKey = 'ArrowLeft' | 'ArrowRight' | 'ArrowUp' | 'ArrowDown' | 'PageUp' | 'PageDown' | 'Home' | 'End'

const utc = (date: string) => new Date(`${date}T00:00:00Z`)
// 0 = Monday … 6 = Sunday
const mondayIndex = (date: string) => (utc(date).getUTCDay() + 6) % 7
const daysIn = (year: number, month: number) => new Date(Date.UTC(year, month, 0)).getUTCDate() // month is 1-based

// Whole Monday-first weeks covering month (YYYY-MM)
export function monthGrid(month: string): string[] {
  const first = `${month}-01`
  const lead = mondayIndex(first)
  const weeks = Math.ceil((lead + daysIn(Number(month.slice(0, 4)), Number(month.slice(5))) ) / 7)
  return Array.from({ length: weeks * 7 }, (_, i) => addDays(first, i - lead))
}

// Where a key moves the focused day; Page keys keep the day number, clamped to the month's end
export function moveDate(date: string, key: CalendarKey): string {
  switch (key) {
    case 'ArrowLeft': return addDays(date, -1)
    case 'ArrowRight': return addDays(date, 1)
    case 'ArrowUp': return addDays(date, -7)
    case 'ArrowDown': return addDays(date, 7)
    case 'Home': return addDays(date, -mondayIndex(date))
    case 'End': return addDays(date, 6 - mondayIndex(date))
    default: {
      const [y, m, d] = date.split('-').map(Number)
      const t = new Date(Date.UTC(y, m - 1 + (key === 'PageDown' ? 1 : -1), 1))
      const ty = t.getUTCFullYear()
      const tm = t.getUTCMonth() + 1
      return `${ty}-${String(tm).padStart(2, '0')}-${String(Math.min(d, daysIn(ty, tm))).padStart(2, '0')}`
    }
  }
}

// "Today", "Tomorrow", "Yesterday", "In 5 days", "5 days ago"
export function landChip(value: string, today: string): string {
  const n = Math.round((utc(value).getTime() - utc(today).getTime()) / 86_400_000)
  if (n === 0) return 'Today'
  if (n === 1) return 'Tomorrow'
  if (n === -1) return 'Yesterday'
  return n > 0 ? `In ${n} days` : `${-n} days ago`
}

// "Friday 30 October 2026"
export const fullDay = (date: string) =>
  utc(date).toLocaleDateString('en-NZ', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).replace(',', '')

// "October 2026"
export const monthTitle = (month: string) =>
  utc(`${month}-01`).toLocaleDateString('en-NZ', { month: 'long', year: 'numeric', timeZone: 'UTC' })
