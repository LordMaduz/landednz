import React from 'react'
import { cn } from '@/lib/utils/cn'

export type BadgeVariant = 'phase' | 'difficulty-easy' | 'difficulty-medium' | 'difficulty-hard' | 'premium'

export interface BadgeProps {
  variant: BadgeVariant
  children: React.ReactNode
  className?: string
}

const variantStyles: Record<BadgeVariant, string> = {
  phase: 'bg-primary-light text-primary',
  'difficulty-easy': 'bg-success-light text-success',
  'difficulty-medium': 'bg-warning-light text-warning',
  'difficulty-hard': 'bg-error-light text-error',
  premium: 'bg-secondary-light text-secondary-hover',
} as const

export function Badge({ variant, children, className }: BadgeProps) {
  const isPremium = variant === 'premium'

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-badge text-caption font-medium',
        isPremium ? 'px-2 py-0.5' : 'px-3 py-1',
        variantStyles[variant],
        className,
      )}
    >
      {isPremium && (
        <svg
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      )}
      {children}
    </span>
  )
}
