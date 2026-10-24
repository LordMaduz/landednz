export function PublicFooter() {
  return (
    <footer className="border-t border-hairline">
      <div className="container-page flex min-h-16 flex-wrap items-center justify-between gap-x-6 gap-y-2 py-4">
        <span className="text-small text-muted">General information, not legal or tax advice.</span>
        <nav aria-label="Legal" className="flex gap-6 text-small">
          <a href="/privacy">Privacy</a>
          <a href="/terms">Terms</a>
        </nav>
      </div>
    </footer>
  )
}
