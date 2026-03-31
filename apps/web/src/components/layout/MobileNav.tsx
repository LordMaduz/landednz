'use client'

import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Map, MessageSquare, Settings, BookOpen, Mail, Menu, X } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils/cn'

const navItems = [
  { href: '/roadmap', label: 'Roadmap', icon: Map },
  { href: '/chat', label: 'Chat', icon: MessageSquare },
  { href: '/settings', label: 'Settings', icon: Settings },
]

const helpItems = [
  { label: 'Resources', icon: BookOpen },
  { label: 'Feedback', icon: Mail },
]

export function MobileNav() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  // Close on escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  // Close when navigating
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  return (
    <>
      {/* Hamburger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-bg-card rounded-button border border-border shadow-card hover:shadow-card-hover transition-shadow motion-reduce:transition-none"
      >
        <Menu className="h-5 w-5 text-text-primary" />
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={cn(
          'fixed left-0 top-0 h-full w-sidebar bg-bg-sidebar border-r border-border z-40 flex flex-col',
          'transform transition-transform motion-reduce:transition-none duration-300',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Header with close button */}
        <div className="p-5 pb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-secondary rounded-lg flex items-center justify-center shrink-0">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-text-primary">
                <path
                  d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <span className="font-display text-h3 text-text-primary">
              LandedNZ
            </span>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 rounded-button text-text-secondary hover:bg-primary-subtle transition-colors motion-reduce:transition-none"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Primary Nav */}
        <nav className="px-3 mb-6 flex flex-col space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'w-full flex items-center gap-2 px-3 py-2 rounded-button transition-colors motion-reduce:transition-none',
                  'border-l-3',
                  isActive
                    ? 'bg-primary-light text-primary border-primary font-semibold'
                    : 'text-text-secondary hover:bg-primary-subtle border-transparent'
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* HELP Section */}
        <div className="px-4 pb-2">
          <span className="text-caption font-medium text-text-tertiary uppercase tracking-wider">
            Help
          </span>
        </div>

        <div className="px-3 pb-4 space-y-1">
          {helpItems.map((item) => {
            const Icon = item.icon

            return (
              <button
                key={item.label}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-button text-text-secondary hover:bg-primary-subtle transition-colors motion-reduce:transition-none"
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </button>
            )
          })}
        </div>

        {/* User Footer */}
        <div className="border-t border-border p-5 mt-auto">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-light rounded-full flex items-center justify-center shrink-0 text-caption font-semibold text-primary">
              P
            </div>
            <div>
              <div className="text-secondary font-semibold text-text-primary">Priya & Karthik</div>
              <div className="text-caption text-text-tertiary">Partner of Student Visa · Auckland</div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}