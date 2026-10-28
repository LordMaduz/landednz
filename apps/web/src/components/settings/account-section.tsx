"use client"

import { Card } from "@/components/ui/card"
import { signOutAndLeave } from "@/lib/sign-out"
import { cn } from "@/lib/utils"
import { DeleteAccount } from "./delete-account"

// Desktop: the lower half of the navy answers card (joined). Phone: its own white card, email + Sign out, then Delete account…
export function AccountSection({ user, joined }: { user: { email: string; google: boolean }; joined?: boolean }) {
  return (
    <Card
      aria-label="Account"
      className={cn(
        "flex-row flex-wrap items-center gap-x-5 gap-y-1.5 border-ink bg-ink px-8 pt-4 pb-8 text-white max-narrow:gap-x-3 max-narrow:gap-y-0 max-narrow:border-hairline max-narrow:bg-white max-narrow:px-4 max-narrow:py-0 max-narrow:text-ink",
        joined && "rounded-t-none border-t-0 max-narrow:rounded-t-surface max-narrow:border-t",
      )}
    >
      <span className={cn("basis-full break-words text-rail-text max-narrow:min-w-0 max-narrow:flex-1 max-narrow:basis-0 max-narrow:py-2 max-narrow:text-ink", joined && "border-t border-white/15 pt-4 max-narrow:border-0 max-narrow:pt-2")}>
        {user.email}<span className="max-narrow:hidden"> · signs in with {user.google ? "Google" : "email"}</span>
      </span>
      <button
        type="button"
        onClick={signOutAndLeave}
        className="min-h-11 cursor-pointer rounded-control border-0 bg-transparent p-0 font-medium text-toast-action hover:text-white max-narrow:border max-narrow:border-border max-narrow:bg-white max-narrow:px-4 max-narrow:text-ink max-narrow:hover:bg-wash max-narrow:hover:text-ink"
      >
        Sign out
      </button>
      <DeleteAccount />
    </Card>
  )
}
