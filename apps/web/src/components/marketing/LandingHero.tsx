'use client';

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export function LandingHero() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [hasProfile, setHasProfile] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)

  // Check authentication status and profile
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const supabase = createClient()
        const { data: { session } } = await supabase.auth.getSession()

        if (session?.user) {
          setIsAuthenticated(true)

          // Check if user has completed profile by trying to fetch roadmap
          try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/roadmap`, {
              headers: {
                'Authorization': `Bearer ${session.access_token}`
              }
            })
            setHasProfile(response.ok)
          } catch (error) {
            // If roadmap fetch fails, assume no profile
            setHasProfile(false)
          }
        } else {
          setIsAuthenticated(false)
          setHasProfile(false)
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        setIsAuthenticated(false)
        setHasProfile(false)
      } finally {
        setIsCheckingAuth(false)
      }
    }

    checkAuthStatus()
  }, [])

  // Smart button logic based on auth state
  const getButtonState = () => {
    if (!isAuthenticated) {
      return {
        text: "Build my plan",
        action: () => router.push('/auth/signin?redirect=/onboarding')
      }
    }

    if (!hasProfile) {
      return {
        text: "Build my plan",
        action: () => router.push('/onboarding')
      }
    }

    return {
      text: "View my roadmap",
      action: () => router.push('/roadmap')
    }
  }

  const buttonState = getButtonState()

  const handleButtonClick = () => {
    buttonState.action()
  }

  return (
    <section className="relative bg-hero-gradient min-h-screen flex items-center justify-center px-6 pt-20 pb-20 overflow-hidden">
      {/* Decorative circles */}
      <div className="absolute top-[15%] right-[-5%] w-[500px] h-[500px] rounded-full border border-secondary/[0.08] pointer-events-none" />
      <div className="absolute bottom-[10%] left-[-8%] w-[400px] h-[400px] rounded-full border border-text-inverse/[0.04] pointer-events-none" />

      {/* Grain texture overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E")`
        }}
      />

      <div className="relative z-10 text-center max-w-[800px]">
        {/* Beta Badge */}
        <div className="fade-in-up delay-1 mb-4">
          <div className="inline-flex items-center px-3 py-1.5 rounded-full border border-secondary/20 bg-secondary/10 text-secondary text-small font-medium">
            <span className="w-2 h-2 bg-secondary rounded-full mr-2"></span>
            Free Beta — All Premium Features Included
          </div>
        </div>

        {/* Eyebrow */}
        <div className="fade-in-up delay-1 mb-6">
          <span className="text-small text-secondary font-medium px-4 py-1.5 rounded-full inline-block">
            FOR SKILLED MIGRANTS TO NEW ZEALAND
          </span>
        </div>

        {/* Headline */}
        <h1 className="fade-in-up delay-2 font-display text-h1 text-text-inverse mb-4 leading-tight tracking-tight">
          The first month in{' '}
          <span className="text-secondary">New Zealand</span>
          <br />
          will make or break you.
        </h1>

        {/* Sub */}
        <p className="fade-in-up delay-3 text-body text-text-inverse/[0.78] max-w-[560px] mx-auto mb-8">
          Get your personalized settlement roadmap based on your visa, city, and family situation.
          Know exactly what to do before costly mistakes happen.
        </p>

        {/* CTA */}
        <div className="fade-in-up delay-4 mb-4">
          <button
            onClick={handleButtonClick}
            disabled={isCheckingAuth}
            className="bg-secondary text-text-primary px-12 py-4 rounded-button text-body font-semibold tracking-wide hover:scale-105 active:scale-100 transition-transform disabled:opacity-50 disabled:hover:scale-100"
          >
            {isCheckingAuth ? "Loading..." : buttonState.text}
          </button>
        </div>

        {/* Secondary link */}
        <div className="fade-in-up delay-5 mb-8">
          <button
            onClick={() => {
              const nextSection = document.querySelector('section:nth-of-type(2)');
              nextSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}
            className="group flex flex-col items-center gap-3 text-body text-secondary hover:text-text-inverse/75 transition-all duration-300 mx-auto"
          >
            <span className="underline underline-offset-4">See how it works</span>
            <svg
              className="w-5 h-5 group-hover:translate-y-1 transition-transform duration-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </button>
        </div>

        {/* Trust signal */}
        <p className="fade-in delay-6 text-small text-text-inverse/[0.4] tracking-wide">
          Beta access · No payment required · All features unlocked
        </p>
      </div>
    </section>
  )
}