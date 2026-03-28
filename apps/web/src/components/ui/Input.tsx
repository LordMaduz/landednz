import React, { useRef, useCallback, useId, useEffect } from 'react'
import { cn } from '@/lib/utils/cn'

export type InputVariant = 'text' | 'textarea'

type InputChangeEvent = React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>

export interface InputProps {
  variant?: InputVariant
  label?: string
  error?: string
  disabled?: boolean
  placeholder?: string
  className?: string
  id?: string
  name?: string
  value?: string
  defaultValue?: string
  required?: boolean
  autoComplete?: string
  readOnly?: boolean
  autoFocus?: boolean
  'aria-label'?: string
  'aria-describedby'?: string
  // text variant specific
  type?: 'text' | 'email' | 'password'
  // textarea variant specific
  rows?: number
  autoExpand?: boolean
  // event handlers
  onChange?: (e: InputChangeEvent) => void
  onBlur?: React.FocusEventHandler<HTMLInputElement | HTMLTextAreaElement>
  onFocus?: React.FocusEventHandler<HTMLInputElement | HTMLTextAreaElement>
}

const MIN_EXPAND_HEIGHT = 24
const MAX_EXPAND_HEIGHT = 72

const baseInputClasses = [
  'w-full bg-bg-card text-text-primary text-body',
  'border border-border',
  'transition-colors duration-150 motion-reduce:transition-none',
  'placeholder:text-text-tertiary',
  'hover:border-border-hover',
  'focus:outline-none',
  'disabled:bg-blocked-light disabled:text-blocked disabled:border-border disabled:cursor-not-allowed disabled:ring-0',
].join(' ')

export function Input({
  variant = 'text',
  label,
  error,
  disabled,
  placeholder,
  className,
  id: propId,
  name,
  value,
  defaultValue,
  required,
  autoComplete,
  readOnly,
  autoFocus,
  type = 'text',
  rows = 1,
  autoExpand = false,
  onChange,
  onBlur,
  onFocus,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedby,
}: InputProps) {
  const generatedId = useId()
  const inputId = propId ?? generatedId
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const hasError = Boolean(error)
  const errorId = `${inputId}-error`

  // Initialize auto-expand height after mount or when value changes
  useEffect(() => {
    if (variant === 'textarea' && autoExpand && textareaRef.current) {
      const el = textareaRef.current
      el.style.height = 'auto'
      el.style.height = `${Math.min(Math.max(el.scrollHeight, MIN_EXPAND_HEIGHT), MAX_EXPAND_HEIGHT)}px`
    }
  }, [variant, autoExpand, value])

  const handleTextareaChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (autoExpand) {
        const el = e.currentTarget
        el.style.height = 'auto'
        el.style.height = `${Math.min(Math.max(el.scrollHeight, MIN_EXPAND_HEIGHT), MAX_EXPAND_HEIGHT)}px`
      }
      onChange?.(e)
    },
    [autoExpand, onChange],
  )

  const inputClasses = cn(
    baseInputClasses,
    hasError
      ? 'border-error ring ring-error/10'
      : 'focus:border-primary focus:ring focus:ring-primary/10',
  )

  if (variant === 'textarea') {
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={inputId} className="text-secondary text-text-secondary block">
            {label}
          </label>
        )}
        <textarea
          ref={textareaRef}
          id={inputId}
          name={name}
          value={value}
          defaultValue={defaultValue}
          disabled={disabled}
          placeholder={placeholder}
          required={required}
          readOnly={readOnly}
          autoFocus={autoFocus}
          rows={rows}
          onChange={handleTextareaChange}
          onBlur={onBlur as React.FocusEventHandler<HTMLTextAreaElement>}
          onFocus={onFocus as React.FocusEventHandler<HTMLTextAreaElement>}
          aria-label={ariaLabel}
          aria-describedby={hasError ? errorId : ariaDescribedby}
          aria-invalid={hasError || undefined}
          className={cn(
            inputClasses,
            'rounded-card py-2.5 px-3.5 resize-none',
            autoExpand && 'min-h-6 overflow-hidden',
            className,
          )}
        />
        {error && (
          <p id={errorId} className="text-caption text-error" role="alert">
            {error}
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={inputId} className="text-secondary text-text-secondary block">
          {label}
        </label>
      )}
      <input
        id={inputId}
        name={name}
        type={type}
        value={value}
        defaultValue={defaultValue}
        disabled={disabled}
        placeholder={placeholder}
        required={required}
        autoComplete={autoComplete}
        readOnly={readOnly}
        autoFocus={autoFocus}
        onChange={onChange as React.ChangeEventHandler<HTMLInputElement>}
        onBlur={onBlur as React.FocusEventHandler<HTMLInputElement>}
        onFocus={onFocus as React.FocusEventHandler<HTMLInputElement>}
        aria-label={ariaLabel}
        aria-describedby={hasError ? errorId : ariaDescribedby}
        aria-invalid={hasError || undefined}
        className={cn(
          inputClasses,
          'rounded-input py-3 px-4',
          className,
        )}
      />
      {error && (
        <p id={errorId} className="text-caption text-error" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
