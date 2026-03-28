import { Sidebar } from '@/components/layout/Sidebar'

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen bg-bg">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-content mx-auto px-6 lg:px-10 py-7">
          {children}
        </div>
      </main>
    </div>
  )
}