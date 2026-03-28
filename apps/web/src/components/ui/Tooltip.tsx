import React, { useState, useRef, useEffect, useId } from 'react'
import { cn } from '@/lib/utils/cn'

export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right'

export interface TooltipProps {
  content: React.ReactNode
  position?: TooltipPosition
  children: React.ReactElement
  className?: string
}

// Position class maps for tooltip box and arrow placement
const tooltipPositionClasses: Record<TooltipPosition, string> = {
  top: 'absolute bottom-full left-1/2 -translate-x-1/2 mb-2',
  bottom: 'absolute top-full left-1/2 -translate-x-1/2 mt-2',
  left: 'absolute right-full top-1/2 -translate-y-1/2 mr-2',
  right: 'absolute left-full top-1/2 -translate-y-1/2 ml-2',
}

const arrowPositionClasses: Record<TooltipPosition, string> = {
  top: 'absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-text-primary rotate-45',
  bottom: 'absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-text-primary rotate-45',
  left: 'absolute -right-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-text-primary rotate-45',
  right: 'absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-text-primary rotate-45',
}

export function Tooltip({
  content,
  position = 'top',
  children,
  className,
}: TooltipProps) {
  const [visible, setVisible] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const tooltipId = useId()

  // Click-outside dismiss
  useEffect(() => {
    if (!visible) return
    function handleMouseDown(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setVisible(false)
      }
    }
    document.addEventListener('mousedown', handleMouseDown)
    return () => document.removeEventListener('mousedown', handleMouseDown)
  }, [visible])

  // Escape key dismiss
  useEffect(() => {
    if (!visible) return
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setVisible(false)
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [visible])

  return (
    <div
      ref={wrapperRef}
      className="relative inline-block"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      {/* React.cloneElement to inject aria-describedby */}
      {React.cloneElement(children, {
        'aria-describedby': visible ? tooltipId : undefined,
      } as Record<string, unknown>)}

      {visible && (
        <div
          id={tooltipId}
          role="tooltip"
          className={cn(
            tooltipPositionClasses[position],
            'z-50 whitespace-nowrap',
            'bg-text-primary text-text-inverse text-caption',
            'px-3 py-1.5 rounded-button shadow-dropdown',
            'pointer-events-none',
            className,
          )}
        >
          {content}
          {/* Arrow div */}
          <div className={arrowPositionClasses[position]} aria-hidden="true" />
        </div>
      )}
    </div>
  )
}