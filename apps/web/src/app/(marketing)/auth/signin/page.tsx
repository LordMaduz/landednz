import { AuthCard } from '@/components/auth/AuthCard'

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-6 relative">
      {/* Decorative circles */}
      <div
        className="absolute top-10p right-10p w-circle-lg h-circle-lg rounded-full border border-border opacity-30 pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-15p left-8p w-circle-sm h-circle-sm rounded-full border border-border opacity-20 pointer-events-none"
        aria-hidden="true"
      />

      {/* Auth card */}
      <div className="w-full max-w-auth-card bg-bg-card rounded-chat-panel border border-border px-9 py-10 shadow-auth-card relative z-10">
        <AuthCard />
      </div>
    </div>
  )
}
