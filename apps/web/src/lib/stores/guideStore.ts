import { create } from 'zustand'
import type { GuideMessageDto, GuideOpeningResponse, GuideScreen, GuideSseEvent } from '@landednz/types'
import {
  askGuide, cancelGuide, deleteMemory, getGuideConversation, getGuideOpening, getGuideTaskMessages, retryGuide,
  type GuideRequestError,
} from '@/lib/api'
import { createClient } from '@/lib/supabase/client'
import { applyEvent, textCount, turnsFromHistory, type Turn } from '@/lib/guide-turns'

export type GuideBanner = { kind: 'cap'; resetAt: string } | { kind: 'busy' } | null

interface GuideStore {
  open: boolean
  expanded: boolean
  context: GuideScreen
  page: GuideScreen | null
  turns: Turn[]
  opening: GuideOpeningResponse | null
  streaming: boolean
  draft: string
  // shown under the composer, e.g. after Stop gives a question back
  note: string | null
  banner: GuideBanner
  unseen: boolean
  historyLoaded: 'none' | 'task' | 'all'
  hasConversation: boolean
  primed: boolean
  setPage: (page: GuideScreen | null) => void
  setDraft: (draft: string) => void
  openPane: (context?: GuideScreen) => Promise<void>
  close: () => void
  toggleExpanded: () => void
  clearContext: () => void
  ask: (text: string) => Promise<void>
  stop: () => Promise<void>
  retry: (turnKey: string) => Promise<void>
  undoMemory: (memoryId: string) => Promise<void>
  showAll: () => Promise<void>
  prime: () => Promise<void>
  askFromBar: (text: string) => Promise<void>
}

const HOME: GuideScreen = { kind: 'home' }
export const STOPPED_NOTE = "Stopped. This question wasn't counted."
const POLL_MS = 5000

async function getToken(): Promise<string> {
  const { data } = await createClient().auth.getSession()
  if (!data.session) throw new Error('Signed out')
  return data.session.access_token
}

// The one open stream lives outside state: it must survive pane close and page changes
let live: { ctl: AbortController; key: string; isNew: boolean } | null = null
let poll: ReturnType<typeof setTimeout> | null = null
let seq = 0

const upsert = (turns: Turn[], t: Turn) =>
  turns.some(x => x.assistantId === t.assistantId) ? turns.map(x => (x.assistantId === t.assistantId ? t : x)) : [...turns, t]

const newestAssistant = (oldestFirst: GuideMessageDto[]) => oldestFirst.filter(m => m.role === 'assistant').at(-1)

