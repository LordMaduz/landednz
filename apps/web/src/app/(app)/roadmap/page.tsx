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
    if ((err as { status?: number }).status === 404) {
      // No profile exists — redirect to onboarding (fixes first-time user flow)
      redirect('/onboarding')
    }
    // Other errors: pass null to show empty roadmap (AC-W4-14 handles error UI)
    return <RoadmapView initialData={null} token={session.access_token} />
  }
}
