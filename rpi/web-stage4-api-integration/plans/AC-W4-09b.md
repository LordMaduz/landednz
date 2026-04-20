# Implementation Plan: AC-W4-09b
# Structured chat responses: detect patterns, render with existing components
# Constitutional Validator: PASS

---

## Approach

Extract all parsing logic into a pure, testable `chat-parser.ts` module. It takes raw
LLM text and returns a `{ content: ChatResponse, sources: string[] }` pair. Detection
priority: ordered list → StepsResponse, unordered list + document keywords →
ChecklistResponse, unordered list only → StepsResponse (bullets as steps), short
urgency response → AlertResponse, fallback → PlainTextResponse. All text is
markdown-stripped before entering components (no `**bold**` leaking into the UI).
Sources are fixed to be a top-level `sources` field on AIMessage (not buried in
content.sources), so they actually render in ChatMessage's source footer.

Streaming bubble (in-progress text) also gets markdown stripped for clean display.
Tests are written first (TDD) to lock in correct parsing behaviour.

---

## File Changes

| # | Action | Path |
|---|--------|------|
| 1 | Create | `apps/web/src/lib/chat-parser.ts` |
| 2 | Create | `apps/web/src/lib/chat-parser.test.ts` |
| 3 | Modify | `apps/web/src/components/chat/ChatPanel.tsx` |

`ChatMessage.tsx` and `ResponseRenderers.tsx` — **unchanged**. Parser produces clean
text so renderers receive no markdown artifacts.

---

## Implementation Order

### Step 1 — Write failing tests first (TDD)

`apps/web/src/lib/chat-parser.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { parseResponse, stripMarkdown } from './chat-parser'

describe('stripMarkdown', () => {
  it('removes bold markers', () => {
    expect(stripMarkdown('Visit **ird.govt.nz** today')).toBe('Visit ird.govt.nz today')
  })
  it('removes italic markers', () => {
    expect(stripMarkdown('*important* note')).toBe('important note')
  })
  it('removes inline code markers', () => {
    expect(stripMarkdown('use `IR742` form')).toBe('use IR742 form')
  })
  it('handles no markdown', () => {
    expect(stripMarkdown('plain text')).toBe('plain text')
  })
})

describe('parseResponse — steps detection', () => {
  it('detects numbered list "1. item" → StepsResponse', () => {
    const text = `To get an IRD number:\n\n1. Complete the IR742 form\n2. Submit to IRD\n3. Wait 8-10 days`
    const result = parseResponse(text)
    expect(result.content.type).toBe('steps')
    if (result.content.type === 'steps') {
      expect(result.content.steps).toHaveLength(3)
      expect(result.content.steps[0].text).toBe('Complete the IR742 form')
      expect(result.content.intro).toBe('To get an IRD number:')
    }
  })

  it('detects "1) item" format → StepsResponse', () => {
    const text = '1) Apply online\n2) Provide ID\n3) Confirm'
    const result = parseResponse(text)
    expect(result.content.type).toBe('steps')
  })

  it('detects "Step 1: item" format → StepsResponse', () => {
    const text = 'Step 1: Apply for IRD\nStep 2: Get bank account'
    const result = parseResponse(text)
    expect(result.content.type).toBe('steps')
  })

  it('strips markdown from step text', () => {
    const text = '1. Complete the **IR742** form\n2. Visit *ird.govt.nz*'
    const result = parseResponse(text)
    if (result.content.type === 'steps') {
      expect(result.content.steps[0].text).toBe('Complete the IR742 form')
      expect(result.content.steps[1].text).toBe('Visit ird.govt.nz')
    }
  })

  it('single list item does NOT trigger steps (needs 2+)', () => {
    const text = '1. Just one step'
    const result = parseResponse(text)
    expect(result.content.type).toBe('plain')
  })
})

describe('parseResponse — checklist detection', () => {
  it('detects bullet list + document keywords → ChecklistResponse', () => {
    const text = `You need the following documents:\n\n- Passport\n- NZ visa\n- Proof of address`
    const result = parseResponse(text)
    expect(result.content.type).toBe('checklist')
    if (result.content.type === 'checklist') {
      expect(result.content.items).toHaveLength(3)
      expect(result.content.items[0].text).toBe('Passport')
    }
  })

  it('marks items as required by default', () => {
    const text = '- Passport\n- Bank statement\nyou need these documents'
    const result = parseResponse(text)
    if (result.content.type === 'checklist') {
      expect(result.content.items[0].required).toBe(true)
    }
  })

  it('marks items as optional when keywords present', () => {
    const text = 'Documents required:\n- Passport\n- Reference letter (optional)\n- Bank statement'
    const result = parseResponse(text)
    if (result.content.type === 'checklist') {
      const optional = result.content.items.find(i => i.text.includes('Reference letter'))
      expect(optional?.required).toBe(false)
    }
  })

  it('bullet list WITHOUT document keywords → StepsResponse', () => {
    const text = 'Here is what to do:\n- Call IRD first\n- Then visit in person\n- Bring your ID'
    const result = parseResponse(text)
    expect(result.content.type).toBe('steps')
  })
})

describe('parseResponse — alert detection', () => {
  it('short urgency response → AlertResponse', () => {
    const text = 'Your visa expires soon. You must apply for renewal immediately to avoid overstay penalties.'
    const result = parseResponse(text)
    expect(result.content.type).toBe('alert')
  })

  it('long response with urgency keywords → NOT alert (uses list/plain instead)', () => {
    const text = `To renew your visa before it expires:\n\n1. Log into Immigration Online\n2. Select visa renewal\n3. Pay the fee\n4. Submit and wait\n\nApply immediately to avoid delays.`
    const result = parseResponse(text)
    // Should be steps, not alert — urgency is just context, not the primary content
    expect(result.content.type).toBe('steps')
  })
})

describe('parseResponse — plain text fallback', () => {
  it('plain Q&A → PlainTextResponse', () => {
    const text = 'ACC is the Accident Compensation Corporation. It provides injury cover for everyone in New Zealand, including migrants on work visas.'
    const result = parseResponse(text)
    expect(result.content.type).toBe('plain')
  })

  it('strips markdown from plain text', () => {
    const text = 'ACC stands for **Accident Compensation Corporation**. It covers *all* residents.'
    const result = parseResponse(text)
    if (result.content.type === 'plain') {
      expect(result.content.text).toBe('ACC stands for Accident Compensation Corporation. It covers all residents.')
    }
  })
})

describe('parseResponse — sources', () => {
  it('extracts NZ domains from response text', () => {
    const text = 'Apply at ird.govt.nz or visit immigration.govt.nz for details.'
    const result = parseResponse(text)
    expect(result.sources).toContain('ird.govt.nz')
    expect(result.sources).toContain('immigration.govt.nz')
  })

  it('deduplicates sources', () => {
    const text = 'Visit ird.govt.nz to apply. More info at ird.govt.nz.'
    const result = parseResponse(text)
    expect(result.sources.filter(s => s === 'ird.govt.nz')).toHaveLength(1)
  })

  it('returns empty sources when none found', () => {
    const text = 'ACC covers all NZ residents.'
    const result = parseResponse(text)
    expect(result.sources).toHaveLength(0)
  })
})
```

