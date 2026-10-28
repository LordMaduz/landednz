// With `app` (signed-in pages) the phone footer is one 36 px line that clears the 56 px tab bar
export function PublicFooter({ app }: { app?: boolean }) {
  const phone = app ? "max-narrow:mb-14 max-narrow:min-h-9 max-narrow:py-0" : ""
  return (
    <footer className="border-t border-hairline">
      <div className={`container-page ${app ? "container-app" : ""} flex min-h-16 flex-wrap max-narrow:flex-nowrap items-center justify-between gap-x-6 gap-y-2 py-4 ${phone}`}>
        <span className="text-small text-muted">
          {app ? (
            <>
              <span className="max-narrow:hidden">General information, not legal or tax advice.</span>
              <span className="hidden max-narrow:inline">Not legal or tax advice</span>
            </>
          ) : (
            "General information, not legal or tax advice."
          )}
        </span>
        {/* 44 px link targets; -my-2 keeps the footer at the board's height */}
        <nav aria-label="Legal" className={`-my-2 flex gap-6 text-small ${app ? "max-narrow:my-0 max-narrow:gap-4" : ""}`}>
          <a href="/privacy" className={`inline-flex min-h-11 items-center ${app ? "max-narrow:min-h-9" : ""}`}>Privacy</a>
          <a href="/terms" className={`inline-flex min-h-11 items-center ${app ? "max-narrow:min-h-9" : ""}`}>Terms</a>
        </nav>
      </div>
    </footer>
  )
}
