"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu } from "@base-ui/react/menu"
import { Bookmark, FileText, IdCard, Power, Shield, X } from "lucide-react"
import { GuideMark } from "@/components/guide/ask-bar"
import { useFullView } from "@/components/guide/guide-shell"
import { useGuideStore } from "@/lib/stores/guideStore"
import { signOutAndLeave } from "@/lib/sign-out"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Brand } from "./logo"

export type HeaderUser = { name: string; initials: string; email?: string; avatar?: string }

// The selected page: ink text and a 2 px line on the header's bottom edge, no fill
const navLink =
  "relative flex items-center px-3 font-medium text-fg-muted no-underline state after:absolute after:inset-x-3 after:-bottom-px after:h-0.5 after:rounded-full hover:text-fg hover:no-underline aria-[current=page]:text-fg aria-[current=page]:after:bg-fg max-compact:px-2 max-compact:after:inset-x-2"
const HOME = { key: "home", href: "/app", label: "Home", icon: "M4 11 12 4l8 7M6 10v9h12v-9" } as const
const ROADMAP = { key: "roadmap", href: "/app/roadmap", label: "Roadmap", icon: "M6 19a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM18 10a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM8.5 16.5H15a3 3 0 0 0 0-6H9a3 3 0 0 1 0-6h6.5" } as const
// Settings is "Your details" in the account menu; on phones it is the You tab
const TABS = [HOME, ROADMAP] as const

const tab =
  "group flex flex-col items-center justify-center gap-0.5 text-small font-medium text-fg-muted no-underline state hover:no-underline aria-[current=page]:font-semibold aria-[current=page]:text-fg aria-[current=page]:[&_svg]:text-accent"
const menuItem =
  "flex min-h-10 w-full cursor-pointer items-center gap-2 rounded-control px-3 text-ui text-fg no-underline hover:no-underline data-highlighted:bg-surface-sunken [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-fg-muted"

// Google's photo when there is one; initials when not, or when it fails to load
export function Avatar({ user, className }: { user: HeaderUser; className: string }) {
  const [failed, setFailed] = useState(false)
  return (
    <span aria-hidden="true" className={cn("flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-avatar font-semibold text-fg-accent", className)}>
      {user.avatar && !failed ? (
        // eslint-disable-next-line @next/next/no-img-element -- a remote profile photo at 22–40 px; next/image would need Google's host allowed
        <img src={user.avatar} alt="" referrerPolicy="no-referrer" onError={() => setFailed(true)} className="size-full object-cover" />
      ) : (
        user.initials
      )}
    </span>
  )
}

