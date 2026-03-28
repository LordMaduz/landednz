import React from 'react'
import { cn } from '@/lib/utils/cn'

export type ProgressBarSize = 'sm' | 'md'

export interface ProgressBarProps {
  value?: number          // 0–100 (required for deterministic mode)
  indeterminate?: boolean // enables pulse animation; overrides value
  size?: ProgressBarSize  // sm=4px (h-1), md=8px (h-2)
  label?: string          // aria-label for screen readers
  className?: string
}

const sizeStyles: Record<ProgressBarSize, string> = {
  sm: 'h-1', // 4px
  md: 'h-2', // 8px
} as const

export function ProgressBar({
  value = 0,
  indeterminate = false,
  size = 'sm',
  label = 'Progress',
  className,
}: ProgressBarProps) {
  // Clamp value between 0-100
  const clampedValue = Math.max(0, Math.min(100, value))

  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuenow={indeterminate ? undefined : clampedValue}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn(
        'relative w-full bg-border rounded-full overflow-hidden',
        sizeStyles[size],
        className,
      )}
    >
      <div
        aria-hidden="true"
        className={cn(
          'h-full bg-primary rounded-full transition-all duration-fill motion-reduce:transition-none',
          indeterminate && 'progress-pulse',
        )}
        style={{
          width: indeterminate ? '60%' : `${clampedValue}%`,
        }}
      />
    </div>
  )
}