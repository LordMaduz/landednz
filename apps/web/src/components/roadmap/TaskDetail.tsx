'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils/cn'
import type { TaskListItem, TaskCardState } from '@/types/web'

// ── Status icon (22px variant for detail header) ──────────────────────────────

function StatusIcon({ state }: { state: TaskCardState }) {
  const s = 22
  const iconSize = 12

  if (state === 'complete') {
    return (
      <div
        className="rounded-full bg-success flex items-center justify-center flex-shrink-0"
        style={{ width: s, height: s }}
      >
        <svg width={14} height={14} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M20 6L9 17l-5-5" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    )
  }

  if (state === 'in_progress') {
    return (
      <div
        className="rounded-full border-2 border-primary flex-shrink-0 status-in-progress"
        style={{ width: s, height: s }}
      />
    )
  }

  if (state === 'blocked') {
    return (
      <div
        className="rounded-full bg-blocked-light border-1.5 border-blocked flex items-center justify-center flex-shrink-0"
        style={{ width: s, height: s }}
      >
        <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" className="text-blocked" strokeWidth="2" />
          <path d="M7 11V7a5 5 0 0110 0v4" stroke="currentColor" className="text-blocked" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>
    )
  }

  if (state === 'premium_locked') {
    return (
      <div
        className="rounded-full bg-secondary-light border-1.5 border-premium-gold flex items-center justify-center flex-shrink-0"
        style={{ width: s, height: s }}
      >
        <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" className="text-premium-gold" strokeWidth="2" />
          <path d="M7 11V7a5 5 0 0110 0v4" stroke="currentColor" className="text-premium-gold" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>
    )
  }

  // not_started (default)
  return (
    <div
      className="rounded-full border-2 border-border flex-shrink-0"
      style={{ width: s, height: s }}
    />
  )
}

// ── Phase badge ───────────────────────────────────────────────────────────────

function PhaseBadge({ phase }: { phase: 1 | 2 | 3 }) {
  const labels: Record<number, string> = {
    1: 'Phase 1',
    2: 'Phase 2',
    3: 'Phase 3',
  }
  return (
    <span className="text-caption font-medium px-2.5 py-1 rounded-badge bg-primary-light text-primary">
      {labels[phase]}
    </span>
  )
}

// ── Difficulty badge ──────────────────────────────────────────────────────────

function DifficultyBadge({ difficulty }: { difficulty: 'Easy' | 'Medium' | 'Hard' }) {
  const styles = {
    Easy: 'bg-success-light text-success',
    Medium: 'bg-warning-light text-warning',
    Hard: 'bg-error-light text-error',
  }
  return (
    <span className={cn('text-caption font-medium px-2.5 py-1 rounded-badge', styles[difficulty])}>
      {difficulty}
    </span>
  )
}

// ── Task Detail ───────────────────────────────────────────────────────────────

interface TaskDetailProps {
  task: TaskListItem
  onBack: () => void
}

export function TaskDetail({ task, onBack }: TaskDetailProps) {
  const [tipsOpen, setTipsOpen] = useState(false)
  const { detail } = task

  return (
    <div className="slide-in-right max-w-3xl">
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-small font-medium text-primary mb-6 hover:opacity-75 transition-opacity focus:outline-none focus:ring-2 focus:ring-border-focus focus:ring-offset-2 rounded"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M19 12H5M12 5l-7 7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Back to roadmap
      </button>

      {/* Task header */}
      <div className="mb-6">
        <div className="flex items-start gap-3 mb-3">
          <StatusIcon state={task.cardState} />
          <h2 className="font-display text-h1 text-text-primary leading-tight">
            {task.taskName}
          </h2>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <PhaseBadge phase={task.phase} />
          {task.estimatedDuration && (
            <span className="text-caption font-medium px-2.5 py-1 rounded-badge bg-bg text-text-secondary flex items-center gap-1">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
                <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              {task.estimatedDuration}
            </span>
          )}
          {task.difficulty && <DifficultyBadge difficulty={task.difficulty} />}
        </div>
      </div>

      {/* Consequence callout */}
      <div className="bg-warning-light border-l-3 border-warning rounded-r-button px-5 py-4 mb-6">
        <p className="text-small font-semibold text-text-primary mb-0.5">Why this matters</p>
        <p className="text-small text-text-secondary">{task.consequenceLine}</p>
      </div>

      {detail ? (
        <>
          {/* Why now */}
          <div className="mb-6">
            <h3 className="text-h3 text-text-primary mb-2">Why now?</h3>
            <p className="text-body text-text-secondary">{detail.whyNow}</p>
          </div>

          {/* Steps */}
          {detail.steps && detail.steps.length > 0 && (
            <div className="mb-6">
              <h3 className="text-h3 text-text-primary mb-3">How to do it</h3>
              <div className="space-y-0">
                {detail.steps.map((step, i) => (
                  <div key={i} className="flex gap-3 relative">
                    {/* Connector line between steps */}
                    {i < detail.steps!.length - 1 && (
                      <div className="absolute left-3.5 top-7 bottom-0 w-px bg-border" />
                    )}
                    <div className="w-7 h-7 rounded-full bg-primary-light text-caption font-semibold text-primary flex items-center justify-center flex-shrink-0 z-10">
                      {i + 1}
                    </div>
                    <p className="text-small text-text-secondary pt-1.5 pb-4">{step.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Documents */}
          {detail.documents && detail.documents.length > 0 && (
            <div className="mb-6">
              <h3 className="text-h3 text-text-primary mb-3">What you need</h3>
              <div className="bg-bg rounded-lg overflow-hidden">
                {detail.documents.map((doc, i) => (
                  <div
                    key={i}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3',
                      i < detail.documents!.length - 1 && 'border-b border-border'
                    )}
                  >
                    {doc.required ? (
                      <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                    ) : (
                      <div className="w-2 h-2 rounded-full border border-text-tertiary flex-shrink-0" />
                    )}
                    <span className="text-small text-text-primary flex-1">{doc.name}</span>
                    <span className={cn(
                      'text-caption',
                      doc.required ? 'text-primary font-medium' : 'text-text-tertiary'
                    )}>
                      {doc.required ? 'Required' : 'Optional'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Source card */}
          {detail.source && (
            <div className="border border-border rounded-button px-4 py-3.5 flex items-center justify-between mb-6">
              <div>
                <p className="text-caption text-text-tertiary mb-0.5">Official source</p>
                <p className="text-small font-medium text-text-primary">{detail.source.agency}</p>
                <p className="text-caption text-text-secondary">{detail.source.page}</p>
              </div>
              <a
                href={`https://${detail.source.url}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-success-light text-success rounded-lg text-small font-semibold px-3 py-2 flex-shrink-0 hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-border-focus focus:ring-offset-2"
              >
                Go to {detail.source.agency.split(' ')[0]}
              </a>
            </div>
          )}

          {/* Tips collapsible */}
          {detail.tips && detail.tips.length > 0 && (
            <div className="mb-8">
              <button
                onClick={() => setTipsOpen(!tipsOpen)}
                className="flex items-center gap-2 text-small font-semibold text-text-primary mb-2 w-full text-left focus:outline-none focus:ring-2 focus:ring-border-focus focus:ring-offset-2 rounded"
                aria-expanded={tipsOpen}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                  className={cn('transition-transform duration-200', tipsOpen && 'rotate-90')}
                >
                  <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Tips ({detail.tips.length})
              </button>
              {tipsOpen && (
                <ul className="space-y-2 pl-6">
                  {detail.tips.map((tip, i) => (
                    <li key={i} className="text-small text-text-secondary list-disc">
                      {tip}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </>
      ) : (
        <div className="mb-8 text-small text-text-tertiary">
          Detailed guidance coming soon.
        </div>
      )}

      {/* Action buttons */}
      <div className="space-y-3 border-t border-border pt-6">
        {/* Ask a question — Chat wired in AC-W4-10 */}
        <button
          onClick={() => {/* Chat wired in AC-W4-10 */}}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-button border border-border text-small font-medium text-text-primary hover:border-border-hover hover:bg-primary-subtle transition-colors focus:outline-none focus:ring-2 focus:ring-border-focus focus:ring-offset-2"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Ask a question
        </button>

        <div className="flex gap-3">
          {/* Mark as done — Wired in AC-W4-08 */}
          <button
            onClick={() => {/* Wired in AC-W4-08 */}}
            className="flex-1 px-4 py-3 rounded-button bg-primary text-text-inverse text-small font-semibold hover:bg-primary-hover transition-colors focus:outline-none focus:ring-2 focus:ring-border-focus focus:ring-offset-2"
          >
            Mark as done
          </button>
          {/* I've already done this — Wired in AC-W4-08 */}
          <button
            onClick={() => {/* Wired in AC-W4-08 */}}
            className="flex-1 px-4 py-3 rounded-button border border-border text-small font-medium text-text-primary hover:border-border-hover hover:bg-primary-subtle transition-colors focus:outline-none focus:ring-2 focus:ring-border-focus focus:ring-offset-2"
          >
            I&apos;ve already done this
          </button>
        </div>
      </div>
    </div>
  )
}
