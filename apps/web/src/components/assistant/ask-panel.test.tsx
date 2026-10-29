import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { TaskDetailApiResponse } from '@/lib/api'

type Stream = {
  content: string
  onChunk(t: string): void
  onDone(): void
  onError(e: { code?: string; message: string }): void
  signal?: AbortSignal
}
let streams: Stream[] = []
const createChatSession = vi.fn()
vi.mock('@/lib/api', () => ({
  createChatSession: (...args: unknown[]) => createChatSession(...args),
  streamChat: (
    _sessionId: string,
    content: string,
    _token: string,
    onChunk: Stream['onChunk'],
    onDone: Stream['onDone'],
    onError: Stream['onError'],
    signal?: AbortSignal,
  ) =>
    new Promise<void>(resolve => {
      streams.push({
        content,
        onChunk,
        onDone: () => (onDone(), resolve()),
        onError: e => (onError(e), resolve()),
        signal,
      })
      signal?.addEventListener('abort', () => resolve())
    }),
}))
vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({ auth: { getSession: async () => ({ data: { session: { access_token: 'tok' } } }) } }),
}))

const { AskPanel } = await import('./ask-panel')

const detail = {
  taskId: 'T08',
  documentsRequired: ['Passport'],
  processingTime: '1–2 business days',
  commonMistakes: [],
} as unknown as TaskDetailApiResponse

const panel = () => render(<AskPanel taskId="T08" topic="your IRD number" detail={detail} />)
const input = () => screen.getByRole('textbox', { name: 'Ask about your IRD number' })
const last = () => streams[streams.length - 1]

beforeEach(() => {
  vi.clearAllMocks()
  streams = []
  createChatSession.mockResolvedValue({ sessionId: 's1', openingMessage: '' })
})

describe('AskPanel', () => {
  it('heading and suggestions', () => {
    panel()
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Ask about your IRD number')
    // the page lists documents and mistakes, so only processing time is suggested
    expect(screen.getAllByRole('button', { name: /\?$/ }).map(b => b.textContent)).toEqual(['How long does it take?'])
  })

  it('a suggestion streams into an aurora reply; done gives the trace and removes the suggestion', async () => {
    const { container } = panel()
    fireEvent.click(screen.getByRole('button', { name: 'How long does it take?' }))
    await waitFor(() => expect(streams).toHaveLength(1))
    expect(createChatSession).toHaveBeenCalledWith('TASK_CARD', 'tok', 'T08')
    expect(last().content).toBe('How long does it take?')
    act(() => last().onChunk('Your passport and '))
    act(() => last().onChunk('your **visa** details, see ird.govt.nz.'))

    const reply = container.querySelector('.ai.ai-streaming')!
    expect(reply).not.toBeNull()
    expect(within(reply as HTMLElement).getByText('Checking sources')).toBeInTheDocument()
    expect(input()).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Stop' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'How long does it take?' })).toBeNull()

    act(() => last().onDone())
    expect(container.querySelector('.ai-streaming')).toBeNull()
    const done = container.querySelector('.ai') as HTMLElement
    expect(within(done).getByText('Checked ird.govt.nz')).toBeInTheDocument()
    expect(within(done).getByText('visa').tagName).toBe('STRONG')
    expect(input()).toBeEnabled()
    expect(screen.queryByRole('button', { name: 'Stop' })).toBeNull()
    expect(screen.getByText('How long does it take?')).toHaveClass('ask-q')
  })

  it('Stop aborts; the trace ends ", stopped" and the partial answer stays', async () => {
    panel()
    fireEvent.click(screen.getByRole('button', { name: 'How long does it take?' }))
    await waitFor(() => expect(streams).toHaveLength(1))
    act(() => last().onChunk('Usually one or two'))
    fireEvent.click(screen.getByRole('button', { name: 'Stop' }))
    expect(last().signal!.aborted).toBe(true)
    expect(screen.getByText('Answered from the LandedNZ knowledge base, stopped')).toBeInTheDocument()
    expect(screen.getByText('Usually one or two')).toBeInTheDocument()
    expect(input()).toBeEnabled()
  })

  it('Enter in the input sends; one session for the panel', async () => {
    panel()
    fireEvent.change(input(), { target: { value: 'Can my partner apply too?' } })
    fireEvent.submit(input().closest('form')!)
    await waitFor(() => expect(streams).toHaveLength(1))
    expect(last().content).toBe('Can my partner apply too?')
    expect(input()).toHaveValue('')
    act(() => last().onDone())
    fireEvent.change(input(), { target: { value: 'And how long?' } })
    fireEvent.submit(input().closest('form')!)
    await waitFor(() => expect(streams).toHaveLength(2))
    expect(createChatSession).toHaveBeenCalledTimes(1)
  })

  it('daily cap: the limit message, input stays disabled, earlier replies stay (Review Focus 4)', async () => {
    panel()
    fireEvent.change(input(), { target: { value: 'What documents do I need?' } })
    fireEvent.submit(input().closest('form')!)
    await waitFor(() => expect(streams).toHaveLength(1))
    act(() => last().onChunk('Your passport.'))
    act(() => last().onDone())
    fireEvent.click(screen.getByRole('button', { name: 'How long does it take?' }))
    await waitFor(() => expect(streams).toHaveLength(2))
    act(() => last().onError({ code: 'CHAT_DAILY_CAP_REACHED', message: 'Daily message limit reached.' }))

    expect(screen.getByRole('alert')).toHaveTextContent(
      "You've reached today's question limit. You can ask again after midnight.",
    )
    expect(input()).toBeDisabled()
    expect(screen.queryByRole('button', { name: 'Ask' })).toBeDisabled()
    expect(screen.getByText('Your passport.')).toBeInTheDocument()
  })

  it('thinking: "Checking official sources…" until the first words arrive', async () => {
    panel()
    fireEvent.click(screen.getByRole('button', { name: 'How long does it take?' }))
    await waitFor(() => expect(streams).toHaveLength(1))
    expect(screen.getByRole('status')).toHaveTextContent('Checking official sources…')
    act(() => last().onChunk('Usually'))
    expect(screen.queryByText('Checking official sources…')).toBeNull()
  })

  it('any other failure: keeps the question, says so, and Try again sends it once more', async () => {
    panel()
    fireEvent.click(screen.getByRole('button', { name: 'How long does it take?' }))
    await waitFor(() => expect(streams).toHaveLength(1))
    act(() => last().onError({ message: 'AI service unavailable' }))
    expect(screen.getByRole('alert')).toHaveTextContent("That didn't work. Your question is still here, so you can send it again.")
    expect(screen.getByText('How long does it take?', { selector: '.ask-q' })).toBeInTheDocument()
    expect(input()).toBeEnabled()
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }))
    await waitFor(() => expect(streams).toHaveLength(2))
    expect(last().content).toBe('How long does it take?')
    expect(screen.getAllByText('How long does it take?', { selector: '.ask-q' })).toHaveLength(1)
    expect(screen.queryByRole('alert')).toBeNull()
  })
})
