import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getRoadmap } from '@/lib/api'
import { RoadmapView } from '@/components/roadmap'

export default async function RoadmapPage() {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/auth/signin?redirect=/roadmap')
  }

  try {
    const data = await getRoadmap(session.access_token)
    return <RoadmapView initialData={data} token={session.access_token} />
  } catch (err: unknown) {
    const status = (err as { status?: number }).status

    if (status === 404) {
      // No profile exists — redirect to onboarding (fixes first-time user flow)
      redirect('/onboarding')
    }

    if (status === 401) {
      // Unauthorized — redirect to sign in with return URL
      redirect('/auth/signin?redirect=/roadmap')
    }

    // Network errors (no status) — re-throw to let error.tsx boundary handle
    if (!status) {
      throw err
    }

    // Server errors (5xx, other 4xx) — pass null to show inline error in RoadmapView
    return <RoadmapView initialData={null} token={session.access_token} />
  }
}
