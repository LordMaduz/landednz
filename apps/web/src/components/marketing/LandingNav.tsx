'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils/cn'

export function LandingNav() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav
      className={cn(
        'fixed top-0 left-0 right-0 z-50 px-6 h-16 flex items-center justify-between transition-all duration-300',
        scrolled
          ? 'bg-primary/95 backdrop-blur-md border-b border-text-inverse/5'
          : 'bg-transparent border-b border-transparent'
      )}
    >
      <div className="flex items-center gap-2.5">
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
        <span className="font-display text-xl text-text-inverse">
          LandedNZ
        </span>
      </div>

      <div className="flex items-center gap-8">
        <button className="text-secondary text-text-inverse/75 hover:text-secondary transition-colors">
          How it works
        </button>
        <button className="text-secondary text-text-inverse/75 hover:text-secondary transition-colors">
          Pricing
        </button>
        <button className="bg-secondary text-text-primary px-6 py-2.5 rounded-lg font-semibold text-secondary hover:scale-105 active:scale-100 transition-transform">
          Build my plan
        </button>
      </div>
    </nav>
  )
}