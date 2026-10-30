import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { GuideSseEvent } from '@landednz/types'
import * as api from '@/lib/api'
import { useGuideStore } from '@/lib/stores/guideStore'
import { GuideShell } from './guide-shell'

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
const initial = useGuideStore.getState()

// Desktop: the pane sits beside the page (≥1024)
beforeEach(() => {
  useGuideStore.setState(initial, true)
  vi.clearAllMocks()
  window.matchMedia = (q: string) => ({ matches: true, media: q, addEventListener() {}, removeEventListener() {} }) as unknown as MediaQueryList
  m.getGuideOpening.mockResolvedValue({ whereYouAre: "You've done 1 of 4 tasks.", starters: ['What do I need to open a bank account?'], leftToday: 14, dailyCap: 20 })
  m.getGuideConversation.mockResolvedValue({ messages: [], nextBefore: null })
  m.getGuideTaskMessages.mockResolvedValue([])
})

const shell = (page = { kind: 'home' } as const) =>
  render(
    <GuideShell page={page} titles={{ T08: 'Apply for your IRD number' }}>
      <input aria-label="Other field" />
    </GuideShell>,
  )
const bar = (name: RegExp | string = /^Ask about/) => screen.getByRole('button', { name })
const box = (name: RegExp | string = /^Ask about/) => screen.getByRole('textbox', { name })
const openGuide = () => act(() => useGuideStore.getState().openPane())
const askInBar = (text: string) => {
  fireEvent.change(box(), { target: { value: text } })
  fireEvent.keyDown(box(), { key: 'Enter' })
}

describe('GuideShell', () => {
  it('"/" focuses the bar and does not open the guide', () => {
    shell()
    fireEvent.keyDown(document.body, { key: '/' })
    expect(document.activeElement?.id).toBe('guide-ask')
    expect(useGuideStore.getState().open).toBe(false)
  })

  it('below 1024 the bar is still a button that opens the sheet', async () => {
    window.matchMedia = (q: string) => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {} }) as unknown as MediaQueryList
    shell()
    expect(screen.queryByRole('textbox', { name: /^Ask about/ })).toBeNull()
    fireEvent.click(bar())
    expect(await screen.findByRole('dialog', { name: 'Guide' })).toBeInTheDocument()
  })

  it('/ typed in a field does nothing (D22); opening focuses the composer', async () => {
    shell()
    fireEvent.keyDown(screen.getByLabelText('Other field'), { key: '/' })
    expect(box()).not.toHaveFocus()
    await openGuide()
    await screen.findByRole('complementary', { name: 'Guide' })
    await waitFor(() => expect(screen.getByRole('textbox', { name: 'Question' })).toHaveFocus())
  })

  it('Enter in the bar opens the guide; Close returns focus to the bar (B1)', async () => {
    shell()
    askInBar('Can I apply?')
    const pane = await screen.findByRole('complementary', { name: 'Guide' })
    expect(pane).toHaveAttribute('id', 'guide-pane')
    expect(screen.getByRole('main')).toHaveAttribute('data-guide', 'open')
    fireEvent.click(screen.getByRole('button', { name: 'Close' }))
    await waitFor(() => expect(box()).toHaveFocus())
    expect(screen.getByRole('main')).toHaveAttribute('data-guide', 'closed')
  })

  it('Escape closes the pane', async () => {
    shell()
    await openGuide()
    await screen.findByRole('complementary', { name: 'Guide' })
    fireEvent.keyDown(screen.getByRole('textbox', { name: 'Question' }), { key: 'Escape' })
    expect(screen.queryByRole('complementary', { name: 'Guide' })).toBeNull()
  })

  it('below 1024 the guide opens as a sheet and the page layout does not change', async () => {
    window.matchMedia = (q: string) => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {} }) as unknown as MediaQueryList
    shell()
    fireEvent.click(bar())
    expect(await screen.findByRole('dialog', { name: 'Guide' })).toHaveAttribute('id', 'guide-pane')
    expect(screen.getByRole('main', { hidden: true })).toHaveAttribute('data-guide', 'closed')
    expect(screen.queryByRole('button', { name: 'Expand' })).toBeNull()
  })

  it('on a task the bar reads "Ask about your IRD number"', () => {
    shell({ kind: 'task', taskKey: 'T08' } as never)
    expect(box('Ask about your IRD number')).toBeInTheDocument()
  })

  it('the opening shows the where-you-are line and starters', async () => {
    shell()
    await openGuide()
    expect(await screen.findByRole('heading', { name: "You've done 1 of 4 tasks." })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'What do I need to open a bank account?' })).toBeInTheDocument()
  })

  it('unseen shows the dot; opening clears it', async () => {
    useGuideStore.setState({ unseen: true })
    shell()
    expect(box(/new answer/)).toBeInTheDocument()
    await openGuide()
    await screen.findByRole('complementary', { name: 'Guide' })
    fireEvent.click(screen.getByRole('button', { name: 'Close' }))
    expect(box('Ask about your first 90 days')).toBeInTheDocument()
  })

  it('RF1: leaving for Settings mid-stream keeps the stream; back on Home the answer is there with the dot', async () => {
    let emit: (e: GuideSseEvent) => void = () => {}
    let finish = () => {}
    m.askGuide.mockImplementation((_b, _t, onEvent) => new Promise<void>(resolve => { emit = onEvent; finish = resolve }))
    shell()
    await openGuide()
    await screen.findByRole('complementary', { name: 'Guide' })
    const asked = useGuideStore.getState().ask('Do I need a bank account?')
    await act(async () => { await new Promise(r => setTimeout(r, 0)) })
    emit({ event: 'start', data: { userMessageId: 'u1', assistantMessageId: 'a1' } })
    // Settings: no page, pane closed
    act(() => {
      useGuideStore.getState().setPage(null)
      useGuideStore.getState().close()
    })
    expect(screen.queryByRole('textbox', { name: /^Ask about/ })).toBeNull()
    emit({ event: 'part', data: { type: 'text', text: 'Yes.', citations: [] } })
    emit({ event: 'done', data: { assistantMessageId: 'a1', status: 'complete' } })
    finish()
    await asked
    expect(useGuideStore.getState().turns).toMatchObject([{ question: 'Do I need a bank account?', status: 'complete' }])
    act(() => useGuideStore.getState().setPage({ kind: 'home' }))
    expect(box(/new answer/)).toBeInTheDocument()
  })
})
