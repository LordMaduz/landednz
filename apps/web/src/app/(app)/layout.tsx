import { Sidebar } from '@/components/layout/Sidebar'
import { MobileNav } from '@/components/layout/MobileNav'
import { ChatWidget } from '@/components/chat/ChatWidget'
import { Toaster } from 'sonner'

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen bg-bg">
      <MobileNav />
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-content mx-auto px-6 lg:px-10 py-7">
          {children}
        </div>
      </main>
      <ChatWidget />
      <Toaster position="bottom-center" />
    </div>
  )
}