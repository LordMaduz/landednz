import { cn } from '@/lib/utils/cn'

interface RadioOptionProps {
  value: string
  label: string
  description?: string
  checked: boolean
  onChange: (value: string) => void
}

export function RadioOption({ value, label, description, checked, onChange }: RadioOptionProps) {
  return (
    <label
      className={cn(
        'border-2 rounded-card p-3 cursor-pointer transition-colors block',
        checked
          ? 'border-primary bg-primary/10'
          : 'border-border bg-bg-card hover:border-primary/40'
      )}
    >
      <input
        type="radio"
        value={value}
        checked={checked}
        onChange={() => onChange(value)}
        className="sr-only"
      />
      <div className="text-small font-medium text-text-primary">{label}</div>
      {description && (
        <div className="text-caption text-text-tertiary mt-0.5">{description}</div>
      )}
    </label>
  )
}