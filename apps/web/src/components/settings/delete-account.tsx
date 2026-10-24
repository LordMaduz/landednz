"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { deleteAccount } from "@/lib/api"
import { signOutAndLeave } from "@/lib/sign-out"
import { createClient } from "@/lib/supabase/client"
import { SettingsSection } from "./settings-section"

const WHAT_GOES = "Removes your answers, your roadmap and your questions to the assistant. This can't be undone."

export function DeleteAccount() {
  const [error, setError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  async function confirm() {
    setError(null)
    setDeleting(true)
    try {
      const { data } = await createClient().auth.getSession()
      await deleteAccount(data.session?.access_token ?? "")
      await signOutAndLeave()
    } catch {
      setError("Couldn't delete your account. Try again.")
      setDeleting(false)
    }
  }

  return (
    <SettingsSection title="Delete your account" lede={WHAT_GOES}>
      <AlertDialog onOpenChange={open => !open && setError(null)}>
        <AlertDialogTrigger render={<Button variant="quiet" className="self-start" />}>Delete my account</AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete your account?</AlertDialogTitle>
            <AlertDialogDescription>{WHAT_GOES}</AlertDialogDescription>
          </AlertDialogHeader>
          {error && <p role="alert" className="text-ink">{error}</p>}
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirm} disabled={deleting}>Delete my account</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SettingsSection>
  )
}
