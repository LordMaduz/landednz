interface ThinkingIndicatorProps {
  status?: string
}

export function ThinkingIndicator({ status }: ThinkingIndicatorProps) {
  return (
    <div className="flex gap-2.5 items-start mb-4 px-1">
      {/* Avatar */}
      <div className="w-7 h-7 rounded-full bg-primary-light flex items-center justify-center flex-shrink-0 mt-0.5">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
            stroke="currentColor"
            className="text-primary"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <div>
        {/* Thinking dots */}
        <div className="flex gap-1 mb-2 mt-1.5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-primary typing-dot flex-shrink-0"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>

        {/* Status text */}
        {status && (
          <p className="text-caption text-text-tertiary">{status}</p>
        )}
      </div>
    </div>
  )
}