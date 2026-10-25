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

// "21 to 22 Oct" drops the first month when both days share it
function range(from: string, to: string): string {
  const [a, b] = [shortDay(from), shortDay(to)]
  return a.split(' ')[1] === b.split(' ')[1] ? `${a.split(' ')[0]} to ${b}` : `${a} to ${b}`
}

// When each leg happens, from the arrival date: week 1 ends arrival + 7, month 1 arrival + 30
export function legWhen(leg: LegId, arrivalDate: string): string {
  switch (leg) {
    case 'before':
      return `before ${shortDay(arrivalDate)}`
    case 'arrival':
      return range(arrivalDate, addDays(arrivalDate, 1))
    case 'week1':
      return `to ${shortDay(addDays(arrivalDate, 7))}`
    case 'month1':
      return `to ${shortDay(addDays(arrivalDate, 30))}`
    case 'later':
      return 'from month 2'
  }
}
