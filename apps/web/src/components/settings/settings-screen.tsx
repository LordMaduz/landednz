"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ApiDown } from "@/components/chrome/api-down"
import { AppHeader } from "@/components/chrome/app-header"
import { PublicFooter } from "@/components/chrome/public-footer"
import { getOnboardingProfile, type GetProfileResponse } from "@/lib/api"
import { useGuideStore } from "@/lib/stores/guideStore"
import { createClient } from "@/lib/supabase/client"
import { AccountSection } from "./account-section"
import { AnswersCard, PlanForm } from "./plan-form"
import { Skeleton } from "@/components/ui/skeleton"

type User = { name: string; initials: string; email: string; google: boolean }

// The plan needs the profile; Account and Delete work without it, so an API failure only replaces the plan
export function SettingsScreen({ user }: { user: User }) {
  const router = useRouter()
  const editing = useSearchParams().get("edit") !== null
  const [profile, setProfile] = useState<GetProfileResponse | "loading" | "down">("loading")

  const load = useCallback(async () => {
    setProfile("loading")
    try {
      const { data } = await createClient().auth.getSession()
      const token = data.session?.access_token
      if (!token) return router.replace("/signin?redirect=%2Fsettings")
      setProfile(await getOnboardingProfile(token))
    } catch (err) {
      if ((err as { status?: number }).status === 404) return router.replace("/onboarding?step=1")
      setProfile("down")
    }
  }, [router])

  // No guide on Settings (D21): the pane closes and the ask bar goes; the conversation is kept
  useEffect(() => {
    const { setPage, close } = useGuideStore.getState()
    setPage(null)
    close()
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch on mount; load sets state after awaiting
    load()
  }, [load])

  return (
    <div className="flex min-h-dvh flex-col">
      <AppHeader active="settings" back={editing ? { href: "/settings", label: "Settings" } : undefined} user={user} />
      <main className="container-page container-app py-6 max-narrow:py-4">
        <div className="grid grid-cols-settings gap-4 max-split:grid-cols-1 max-narrow:gap-2.5">
          {profile === "loading" || profile === "down" ? (
            <div className="flex flex-col gap-4">
              {profile === "loading" ? (
                <AnswersCard>
                  <span className="sr-only">Loading</span>
                  <Skeleton className="mt-5 h-40 w-full bg-white/15" />
                </AnswersCard>
              ) : (
                <>
                  <h1 className="text-title">Settings</h1>
                  <ApiDown heading="h2" onRetry={load} />
                </>
              )}
              <AccountSection user={user} />
            </div>
          ) : (
            <PlanForm profile={profile} account={<AccountSection user={user} joined />} />
          )}
        </div>
      </main>
      <PublicFooter app />
    </div>
  )
}
