import React from 'react'
import { cn } from '@/lib/utils/cn'
import type { TaskCardState } from '@/types/web'

export type StatusIndicatorSize = 'sm' | 'md'

export interface StatusIndicatorProps {
  state: TaskCardState
  size?: StatusIndicatorSize  // default: 'md'
  className?: string
}

const sizeStyles: Record<StatusIndicatorSize, { container: string; iconSize: number }> = {
  sm: { container: 'w-4 h-4', iconSize: 8 },   // 16px
  md: { container: 'w-6 h-6', iconSize: 12 },  // 24px
} as const

// All tokens confirmed in tailwind.config.ts
const stateContainerStyles: Record<TaskCardState, string> = {
  not_started:    'border-2 border-blocked bg-transparent',
  in_progress:    'border-2 border-primary overflow-hidden relative',
  complete:       'bg-success flex items-center justify-center',
  blocked:        'bg-blocked flex items-center justify-center',
  premium_locked: 'bg-secondary flex items-center justify-center',
  loading:        'bg-border skeleton-pulse',
  error:          'bg-error flex items-center justify-center',
} as const

function CheckIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <polyline points="4 13 9 18 20 7" stroke="white" strokeWidth="2.5"
        strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function LockIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="5" y="11" width="14" height="10" rx="2" fill="white" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" stroke="white" strokeWidth="2"
        strokeLinecap="round" fill="none" />
    </svg>
  )
}

function ExclamationIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <line x1="12" y1="7" x2="12" y2="14" stroke="white" strokeWidth="2.5"
        strokeLinecap="round" />
      <circle cx="12" cy="18" r="1.5" fill="white" />
    </svg>
  )
}

export function StatusIndicator({ state, size = 'md', className }: StatusIndicatorProps) {
  const { container, iconSize } = sizeStyles[size]
  return (
    <div
      role="img"
      aria-label={state.replace(/_/g, ' ')}
      className={cn('rounded-full shrink-0', stateContainerStyles[state], container, className)}
    >
      {state === 'in_progress' && (
        <div className="absolute inset-0 flex">
          <div className="w-1/2 h-full bg-primary" />
        </div>
      )}
      {state === 'complete'       && <CheckIcon size={iconSize} />}
      {state === 'blocked'        && <LockIcon size={iconSize} />}
      {state === 'premium_locked' && <LockIcon size={iconSize} />}
      {state === 'error'          && <ExclamationIcon size={iconSize} />}
    </div>
  )
}