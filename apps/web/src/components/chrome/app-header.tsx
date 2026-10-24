"use client"

import { useEffect } from "react"
import Link from "next/link"
import { Menu } from "@base-ui/react/menu"
import { Button } from "@/components/ui/button"
import { signOutAndLeave } from "@/lib/sign-out"
import { Brand } from "./logo"

const navLink =
  "rounded-control px-4 py-2 font-medium text-muted no-underline hover:bg-wash hover:text-ink hover:no-underline aria-[current=page]:bg-wash aria-[current=page]:text-ink max-compact:px-2"
const menuItem =
  "flex min-h-11 w-full cursor-pointer items-center rounded-control px-4 text-ink no-underline outline-none hover:no-underline data-highlighted:bg-wash"

// "/" opens Ask, except while the user is typing somewhere
function isTyping(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  return target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)
}

export function AppHeader({
  active,
  onAsk,
  askDisabled,
  user,
}: {
  active: "home" | "roadmap" | null
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
    <header className="border-b border-hairline">
      <div className="container-page flex h-16 items-center gap-8 max-compact:gap-2">
        <Brand href="/app" compact />
        <nav aria-label="Main" className="flex gap-1">
          <Link href="/app" aria-current={active === "home" ? "page" : undefined} className={navLink}>
            Home
          </Link>
          <Link href="/app/roadmap" aria-current={active === "roadmap" ? "page" : undefined} className={navLink}>
            Roadmap
          </Link>
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
  )
}
