import type { TaskDetailApiResponse } from './api'

// Up to two starter questions, each only when the task's KB entry can answer it
export function suggestionsFor(detail: TaskDetailApiResponse): string[] {
  return [
    detail.documentsRequired.length > 0 && 'What documents do I need?',
    detail.processingTime && 'How long does it take?',
    detail.commonMistakes.length > 0 && 'What do people get wrong?',
  ]
    .filter((q): q is string => Boolean(q))
    .slice(0, 2)
}
