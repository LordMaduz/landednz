import { cn } from '@/lib/utils/cn'

interface SectionCardProps {
  icon: string
  title: string
  children: React.ReactNode
  className?: string
}

export function SectionCard({ icon, title, children, className }: SectionCardProps) {
  return (
    <div className={cn('bg-bg-card rounded-card shadow-card p-6', className)}>
      <div className="flex items-center gap-2 mb-4">
        <span aria-hidden="true" className="text-h3">{icon}</span>
        <h2 className="font-display text-h3 text-text-primary">{title}</h2>
      </div>
      {children}
    </div>
  )
}