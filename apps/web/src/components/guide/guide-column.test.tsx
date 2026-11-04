import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { TaskDetailApiResponse } from '@/lib/api'
import { buildRouteView } from '@/lib/route-view'
import { priya } from '@/test/roadmap-fixtures'

const completeTask = vi.fn()
vi.mock('@/lib/api', () => ({
  lastTaskDetail: () => undefined,
  getTaskDetail: async (id: string) => ({ taskId: id, governmentSourceUrl: 'https://www.ird.govt.nz/', steps: ['Apply online.'], documentsRequired: [], commonMistakes: [], watchOuts: [] }) as unknown as TaskDetailApiResponse,
  completeTask: (id: string, token: string) => completeTask(id, token),
  reopenTask: vi.fn(async () => {}),
  askGuide: vi.fn(),
  retryGuide: vi.fn(),
  cancelGuide: vi.fn(async () => {}),
  getGuideConversation: vi.fn(async () => ({ messages: [], nextBefore: null })),
  getGuideTaskMessages: vi.fn(async () => []),
  getGuideOpening: vi.fn(async () => ({ whereYouAre: 'w', starters: [], leftToday: 14, dailyCap: 20 })),
  deleteMemory: vi.fn(async () => {}),
}))
vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({ auth: { getSession: async () => ({ data: { session: { access_token: 'tok' } } }) } }),
}))

const { TaskSheet } = await import('../workspace/task-sheet')
const { GuideShell } = await import('./guide-shell')
const { useGuideStore } = await import('@/lib/stores/guideStore')

const initial = useGuideStore.getState()
const turn = { key: 't1', question: 'Q1', screen: { kind: 'task' as const, taskKey: 'T08' }, assistantId: 'a1', parts: [], status: 'complete' as const, createdAt: '' }
const wideAs = (matches: boolean) =>
  (window.matchMedia = (q: string) => ({ matches, media: q, addEventListener() {}, removeEventListener() {} }) as unknown as MediaQueryList)

const page = () =>
  render(
    <GuideShell page={{ kind: 'task', taskKey: 'T08' }} titles={{}}>
      <TaskSheet taskId="T08" route={buildRouteView(priya(), '2026-10-21', new Date('2026-10-23T10:00:00+13:00'))} onChanged={() => {}} />
    </GuideShell>,
  )
const actions = () => screen.queryByRole('complementary', { name: 'Task actions' })
const guide = () => screen.queryByRole('complementary', { name: 'Guide' })

beforeEach(() => {
  useGuideStore.setState({ ...initial, open: true, turns: [turn], page: { kind: 'task', taskKey: 'T08' } }, true)
  vi.clearAllMocks()
  completeTask.mockResolvedValue(undefined)
  wideAs(true)
})
afterEach(() => vi.useRealTimers())

describe('GuideColumn (Task, wide)', () => {
  it('chat replaces the actions', async () => {
    page()
    expect(actions()).toBeNull()
    const g = guide()!
    expect(await within(g).findByRole('button', { name: 'Mark as done' })).toBeInTheDocument()
    expect(within(g).getByRole('button', { name: 'Back to task' })).toBeInTheDocument()
    expect(within(g).queryByRole('button', { name: 'Close' })).toBeNull()
  })

  it('announces Guide opened', () => {
    page()
    expect(screen.getByText('Guide opened')).toHaveAttribute('aria-live', 'polite')
  })

  it('Back to task restores the actions and keeps the conversation', async () => {
    page()
    fireEvent.click(within(guide()!).getByRole('button', { name: 'Back to task' }))
    expect(actions()).toBeInTheDocument()
    expect(useGuideStore.getState().turns).toHaveLength(1)
  })

  it('Esc restores', () => {
    page()
    fireEvent.keyDown(screen.getByRole('textbox', { name: 'Question' }), { key: 'Escape' })
    expect(useGuideStore.getState().open).toBe(false)
    expect(actions()).toBeInTheDocument()
  })

  it('Mark as done from the strip keeps the chat open', async () => {
    page()
    fireEvent.click(await within(guide()!).findByRole('button', { name: 'Mark as done' }))
    await waitFor(() => expect(completeTask).toHaveBeenCalledTimes(1))
    expect(await within(guide()!).findByRole('button', { name: 'Mark as not done' })).toBeInTheDocument()
    expect(useGuideStore.getState().open).toBe(true)
  })

  it('expanded shows the full view, not the column', () => {
    useGuideStore.setState({ expanded: true })
    page()
    expect(screen.getByRole('button', { name: 'Back to your task' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Back to task' })).toBeNull()
  })

  it('below 1024 the column never renders the chat', async () => {
    wideAs(false)
    page()
    expect(document.querySelectorAll('aside[aria-label="Task actions"]')).toHaveLength(1)
    await screen.findByRole('dialog', { name: 'Guide' })
    expect(document.querySelectorAll('#guide-pane')).toHaveLength(1)
  })

  it('the card never moves: main is not pushed aside', () => {
    page()
    expect(screen.getByRole('main').className).not.toContain('mx-0')
    expect(document.querySelector('.w-pane')).toBeNull()
    act(() => useGuideStore.setState({ open: false }))
    expect(screen.getByRole('main')).toBeVisible()
  })
})