export function AppHeader({
  active,
  back,
  user,
}: {
  active: "home" | "roadmap" | "settings" | null
  back?: { href: string; label: string }
  user: HeaderUser
}) {
  // The full view is its own place: while open it is the current tab, and any header link leaves it
  const full = useFullView()
  const close = useGuideStore(s => s.close)
  // an email-only account has its email as its name: show it once
  const email = user.email && user.email !== user.name ? user.email : null
  return (
    <>
    {/* from 1024 px the header stays on screen while the page scrolls */}
    <header className="border-b border-border-subtle bg-surface pane:sticky pane:top-0 pane:z-40 pane:shadow-frame-top">
      <div className="container-page container-app flex h-14 items-center gap-8 max-compact:gap-2">
        {back && (
          <Link href={back.href} className="hidden min-h-11 items-center gap-1 font-medium text-fg no-underline hover:no-underline max-narrow:flex">
            <span aria-hidden="true">‹</span> {back.label}
          </Link>
        )}
        <span className={back ? "max-narrow:hidden" : undefined} onClick={close}>
          <Brand href="/app" />
        </span>
        <nav aria-label="Main" className="flex gap-1 self-stretch max-narrow:hidden">
          {TABS.map(t => (
            <Link key={t.key} href={t.href} onClick={close} aria-current={!full && active === t.key ? "page" : undefined} className={navLink}>
              {t.label}
            </Link>
          ))}
          {full && (
            // a mode, not a page: the guide mark, a teal line, and × to leave it
            <>
              <span aria-hidden="true" className="mx-2 h-5 w-px self-center bg-border-subtle" />
              <span className={cn(navLink, "gap-2 pr-2 text-fg after:right-2 after:bg-accent")}>
                <GuideMark />
                <span aria-current="page">Guide</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Close the guide"
                  onClick={close}
                  className="relative size-6 border-0 text-fg-muted after:absolute after:-inset-2 hover:text-fg max-narrow:min-h-0 max-narrow:min-w-0"
                >
                  <X className="size-3.5" aria-hidden />
                </Button>
              </span>
            </>
          )}
        </nav>
        {/* phones reach the account from the You tab */}
        <div className="ml-auto flex items-center gap-2 max-narrow:hidden">
          <Menu.Root>
            <Menu.Trigger
              aria-label={`Account, ${user.name}`}
              className="group flex size-11 cursor-pointer items-center justify-center rounded-full border-0 bg-transparent p-0"
            >
              <Avatar
                user={user}
                className="size-8 text-small group-hover:ring-2 group-hover:ring-border-selected group-data-popup-open:ring-2 group-data-popup-open:ring-border-selected"
              />
            </Menu.Trigger>
            <Menu.Portal>
              <Menu.Positioner align="end" sideOffset={8} className="z-50">
                <Menu.Popup className="w-66 rounded-card bg-surface p-2 shadow-floating outline-none">
                  <div className="flex items-center gap-3 px-3 pt-3 pb-3">
                    <Avatar user={user} className="size-10 text-ui" />
                    <div className="min-w-0">
                      <p translate="no" className="truncate text-ui font-semibold text-fg">{user.name}</p>
                      {email && <p translate="no" className="truncate text-small text-fg-muted">{email}</p>}
                    </div>
                  </div>
                  <Menu.Separator className="-mx-2 my-1 h-px bg-border-subtle" />
                  <Menu.Group>
                    <Menu.Item render={<Link href="/settings" />} className={menuItem}>
                      <IdCard aria-hidden />
                      Your details
                    </Menu.Item>
                    <Menu.Item render={<Link href="/settings?edit=memory" />} className={menuItem}>
                      <Bookmark aria-hidden />
                      Memory
                    </Menu.Item>
                  </Menu.Group>
                  <Menu.Separator className="-mx-2 my-1 h-px bg-border-subtle" />
                  <Menu.Group>
                    <Menu.Item render={<Link href="/privacy" />} onClick={close} className={menuItem}>
                      <Shield aria-hidden />
                      Privacy
                    </Menu.Item>
                    <Menu.Item render={<Link href="/terms" />} onClick={close} className={menuItem}>
                      <FileText aria-hidden />
                      Terms
                    </Menu.Item>
                  </Menu.Group>
                  <Menu.Separator className="-mx-2 my-1 h-px bg-border-subtle" />
                  <Menu.Item
                    onClick={signOutAndLeave}
                    className={cn(menuItem, "justify-between text-danger data-highlighted:bg-danger/5 [&_svg]:text-danger")}
                  >
                    Sign out
                    <Power aria-hidden />
                  </Menu.Item>
                </Menu.Popup>
              </Menu.Positioner>
            </Menu.Portal>
          </Menu.Root>
        </div>
      </div>
    </header>
      {/* the bar pads for the iPhone home indicator when the page runs edge to edge */}
      <nav
        aria-label="Main"
        className="fixed inset-x-0 bottom-0 z-40 hidden tabbar-safe grid-cols-3 border-t border-border-subtle bg-surface max-narrow:grid"
      >
        {TABS.map(t => (
          <Link key={t.key} href={t.href} aria-current={active === t.key ? "page" : undefined} className={tab}>
            <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <path d={t.icon} />
            </svg>
            {t.label}
          </Link>
        ))}
        <Link href="/settings" aria-current={active === "settings" ? "page" : undefined} className={tab}>
          <Avatar user={user} className="size-5.5 text-small group-aria-[current=page]:ring-2 group-aria-[current=page]:ring-accent" />
          You
        </Link>
      </nav>
    </>
  )
}

// Signed-in pages end with this: on phones the content clears the fixed tab bar
export function TabBarSpace() {
  return <div aria-hidden className="mt-auto hidden h-tab-bar shrink-0 max-narrow:block" />
}
