interface SourcePillProps {
  name: string
}

function getSourceUrl(name: string): string {
  // Extract base domain from source name and create a proper URL
  if (name.includes('ird.govt.nz')) {
    return 'https://www.ird.govt.nz'
  }

  // For other sources, try to extract the domain
  const parts = name.split(' — ')
  if (parts.length > 1) {
    const domain = parts[1].toLowerCase()
    if (domain.includes('.govt.nz') || domain.includes('.co.nz')) {
      return `https://www.${domain}`
    }
  }

  // Fallback - try to find a domain-like pattern
  const domainMatch = name.match(/([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
  if (domainMatch) {
    return `https://www.${domainMatch[1]}`
  }

  return '#'
}

export function SourcePill({ name }: SourcePillProps) {
  const handleClick = () => {
    const url = getSourceUrl(name)
    if (url !== '#') {
      window.open(url, '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <button
      onClick={handleClick}
      className="inline-flex items-center gap-1 bg-bg border border-border rounded-badge px-2 py-0.5 text-caption font-medium text-primary hover:bg-primary-light hover:border-primary transition-colors cursor-pointer"
      aria-label={`Open source: ${name}`}
      type="button"
    >
      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {name}
    </button>
  )
}