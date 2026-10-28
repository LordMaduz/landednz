"use client"

import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardFoot, CardHead } from "@/components/ui/card"
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
    <Card aria-labelledby="del" className="gap-3">
      <CardHead title="Delete account" titleId="del" />
      <p className="text-small text-muted">{WHAT_GOES}</p>
      <CardFoot>
        <AlertDialog onOpenChange={open => !open && setError(null)}>
          <AlertDialogTrigger render={<Button variant="quiet" className="text-danger hover:text-danger" />}>Delete my account</AlertDialogTrigger>
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
      </CardFoot>
    </Card>
  )
}
