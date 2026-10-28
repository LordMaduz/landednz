"use client"

import { Button } from "@/components/ui/button"
import { Card, CardFoot, CardHead } from "@/components/ui/card"
import { signOutAndLeave } from "@/lib/sign-out"

export function AccountSection({ user }: { user: { name: string; initials: string; email: string; google: boolean } }) {
  return (
    <Card aria-labelledby="acct">
      <CardHead title="Account" titleId="acct" />
      <div className="flex items-start gap-3">
        <span aria-hidden="true" className="flex size-10 flex-none items-center justify-center rounded-full bg-avatar text-small font-semibold text-teal-text">
          {user.initials}
        </span>
        <div className="flex min-w-0 flex-col">
          <span className="font-medium break-words">{user.name}</span>
          {user.email !== user.name && <span className="text-small break-words text-muted">{user.email}</span>}
          <span className="text-small text-muted">{user.google ? "Signs in with Google" : "Signs in with email"}</span>
        </div>
      </div>
      <CardFoot>
        <Button variant="quiet" onClick={signOutAndLeave}>Sign out</Button>
      </CardFoot>
    </Card>
  )
}
