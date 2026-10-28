import type { TaskDetailApiResponse } from './api'

// Starter questions the task page does not answer already (it lists documents and mistakes)
export function suggestionsFor(detail: TaskDetailApiResponse): string[] {
  return detail.processingTime ? ['How long does it take?'] : []
}
