import { readFileSync } from "node:fs"
import { join } from "node:path"
import { Suspense } from "react"
import Link from "next/link"
import { connection } from "next/server"
import ReactMarkdown from "react-markdown"
import { AppHeader, TabBarSpace, type HeaderUser } from "@/components/chrome/app-header"
import { PublicFooter } from "@/components/chrome/public-footer"
import { PublicHeader } from "@/components/chrome/public-header"
import { buttonVariants } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/server"
import { userBadge } from "@/lib/user-badge"

// Placeholders the owner fills before launch are written as `[...]` in the markdown and drawn as .ph
const components = {
  code: ({ children }: { children?: React.ReactNode }) => <span className="ph">{children}</span>,
  h2: ({ children }: { children?: React.ReactNode }) => <h2 id={slug(String(children))} className="scroll-mt-20">{children}</h2>,
}
const slug = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
const OTHER = { privacy: { href: "/terms", label: "Terms" }, terms: { href: "/privacy", label: "Privacy" } } as const

type Props = { title: string; updated: string; file: "privacy" | "terms" }

// The session decides the frame; a blank fallback so neither header flashes
export function LegalPage(props: Props) {
  return (
    <Suspense fallback={<div className="min-h-dvh" />}>
      <LegalFrame {...props} />
    </Suspense>
  )
}

async function LegalFrame(props: Props) {
  await connection()
  const { data: { user } } = await (await createClient()).auth.getUser()
  return <LegalLayout {...props} user={user ? userBadge(user) : null} />
}

// Signed in: an app page (header, tab bar, one reading card; phones read without the card). Signed out: the public page.
// Signed in: an app page. Text on the page at the logo edge (no card, like Vercel and Anthropic's legal pages),
// and from 1100 px a right rail that stays on screen: the sections, then the other document. Signed out: the public page.
export function LegalLayout({ title, updated, file, user }: Props & { user: HeaderUser | null }) {
  const source = readFileSync(join(process.cwd(), "src/content/legal", `${file}.md`), "utf8")
  const markdown = <ReactMarkdown components={components}>{source}</ReactMarkdown>
  if (user) {
    const sections = [...source.matchAll(/^## (.+)$/gm)].map(m => m[1])
    return (
      <div className="flex min-h-dvh flex-col">
        <AppHeader active="settings" user={user} />
        <main className="container-page container-app flex gap-16 py-10 max-narrow:py-6">
          <article className="legal w-full max-w-lede">
            <div className="flex flex-col gap-1">
              <h1 className="text-title">{title}</h1>
              <p className="text-fg-muted">Last updated {updated}</p>
            </div>
            {markdown}
          </article>
          <aside aria-label="On this page" className="sticky top-20 ml-auto flex w-60 shrink-0 flex-col gap-3 self-start max-wide:hidden">
            <p className="text-small font-semibold text-fg">On this page</p>
            <nav className="flex flex-col gap-2">
              {sections.map(s => (
                <a key={s} href={`#${slug(s)}`} className="link-subtle text-small">{s}</a>
              ))}
            </nav>
            <p className="mt-3 border-t border-border-subtle pt-4 text-small text-fg-muted">
              Also read: <Link href={OTHER[file].href} className="link-subtle font-medium text-fg">{OTHER[file].label}</Link>
            </p>
          </aside>
        </main>
        <TabBarSpace />
      </div>
    )
  }
  return (
    <div className="flex min-h-dvh flex-col">
      <PublicHeader right={<Link href="/signin" className={buttonVariants({ variant: "secondary" })}>Sign in</Link>} />
      <main className="legal mx-auto w-full max-w-legal px-6 pt-16 pb-24">
        <div className="flex flex-col gap-2">
          <h1 className="text-title">{title}</h1>
          <p className="text-fg-muted">Last updated {updated}</p>
        </div>
        {markdown}
      </main>
      <PublicFooter />
    </div>
  )
}
