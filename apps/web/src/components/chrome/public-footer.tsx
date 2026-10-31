// Signed-out pages only; signed-in pages reach Privacy and Terms from the account menu (phones: Your details). On phones the footer is one 36 px line.
export function PublicFooter() {
  return (
    <footer className="mt-auto border-t border-border-subtle">
      <div className="container-page flex min-h-14 flex-wrap max-narrow:flex-nowrap items-center justify-between gap-x-6 gap-y-2 py-3 max-narrow:min-h-9 max-narrow:py-0">
        <span className="text-small text-fg-muted">
          <span className="max-narrow:hidden">General information, not legal or tax advice.</span>
          <span className="hidden max-narrow:inline">Not legal or tax advice</span>
        </span>
        {/* 44 px link targets; -my-2 keeps the footer at the board's height; on phones an ::after reaches 8 px up to keep 44 in the 36 px line (not down: it would grow the page) */}
        <LegalLinks className="-my-2 max-narrow:my-0 max-narrow:gap-4" />
      </div>
    </footer>
  )
}

export function LegalLinks({ className = "" }: { className?: string }) {
  return (
    <nav aria-label="Legal" className={`flex gap-6 text-small ${className}`}>
      <a href="/privacy" className="link-subtle relative inline-flex min-h-11 items-center max-narrow:min-h-9 max-narrow:after:absolute max-narrow:after:-inset-x-2 max-narrow:after:-top-2 max-narrow:after:bottom-0">Privacy</a>
      <a href="/terms" className="link-subtle relative inline-flex min-h-11 items-center max-narrow:min-h-9 max-narrow:after:absolute max-narrow:after:-inset-x-2 max-narrow:after:-top-2 max-narrow:after:bottom-0">Terms</a>
    </nav>
  )
}
