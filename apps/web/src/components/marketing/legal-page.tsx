import { readFileSync } from "node:fs"
import { join } from "node:path"
import Link from "next/link"
import ReactMarkdown from "react-markdown"
import { PublicFooter } from "@/components/chrome/public-footer"
import { PublicHeader } from "@/components/chrome/public-header"
import { buttonVariants } from "@/components/ui/button"

// Placeholders the owner fills before launch are written as `[...]` in the markdown and drawn as .ph
const components = { code: ({ children }: { children?: React.ReactNode }) => <span className="ph">{children}</span> }

export function LegalPage({ title, updated, file }: { title: string; updated: string; file: "privacy" | "terms" }) {
  const markdown = readFileSync(join(process.cwd(), "src/content/legal", `${file}.md`), "utf8")
  return (
    <>
      <PublicHeader right={<Link href="/signin" className={buttonVariants({ variant: "quiet" })}>Sign in</Link>} />
      <main className="legal">
        <div className="flex flex-col gap-2">
          <h1 className="text-title">{title}</h1>
          <p className="text-muted">Last updated {updated}</p>
        </div>
        <ReactMarkdown components={components}>{markdown}</ReactMarkdown>
      </main>
      <PublicFooter />
    </>
  )
}
