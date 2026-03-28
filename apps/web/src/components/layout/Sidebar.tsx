'use client'

import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Map, MessageSquare, Settings, BookOpen, Mail, ChevronRight, Lock, Menu } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils/cn'
import { Tooltip } from '@/components/ui/Tooltip'

const navItems = [
  { href: '/roadmap', label: 'Roadmap', icon: Map },
  { href: '/chat', label: 'Chat', icon: MessageSquare },
  { href: '/settings', label: 'Settings', icon: Settings },
]

const phases = [
  { num: 1, name: 'Before you start working', timeline: 'Week 1' },
  { num: 2, name: 'First 2 weeks', timeline: 'Weeks 1–2' },
  { num: 3, name: 'Settling in', timeline: 'Weeks 3–8', premium: true },
]

const helpItems = [
  { label: 'Resources', icon: BookOpen },
  { label: 'Feedback', icon: Mail },
]

export function Sidebar() {
  const pathname = usePathname()
  const [expandedPhases, setExpandedPhases] = useState<number[]>([1])
  const [isTabletExpanded, setIsTabletExpanded] = useState(false)

  // Close tablet overlay on escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsTabletExpanded(false)
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [])

  const togglePhase = (num: number) => {
    setExpandedPhases(prev =>
      prev.includes(num) ? prev.filter(n => n !== num) : [...prev, num]
    )
  }

  const NavItem = ({ item, isCollapsed }: { item: typeof navItems[0], isCollapsed: boolean }) => {
    const isActive = pathname === item.href
    const Icon = item.icon

    const linkContent = (
      <Link
        href={item.href}
        className={cn(
          'flex items-center gap-2.5 px-3 py-2 rounded-button transition-colors motion-reduce:transition-none',
          'border-l-3',
          isActive
            ? 'bg-primary-light text-primary border-primary font-semibold'
            : 'text-text-secondary hover:bg-primary-subtle border-transparent'
        )}
      >
        <Icon className="h-4 w-4 shrink-0" />
        <span className="hidden xl:block">{item.label}</span>
      </Link>
    )

    if (isCollapsed && !isTabletExpanded) {
      return (
        <Tooltip content={item.label} position="right">
          {linkContent}
        </Tooltip>
      )
    }

    return linkContent
  }

  return (
    <>
      {/* Tablet backdrop */}
      {isTabletExpanded && (
        <div
          className="fixed inset-0 bg-black/20 z-20 md:block xl:hidden"
          onClick={() => setIsTabletExpanded(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'hidden md:flex h-full bg-bg-sidebar shrink-0 border-r border-border flex-col relative z-30',
          'xl:w-sidebar',
          isTabletExpanded ? 'w-sidebar' : 'w-sidebar-collapsed xl:w-sidebar',
          isTabletExpanded && 'md:absolute md:inset-y-0 md:left-0 xl:relative'
        )}
      >
        {/* Logo */}
        <div className="p-5 pb-4 flex items-center gap-2.5">
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
          <span className="font-display text-h3 text-text-primary hidden xl:block">
            LandedNZ
          </span>
        </div>

        {/* Tablet hamburger */}
        <button
          onClick={() => setIsTabletExpanded(!isTabletExpanded)}
          className="md:flex xl:hidden mx-3 mb-2 p-2 rounded-button text-text-secondary hover:bg-primary-subtle transition-colors motion-reduce:transition-none"
        >
          <Menu className="h-4 w-4" />
        </button>

        {/* Primary Nav */}
        <nav className="px-3 mb-2 space-y-1">
          {navItems.map((item) => (
            <NavItem
              key={item.href}
              item={item}
              isCollapsed={!isTabletExpanded}
            />
          ))}
        </nav>

        {/* YOUR PLAN Section */}
        <div className="px-5 pb-2 pt-3">
          <span className="text-caption font-medium text-text-tertiary uppercase tracking-wider hidden xl:block">
            Your plan
          </span>
        </div>

        {/* Phase sections */}
        <div className="px-3 flex-1 space-y-1">
          {phases.map((phase) => {
            const isExpanded = expandedPhases.includes(phase.num)

            return (
              <div key={phase.num}>
                <button
                  onClick={() => togglePhase(phase.num)}
                  className="w-full flex items-center gap-1.5 px-3 py-2 rounded-md text-secondary hover:bg-black/5 transition-colors motion-reduce:transition-none"
                >
                  <ChevronRight
                    className={cn(
                      'h-3 w-3 text-text-tertiary transition-transform motion-reduce:transition-none shrink-0',
                      isExpanded && 'rotate-90'
                    )}
                  />
                  <span className="flex-1 text-left text-text-secondary font-medium text-secondary hidden xl:block">
                    Phase {phase.num}: {phase.name}
                  </span>
                  {phase.premium && (
                    <Lock className="h-3 w-3 text-secondary hidden xl:block" />
                  )}
                </button>
              </div>
            )
          })}
        </div>

        {/* HELP Section */}
        <div className="px-5 pb-2 pt-4">
          <span className="text-caption font-medium text-text-tertiary uppercase tracking-wider hidden xl:block">
            Help
          </span>
        </div>

        <div className="px-3 pb-4 space-y-1">
          {helpItems.map((item) => {
            const Icon = item.icon

            const buttonContent = (
              <button className="w-full flex items-center gap-2.5 px-3 py-2 rounded-button text-text-secondary hover:bg-primary-subtle transition-colors motion-reduce:transition-none">
                <Icon className="h-4 w-4 shrink-0" />
                <span className="hidden xl:block">{item.label}</span>
              </button>
            )

            if (!isTabletExpanded) {
              return (
                <Tooltip key={item.label} content={item.label} position="right">
                  {buttonContent}
                </Tooltip>
              )
            }

            return <div key={item.label}>{buttonContent}</div>
          })}
        </div>

        {/* User Footer */}
        <div className="border-t border-border p-5 mt-auto">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-primary-light rounded-full flex items-center justify-center shrink-0 text-caption font-semibold text-primary">
              P
            </div>
            <div className="hidden xl:block">
              <div className="text-secondary font-semibold text-text-primary">Priya & Karthik</div>
              <div className="text-caption text-text-tertiary">Partner of Student Visa · Auckland</div>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}