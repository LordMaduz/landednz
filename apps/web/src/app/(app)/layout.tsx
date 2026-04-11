import { Sidebar } from '@/components/layout/Sidebar'
import { MobileNav } from '@/components/layout/MobileNav'
import { ChatWidget } from '@/components/chat/ChatWidget'
import { Toaster } from 'sonner'
import { createClient } from '@/lib/supabase/server'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Get session token for chat — chat API requires Bearer auth
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  const token = session?.access_token ?? null

  return (
    <div className="flex h-screen bg-bg">
      <MobileNav />
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-content mx-auto px-6 lg:px-10 py-7">
          {children}
        </div>
      </main>
      <ChatWidget token={token} />
      <Toaster position="bottom-center" />
    </div>
  )
}
