"use client"

import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
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

const WHAT_GOES = "Removes your answers, your roadmap and your questions to the assistant. This can't be undone."

export function DeleteAccount() {
  const [error, setError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const keep = useRef<HTMLButtonElement>(null)

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
    <AlertDialog onOpenChange={open => !open && setError(null)}>
      <Card variant="plain" aria-label="Delete account" className="flex-row items-center gap-4 max-narrow:flex-col max-narrow:items-stretch max-narrow:gap-3">
        <p className="m-0 flex-1 text-ui text-fg-muted">{WHAT_GOES}</p>
        <AlertDialogTrigger render={<Button type="button" variant="secondary" className="text-danger hover:text-danger max-narrow:min-h-control-lg" />}>
          Delete account…
        </AlertDialogTrigger>
      </Card>
      <AlertDialogContent initialFocus={keep}>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete your account?</AlertDialogTitle>
          <AlertDialogDescription>{WHAT_GOES}</AlertDialogDescription>
        </AlertDialogHeader>
        {error && <p role="alert" className="text-danger">{error}</p>}
        <AlertDialogFooter>
          <AlertDialogCancel ref={keep}>Keep my account</AlertDialogCancel>
          <AlertDialogAction
            onClick={confirm}
            disabled={deleting}
            className="border-danger bg-danger text-fg-on-action hover:bg-danger hover:text-fg-on-action"
          >
            Delete account
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
