import type { Metadata } from "next"
import { Suspense } from "react"
import { redirect } from "next/navigation"
import { connection } from "next/server"
import Loading from "@/app/app/loading"
import { HomeScreen } from "@/components/workspace/home-view"
import { firstName } from "@/lib/home-view"
import { createClient } from "@/lib/supabase/server"
import { userBadge } from "@/lib/user-badge"

export const metadata: Metadata = { title: "Home" }

async function Home() {
  await connection()
  const { data: { user } } = await (await createClient()).auth.getUser()
  if (!user) redirect("/signin?redirect=%2Fapp")
  return <HomeScreen user={userBadge(user)} firstName={firstName(user)} />
}

export default function HomePage() {
  return (
    <Suspense fallback={<Loading />}>
      <Home />
    </Suspense>
  )
}
