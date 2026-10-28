"use client"

import { useEffect } from "react"
import Link from "next/link"
import { Menu } from "@base-ui/react/menu"
import { Button } from "@/components/ui/button"
import { signOutAndLeave } from "@/lib/sign-out"
import { Brand } from "./logo"

const navLink =
  "rounded-control px-4 py-2 font-medium text-muted no-underline hover:bg-wash hover:text-ink hover:no-underline aria-[current=page]:bg-wash aria-[current=page]:text-ink max-compact:px-2"
const TABS = [
  { key: "home", href: "/app", label: "Home", icon: "M4 11 12 4l8 7M6 10v9h12v-9" },
  { key: "roadmap", href: "/app/roadmap", label: "Roadmap", icon: "M6 19a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM18 10a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM8.5 16.5H15a3 3 0 0 0 0-6H9a3 3 0 0 1 0-6h6.5" },
  { key: "settings", href: "/settings", label: "Settings", icon: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM19 12l1.8-1-1.5-2.6-2 .4a6.5 6.5 0 0 0-1.6-.9L15 6h-3l-.7 1.9a6.5 6.5 0 0 0-1.6.9l-2-.4L6 11l1.8 1-.1 1 .1 1L6 15l1.5 2.6 2-.4c.5.4 1 .7 1.6.9L12 20h3l.7-1.9c.6-.2 1.1-.5 1.6-.9l2 .4L20.8 15 19 14l.1-1Z" },
] as const

const tab =
  "flex flex-col items-center justify-center gap-0.5 text-citation font-medium text-muted no-underline hover:no-underline aria-[current=page]:text-ink aria-[current=page]:[&_svg]:text-teal"
const menuItem =
  "flex min-h-11 w-full cursor-pointer items-center rounded-control px-4 text-ink no-underline outline-none hover:no-underline data-highlighted:bg-wash"

// "/" opens Ask, except while the user is typing somewhere
function isTyping(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  return target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)
}

export function AppHeader({
  active,
  back,
  onAsk,
  askDisabled,
  user,
}: {
  active: "home" | "roadmap" | "settings" | null
  back?: { href: string; label: string }
  onAsk?: () => void
  askDisabled?: boolean
  user: { name: string; initials: string }
}) {
  useEffect(() => {
    if (!onAsk || askDisabled) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "/" || e.metaKey || e.ctrlKey || e.altKey || isTyping(e.target)) return
      e.preventDefault()
      onAsk()
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [onAsk, askDisabled])

  return (
    <>
    <header className="border-b border-hairline">
      <div className="container-page container-app flex h-16 items-center gap-8 max-compact:gap-2 max-narrow:h-14">
        {back && (
          <Link href={back.href} className="hidden min-h-11 items-center gap-1 font-medium text-ink no-underline hover:no-underline max-narrow:flex">
            <span aria-hidden="true">‹</span> {back.label}
          </Link>
        )}
        <span className={back ? "max-narrow:hidden" : undefined}>
          <Brand href="/app" />
        </span>
        <nav aria-label="Main" className="flex gap-1 max-narrow:hidden">
          {TABS.map(t => (
            <Link key={t.key} href={t.href} aria-current={active === t.key ? "page" : undefined} className={navLink}>
              {t.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="quiet" aria-keyshortcuts="/" onClick={onAsk} disabled={askDisabled || !onAsk}>
            Ask
            <span
              aria-hidden="true"
              className="rounded-sm border border-hairline px-1 text-small leading-5 text-muted max-compact:hidden"
            >
              /
            </span>
          </Button>
          <Menu.Root>
            <Menu.Trigger
              aria-label={`Account, ${user.name}`}
              className="flex size-11 cursor-pointer items-center justify-center rounded-full border-0 bg-transparent p-0"
            >
              <span
                aria-hidden="true"
                className="flex size-8 items-center justify-center rounded-full bg-avatar text-small font-semibold text-teal-text"
              >
                {user.initials}
              </span>
            </Menu.Trigger>
            <Menu.Portal>
              <Menu.Positioner align="end" sideOffset={8} className="z-50">
                <Menu.Popup className="min-w-48 rounded-surface border border-hairline bg-white p-1 outline-none">
                  <Menu.Item render={<Link href="/settings" />} className={menuItem}>
                    Settings
                  </Menu.Item>
                  <Menu.Item onClick={signOutAndLeave} className={menuItem}>
                    Sign out
                  </Menu.Item>
                </Menu.Popup>
              </Menu.Positioner>
            </Menu.Portal>
          </Menu.Root>
        </div>
      </div>
    </header>
      <nav aria-label="Main" className="fixed inset-x-0 bottom-0 z-40 hidden h-14 grid-cols-3 border-t border-hairline bg-white max-narrow:grid">
        {TABS.map(t => (
          <Link key={t.key} href={t.href} aria-current={active === t.key ? "page" : undefined} className={tab}>
            <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <path d={t.icon} />
            </svg>
            {t.label}
          </Link>
        ))}
      </nav>
    </>
  )
}
