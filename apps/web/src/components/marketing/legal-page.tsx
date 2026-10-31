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
import { Card } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/server"
import { userBadge } from "@/lib/user-badge"

// Placeholders the owner fills before launch are written as `[...]` in the markdown and drawn as .ph
const components = { code: ({ children }: { children?: React.ReactNode }) => <span className="ph">{children}</span> }

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
export function LegalLayout({ title, updated, file, user }: Props & { user: HeaderUser | null }) {
  const markdown = <ReactMarkdown components={components}>{readFileSync(join(process.cwd(), "src/content/legal", `${file}.md`), "utf8")}</ReactMarkdown>
  if (user) {
    return (
      <div className="flex min-h-dvh flex-col">
        <AppHeader active="settings" user={user} />
        <main className="container-page container-app py-6 max-narrow:py-4">
          {/* the title row of Home and Settings: title left, its line right */}
          <div className="mb-5 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
            <h1 className="text-title">{title}</h1>
            <p className="text-fg-muted">Last updated {updated}</p>
          </div>
          {/* the card spans the container like Home's; the text inside keeps reading width */}
          <Card as="div" className="max-narrow:border-0 max-narrow:bg-transparent max-narrow:p-0 max-narrow:shadow-none">
            <div className="legal max-w-reading">{markdown}</div>
          </Card>
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
