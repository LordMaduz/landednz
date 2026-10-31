// On phones the footer is one 36 px line; with `app` (signed-in pages) it also clears the 56 px tab bar.
// Signed-in from 1024 px it stays at the window bottom; the spacer keeps its 65 px so no content sits under it.
export function PublicFooter({ app }: { app?: boolean }) {
  return (
    <>
    {app && <div aria-hidden className="mt-auto hidden h-16 shrink-0 border-t border-transparent pane:block" />}
    <footer className={`mt-auto border-t border-border-subtle ${app ? "bg-surface pane:fixed pane:inset-x-0 pane:bottom-0 pane:z-40 pane:shadow-frame-bottom" : ""}`}>
      <div className={`container-page ${app ? "container-app max-narrow:mb-tab-bar" : ""} flex min-h-16 flex-wrap max-narrow:flex-nowrap items-center justify-between gap-x-6 gap-y-2 py-4 max-narrow:min-h-9 max-narrow:py-0`}>
        <span className="text-small text-fg-muted">
          <span className="max-narrow:hidden">General information, not legal or tax advice.</span>
          <span className="hidden max-narrow:inline">Not legal or tax advice</span>
        </span>
        {/* 44 px link targets; -my-2 keeps the footer at the board's height; on phones an ::after reaches 8 px up to keep 44 in the 36 px line (not down: it would grow the page) */}
        <nav aria-label="Legal" className="-my-2 flex gap-6 text-small max-narrow:my-0 max-narrow:gap-4">
          <a href="/privacy" className="link-subtle relative inline-flex min-h-11 items-center max-narrow:min-h-9 max-narrow:after:absolute max-narrow:after:-inset-x-2 max-narrow:after:-top-2 max-narrow:after:bottom-0">Privacy</a>
          <a href="/terms" className="link-subtle relative inline-flex min-h-11 items-center max-narrow:min-h-9 max-narrow:after:absolute max-narrow:after:-inset-x-2 max-narrow:after:-top-2 max-narrow:after:bottom-0">Terms</a>
        </nav>
      </div>
    </footer>
    </>
  )
}
