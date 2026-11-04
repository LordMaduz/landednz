// The same fields as the guide page, as Markdown, for /llms.txt and /llms-full.txt (one copy of the content).
import type { GuideDetail, GuideIndexItem } from "./guides"
import { SITE_URL } from "./site"

type Item = { text: string }
const bullets = (title: string, items: Item[]) => (items.length ? `## ${title}\n\n${items.map(i => `- ${i.text}`).join("\n")}` : "")

export function guideMarkdown(g: GuideDetail): string {
  const sections = [
    `# ${g.name}\n\nLast checked ${g.checkedAt} · ${SITE_URL}/guides/${g.slug}`,
    bullets("Why it matters", g.why),
    `## Steps\n\n${g.steps.map((s, i) => `${i + 1}. ${s.text}`).join("\n")}`,
    bullets("Documents you'll need", g.documents),
    bullets("Common mistakes", g.mistakes),
    bullets("Watch out for", g.watchOuts),
    bullets("Cost", g.cost ? [g.cost] : []),
    bullets("When to get advice", g.advice ? [g.advice] : []),
    `## Sources\n\n${g.sources.map(s => `- [${s.title}](${s.url}) (${s.agency})`).join("\n")}`,
    `Personal plan: ${SITE_URL}/onboarding`,
  ]
  return sections.filter(Boolean).join("\n\n")
}

export function llmsIndex(items: GuideIndexItem[]): string {
  // Items arrive in phase order, so legs come out in journey order
  const legs = [...new Set(items.map(g => g.legName))]
  const body = legs.map(leg => `## ${leg}\n\n${items.filter(g => g.legName === leg).map(g => `- [${g.name}](${SITE_URL}/guides/${g.slug})`).join("\n")}`)
  return [
    "# LandedNZ",
    `> Free step-by-step guides for people moving to New Zealand, checked against official sources, plus a personal plan that puts the steps in the right order for your visa and family.`,
    ...body,
    `## Optional\n\n- [About LandedNZ](${SITE_URL}/about)\n- [Full text of every guide](${SITE_URL}/llms-full.txt)`,
  ].join("\n\n")
}
