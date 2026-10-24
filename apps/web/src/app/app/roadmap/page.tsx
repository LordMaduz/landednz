import type { Metadata } from "next"
import { Suspense } from "react"
import { redirect } from "next/navigation"
import { connection } from "next/server"
import Loading from "@/app/app/loading"
import { RoadmapScreen } from "@/components/workspace/roadmap-view"
import { createClient } from "@/lib/supabase/server"
import { userBadge } from "@/lib/user-badge"

export const metadata: Metadata = { title: "Your roadmap" }

async function Roadmap() {
  await connection()
  const { data: { user } } = await (await createClient()).auth.getUser()
  if (!user) redirect("/signin?redirect=%2Fapp%2Froadmap")
  return <RoadmapScreen user={userBadge(user)} />
}

export default function RoadmapPage() {
  return (
    <Suspense fallback={<Loading />}>
      <Roadmap />
    </Suspense>
  )
}
