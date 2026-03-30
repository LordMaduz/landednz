import { Pencil } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface FieldRowProps {
  label: string
  value: string
  badge?: string
  editable?: boolean
  onEdit?: () => void
}

export function FieldRow({ label, value, badge, editable = false, onEdit }: FieldRowProps) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-border last:border-0">
      <div className="flex-1 min-w-0">
        <div className="text-sm text-text-secondary font-medium mb-1">{label}</div>
        <div className="flex items-center gap-2">
          <div className="text-sm text-text-primary">{value}</div>
          {badge && (
            <span className="bg-secondary-light text-secondary text-xs px-2 py-0.5 rounded-badge">
              {badge}
            </span>
          )}
        </div>
      </div>
      {editable && onEdit && (
        <button
          onClick={onEdit}
          className="text-text-tertiary hover:text-primary transition-colors p-1"
        >
          <Pencil size={14} />
        </button>
      )}
    </div>
  )
}