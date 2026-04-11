# Research: AC-W4-09b — Structured chat responses: detect patterns, render with existing components

## Context (pre-filled from AC-W4-09 implementation session)

This is an enhancement AC that improves the UX of chat responses. During AC-W4-09
research, the user identified that streaming raw LLM text into a plain text bubble is
a UX regression — the mock showed beautiful structured responses (steps, checklists,
alerts) that the UI components can already render.

AC-W4-09 ships basic plain text streaming (meets the AC requirements).
This AC upgrades it to structured rendering post-streaming.

---

## Understanding

The backend SSE stream only emits raw text tokens — there are no structured events.
The LLM outputs natural language. After the `done` event fires, we have the full
response text available. At that point, we post-process it into one of the existing
`ChatResponse` types and re-render with the existing `ResponseRenderers` components.

**Key insight:** The LLM is instructed via system prompt to be helpful about NZ
settlement tasks. Its responses tend to follow predictable patterns:
- Step-by-step processes (numbered lists)
- Document checklists (bullet points with Required/Optional)
- Urgent warnings (deadline alerts, "important" callouts)
- Simple Q&A (fallback plain text)

These map directly to existing component types in `ResponseRenderers.tsx`.

---

## Files Involved

| Action | Path | Why |
|--------|------|-----|
| Modify | `apps/web/src/components/chat/ChatPanel.tsx` | Replace `// TODO AC-W4-09b` with pattern detection + structured render |
| Modify | `apps/web/src/types/chat.ts` | Verify `ChatResponse` types cover all detected patterns (likely no change needed) |
| Possibly modify | `apps/web/src/components/chat/ChatMessage.tsx` | May need to support `ChatResponse` union type for AI messages again |

The core work is in `ChatPanel.tsx` — specifically the `onDone()` callback in `handleSend`.

---

## Current code to replace (AC-W4-09 placeholder)

In `ChatPanel.tsx` `handleSend` → `onDone` callback:
```typescript
// TODO AC-W4-09b: Replace this plain text render with pattern detection.
// Detect numbered lists → StepsResponse, bullets → ChecklistResponse,
// warning keywords → AlertResponse, then re-render with ResponseRenderers.
const finalText = streamingTextRef.current
const sources = extractSources(finalText)
setMessages(prev => [...prev, {
  id: Date.now().toString(),
  variant: 'ai',
  content: {
    type: 'plain',
    text: finalText,
    sources: sources.length > 0 ? sources : undefined,
  },
  timestamp: 'Just now',
}])
```

This is what needs to be replaced with structured output.

---

## Pattern Detection Approach

```typescript
function parseResponseStructure(text: string, sources: string[]): ChatResponse {
  const lines = text.split('\n').filter(l => l.trim())

  // Numbered list → StepsResponse
  // Matches: "1. Do X", "1) Do X", "Step 1: Do X"
  const numberedLineRegex = /^(\d+)[.)]\s+|^step\s+\d+[.:]\s+/i
  const numberedLines = lines.filter(l => numberedLineRegex.test(l.trim()))
  if (numberedLines.length >= 2) {
    return {
      type: 'steps',
      header: 'Based on official NZ sources',
      intro: extractIntro(lines, numberedLineRegex),
      steps: numberedLines.map(l => ({
        text: l.replace(numberedLineRegex, '').trim(),
      })),
      sources,
    }
  }

  // Bullet list → ChecklistResponse (if contains "required"/"optional" keywords)
  const bulletRegex = /^[•\-*]\s+/
  const bulletLines = lines.filter(l => bulletRegex.test(l.trim()))
  const hasRequiredKeyword = text.toLowerCase().includes('required') ||
    text.toLowerCase().includes('you need') ||
    text.toLowerCase().includes('you will need')
  if (bulletLines.length >= 2 && hasRequiredKeyword) {
    return {
      type: 'checklist',
      header: 'Based on official NZ sources',
      intro: extractIntro(lines, bulletRegex),
      items: bulletLines.map(l => ({
        text: l.replace(bulletRegex, '').trim(),
        required: true, // Default required — AC-W4-09b may refine this
      })),
      sources,
    }
  }

  // Warning/urgency → AlertResponse
  const urgencyKeywords = /deadline|expires?|urgent|immediately|must apply|penalty|fine/i
  if (urgencyKeywords.test(text)) {
    return {
      type: 'alert',
      severity: 'warning',
      title: 'Important',
      message: text,
      sources,
    }
  }

  // Fallback → PlainTextResponse
  return {
    type: 'plain',
    header: 'Based on official NZ sources',
    text,
    sources: sources.length > 0 ? sources : undefined,
  }
}

function extractIntro(lines: string[], patternRegex: RegExp): string {
  // First non-list line before the list starts
  const firstListIndex = lines.findIndex(l => patternRegex.test(l.trim()))
  const introLines = lines.slice(0, firstListIndex).filter(l => !patternRegex.test(l.trim()))
  return introLines.join(' ').trim() || ''
}
```

---

## Type Change Required

In `ChatPanel.tsx`, the current `AIMessage` type is:
```typescript
interface AIMessage {
  id: string
  variant: 'ai'
  content: { type: 'plain'; text: string; sources?: string[] }  // AC-W4-09 narrowing
  timestamp: string
}
```

For AC-W4-09b, change to full `ChatResponse` union:
```typescript
import type { ChatResponse } from '@/types/chat'

interface AIMessage {
  id: string
  variant: 'ai'
  content: ChatResponse  // Now supports steps, checklist, alert, plain
  timestamp: string
}
```

`ChatMessage.tsx` already handles `ChatResponse` with its `ResponseRenderer` dispatch — no changes needed there.

---

## Constraints That Apply

- **CW01**: No arbitrary Tailwind values
- **CW04**: `ChatResponse` type from `@/types/chat` (web-specific type, not @landednz/types)
- The pattern detection runs **only after** `done` event — during streaming, always show plain text
- Streaming bubble (in-progress) stays as plain text — structured rendering only for completed messages

---

## Verification

1. Ask a process question: "How do I get an IRD number?" → response shows as numbered steps, not plain text
2. Ask a document question: "What do I need to open a bank account?" → response shows as checklist
3. Ask a general question: "What is ACC?" → response shows as plain text (no forced structure)
4. Source footer: if LLM mentions ird.govt.nz → SourcePill renders

---

## Ambiguities to Surface at /rpi:plan

1. **Intro extraction**: If the LLM leads with a paragraph before the steps, how do we split intro vs steps? (regex approach above covers basic case)
2. **Mixed patterns**: Response has both a paragraph and a numbered list — use `StepsResponse` with `intro` field?
3. **Checklist required/optional splitting**: Can we reliably detect which items are required vs optional from natural language? Or default all to `required: true`?

## Ready to Plan

YES — research complete, prior implementation context captured. Surface ambiguities at `/rpi:plan`.
