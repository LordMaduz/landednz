import { AuthCard } from '@/components/auth/AuthCard'

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-6 relative">
      {/* Decorative circles */}
      <div
        className="absolute top-[10%] right-[10%] w-[300px] h-[300px] rounded-full border border-border opacity-30 pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-[15%] left-[8%] w-[200px] h-[200px] rounded-full border border-border opacity-20 pointer-events-none"
        aria-hidden="true"
      />

      {/* Auth card */}
      <div className="w-full max-w-auth-card bg-bg-card rounded-chat-panel border border-border px-9 py-10 shadow-auth-card relative z-10">
        <AuthCard />
      </div>
    </div>
  )
}
