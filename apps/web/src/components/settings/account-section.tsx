"use client"

import { Button } from "@/components/ui/button"
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
        "flex-row flex-wrap items-center gap-x-5 gap-y-2 border-fg bg-surface-inverse px-8 pt-4 pb-8 text-fg-on-action max-narrow:gap-x-3 max-narrow:gap-y-0 max-narrow:border-border-subtle max-narrow:bg-surface max-narrow:px-4 max-narrow:py-0 max-narrow:text-fg",
        joined && "rounded-t-none border-t-0 max-narrow:rounded-t-card max-narrow:border-t",
      )}
    >
      <span className={cn("basis-full break-words text-fg-on-inverse max-narrow:min-w-0 max-narrow:flex-1 max-narrow:basis-0 max-narrow:py-2 max-narrow:text-fg", joined && "border-t border-fg-on-action/15 pt-4 max-narrow:border-0 max-narrow:pt-2")}>
        {user.email}<span className="max-narrow:hidden"> · signs in with {user.google ? "Google" : "email"}</span>
      </span>
      <Button
        type="button"
        variant="text"
        onClick={signOutAndLeave}
        className="min-h-11 rounded-control text-link-on-inverse hover:text-fg-on-action max-narrow:border max-narrow:border-border max-narrow:bg-surface max-narrow:px-4 max-narrow:text-fg max-narrow:state max-narrow:state-base-surface max-narrow:hover:text-fg max-narrow:hover:no-underline"
      >
        Sign out
      </Button>
      <DeleteAccount />
    </Card>
  )
}
