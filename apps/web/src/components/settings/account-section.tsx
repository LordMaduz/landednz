"use client"

import { Avatar, type HeaderUser } from "@/components/chrome/app-header"
import { Button } from "@/components/ui/button"
import { Card, CardHead } from "@/components/ui/card"
import { signOutAndLeave } from "@/lib/sign-out"
import { DeleteAccount } from "./delete-account"

// Desktop: an Account card under Guide. Phone: the same card leads the page as the identity card (big avatar, centred)
export function AccountSection({ user }: { user: HeaderUser & { email: string; google: boolean } }) {
  return (
    <>
      <Card aria-labelledby="account" className="gap-1 max-narrow:order-first max-narrow:items-center max-narrow:gap-0 max-narrow:pt-8 max-narrow:text-center">
        <div className="max-narrow:sr-only">
          <CardHead title="Account" titleId="account" />
        </div>
        <div className="flex items-center gap-3 max-narrow:flex-col max-narrow:gap-0">
          <Avatar user={user} className="size-10 text-featured max-narrow:size-18" />
          <span className="flex min-w-0 flex-1 flex-col leading-snug">
            <span className="break-words max-narrow:mt-3 max-narrow:font-semibold">{user.email}</span>
            <span className="text-ui text-fg-muted">Signs in with {user.google ? "Google" : "email"}</span>
          </span>
          <Button type="button" variant="secondary" onClick={signOutAndLeave} className="min-h-10 max-narrow:mt-5 max-narrow:min-h-12 max-narrow:w-full">
            Sign out
          </Button>
        </div>
      </Card>
      <DeleteAccount />
    </>
  )
}
