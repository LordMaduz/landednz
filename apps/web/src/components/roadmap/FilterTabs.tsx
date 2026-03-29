import type { FilterValue } from '@/types/web'
import { cn } from '@/lib/utils/cn'

interface FilterTabsProps {
  active: FilterValue
  onChange: (value: FilterValue) => void
}

const TABS: { id: FilterValue; label: string }[] = [
  { id: 'all', label: 'All tasks' },
  { id: 'todo', label: 'To do' },
  { id: 'progress', label: 'In progress' },
  { id: 'done', label: 'Done' },
]

export function FilterTabs({ active, onChange }: FilterTabsProps) {
  return (
    <div className="flex gap-1 mb-4 border-b border-border">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            'px-3.5 py-2 text-small -mb-px transition-colors duration-150 border-b-2',
            active === tab.id
              ? 'text-primary border-primary font-semibold'
              : 'text-text-tertiary border-transparent hover:text-text-secondary font-medium'
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
