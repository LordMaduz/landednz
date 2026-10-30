import { act, render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { Turn } from '@/lib/guide-turns'
import { useGuideStore } from '@/lib/stores/guideStore'
import { Conversation } from './guide-pane'

vi.mock('@/lib/api', () => ({}))
vi.mock('@/lib/supabase/client', () => ({ createClient: () => ({ auth: { getSession: async () => ({ data: { session: null } }) } }) }))

const turn = (key: string): Turn => ({
  key,
  question: `Question ${key}`,
  screen: { kind: 'home' },
  assistantId: `a-${key}`,
  parts: [{ type: 'text', text: 'An answer.', citations: [] }],
  status: 'complete',
  createdAt: '2026-10-30T01:00:00.000Z',
})

// jsdom has no layout: each turn sits 500 px below the previous one, the conversation is 5000 px tall
beforeEach(() => {
  Object.defineProperty(HTMLElement.prototype, 'offsetTop', {
    configurable: true,
    get(this: HTMLElement) {
      return this.dataset.turn ? Number(this.dataset.turn.slice(1)) * 500 : 0
    },
  })
  Object.defineProperty(HTMLElement.prototype, 'scrollHeight', { configurable: true, get: () => 5000 })
  Object.defineProperty(HTMLElement.prototype, 'clientHeight', { configurable: true, get: () => 600 })
})
afterEach(() => {
  useGuideStore.setState({ banner: null })
  delete (HTMLElement.prototype as { offsetTop?: number }).offsetTop
  delete (HTMLElement.prototype as { scrollHeight?: number }).scrollHeight
  delete (HTMLElement.prototype as { clientHeight?: number }).clientHeight
})

const box = (c: HTMLElement) => c.querySelector<HTMLElement>('[data-turn]')!.parentElement!

describe('Conversation scroll', () => {
  it('opens at the start of the last turn, not the bottom', () => {
    const { container } = render(<Conversation turns={[turn('t1'), turn('t2')]} />)
    expect(box(container).scrollTop).toBe(1000)
  })

  it('a new question goes to the top; the answer flows in below it without following', () => {
    const { container, rerender } = render(<Conversation turns={[turn('t1')]} />)
    rerender(<Conversation turns={[turn('t1'), { ...turn('t2'), parts: [], status: 'sending' }]} />)
    expect(box(container).scrollTop).toBe(1000)
    // the newest turn is at least the pane's height, so its heading can reach the top before the answer fills in
    const [first, second] = container.querySelectorAll<HTMLElement>('[data-turn]')
    expect(second.style.minHeight).toBe('600px')
    expect(first.style.minHeight).toBe('')
    box(container).scrollTop = 1200 // the reader scrolls on
    rerender(<Conversation turns={[turn('t1'), { ...turn('t2'), status: 'streaming' }]} />)
    expect(box(container).scrollTop).toBe(1200)
  })

  it('a cap or busy banner is scrolled into view', () => {
    const { container } = render(<Conversation turns={[turn('t1')]} />)
    act(() => useGuideStore.setState({ banner: { kind: 'busy' } }))
    expect(box(container).scrollTop).toBe(5000)
  })
})
