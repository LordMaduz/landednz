import type { Metadata } from "next"
import { Suspense } from "react"
import { redirect } from "next/navigation"
import { connection } from "next/server"
import Loading from "@/app/app/loading"
import { SettingsScreen } from "@/components/settings/settings-screen"
import { createClient } from "@/lib/supabase/server"
import { userBadge } from "@/lib/user-badge"

export const metadata: Metadata = { title: "Settings" }

async function Settings() {
  await connection()
  const { data: { user } } = await (await createClient()).auth.getUser()
  if (!user) redirect("/signin?redirect=%2Fsettings")
  const google = user.app_metadata?.provider === "google"
  return <SettingsScreen user={{ ...userBadge(user), email: user.email ?? "", google }} />
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<Loading />}>
      <Settings />
    </Suspense>
  )
}
