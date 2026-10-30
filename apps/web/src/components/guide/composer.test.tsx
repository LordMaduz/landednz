import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useGuideStore } from '@/lib/stores/guideStore'
import { Composer } from './composer'

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

const initial = useGuideStore.getState()
const ask = vi.fn(async () => {})
const stop = vi.fn(async () => {})
const opening = { whereYouAre: 'w', starters: [], leftToday: 14, dailyCap: 20 }

beforeEach(() => {
  useGuideStore.setState({ ...initial, ask, stop, opening, page: { kind: 'home' }, context: { kind: 'task', taskKey: 'T08' } }, true)
  vi.clearAllMocks()
})

const box = () => screen.getByRole('textbox', { name: 'Question' })

describe('Composer', () => {
  it('"N left today" sits with Send at the end of the row, chip or no chip (board composer)', () => {
    render(<Composer titles={{ T08: 'Apply for your IRD number' }} />)
    // one end group, so the count never floats mid-row when the chip is absent
    const group = screen.getByText('14 left today').parentElement!
    expect(group).not.toHaveAttribute('data-row')
    expect(group).toContainElement(screen.getByRole('button', { name: 'Send' }))
  })

  it('Enter sends, Shift+Enter does not', () => {
    render(<Composer titles={{ T08: 'Apply for your IRD number' }} />)
    fireEvent.change(box(), { target: { value: 'Do I need a bank account?' } })
    fireEvent.keyDown(box(), { key: 'Enter', shiftKey: true })
    expect(ask).not.toHaveBeenCalled()
    fireEvent.keyDown(box(), { key: 'Enter' })
    expect(ask).toHaveBeenCalledWith('Do I need a bank account?')
  })

  it('shows the task chip, the count, and Send turns into Stop while streaming', () => {
    const { rerender } = render(<Composer titles={{ T08: 'Apply for your IRD number' }} />)
    expect(screen.getByText('Apply for your IRD number')).toBeInTheDocument()
    expect(screen.getByText('14 left today')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Send' })).toBeInTheDocument()
    useGuideStore.setState({ streaming: true })
    rerender(<Composer titles={{ T08: 'Apply for your IRD number' }} />)
    fireEvent.click(screen.getByRole('button', { name: 'Stop' }))
    expect(stop).toHaveBeenCalled()
    expect(screen.queryByRole('button', { name: 'Send' })).toBeNull()
  })

  it('× on the chip returns to the page context', () => {
    render(<Composer titles={{ T08: 'Apply for your IRD number' }} />)
    fireEvent.click(screen.getByRole('button', { name: 'Remove Apply for your IRD number' }))
    expect(useGuideStore.getState().context).toEqual({ kind: 'home' })
  })

  it('cap: no chip, "0 left today" and the midnight placeholder', () => {
    useGuideStore.setState({ banner: { kind: 'cap', resetAt: 'R' }, opening: { ...opening, leftToday: 0 } })
    render(<Composer titles={{ T08: 'Apply for your IRD number' }} />)
    expect(screen.queryByText('Apply for your IRD number')).toBeNull()
    expect(screen.getByText('0 left today')).toBeInTheDocument()
    expect(box()).toHaveAttribute('placeholder', 'You can ask again after midnight')
    expect(box()).toBeDisabled()
  })

  it('busy: no chip and the waiting placeholder', () => {
    useGuideStore.setState({ banner: { kind: 'busy' } })
    render(<Composer titles={{ T08: 'Apply for your IRD number' }} />)
    expect(screen.queryByText('Apply for your IRD number')).toBeNull()
    expect(box()).toHaveAttribute('placeholder', 'Waiting for the other window')
  })

  it('RF4: a 70-character title truncates with the full title in `title`', () => {
    const long = 'Check whether you need a qualification assessment before a job in Akld'
    expect(long).toHaveLength(70)
    render(<Composer titles={{ T08: long }} />)
    const chip = screen.getByTitle(long)
    expect(chip).toHaveTextContent(long)
    expect(chip).toHaveClass('truncate')
    // the row never wraps: the chip may shrink, the count and Send may not
    expect(chip.closest('[data-row]')).toHaveClass('flex-nowrap')
  })
})
