"use client"

import { useRef, useState } from "react"
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
      <AlertDialogTrigger
        render={<Button type="button" variant="danger-ghost" className="-mx-3 min-h-11 px-3 text-danger-on-inverse state-inverse hover:text-fg-on-action max-narrow:mx-0 max-narrow:basis-full max-narrow:justify-start max-narrow:rounded-none max-narrow:border-0 max-narrow:border-t max-narrow:border-border-subtle max-narrow:px-0 max-narrow:text-danger max-narrow:state max-narrow:hover:text-danger" />}
      >
        Delete account<span className="hidden max-narrow:inline">…</span>
      </AlertDialogTrigger>
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
