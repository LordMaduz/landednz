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
        render={<button type="button" className="min-h-11 cursor-pointer border-0 bg-transparent p-0 font-medium text-danger-on-ink hover:text-white max-narrow:basis-full max-narrow:text-left max-narrow:border-t max-narrow:border-hairline max-narrow:text-danger max-narrow:hover:text-danger" />}
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
            className="border-danger bg-danger text-white hover:bg-danger hover:text-white"
          >
            Delete account
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
