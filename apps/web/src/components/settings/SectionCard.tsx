import { cn } from '@/lib/utils/cn'
import { LucideProps } from "lucide-react"

interface SectionCardProps {
  icon: React.ComponentType<LucideProps>
  title: string
  children: React.ReactNode
  className?: string
}

export function SectionCard({ icon: Icon, title, children, className }: SectionCardProps) {
  return (
    <div className={cn('bg-bg-card rounded-card shadow-card p-6', className)}>
      <div className="flex items-center gap-2 mb-4">
        <Icon className="w-5 h-5" aria-hidden="true" />
        <h2 className="font-display text-h3 text-text-primary">{title}</h2>
      </div>
      {children}
    </div>
  )
}