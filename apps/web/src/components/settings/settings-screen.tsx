"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ApiDown } from "@/components/chrome/api-down"
import { AppHeader, TabBarSpace, type HeaderUser } from "@/components/chrome/app-header"
import { LegalLinks } from "@/components/chrome/public-footer"
import { getOnboardingProfile, lastProfile, type GetProfileResponse } from "@/lib/api"
import { useGuideStore } from "@/lib/stores/guideStore"
import { createClient } from "@/lib/supabase/client"
import { AccountSection } from "./account-section"
import { PlanCard, PlanForm } from "./plan-form"
import { Skeleton } from "@/components/ui/skeleton"

type User = HeaderUser & { email: string; google: boolean }

// The plan needs the profile; Account and Delete work without it, so an API failure only replaces the plan
export function SettingsScreen({ user }: { user: User }) {
  const router = useRouter()
  const editing = useSearchParams().get("edit") !== null
  // What was fetched last draws at once; it stays while it refetches, and stays if that fails
  const [profile, setProfile] = useState<GetProfileResponse | "loading" | "down">(() => lastProfile() ?? "loading")

  const load = useCallback(async () => {
    setProfile(p => (typeof p === "string" ? "loading" : p))
    try {
      const { data } = await createClient().auth.getSession()
      const token = data.session?.access_token
      if (!token) return router.replace("/signin?redirect=%2Fsettings")
      setProfile(await getOnboardingProfile(token))
    } catch (err) {
      if ((err as { status?: number }).status === 404) return router.replace("/onboarding?step=1")
      setProfile(p => (typeof p === "string" ? "down" : p))
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
      <AppHeader active="settings" back={editing ? { href: "/settings", label: "Your details" } : undefined} user={user} />
      <main className="container-page container-app py-6 max-narrow:py-4">
        {/* phones: the identity card leads, so the title is for screen readers only */}
        <section aria-labelledby="details" className="mb-5 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 max-narrow:sr-only">
          <h1 id="details" className="text-title">Your details</h1>
          <p className="text-fg-muted">Your answers build your roadmap.</p>
        </section>
        <div className="grid grid-cols-settings gap-4 max-split:grid-cols-1 max-narrow:gap-3">
          {profile === "loading" || profile === "down" ? (
            <div className="flex flex-col gap-4">
              {profile === "loading" ? (
                <PlanCard>
                  <span className="sr-only">Loading</span>
                  <div className="px-5 pb-5"><Skeleton className="h-64 w-full" /></div>
                </PlanCard>
              ) : (
                <ApiDown heading="h2" onRetry={load} />
              )}
              <AccountSection user={user} />
            </div>
          ) : (
            <PlanForm profile={profile} account={<AccountSection user={user} />} />
          )}
        </div>
        {/* phones have no account menu: Privacy and Terms live here */}
        <LegalLinks className="hidden pt-6 max-narrow:flex" />
      </main>
      <TabBarSpace />
    </div>
  )
}
