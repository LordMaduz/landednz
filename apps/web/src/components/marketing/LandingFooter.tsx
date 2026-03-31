export function LandingFooter() {
  return (
    <footer className="bg-primary-darker py-10 px-6 border-t border-text-inverse/[0.06]">
      <div className="max-w-landing mx-auto flex justify-between items-center flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-secondary flex items-center justify-center">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-text-primary"
              />
            </svg>
          </div>
          <span className="font-display text-text-inverse/50">
            LandedNZ
          </span>
        </div>

        <div className="flex gap-6">
          <button className="text-small text-text-inverse/35 hover:text-text-inverse/50 transition-colors">
            Privacy
          </button>
          <button className="text-small text-text-inverse/35 hover:text-text-inverse/50 transition-colors">
            Terms
          </button>
          <button className="text-small text-text-inverse/35 hover:text-text-inverse/50 transition-colors">
            Contact
          </button>
        </div>

        <span className="text-small text-text-inverse/25">
          © 2026 LandedNZ
        </span>
      </div>
    </footer>
  )
}