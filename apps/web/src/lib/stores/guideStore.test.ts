import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { GuideMessageDto, GuideSseEvent } from '@landednz/types'
import * as api from '@/lib/api'
import { useGuideStore } from './guideStore'

vi.mock('@/lib/api', () => ({
  askGuide: vi.fn(),
  retryGuide: vi.fn(),
  cancelGuide: vi.fn(async () => {}),
  getGuideConversation: vi.fn(),
  getGuideTaskMessages: vi.fn(),
  getGuideOpening: vi.fn(),
  deleteMemory: vi.fn(async () => {}),
}))
vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({ auth: { getSession: async () => ({ data: { session: { access_token: 'tok' } } }) } }),
}))

const m = vi.mocked(api)
const opening = (leftToday: number) => ({ whereYouAre: 'w', starters: [], leftToday, dailyCap: 20 })
const row = (o: Partial<GuideMessageDto> & Pick<GuideMessageDto, 'id' | 'role'>): GuideMessageDto => ({
  text: '', parts: null, status: 'complete', screen: { kind: 'home' }, createdAt: '2026-10-30T00:00:00.000Z', ...o,
})
const text = (t: string) => ({ type: 'text' as const, text: t, citations: [] })

// A controllable stream: push events, finish, and see the abort signal
function fakeStream() {
  const s = { emit: (() => {}) as (e: GuideSseEvent) => void, finish: () => {}, signal: null as AbortSignal | null }
  m.askGuide.mockImplementation((_b, _t, onEvent, signal) => new Promise<void>(resolve => {
    s.emit = onEvent
    s.finish = resolve
    s.signal = signal
    signal.addEventListener('abort', () => resolve())
  }))
  return s
}
const flush = () => new Promise(r => setTimeout(r, 0))
const start = { event: 'start', data: { userMessageId: 'u1', assistantMessageId: 'a1' } } as const
const initial = useGuideStore.getState()

beforeEach(() => {
  useGuideStore.setState(initial, true)
  vi.clearAllMocks()
  m.getGuideOpening.mockResolvedValue(opening(20))
  m.getGuideConversation.mockResolvedValue({ messages: [], nextBefore: null })
  m.getGuideTaskMessages.mockResolvedValue([])
})
afterEach(() => vi.useRealTimers())

describe('ask', () => {
  it('sending turn, start sets assistantId, done sets status, refetches opening and marks unseen when closed', async () => {
    const s = fakeStream()
    useGuideStore.setState({ context: { kind: 'task', taskKey: 'T1' } })
    const done = useGuideStore.getState().ask('How?')
    await flush()
    expect(m.askGuide.mock.calls[0][0]).toEqual({ text: 'How?', screen: { kind: 'task', taskKey: 'T1' } })
    expect(useGuideStore.getState()).toMatchObject({ streaming: true, turns: [{ question: 'How?', status: 'sending', assistantId: null }] })
    s.emit(start)
    expect(useGuideStore.getState().turns[0].assistantId).toBe('a1')
    m.getGuideOpening.mockResolvedValue(opening(19))
    s.emit({ event: 'part', data: text('Do this.') })
    s.emit({ event: 'done', data: { assistantMessageId: 'a1', status: 'complete' } })
    s.finish()
    await done
    await flush()
    const st = useGuideStore.getState()
    expect(st.turns[0]).toMatchObject({ status: 'complete', parts: [text('Do this.')] })
    expect(st).toMatchObject({ streaming: false, unseen: true, opening: { leftToday: 19 } })
  })

  it('stop before start aborts, removes the turn, gives the question back with a note (RF2)', async () => {
    const s = fakeStream()
    useGuideStore.setState({ turns: [{ key: 'old', question: 'Q0', screen: { kind: 'home' }, assistantId: 'a0', parts: [], status: 'complete', createdAt: '' }] })
    const done = useGuideStore.getState().ask('Too soon')
    await flush()
    await useGuideStore.getState().stop()
    await done
    const st = useGuideStore.getState()
    expect(s.signal!.aborted).toBe(true)
    expect(m.cancelGuide).not.toHaveBeenCalled()
    expect(st.turns.map(t => t.key)).toEqual(['old'])
    expect(st).toMatchObject({ draft: 'Too soon', note: "Stopped. This question wasn't counted.", streaming: false })
  })

  it('stop after text calls cancelGuide, keeps the parts, status cancelled', async () => {
    const s = fakeStream()
    const done = useGuideStore.getState().ask('Q')
    await flush()
    s.emit(start)
    s.emit({ event: 'part', data: text('One.') })
    await useGuideStore.getState().stop()
    await done
    expect(m.cancelGuide).toHaveBeenCalledWith('a1', 'tok')
    expect(useGuideStore.getState().turns[0]).toMatchObject({ status: 'cancelled', parts: [text('One.')] })
    expect(useGuideStore.getState().streaming).toBe(false)
  })

  it('cap error sets the cap banner and keeps earlier turns', async () => {
    const old = { key: 'old', question: 'Q0', screen: { kind: 'home' as const }, assistantId: 'a0', parts: [], status: 'complete' as const, createdAt: '' }
    useGuideStore.setState({ turns: [old] })
    m.askGuide.mockRejectedValue(Object.assign(new Error('cap'), { kind: 'cap', resetAt: 'R' }))
    await useGuideStore.getState().ask('Q')
    expect(useGuideStore.getState()).toMatchObject({ banner: { kind: 'cap', resetAt: 'R' }, turns: [old], draft: 'Q', streaming: false })
  })
})

