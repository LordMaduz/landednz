"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ApiDown } from "@/components/chrome/api-down"
import { AppHeader } from "@/components/chrome/app-header"
import { getOnboardingProfile, type GetProfileResponse } from "@/lib/api"
import { createClient } from "@/lib/supabase/client"
import { AccountSection } from "./account-section"
import { DeleteAccount } from "./delete-account"
import { PlanForm } from "./plan-form"
import { SettingsSection } from "./settings-section"

type User = { name: string; initials: string; email: string; google: boolean }

// The plan needs the profile; Account and Delete work without it, so an API failure only replaces the plan
export function SettingsScreen({ user }: { user: User }) {
  const router = useRouter()
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

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch on mount; load sets state after awaiting
    load()
  }, [load])

  return (
    <>
      <AppHeader active={null} user={user} onAsk={() => router.push("/app/roadmap?ask=1")} />
      <main className="container-page flex flex-col gap-8 pt-12 pb-24">
        <h1 className="text-title">Settings</h1>
        <div>
          {profile === "loading" ? (
            <SettingsSection title="Your plan" lede="Your roadmap is built from these answers.">
              <div aria-busy="true" className="h-48 rounded-surface bg-wash">
                <span className="sr-only">Loading</span>
              </div>
            </SettingsSection>
          ) : profile === "down" ? (
            <SettingsSection title="Your plan" lede="Your roadmap is built from these answers.">
              <ApiDown heading="h2" onRetry={load} />
            </SettingsSection>
          ) : (
            <PlanForm profile={profile} />
          )}
          <AccountSection user={user} />
          <DeleteAccount />
        </div>
      </main>
    </>
  )
}
