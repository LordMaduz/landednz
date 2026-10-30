// Pure turn model for the settlement guide: history rows and SSE events in, render-ready turns out.
import type { GuideMessageDto, GuideMessageStatus, GuideScreen, GuideSseEvent, ReplyPart } from '@landednz/types'
import { TASK_COPY } from './task-copy'

export type Turn = {
  key: string
  question: string
  screen: GuideScreen
  assistantId: string | null
  parts: ReplyPart[]
  status: GuideMessageStatus | 'sending'
  createdAt: string
}

export type TextPart = Extract<ReplyPart, { type: 'text' }>

export type Block = { kind: 'prose' | 'limits' | 'crisis'; parts: TextPart[] } | { kind: 'steps'; items: TextPart[][] }

// Oldest first. An assistant row without its user row (cut off by paging) is skipped.
export function turnsFromHistory(messages: GuideMessageDto[]): Turn[] {
  const turns: Turn[] = []
  messages.forEach((m, i) => {
    if (m.role !== 'user') return
    const a = messages[i + 1]?.role === 'assistant' ? messages[i + 1] : null
    turns.push({
      key: m.id,
      question: m.text,
      screen: m.screen,
      assistantId: a?.id ?? null,
      parts: a?.parts ?? [],
      status: a?.status ?? 'failed',
      createdAt: m.createdAt,
    })
  })
  return turns
}

export function applyEvent(turn: Turn, e: GuideSseEvent): Turn {
  if (e.event === 'start') return { ...turn, assistantId: e.data.assistantMessageId, status: 'streaming' }
  if (e.event === 'part') return { ...turn, parts: [...turn.parts, e.data] }
  return { ...turn, status: e.data.status }
}

export const textCount = (turn: Turn): number => turn.parts.filter(p => p.type === 'text' && p.block !== 'crisis').length

export function provenance(parts: ReplyPart[]): { label: string; domain: string; count: number } | null {
  const sources = parts.filter(p => p.type === 'source')
  if (!sources.length) return null
  const hosts = new Map<string, number>()
  for (const s of sources) {
    const host = new URL(s.url).hostname.replace(/^www\./, '')
    hosts.set(host, (hosts.get(host) ?? 0) + 1)
  }
  const domain = [...hosts].reduce((best, h) => (h[1] > best[1] ? h : best))[0]
  const label = sources.every(s => s.origin === 'guide') ? "LandedNZ's checked guide" : 'Official sites, checked today'
  return { label, domain, count: sources.length }
}

// Text parts only; other part types render outside the blocks.
export function groupBlocks(parts: ReplyPart[]): Block[] {
  const blocks: Block[] = []
  for (const p of parts) {
    if (p.type !== 'text') continue
    const last = blocks.at(-1)
    if (p.block === 'step') {
      if (last?.kind !== 'steps') blocks.push({ kind: 'steps', items: [[p]] })
      else if (last.items.at(-1)![0].step === p.step) last.items.at(-1)!.push(p)
      else last.items.push([p])
      continue
    }
    const kind = p.block ?? 'prose'
    if (last?.kind === kind) last.parts.push(p)
    else blocks.push({ kind, parts: [p] })
  }
  return blocks
}

const nzDay = (d: Date) => d.toLocaleDateString('en-NZ', { timeZone: 'Pacific/Auckland', day: 'numeric', month: 'short' })

// Board "Asked on this task · 29 Oct": where and when an earlier day's question was asked; today's need no line
export function askedOn(turn: Pick<Turn, 'screen' | 'createdAt'>, page: GuideScreen | null, now: Date): string | null {
  const day = nzDay(new Date(turn.createdAt))
  if (day === nzDay(now)) return null
  const { kind, taskKey } = turn.screen
  const where =
    kind === 'home' ? 'Home'
    : kind === 'roadmap' ? 'your roadmap'
    : page?.kind === 'task' && page.taskKey === taskKey ? 'this task'
    : (taskKey && TASK_COPY[taskKey]?.title) || 'a task'
  return `Asked on ${where} · ${day}`
}
