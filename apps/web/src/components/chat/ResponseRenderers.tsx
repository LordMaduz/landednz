import { SourcePill } from './SourcePill'
import type { StepsResponse, ChecklistResponse, AlertResponse, PlainTextResponse } from '@/types/chat'
import { cn } from '@/lib/utils/cn'

// Steps renderer - for step-by-step processes
export function StepsRenderer({ data }: { data: StepsResponse }) {
  return (
    <div>
      {/* Header */}
      <p className="text-caption text-text-tertiary font-medium mb-2">
        {data.header}
      </p>

      {/* Intro */}
      <p className="text-small leading-body text-text-primary mb-3">
        {data.intro}
      </p>

      {/* Steps */}
      <div className="flex flex-col gap-2 mb-4">
        {data.steps.map((step, i) => (
          <div key={i} className="flex gap-2.5 items-start">
            <div className="w-5 h-5 rounded-full bg-primary-subtle flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-caption font-semibold text-primary">{i + 1}</span>
            </div>
            <div className="flex-1">
              <p className="text-small leading-body text-text-primary">
                {step.text}
                {step.sources && step.sources.map((source, j) => (
                  <span key={j} className="ml-1">
                    <SourcePill name={source} />
                  </span>
                ))}
              </p>
              {step.note && (
                <p className="text-caption text-text-tertiary mt-1 ml-1">
                  💡 {step.note}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Callout */}
      {data.callout && (
        <div className={cn(
          'border-l-3 rounded-r-button px-3.5 py-2.5 mb-2',
          data.callout.type === 'warning' && 'bg-warning-light border-warning',
          data.callout.type === 'info' && 'bg-primary-light border-primary',
          data.callout.type === 'success' && 'bg-success-light border-success'
        )}>
          <p className="text-caption font-semibold text-text-primary mb-1">
            {data.callout.title}
          </p>
          <p className="text-caption leading-body text-text-primary">
            {data.callout.text}
          </p>
        </div>
      )}
    </div>
  )
}

// Checklist renderer - for documents/requirements
export function ChecklistRenderer({ data }: { data: ChecklistResponse }) {
  const requiredItems = data.items.filter(item => item.required)
  const optionalItems = data.items.filter(item => !item.required)

  return (
    <div>
      {/* Header */}
      <p className="text-caption text-text-tertiary font-medium mb-2">
        {data.header}
      </p>

      {/* Intro */}
      <p className="text-small leading-body text-text-primary mb-3">
        {data.intro}
      </p>

      {/* Required items */}
      {requiredItems.length > 0 && (
        <div className="mb-3">
          <p className="text-caption font-semibold text-text-primary mb-2 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-error flex-shrink-0"></span>
            Required documents
          </p>
          <div className="space-y-1.5 ml-3">
            {requiredItems.map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-error flex-shrink-0"></div>
                <span className="text-small text-text-primary flex-1">{item.text}</span>
                {item.sources && item.sources.map((source, j) => (
                  <SourcePill key={j} name={source} />
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Optional items */}
      {optionalItems.length > 0 && (
        <div className="mb-3">
          <p className="text-caption font-semibold text-text-primary mb-2 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full border border-text-tertiary flex-shrink-0"></span>
            Optional documents
          </p>
          <div className="space-y-1.5 ml-3">
            {optionalItems.map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full border border-text-tertiary flex-shrink-0"></div>
                <span className="text-small text-text-secondary flex-1">{item.text}</span>
                {item.sources && item.sources.map((source, j) => (
                  <SourcePill key={j} name={source} />
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Note */}
      {data.note && (
        <div className="bg-bg border border-border rounded-button px-3 py-2">
          <p className="text-caption text-text-secondary">
            💡 {data.note}
          </p>
        </div>
      )}
    </div>
  )
}

// Alert renderer - for warnings and important info
export function AlertRenderer({ data }: { data: AlertResponse }) {
  const severityStyles = {
    warning: {
      bg: 'bg-warning-light',
      border: 'border-warning',
      icon: '⚠️'
    },
    error: {
      bg: 'bg-error-light',
      border: 'border-error',
      icon: '🚨'
    },
    info: {
      bg: 'bg-primary-light',
      border: 'border-primary',
      icon: 'ℹ️'
    }
  }

  const style = severityStyles[data.severity]

  return (
    <div className={cn('border-l-3 rounded-r-button px-4 py-3', style.bg, style.border)}>
      <div className="flex items-start gap-2.5">
        <span className="text-body flex-shrink-0">{style.icon}</span>
        <div className="flex-1">
          <p className="text-small font-semibold text-text-primary mb-1">
            {data.title}
          </p>
          <p className="text-small leading-body text-text-primary mb-2">
            {data.message}
          </p>
          {data.deadline && (
            <p className="text-caption text-text-secondary mb-2">
              ⏰ Deadline: {data.deadline}
            </p>
          )}
          {data.action && (
            <p className="text-caption font-medium text-text-primary">
              👉 {data.action}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

// Plain text renderer - for simple Q&A
export function PlainTextRenderer({ data }: { data: PlainTextResponse }) {
  return (
    <div>
      {data.header && (
        <p className="text-caption text-text-tertiary font-medium mb-2">
          {data.header}
        </p>
      )}
      <p className="text-small leading-body text-text-primary whitespace-pre-wrap">
        {data.text}
      </p>
    </div>
  )
}