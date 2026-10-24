"use client"

import { Button } from "@/components/ui/button"
import { signOutAndLeave } from "@/lib/sign-out"
import { SettingsSection } from "./settings-section"

export function AccountSection({ user }: { user: { name: string; email: string; google: boolean } }) {
  return (
    <SettingsSection title="Account" lede={user.google ? "You sign in with Google." : "You sign in with your email."}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex min-w-0 flex-col">
          <span className="font-medium break-words">{user.name}</span>
          {user.email !== user.name && <span className="break-words text-muted">{user.email}</span>}
        </div>
        <Button variant="quiet" onClick={signOutAndLeave}>Sign out</Button>
      </div>
    </SettingsSection>
  )
}
