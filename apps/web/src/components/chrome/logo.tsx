import Link from "next/link"

// The LandedNZ mark: two contour lines and a waypoint
export function Logo() {
  return (
    <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" className="shrink-0">
      <rect width="24" height="24" rx="6" className="fill-ink" />
      <path d="M4 15.5c2.6-.9 4.2-3.6 8-3.6s5.4 2.7 8 3.6" className="stroke-white" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M6.5 19c1.9-.6 3-2.2 5.5-2.2s3.6 1.6 5.5 2.2" className="stroke-white/55" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="16.5" cy="7.5" r="2" className="fill-mark" />
    </svg>
  )
}

export function Brand({ href }: { href: string }) {
  return (
    <Link href={href} aria-label="LandedNZ home" className="flex items-center gap-2 text-ink no-underline hover:text-ink hover:no-underline">
      <Logo />
      <span className="font-semibold tracking-tight max-compact:hidden">LandedNZ</span>
    </Link>
  )
}
