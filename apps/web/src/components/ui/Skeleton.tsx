import React from 'react'
import { cn } from '@/lib/utils/cn'

export type SkeletonVariant = 'text-line' | 'card' | 'circle'

export interface SkeletonProps {
  variant: SkeletonVariant
  width?: string      // Tailwind width class override e.g. 'w-32'
  height?: string     // Tailwind height class override e.g. 'h-8'
  className?: string
}

const variantStyles: Record<SkeletonVariant, string> = {
  'text-line': 'w-full h-4 rounded-full',
  'card':      'w-full h-32 rounded-card',
  'circle':    'w-10 h-10 rounded-full',
} as const

export function Skeleton({ variant, width, height, className }: SkeletonProps) {
  return (
    <div
      role="status"
      aria-label="Loading"
      aria-busy="true"
      className={cn(
        'bg-border skeleton-pulse',
        variantStyles[variant],
        width,
        height,
        className,
      )}
    />
  )
}
