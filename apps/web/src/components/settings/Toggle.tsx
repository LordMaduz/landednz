import { cn } from '@/lib/utils/cn'

interface ToggleProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
  id: string
  description?: string
}

export function Toggle({ checked, onChange, label, id, description }: ToggleProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <div className="text-small font-medium text-text-primary">{label}</div>
        {description && (
          <div className="text-caption text-text-tertiary mt-0.5">{description}</div>
        )}
      </div>
      <label
        htmlFor={id}
        className={cn(
          'w-11 h-6 rounded-full shadow-toggle transition-colors cursor-pointer inline-flex items-center px-0.5',
          checked ? 'bg-primary' : 'bg-border'
        )}
      >
        <input
          type="checkbox"
          id={id}
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only"
        />
        <div
          className={cn(
            'w-5 h-5 bg-white rounded-full transition-transform shadow-sm',
            checked ? 'translate-x-5' : 'translate-x-0.5'
          )}
        />
      </label>
    </div>
  )
}