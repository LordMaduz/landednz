import type { ChatResponse } from '@/types/chat'

// ─── Markdown cleanup ─────────────────────────────────────────────────────────

export function stripMarkdown(text: string): string {
  return text
    .replace(/^#{1,6}\s+/gm, '')       // # ## ### headers → remove
    .replace(/^---+$/gm, '')           // --- horizontal rules → remove
    .replace(/\*\*(.+?)\*\*/g, '$1')   // **bold** → bold
    .replace(/\*(.+?)\*/g, '$1')        // *italic* → italic
    .replace(/`(.+?)`/g, '$1')          // `code` → code
    .replace(/^\s*$/gm, '')            // empty lines → remove
    .replace(/\n+/g, ' ')              // multiple newlines → single space
    .trim()
}

// ─── Source extraction ────────────────────────────────────────────────────────

const NZ_DOMAIN_REGEX = /\b([a-zA-Z0-9-]+\.(?:govt\.nz|co\.nz|org\.nz|ac\.nz))\b/g

function extractSources(text: string): string[] {
  const matches: string[] = text.match(NZ_DOMAIN_REGEX) ?? []
  return matches.filter((domain, index) => matches.indexOf(domain) === index)
}

// ─── Intro extraction ─────────────────────────────────────────────────────────

function extractIntro(lines: string[], firstListIndex: number): string {
  return lines
    .slice(0, firstListIndex)
    .filter(l => l.trim())
    .map(l => stripMarkdown(l))
    .join(' ')
    .trim()
}

// ─── Callout extraction ───────────────────────────────────────────────────────

// Detects blockquotes (> text) or labelled warnings (Important: / Note:)
function extractCallout(lines: string[]): { type: 'warning' | 'info'; title: string; text: string } | null {
  const calloutLine = lines.find(l =>
    l.trim().startsWith('>') ||
    /^(important|note|warning|tip)[:\s]/i.test(l.trim())
  )
  if (!calloutLine) return null

  const cleanText = stripMarkdown(
    calloutLine
      .replace(/^>\s*/, '')
      .replace(/^(important|note|warning|tip)[:\s]+/i, '')
  )
  const label = calloutLine.match(/^(important|warning)/i) ? 'warning' : 'info'
  const title = calloutLine.match(/^(important|note|warning|tip)/i)?.[1] ?? 'Note'

  return { type: label as 'warning' | 'info', title, text: cleanText }
}

// ─── Required/optional detection ─────────────────────────────────────────────

const OPTIONAL_KEYWORDS = ['optional', 'if applicable', 'if available', 'may help', 'not required', 'not mandatory']

function isRequired(itemText: string): boolean {
  const lower = itemText.toLowerCase()
  return !OPTIONAL_KEYWORDS.some(k => lower.includes(k))
}

// ─── Regex patterns ───────────────────────────────────────────────────────────

const ORDERED_ITEM_REGEX = /^(\d+)[.)]\s+(.+)|^step\s+\d+[.:\s]+(.+)/i
const UNORDERED_ITEM_REGEX = /^[-*•]\s+(.+)/
const DOCUMENT_KEYWORDS = /\b(need.*(document|paper|form)|required.*(document|paper|form)|following\s+(document|paper|form)|document|passport|visa|certificate|proof\s+of|birth\s+certificate|driver.?s?\s+license)\b/i
const URGENCY_KEYWORDS = /\b(deadline|expires?|you must|urgent|immediately|penalty|fine|overstay)\b/i

// ─── Main parser ──────────────────────────────────────────────────────────────

export interface ParsedResponse {
  content: ChatResponse
  sources: string[]
}

