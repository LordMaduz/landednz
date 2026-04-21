'use client'

interface ErrorProps {
  error: Error
  reset: () => void
}

export default function RoadmapError({ error, reset }: ErrorProps) {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="bg-error-light border border-error rounded-button px-6 py-8 max-w-md text-center">
        <div className="w-12 h-12 rounded-full bg-error flex items-center justify-center mx-auto mb-4">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2" />
            <path d="M15 9l-6 6M9 9l6 6" stroke="white" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
        <h2 className="text-small font-semibold text-text-primary mb-2">Something went wrong</h2>
        <p className="text-small text-text-secondary mb-6">
          We couldn't load your roadmap. Please check your connection and try again.
        </p>
        <button
          onClick={reset}
          className="w-full px-4 py-3 rounded-button bg-primary text-text-inverse text-small font-semibold hover:bg-primary-hover transition-colors focus:outline-none focus:ring-2 focus:ring-border-focus focus:ring-offset-2"
        >
          Try again
        </button>
      </div>
    </div>
  )
}