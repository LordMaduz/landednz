'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils/cn'
import { Input } from '@/components/ui/Input'

type AuthMode = 'main' | 'email' | 'magic_sent' | 'google_loading'

function GoogleLogo() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  )
}

function Spinner() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      className="animate-spin"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" opacity="0.25" />
      <path d="M12 2a10 10 0 019.95 9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  )
}

const isValidEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)

export interface AuthCardProps {
  initialMode?: AuthMode
  initialEmail?: string
}

export function AuthCard({ initialMode = 'main', initialEmail = '' }: AuthCardProps) {
  const [mode, setMode] = useState<AuthMode>(initialMode)
  const [email, setEmail] = useState(initialEmail)
  const [emailError, setEmailError] = useState('')

  const handleGoogleClick = () => {
    setMode('google_loading')
    setTimeout(() => setMode('main'), 2500)
  }

  const handleEmailSubmit = (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!email.trim()) {
      setEmailError('Please enter your email address.')
      return
    }
    if (!isValidEmail(email)) {
      setEmailError("That doesn't look like a valid email address.")
      return
    }
    setEmailError('')
    setMode('magic_sent')
  }

  // ─── Magic Link Sent State ───
  if (mode === 'magic_sent') {
    return (
      <div className="scale-in text-center">
        <div className="w-16 h-16 rounded-full bg-success-light flex items-center justify-center mx-auto mb-5">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-success" aria-hidden="true">
            <rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" />
            <path d="M22 4l-10 8L2 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h2 className="font-display text-h2 text-text-primary mb-2">
          Check your email
        </h2>
        <p className="text-small text-text-secondary leading-body mb-2">
          We sent a sign-in link to
        </p>
        <p className="text-small font-semibold text-text-primary mb-6">
          {email}
        </p>
        <p className="text-caption text-text-tertiary leading-body mb-7">
          Click the link in the email to sign in. It expires in 10 minutes.
          <br />
          Check your spam folder if you don&apos;t see it.
        </p>
        <button
          onClick={() => setMode('email')}
          className="text-caption font-medium text-primary hover:text-primary-hover transition-colors duration-150 motion-reduce:transition-none"
        >
          ← Use a different email
        </button>
      </div>
    )
  }

  return (
    <div className="fade-in-up">
      {/* Logo */}
      <div className="flex justify-center mb-7">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-button bg-secondary flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-text-primary" aria-hidden="true">
              <path
                d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <span className="font-display text-h3 text-text-primary">LandedNZ</span>
        </div>
      </div>

      {/* Heading */}
      <h1 className="font-display text-h2 text-text-primary text-center mb-2">
        Save your progress
      </h1>
      <p className="text-small text-text-secondary leading-body text-center mb-8">
        Sign in to keep your roadmap and pick up where you left off.
      </p>

      {/* Google OAuth button */}
      <button
        onClick={handleGoogleClick}
        disabled={mode === 'google_loading'}
        className={cn(
          'w-full flex items-center justify-center gap-2.5',
          'py-3.5 px-5',
          'rounded-button border border-1.5 border-border bg-bg-card',
          'text-small font-medium text-text-primary',
          'transition-all duration-150 motion-reduce:transition-none',
          'hover:border-border-hover hover:bg-primary-subtle hover:-translate-y-px',
          'active:translate-y-0',
          'disabled:opacity-60 disabled:cursor-default disabled:hover:translate-y-0 disabled:hover:bg-bg-card disabled:hover:border-border',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30',
          'mb-5',
        )}
      >
        {mode === 'google_loading' ? (
          <>
            <Spinner />
            <span className="text-text-tertiary">Connecting to Google...</span>
          </>
        ) : (
          <>
            <GoogleLogo />
            Continue with Google
          </>
        )}
      </button>

      {/* Divider */}
      <div className="flex items-center gap-4 mb-5">
        <div className="flex-1 h-px bg-border" />
        <span className="text-caption text-text-tertiary">or</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      {/* Email section — expanded input or collapsed button */}
      {mode === 'email' ? (
        <form onSubmit={handleEmailSubmit} noValidate className="fade-in">
          <div className="mb-3">
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                setEmailError('')
              }}
              error={emailError}
              autoFocus
            />
          </div>
          <button
            type="submit"
            className={cn(
              'w-full flex items-center justify-center',
              'py-3.5 px-5',
              'rounded-button bg-primary',
              'text-small font-semibold text-text-inverse',
              'transition-all duration-150 motion-reduce:transition-none',
              'hover:bg-primary-hover hover:-translate-y-px',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30',
            )}
          >
            Continue
          </button>
          <div className="text-center mt-3">
            <button
              type="button"
              onClick={() => {
                setMode('main')
                setEmailError('')
              }}
              className="text-caption text-text-tertiary hover:text-primary transition-colors duration-150 motion-reduce:transition-none"
            >
              ← Back
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setMode('email')}
          className={cn(
            'w-full flex items-center justify-center gap-2',
            'py-3.5 px-5',
            'rounded-button border border-1.5 border-border bg-transparent',
            'text-small font-medium text-text-secondary',
            'transition-all duration-150 motion-reduce:transition-none',
            'hover:border-border-hover hover:bg-primary-subtle',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30',
          )}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" />
            <path
              d="M22 4l-10 8L2 4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Continue with email
        </button>
      )}

      {/* Trust signal */}
      <p className="text-caption text-text-tertiary text-center mt-5 leading-body">
        We&apos;ll never share your email. No spam, ever.
      </p>

      {/* Terms */}
      <p className="text-caption text-text-tertiary text-center mt-4 leading-body">
        By continuing, you agree to our{' '}
        <span className="text-primary cursor-pointer hover:underline">Terms of Service</span>
        {' '}and{' '}
        <span className="text-primary cursor-pointer hover:underline">Privacy Policy</span>
      </p>
    </div>
  )
}