export function parseResponse(rawText: string): ParsedResponse {
  const sources = extractSources(rawText)
  const allLines = rawText.split('\n')
  const lines = allLines.filter(l => l.trim())

  // 1. Detect ordered list (≥2 items) → StepsResponse
  const orderedItems = lines.filter(l => ORDERED_ITEM_REGEX.test(l.trim()))

  // Also check for multi-line numbered format: "1\n✅ content" or "2\n→ content"
  const multiLineNumbered: string[] = []
  for (let i = 0; i < lines.length - 1; i++) {
    const currentLine = lines[i].trim()
    const nextLine = lines[i + 1]?.trim()
    if (/^\d+$/.test(currentLine) && nextLine && /^[✅→•-]/.test(nextLine)) {
      multiLineNumbered.push(`${currentLine}. ${nextLine}`)
    }
  }

  const allOrderedItems = [...orderedItems, ...multiLineNumbered]
  if (allOrderedItems.length >= 2) {
    // Find first ordered item (either inline or multi-line)
    let firstIndex = lines.findIndex(l => ORDERED_ITEM_REGEX.test(l.trim()))
    if (firstIndex === -1 && multiLineNumbered.length > 0) {
      // Find first standalone number that starts multi-line pattern
      firstIndex = lines.findIndex(l => /^\d+$/.test(l.trim()))
    }

    const intro = firstIndex >= 0 ? extractIntro(lines, firstIndex) : ''
    const callout = extractCallout(lines)

    return {
      content: {
        type: 'steps',
        header: 'Based on official NZ sources',
        intro: intro || '',
        steps: allOrderedItems.map(item => {
          // Handle both "1. content" format and reconstructed "1. ✅ content" format
          const match = item.trim().match(ORDERED_ITEM_REGEX) || item.trim().match(/^(\d+)\.\s*(.+)/)
          return { text: stripMarkdown((match?.[2] ?? match?.[3] ?? item).trim()) }
        }),
        ...(callout ? { callout: { type: callout.type, title: callout.title, text: callout.text } } : {}),
        sources,
      },
      sources,
    }
  }

  // 2. Detect unordered list (≥2 items)
  const unorderedItems = lines.filter(l => UNORDERED_ITEM_REGEX.test(l.trim()))
  if (unorderedItems.length >= 2) {
    const firstIndex = lines.findIndex(l => UNORDERED_ITEM_REGEX.test(l.trim()))
    const intro = extractIntro(lines, firstIndex)
    const callout = extractCallout(lines)
    const isDocumentList = DOCUMENT_KEYWORDS.test(rawText)

    if (isDocumentList) {
      // ChecklistResponse — required/optional per item
      return {
        content: {
          type: 'checklist',
          header: 'Based on official NZ sources',
          intro: intro || '',
          items: unorderedItems.map(l => {
            const match = l.trim().match(UNORDERED_ITEM_REGEX)
            const text = stripMarkdown((match?.[1] ?? l).trim())
            return { text, required: isRequired(text) }
          }),
          ...(callout ? { note: `${callout.title}: ${callout.text}` } : {}),
          sources,
        },
        sources,
      }
    }

    // Unordered list without document keywords → StepsResponse (bullets as steps)
    return {
      content: {
        type: 'steps',
        header: 'Based on official NZ sources',
        intro: intro || '',
        steps: unorderedItems.map(l => {
          const match = l.trim().match(UNORDERED_ITEM_REGEX)
          return { text: stripMarkdown((match?.[1] ?? l).trim()) }
        }),
        sources,
      },
      sources,
    }
  }

  // 3. Short urgency response → AlertResponse
  // Only triggers when the whole response IS the warning (short, no lists detected)
  if (URGENCY_KEYWORDS.test(rawText) && lines.length <= 5) {
    return {
      content: {
        type: 'alert',
        severity: 'warning',
        title: 'Important',
        message: stripMarkdown(rawText),
        sources,
      },
      sources,
    }
  }

  // 4. Fallback → PlainTextResponse (markdown stripped)
  return {
    content: {
      type: 'plain',
      header: 'Based on official NZ sources',
      text: stripMarkdown(rawText),
      sources: sources.length > 0 ? sources : undefined,
    },
    sources,
  }
}

// Exported for streaming bubble — strips markdown from in-progress text
export { stripMarkdown as cleanStreamingText }