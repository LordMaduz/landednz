// The five journey legs shared by Home's route strip and the Roadmap rail (spec §7.2).
import { addDays, shortDay } from './nz-date'

export type LegId = 'before' | 'arrival' | 'week1' | 'month1' | 'later'

// In task phase order: phase 1 is the first leg, phase 5 the last
export const LEGS: { id: LegId; name: string }[] = [
  { id: 'before', name: 'Before you flew' },
  { id: 'arrival', name: 'Arrival' },
  { id: 'week1', name: 'Week 1' },
  { id: 'month1', name: 'Month 1' },
  { id: 'later', name: 'Later' },
]

export function legForPhase(phase: number): LegId {
  return LEGS[phase - 1]?.id ?? 'later'
}

// "Before you fly" until the traveller lands, "Before you flew" after
export function legName(id: LegId, beforeArrival: boolean): string {
  if (id === 'before') return beforeArrival ? 'Before you fly' : 'Before you flew'
  return LEGS.find(l => l.id === id)!.name
}

// "1–2 Mar" drops the first month when both days share it
function range(from: string, to: string): string {
  const [a, b] = [shortDay(from), shortDay(to)]
  return a.split(' ')[1] === b.split(' ')[1] ? `${a.split(' ')[0]}–${b}` : `${a}–${b}`
}

// When each leg happens, from the arrival date: week 1 ends arrival + 7, month 1 arrival + 30, later starts the month after
export function legWhen(leg: LegId, arrivalDate: string): string {
  switch (leg) {
    case 'before':
      return `by ${shortDay(arrivalDate)}`
    case 'arrival':
      return range(arrivalDate, addDays(arrivalDate, 1))
    case 'week1':
      return `to ${shortDay(addDays(arrivalDate, 7))}`
    case 'month1':
      return `to ${shortDay(addDays(arrivalDate, 30))}`
    case 'later':
      return `from ${new Date(`${addDays(arrivalDate, 31)}T00:00:00Z`).toLocaleDateString('en-NZ', { month: 'long', timeZone: 'UTC' })}`
  }
}

// The calendar date each leg starts: arrival is days 1–2, week 1 from day 3, month 1 from day 9, later from day 32
export function legStart(leg: LegId, arrivalDate: string): string {
  const offset = { before: 0, arrival: 0, week1: 2, month1: 8, later: 31 }[leg]
  return addDays(arrivalDate, offset)
}