export const useGuideStore = create<GuideStore>((set, get) => {
  const updateTurn = (key: string, fn: (t: Turn) => Turn) => set(s => ({ turns: s.turns.map(t => (t.key === key ? fn(t) : t)) }))
  const removeTurn = (key: string) => set(s => ({ turns: s.turns.filter(t => t.key !== key) }))

  const refreshOpening = async () => {
    try {
      set({ opening: await getGuideOpening(get().context, await getToken()) })
    } catch { /* the old opening stays */ }
  }

  // The cap lifts at resetAt (NZ midnight): unlock the composer then, even in a tab left open
  const clearCapAt = (resetAt: string) => {
    const ms = Date.parse(resetAt) - Date.now()
    if (Number.isNaN(ms)) return
    setTimeout(() => {
      if (get().banner?.kind !== 'cap') return
      set({ banner: null })
      void refreshOpening()
    }, Math.max(ms, 0))
  }

  // Another window is answering: check every 5 s until its row finishes, then show it
  const pollBusy = () => {
    if (poll) return
    poll = setTimeout(async () => {
      poll = null
      try {
        const oldestFirst = [...(await getGuideConversation(await getToken())).messages].reverse()
        if (newestAssistant(oldestFirst)?.status === 'streaming') return pollBusy()
        const finished = turnsFromHistory(oldestFirst).at(-1)
        set(s => ({ banner: null, turns: finished ? upsert(s.turns, finished) : s.turns }))
      } catch {
        pollBusy()
      }
    }, POLL_MS)
  }

  const run = async (
    key: string,
    isNew: boolean,
    call: (token: string, onEvent: (e: GuideSseEvent) => void, signal: AbortSignal) => Promise<void>,
    undo: () => void,
  ) => {
    const ctl = new AbortController()
    live = { ctl, key, isNew }
    set({ streaming: true })
    try {
      await call(await getToken(), e => { if (live?.ctl === ctl) updateTurn(key, t => applyEvent(t, e)) }, ctl.signal)
      if (live?.ctl !== ctl) return
      // a stream that ends without `done` was dropped
      updateTurn(key, t => (t.status === 'sending' || t.status === 'streaming' ? { ...t, status: 'interrupted' } : t))
      set({ unseen: !get().open })
      void refreshOpening()
    } catch (e) {
      if (live?.ctl !== ctl) return
      const err = e as Partial<GuideRequestError>
      if (err.kind === 'cap' || err.kind === 'busy') {
        undo()
        set({ banner: err.kind === 'cap' ? { kind: 'cap', resetAt: (err as { resetAt: string }).resetAt } : { kind: 'busy' } })
        if (err.kind === 'busy') pollBusy()
        else clearCapAt((err as { resetAt: string }).resetAt)
      } else {
        updateTurn(key, t => ({ ...t, status: 'failed' }))
      }
    } finally {
      if (live?.ctl === ctl) {
        live = null
        set({ streaming: false })
      }
    }
  }

  // Newest first, one page; `everything` follows nextBefore to the start of the conversation
  const conversation = async (token: string, everything: boolean) => {
    let page = await getGuideConversation(token)
    const rows = [...page.messages]
    while (everything && page.nextBefore) {
      page = await getGuideConversation(token, page.nextBefore)
      rows.push(...page.messages)
    }
    return rows
  }

  const loadHistory = async (ctx: GuideScreen, token: string, everything = false) => {
    const oldestFirst = ctx.kind === 'task' && ctx.taskKey
      ? await getGuideTaskMessages(ctx.taskKey, token)
      : (await conversation(token, everything)).reverse()
    const turns = turnsFromHistory(oldestFirst)
    const liveTurn = live && get().turns.find(t => t.key === live!.key)
    set({
      turns: liveTurn ? [...turns.filter(t => t.assistantId !== liveTurn.assistantId), liveTurn] : turns,
      historyLoaded: ctx.kind === 'task' && ctx.taskKey ? 'task' : 'all',
    })
    if (!live && newestAssistant(oldestFirst)?.status === 'streaming') {
      set({ banner: { kind: 'busy' } })
      pollBusy()
    }
  }

  return {
    open: false,
    expanded: false,
    context: HOME,
    page: null,
    turns: [],
    opening: null,
    streaming: false,
    draft: '',
    note: null,
    banner: null,
    unseen: false,
    historyLoaded: 'none',
    hasConversation: false,
    primed: false,

    setDraft: draft => set({ draft }),

    setPage: page => set(s => ({ page, context: page ?? s.context, open: page ? s.open : false })),

    openPane: async context => {
      const ctx = context ?? get().page ?? HOME
      set({ open: true, context: ctx, unseen: false })
      try {
        const token = await getToken()
        await Promise.all([
          getGuideOpening(ctx, token).then(opening => set({ opening })),
          live ? null : loadHistory(ctx, token),
        ])
      } catch { /* pane stays usable; history and opening load on the next open */ }
    },

    close: () => set({ open: false }),
    toggleExpanded: () => set(s => ({ expanded: !s.expanded })),
    clearContext: () => set(s => ({ context: s.page ?? HOME })),

    ask: async text => {
      const { streaming, banner, context, turns } = get()
      if (streaming || banner) return
      const turn: Turn = {
        key: `local-${++seq}`, question: text, screen: context, assistantId: null, parts: [], status: 'sending', createdAt: new Date().toISOString(),
      }
      set({ turns: [...turns, turn], draft: '', note: null, hasConversation: true })
      await run(turn.key, true, (token, onEvent, signal) => askGuide({ text, screen: context }, token, onEvent, signal), () => {
        removeTurn(turn.key)
        set({ draft: text })
      })
    },

    stop: async () => {
      if (!live) return
      const { ctl, key, isNew } = live
      const turn = get().turns.find(t => t.key === key)!
      live = null
      // spec §7: Stop before any answer text gives the question back and does not count it
      if (isNew && textCount(turn) === 0) {
        // a crisis card already on screen stays (C08)
        if (turn.parts.length) updateTurn(key, t => ({ ...t, status: 'cancelled' }))
        else removeTurn(key)
        set({ draft: turn.question, note: STOPPED_NOTE, streaming: false })
      } else {
        updateTurn(key, t => ({ ...t, status: 'cancelled' }))
        set({ streaming: false })
      }
      // cancel before aborting, so the server records `cancelled`, not a disconnect
      if (turn.assistantId) await cancelGuide(turn.assistantId, await getToken()).catch(() => {})
      ctl.abort()
      void refreshOpening()
    },

    retry: async turnKey => {
      const turn = get().turns.find(t => t.key === turnKey)
      if (!turn || get().streaming || get().banner) return
      const assistantId = turn.assistantId
      if (!assistantId) {
        // failed before `start`: nothing on the server to retry, ask again
        removeTurn(turnKey)
        return get().ask(turn.question)
      }
      updateTurn(turnKey, t => ({ ...t, parts: [], status: 'sending' }))
      await run(turnKey, false, (token, onEvent, signal) => retryGuide(assistantId, token, onEvent, signal), () => updateTurn(turnKey, () => turn))
    },

    undoMemory: async memoryId => {
      await deleteMemory(memoryId, await getToken())
      set(s => ({
        turns: s.turns.map(t => ({ ...t, parts: t.parts.filter(p => !(p.type === 'memory_saved' && p.memoryId === memoryId)) })),
      }))
    },

    showAll: async () => loadHistory(HOME, await getToken(), true),

    // The bar needs "left today" and "has a conversation" before the guide is ever opened
    prime: async () => {
      if (get().primed) return
      set({ primed: true })
      try {
        const token = await getToken()
        const [opening, page] = await Promise.all([getGuideOpening(get().page ?? HOME, token), getGuideConversation(token)])
        set(s => ({ opening: s.opening ?? opening, hasConversation: s.hasConversation || page.messages.length > 0 }))
      } catch { /* the bar stays usable */ }
    },

    // draft is set first so an ask that returns early (streaming, banner) keeps the question in the composer
    askFromBar: async text => {
      set({ draft: text })
      await get().openPane()
      await get().ask(text.trim())
    },
  }
})
