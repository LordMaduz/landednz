import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useGuideStore } from '@/lib/stores/guideStore'
import { AskBar } from './ask-bar'

vi.mock('@/lib/supabase/client', () => ({ createClient: () => ({ auth: { getSession: async () => ({ data: { session: null } }) } }) }))

const initial = useGuideStore.getState()
const askFromBar = vi.fn(async () => {})
const openPane = vi.fn(async () => {})

beforeEach(() => {
  useGuideStore.setState({ ...initial, askFromBar, openPane }, true)
  vi.clearAllMocks()
})

const bar = (o: { onOpen?: () => void; page?: { kind: 'home' } | { kind: 'roadmap' } } = {}) =>
  render(<AskBar page={o.page ?? { kind: 'home' }} open={false} unseen={false} wide onOpen={o.onOpen ?? (() => {})} />)
const box = () => screen.getByRole('textbox', { name: 'Ask about your first 90 days' })

describe('AskBar (wide)', () => {
  it('Enter sends the typed question', () => {
    bar()
    fireEvent.change(box(), { target: { value: 'Can I apply?' } })
    fireEvent.keyDown(box(), { key: 'Enter' })
    expect(askFromBar).toHaveBeenCalledWith('Can I apply?')
  })

  it('Enter on an empty bar shows the note and does not open', () => {
    bar()
    fireEvent.change(box(), { target: { value: '   ' } })
    fireEvent.keyDown(box(), { key: 'Enter' })
    expect(screen.getByRole('status')).toHaveTextContent('Type a question to start chatting.')
    expect(openPane).not.toHaveBeenCalled()
    expect(askFromBar).not.toHaveBeenCalled()
    fireEvent.change(box(), { target: { value: '   a' } })
    expect(screen.getByRole('status')).toHaveTextContent('')
  })

  it('Shift+Enter keeps a new line', () => {
    bar()
    fireEvent.change(box(), { target: { value: 'line one\nline two' } })
    fireEvent.keyDown(box(), { key: 'Enter', shiftKey: true })
    expect(box()).toHaveValue('line one\nline two')
    expect(askFromBar).not.toHaveBeenCalled()
  })

  it('Enter while composing does not send', () => {
    bar()
    fireEvent.change(box(), { target: { value: '日本' } })
    fireEvent.keyDown(box(), { key: 'Enter', isComposing: true })
    expect(askFromBar).not.toHaveBeenCalled()
  })

  it('limit reached: the bar stays focusable, says why, and sends nothing', () => {
    useGuideStore.setState({ opening: { whereYouAre: 'w', starters: [], leftToday: 0, dailyCap: 20 } })
    bar()
    expect(box()).toHaveAttribute('aria-disabled', 'true')
    expect(box()).toHaveAttribute('readonly')
    expect(box()).not.toBeDisabled()
    expect(box()).toHaveAttribute('placeholder', 'No questions left today. You can ask again after midnight, NZ time.')
    expect(box()).toHaveAccessibleDescription('No questions left today. You can ask again after midnight, NZ time.')
    fireEvent.keyDown(box(), { key: 'Enter' })
    expect(askFromBar).not.toHaveBeenCalled()
    expect(screen.queryByRole('status')).toBeEmptyDOMElement()
  })

  it('Open conversation shows only with a conversation', () => {
    const onOpen = vi.fn()
    const { unmount } = bar({ onOpen })
    expect(screen.queryByRole('button', { name: 'Open conversation' })).toBeNull()
    unmount()
    useGuideStore.setState({ hasConversation: true })
    bar({ onOpen })
    fireEvent.click(screen.getByRole('button', { name: 'Open conversation' }))
    expect(onOpen).toHaveBeenCalled()
  })

  it('the draft carries to the next page', () => {
    useGuideStore.setState({ draft: 'Q' })
    bar({ page: { kind: 'roadmap' } })
    expect(screen.getByRole('textbox', { name: 'Ask about your roadmap' })).toHaveValue('Q')
  })
})
