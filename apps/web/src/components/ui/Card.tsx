import React from 'react'
import { cn } from '@/lib/utils/cn'

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  state?: 'default' | 'hover' | 'selected' | 'error'
  padding?: 'compact' | 'default' | 'spacious'
  children: React.ReactNode
}

const stateStyles = {
  default: 'bg-bg-card border-border shadow-card',
  hover: 'bg-bg-card border-border-hover shadow-card-hover',
  selected: 'bg-primary-light border-primary shadow-card',
  error: 'bg-error-light border-error/30 shadow-card',
} as const

const paddingStyles = {
  compact: 'p-3',
  default: 'p-6',
  spacious: 'p-8',
} as const

export function Card({
  state = 'default',
  padding = 'default',
  className,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        'rounded-card border transition-all duration-150',
        stateStyles[state],
        paddingStyles[padding],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}
