// The five journey legs shared by Home's route strip and the Roadmap rail (spec §7.2).
import { addDays, shortDay } from './nz-date'

export type LegId = 'before' | 'arrival' | 'week1' | 'month1' | 'later'

const ids = (from: number, to: number) =>
  Array.from({ length: to - from + 1 }, (_, i) => `T${String(from + i).padStart(2, '0')}`)

export const LEGS: { id: LegId; name: string; taskIds: string[] }[] = [
  { id: 'before', name: 'Before you flew', taskIds: ids(1, 5) },
  { id: 'arrival', name: 'Arrival', taskIds: ids(6, 7) },
  { id: 'week1', name: 'Week 1', taskIds: ids(8, 10) },
  { id: 'month1', name: 'Month 1', taskIds: ids(11, 14) },
  { id: 'later', name: 'Later', taskIds: ids(15, 21) },
]

export function legForTask(taskId: string): LegId {
  return LEGS.find(l => l.taskIds.includes(taskId))?.id ?? 'later'
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
