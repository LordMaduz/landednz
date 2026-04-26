'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils/cn'

export function LandingNav() {
  const [scrolled, setScrolled] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [hasProfile, setHasProfile] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

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

  const scrollToSection = (sectionNumber: number) => {
    const section = document.querySelector(`section:nth-of-type(${sectionNumber})`)
    section?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

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
    <nav
      className={cn(
        'fixed top-0 left-0 right-0 z-50 px-6 h-16 flex items-center justify-between transition-all duration-300',
        scrolled
          ? 'bg-primary/95 backdrop-blur-md border-b border-text-inverse/5'
          : 'bg-transparent border-b border-transparent'
      )}
    >
      <div className="flex items-center gap-2">
        {/* Logo mark */}
        <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-text-primary"
            />
          </svg>
        </div>
        <span className="font-display text-h3 text-text-inverse">
          LandedNZ
        </span>
      </div>

      <div className="hidden md:flex items-center gap-8">
        <button
          onClick={() => scrollToSection(3)}
          className="text-small text-text-inverse/75 hover:text-secondary transition-colors"
        >
          How it works
        </button>
        <button
          onClick={() => scrollToSection(5)}
          className="text-small text-text-inverse/75 hover:text-secondary transition-colors"
        >
          Pricing
        </button>
        <button
          onClick={handleButtonClick}
          disabled={isCheckingAuth}
          className="bg-secondary text-text-primary px-6 py-2.5 rounded-lg font-semibold text-small hover:scale-105 active:scale-100 transition-transform disabled:opacity-50 disabled:hover:scale-100"
        >
          {isCheckingAuth ? "Loading..." : buttonState.text}
        </button>
      </div>
    </nav>
  )
}