Run tests — confirm RED: `npm run test -- chat-parser`

### Step 2 — Implement chat-parser.ts (GREEN)

`apps/web/src/lib/chat-parser.ts`:

```typescript
import type { ChatResponse } from '@/types/chat'

// ─── Markdown cleanup ─────────────────────────────────────────────────────────

export function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '$1')  // **bold** → bold
    .replace(/\*(.+?)\*/g, '$1')       // *italic* → italic
    .replace(/`(.+?)`/g, '$1')         // `code` → code
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
const DOCUMENT_KEYWORDS = /\b(need|required|document|bring|provide|must have|passport|visa|form)\b/i
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
  if (orderedItems.length >= 2) {
    const firstIndex = lines.findIndex(l => ORDERED_ITEM_REGEX.test(l.trim()))
    const intro = extractIntro(lines, firstIndex)
    const callout = extractCallout(lines)

    return {
      content: {
        type: 'steps',
        header: 'Based on official NZ sources',
        intro: intro || '',
        steps: orderedItems.map(l => {
          const match = l.trim().match(ORDERED_ITEM_REGEX)
          return { text: stripMarkdown((match?.[2] ?? match?.[3] ?? l).trim()) }
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
```

Run tests — confirm GREEN: `npm run test -- chat-parser`

### Step 3 — Update ChatPanel.tsx

**3a** — Update `AIMessage` interface (add `sources` as top-level field, widen `content` to `ChatResponse`):

```typescript
import type { ChatResponse } from '@/types/chat'
import { parseResponse, cleanStreamingText } from '@/lib/chat-parser'

interface AIMessage {
  id: string
  variant: 'ai'
  content: ChatResponse        // full union, not just plain
  sources?: string[]           // top-level — ChatMessage reads this for source footer
  timestamp: string
}
```

**3b** — Replace the TODO block in `onDone` callback:

```typescript
() => {
  const { content, sources } = parseResponse(streamingTextRef.current)
  setMessages(prev => [...prev, {
    id: Date.now().toString(),
    variant: 'ai',
    content,
    sources: sources.length > 0 ? sources : undefined,
    timestamp: 'Just now',
  }])
  setIsStreaming(false)
  setStreamingText('')
  streamingTextRef.current = ''
},
```

**3c** — Strip markdown from streaming bubble:

```tsx
{isStreaming && streamingText && (
  <ChatMessage
    variant="ai"
    content={{ type: 'plain', text: cleanStreamingText(streamingText) }}
    timestamp="Just now"
  />
)}
```

**3d** — Remove `extractSources` from ChatPanel (now in chat-parser.ts).

**3e** — Opening message: keep as `{ type: 'plain', text: result.openingMessage }` — opening message is conversational, no structure needed.

### Step 4 — TypeScript check

```bash
cd apps/web && npx tsc --noEmit
```

### Step 5 — Run all tests

```bash
cd apps/web && npm run test -- chat-parser
```

---

## Test Strategy

**Unit tests (Vitest):** `chat-parser.test.ts` covers all 6 detection paths + markdown stripping + source extraction + edge cases. Must pass before marking AC complete.

**Manual verification:**
1. "How do I get an IRD number?" → StepsResponse with numbered circles
2. "What do I need to open a bank account?" → ChecklistResponse with required/optional grouping
3. "What is ACC?" → PlainTextResponse (no forced structure)
4. Urgency question: "What happens if my visa expires?" → AlertResponse (short) or StepsResponse (with steps)
5. No `**bold**` markers visible anywhere in any response
6. Source footer renders `SourcePill` badges when NZ domains mentioned

---

## Golden Examples Affected

None — this AC does not touch priority scoring or the roadmap engine.
