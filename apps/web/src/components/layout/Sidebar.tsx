'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Map, Settings, BookOpen, Mail, ChevronRight, Menu } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils/cn'
import { Tooltip } from '@/components/ui/Tooltip'
import { StatusIndicator } from '@/components/ui/StatusIndicator'
import { useRoadmapStore } from '@/lib/stores/roadmapStore'
import { createClient } from '@/lib/supabase/client'
import { mapApiPhasesToWeb, mapApiTaskDetail } from '@/lib/roadmap-mapper'
import { getTaskDetail } from '@/lib/api'
import type { RoadmapPhase } from '@/types/web'

const navItems = [
  { href: '/roadmap', label: 'Roadmap', icon: Map },
  { href: '/settings', label: 'Settings', icon: Settings },
]

// Smart abbreviation for phase names - Linear style
function getPhaseDisplayText(name: string, level: 'minimal' | 'short' | 'medium' | 'full') {
  const words = name.split(' ')

  switch (level) {
    case 'minimal':
      return words[0] // "Before"
    case 'short':
      return words.slice(0, 2).join(' ') // "Before you"
    case 'medium':
      return words.slice(0, 3).join(' ') // "Before you start"
    case 'full':
    default:
      return name // Full name
  }
}

const helpItems = [
  { label: 'Resources', icon: BookOpen, href: '/resources' },
  { label: 'Feedback', icon: Mail, href: '/contact' },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { roadmapData, setSelectedTask, updateSelectedTask } = useRoadmapStore()
  const [expandedPhases, setExpandedPhases] = useState<number[]>([1])
  const [isTabletExpanded, setIsTabletExpanded] = useState(false)
  const [userName, setUserName] = useState<string>('User')
  const [userInitial, setUserInitial] = useState<string>('U')

  // Transform API data to sidebar format
  const phases: RoadmapPhase[] = roadmapData
    ? mapApiPhasesToWeb(roadmapData.phases)
    : []

  // Fetch user data from Supabase session
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const supabase = createClient()
        const { data: { session } } = await supabase.auth.getSession()

        if (session?.user) {
          const name = session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User'
          setUserName(name)
          setUserInitial(name.charAt(0).toUpperCase())
        }
      } catch (error) {
        console.error('Failed to fetch user data:', error)
      }
    }

    fetchUserData()
  }, [])

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

  const handleTaskClick = async (taskId: string, taskName: string) => {
    // Navigate to roadmap if not already there
    if (pathname !== '/roadmap') {
      router.push('/roadmap')
    }

    // Find the task in the current roadmap data to get complete info
    const task = phases
      .flatMap(p => p.tasks)
      .find(t => t.taskId === taskId)

    if (!task) return

    // Set the selected task immediately (shows panel with loading state)
    setSelectedTask(task)

    try {
      // Get auth token from Supabase session
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()

      if (!session?.access_token) {
        router.push('/auth/signin?redirect=/roadmap')
        return
      }

      // Fetch task detail from API (same pattern as RoadmapView)
      const response = await getTaskDetail(task.taskId, session.access_token)
      const detail = mapApiTaskDetail(response)

      // Update the selected task with the fetched details
      updateSelectedTask(prev => ({ ...prev, detail }))
    } catch (error) {
      // Handle 401 unauthorized error
      if ((error as { status?: number }).status === 401) {
        router.push('/auth/signin?redirect=/roadmap')
        return
      }
      console.error('Failed to load task detail from sidebar:', error)
      // Detail stays undefined, TaskDetail shows "Coming soon" fallback
    }
  }

  const NavItem = ({ item, isCollapsed }: { item: typeof navItems[0], isCollapsed: boolean }) => {
    const isActive = pathname === item.href
    const Icon = item.icon

    const linkContent = (
      <Link
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
        <span className="hidden xl:block text-small font-medium">{item.label}</span>
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
        <div className="p-5 pb-4 flex items-center gap-2">
          <div className="w-7 h-7 bg-secondary rounded-lg flex items-center justify-center shrink-0">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-text-primary" aria-hidden="true">
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
        <nav className="px-3 mb-2 flex flex-col space-y-1">
          {navItems.map((item) => (
            <NavItem
              key={item.href}
              item={item}
              isCollapsed={!isTabletExpanded}
            />
          ))}
        </nav>

        {/* YOUR PLAN Section */}
        <div className="px-4 pb-2 pt-4">
          <span className="text-caption font-medium text-text-tertiary uppercase tracking-wider hidden xl:block">
            Your plan
          </span>
        </div>

        {/* Phase sections */}
        <div className="px-3 flex-1 space-y-1 overflow-y-auto">
          {phases.map((phase) => {
            const isExpanded = expandedPhases.includes(phase.num)
            const completedCount = phase.tasks.filter(t => t.cardState === 'complete').length

            return (
              <div key={phase.num}>
                {/* Phase header */}
                <button
                  onClick={() => togglePhase(phase.num)}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-md hover:bg-black/5 transition-colors motion-reduce:transition-none"
                >
                  <ChevronRight
                    className={cn(
                      'h-3 w-3 text-text-tertiary transition-transform motion-reduce:transition-none shrink-0',
                      isExpanded && 'rotate-90'
                    )}
                  />
                  {/* Progressive disclosure for phase names - no truncation */}
                  <div className="flex-1 text-left text-text-secondary font-medium text-small">
                    {/* Medium: Just number + first word */}
                    <span className="hidden md:block lg:hidden">
                      {phase.num}: {getPhaseDisplayText(phase.name, 'minimal')}
                    </span>
                    {/* Large: Number + 2 words */}
                    <span className="hidden lg:block xl:hidden">
                      {phase.num}: {getPhaseDisplayText(phase.name, 'short')}
                    </span>
                    {/* Extra large: Number + 3 words */}
                    <span className="hidden xl:block 2xl:hidden">
                      {phase.num}: {getPhaseDisplayText(phase.name, 'medium')}
                    </span>
                    {/* 2xl: Full name */}
                    <span className="hidden 2xl:block">
                      {phase.num}: {getPhaseDisplayText(phase.name, 'full')}
                    </span>
                  </div>
                  {/* Non-premium: completed/total count - show earlier than xl */}
                  {!phase.isPremium && (
                    <span className="text-caption text-text-tertiary hidden lg:block shrink-0">
                      {completedCount}/{phase.tasks.length}
                    </span>
                  )}
                  {/* Premium: gold badge - progressive disclosure */}
                  {phase.isPremium && (
                    <>
                      {/* Large: Compact badge */}
                      <span className="text-caption bg-secondary-light text-secondary-hover px-1.5 py-0.5 rounded-badge font-medium hidden lg:block xl:hidden shrink-0">
                        Pro
                      </span>
                      {/* Extra large+: Full badge */}
                      <span className="text-caption bg-secondary-light text-secondary-hover px-2 py-0.5 rounded-badge font-medium hidden xl:block shrink-0">
                        Premium
                      </span>
                    </>
                  )}
                </button>

                {/* Expanded task list — non-premium phases only */}
                {isExpanded && !phase.isPremium && (
                  <div className="pl-6 pb-1 hidden xl:block">
                    {phase.tasks.map((task) => (
                      <button
                        key={task.taskId}
                        onClick={() => handleTaskClick(task.taskId, task.taskName)}
                        className="w-full flex items-center gap-2 py-1 px-2 rounded cursor-pointer hover:bg-black/5 transition-colors motion-reduce:transition-none text-left"
                      >
                        <StatusIndicator state={task.cardState} size="sm" />
                        <span
                          className={cn(
                            'text-caption truncate',
                            task.cardState === 'complete' ? 'text-text-tertiary' : 'text-text-secondary'
                          )}
                        >
                          {task.taskName}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* HELP Section */}
        <div className="px-4 pb-2 pt-4">
          <span className="text-caption font-medium text-text-tertiary uppercase tracking-wider hidden xl:block">
            Help
          </span>
        </div>

        <div className="px-3 pb-4 flex flex-col space-y-1">
          {helpItems.map((item) => {
            const Icon = item.icon

            const linkContent = (
              <Link
                href={item.href}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-button text-text-secondary hover:bg-primary-subtle transition-colors motion-reduce:transition-none"
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="hidden xl:block text-small">{item.label}</span>
              </Link>
            )

            if (!isTabletExpanded) {
              return (
                <Tooltip key={item.label} content={item.label} position="right">
                  {linkContent}
                </Tooltip>
              )
            }

            return <div key={item.label}>{linkContent}</div>
          })}
        </div>

        {/* User Footer */}
        <div className="border-t border-border p-5 mt-auto">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-light rounded-full flex items-center justify-center shrink-0 text-caption font-semibold text-primary">
              {userInitial}
            </div>
            <div className="hidden xl:block">
              <div className="text-small font-semibold text-text-primary">{userName}</div>
              <div className="text-caption text-text-tertiary">Settlement Profile</div>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