describe('busy (RF3)', () => {
  const busyPage = { messages: [row({ id: 'a9', role: 'assistant', status: 'streaming' }), row({ id: 'u9', role: 'user', text: 'Elsewhere' })], nextBefore: null }
  const donePage = { messages: [row({ id: 'a9', role: 'assistant', status: 'complete', parts: [text('Done.')] }), row({ id: 'u9', role: 'user', text: 'Elsewhere' })], nextBefore: null }

  it('a 409 shows busy, polls every 5 s until the row finishes, then clears and shows it', async () => {
    vi.useFakeTimers()
    m.askGuide.mockRejectedValue(Object.assign(new Error('busy'), { kind: 'busy' }))
    m.getGuideConversation.mockResolvedValueOnce(busyPage).mockResolvedValueOnce(donePage)
    await useGuideStore.getState().ask('Mine')
    expect(useGuideStore.getState()).toMatchObject({ banner: { kind: 'busy' }, draft: 'Mine', turns: [] })
    await vi.advanceTimersByTimeAsync(5000)
    expect(m.getGuideConversation).toHaveBeenCalledTimes(1)
    expect(useGuideStore.getState().banner).toEqual({ kind: 'busy' })
    await vi.advanceTimersByTimeAsync(5000)
    expect(m.getGuideConversation).toHaveBeenCalledTimes(2)
    expect(useGuideStore.getState().banner).toBeNull()
    expect(useGuideStore.getState().turns).toMatchObject([{ question: 'Elsewhere', assistantId: 'a9', status: 'complete', parts: [text('Done.')] }])
    await vi.advanceTimersByTimeAsync(10000)
    expect(m.getGuideConversation).toHaveBeenCalledTimes(2)
  })

  it('history whose newest assistant row is streaming shows busy and picks up the finished row', async () => {
    vi.useFakeTimers()
    m.getGuideConversation.mockResolvedValueOnce(busyPage).mockResolvedValueOnce(donePage)
    await useGuideStore.getState().openPane()
    expect(useGuideStore.getState()).toMatchObject({ open: true, historyLoaded: 'all', banner: { kind: 'busy' } })
    await vi.advanceTimersByTimeAsync(5000)
    expect(useGuideStore.getState().banner).toBeNull()
    expect(useGuideStore.getState().turns).toMatchObject([{ assistantId: 'a9', status: 'complete' }])
  })
})

describe('context', () => {
  it('clearContext returns to the page context, not Home', () => {
    const store = useGuideStore.getState()
    store.setPage({ kind: 'roadmap' })
    store.openPane({ kind: 'task', taskKey: 'T08' })
    useGuideStore.getState().clearContext()
    expect(useGuideStore.getState().context).toEqual({ kind: 'roadmap' })
  })
})

describe('history', () => {
  it('openPane on a task loads its messages first; showAll loads everything', async () => {
    m.getGuideTaskMessages.mockResolvedValue([row({ id: 'u1', role: 'user', text: 'Task Q' }), row({ id: 'a1', role: 'assistant' })])
    await useGuideStore.getState().openPane({ kind: 'task', taskKey: 'T1' })
    let st = useGuideStore.getState()
    expect(m.getGuideTaskMessages).toHaveBeenCalledWith('T1', 'tok')
    expect(m.getGuideOpening).toHaveBeenCalledWith({ kind: 'task', taskKey: 'T1' }, 'tok')
    expect(st).toMatchObject({ open: true, context: { kind: 'task', taskKey: 'T1' }, historyLoaded: 'task', turns: [{ question: 'Task Q' }] })
    m.getGuideConversation.mockResolvedValue({ messages: [row({ id: 'a1', role: 'assistant' }), row({ id: 'u1', role: 'user', text: 'Task Q' }), row({ id: 'a0', role: 'assistant' }), row({ id: 'u0', role: 'user', text: 'Older' })], nextBefore: null })
    await useGuideStore.getState().showAll()
    st = useGuideStore.getState()
    expect(st.historyLoaded).toBe('all')
    expect(st.turns.map(t => t.question)).toEqual(['Older', 'Task Q'])
  })

  it('showAll follows nextBefore until the whole conversation is loaded', async () => {
    m.getGuideConversation
      .mockResolvedValueOnce({ messages: [row({ id: 'a2', role: 'assistant', status: 'streaming' }), row({ id: 'u2', role: 'user', text: 'Newest' })], nextBefore: 'c1' })
      .mockResolvedValueOnce({ messages: [row({ id: 'a1', role: 'assistant' }), row({ id: 'u1', role: 'user', text: 'Oldest' })], nextBefore: null })
    await useGuideStore.getState().showAll()
    expect(m.getGuideConversation.mock.calls).toEqual([['tok'], ['tok', 'c1']])
    const st = useGuideStore.getState()
    expect(st.turns.map(t => t.question)).toEqual(['Oldest', 'Newest'])
    expect(st.banner).toEqual({ kind: 'busy' })
  })

  it('undoMemory deletes the memory and removes its note from the reply', async () => {
    useGuideStore.setState({ turns: [{ key: 'k', question: 'q', screen: { kind: 'home' }, assistantId: 'a', parts: [text('x'), { type: 'memory_saved', memoryId: 'mem1', text: 'm' }], status: 'complete', createdAt: '' }] })
    await useGuideStore.getState().undoMemory('mem1')
    expect(m.deleteMemory).toHaveBeenCalledWith('mem1', 'tok')
    expect(useGuideStore.getState().turns[0].parts).toEqual([text('x')])
  })
})
