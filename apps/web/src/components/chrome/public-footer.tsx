import Link from "next/link"

// Signed-out pages only; signed-in pages reach Privacy and Terms from the account menu (phones: Your details). On phones the footer is one 36 px line.
export function PublicFooter() {
  return (
    <footer className="mt-auto border-t border-border-subtle">
      <div className="container-page flex min-h-footer flex-wrap max-narrow:flex-nowrap items-center justify-between gap-x-6 gap-y-2 py-3 max-narrow:py-0">
        <span className="text-small text-fg-muted">
          <span className="max-narrow:hidden">General information, not legal or tax advice.</span>
          <span className="hidden max-narrow:inline">Not legal or tax advice</span>
        </span>
        {/* link targets (target role); -my-2 keeps the footer at the board's height; on phones an ::after reaches 8 px up to keep 44 in the 36 px line (not down: it would grow the page) */}
        <LegalLinks withGuides className="-my-2 max-narrow:my-0 max-narrow:gap-4" />
      </div>
    </footer>
  )
}

// Guides is a public-page link only: the signed-in Settings screen reuses these links without it
export function LegalLinks({ className = "", withGuides = false }: { className?: string; withGuides?: boolean }) {
  return (
    <nav aria-label="Legal" className={`flex gap-6 text-small ${className}`}>
      {withGuides && <Link href="/guides" className="link-subtle relative inline-flex min-h-target items-center max-narrow:min-h-footer max-narrow:after:absolute max-narrow:after:-inset-x-2 max-narrow:after:-top-2 max-narrow:after:bottom-0">Guides</Link>}
      <a href="/about" className="link-subtle relative inline-flex min-h-target items-center max-narrow:min-h-footer max-narrow:after:absolute max-narrow:after:-inset-x-2 max-narrow:after:-top-2 max-narrow:after:bottom-0">About</a>
      <a href="/privacy" className="link-subtle relative inline-flex min-h-target items-center max-narrow:min-h-footer max-narrow:after:absolute max-narrow:after:-inset-x-2 max-narrow:after:-top-2 max-narrow:after:bottom-0">Privacy</a>
      <a href="/terms" className="link-subtle relative inline-flex min-h-target items-center max-narrow:min-h-footer max-narrow:after:absolute max-narrow:after:-inset-x-2 max-narrow:after:-top-2 max-narrow:after:bottom-0">Terms</a>
    </nav>
  )
}
