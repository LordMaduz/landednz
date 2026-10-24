export function PublicFooter() {
  return (
    <footer className="border-t border-hairline">
      <div className="container-page flex min-h-16 flex-wrap items-center justify-between gap-x-6 gap-y-2 py-4">
        <span className="text-small text-muted">General information, not legal or tax advice.</span>
        {/* 44 px link targets; -my-2 keeps the footer at the board's height */}
        <nav aria-label="Legal" className="-my-2 flex gap-6 text-small">
          <a href="/privacy" className="inline-flex min-h-11 items-center">Privacy</a>
          <a href="/terms" className="inline-flex min-h-11 items-center">Terms</a>
        </nav>
      </div>
    </footer>
  )
}
