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
  // Try to parse as JSON first
  try {
    const jsonResponse = JSON.parse(rawText.trim())

    // Validate the JSON structure has required fields
    if (jsonResponse && typeof jsonResponse === 'object' && jsonResponse.type) {
      const sources = jsonResponse.sources || []

      // Add default header if missing
      if (!jsonResponse.header && jsonResponse.type !== 'alert') {
        jsonResponse.header = 'Based on official NZ sources'
      }

      return {
        content: jsonResponse as ChatResponse,
        sources,
      }
    }
  } catch (error) {
    // If JSON parsing fails, fall back to markdown parsing
    console.warn('Failed to parse JSON response, falling back to markdown parsing:', error)
  }

  // Fallback: treat as plain text with markdown cleanup (legacy behavior)
  const sources = extractSources(rawText)
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