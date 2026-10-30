import { readFileSync } from 'node:fs'
import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { ReplyPart } from '@landednz/types'
import type { Turn } from '@/lib/guide-turns'
import { Banner, Reply } from './reply'

const source: ReplyPart = {
  type: 'source',
  index: 1,
  title: 'Tax code declaration (IR330)',
  url: 'https://www.ird.govt.nz/ir330',
  origin: 'guide',
  checkedAt: '2026-10-25T03:00:00.000Z',
}
const answer: ReplyPart[] = [
  { type: 'text', text: 'Yes, you can start work before it arrives.', citations: [1] },
  { type: 'text', text: 'Register for myIR.', citations: [], block: 'step', step: 1 },
  { type: 'text', text: 'Apply as a new arrival.', citations: [], block: 'step', step: 2 },
  { type: 'text', text: 'Inland Revenue can, on 0800 227 774.', citations: [], block: 'limits' },
  source,
]

const turn = (over: Partial<Turn> = {}): Turn => ({
  key: 'u1',
  question: 'Can I start work before my IRD number arrives?',
  screen: { kind: 'task', taskKey: 'T08' },
  assistantId: 'a1',
  parts: answer,
  status: 'complete',
  createdAt: '2026-10-29T01:00:00.000Z',
  ...over,
})

const show = (t: Turn, handlers: Partial<{ onRetry: () => void; onFollowUp: (text: string) => void; onUndoMemory: (id: string) => void }> = {}) =>
  render(<Reply turn={t} onRetry={handlers.onRetry ?? vi.fn()} onFollowUp={handlers.onFollowUp ?? vi.fn()} onUndoMemory={handlers.onUndoMemory ?? vi.fn()} />)

describe('Reply', () => {
  it('focused view sets the question at title size; an earlier day\'s question carries where and when it was asked', () => {
    render(<Reply turn={turn()} focus meta="Asked on this task · 29 Oct" onRetry={vi.fn()} onFollowUp={vi.fn()} onUndoMemory={vi.fn()} />)
    expect(screen.getByRole('heading', { name: /Can I start work/ })).toHaveClass('text-title')
    expect(screen.getByText('Asked on this task · 29 Oct')).toBeInTheDocument()
  })

  it('shows the question as a heading, the provenance line, steps as a list and the limits line', () => {
    show(turn())
    expect(screen.getByRole('heading', { level: 3, name: 'Can I start work before my IRD number arrives?' })).toBeInTheDocument()
    expect(screen.getByText("LandedNZ's checked guide")).toBeInTheDocument()
    expect(screen.getByText('ird.govt.nz · 1 source')).toBeInTheDocument()
    const items = within(screen.getByRole('list', { name: 'Steps' })).getAllByRole('listitem')
    expect(items.map(li => li.textContent)).toEqual(['1Register for myIR.', '2Apply as a new arrival.'])
    expect(screen.getByText("What I can't tell you")).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '0800 227 774' })).toHaveAttribute('href', 'tel:0800227774')
  })

  it('streaming: says it is writing, inside a polite live region holding the sentences', () => {
    show(turn({ status: 'streaming', parts: answer.slice(0, 1) }))
    expect(screen.getByText('Writing the answer…')).toBeInTheDocument()
    const live = screen.getByText('Yes, you can start work before it arrives.').closest('[aria-live="polite"]')
    expect(live).not.toBeNull()
  })

  it('streaming before any text: names what it is checking', () => {
    show(turn({ status: 'streaming', parts: [{ type: 'notice', kind: 'checking_official' }] }))
    expect(screen.getByText('Checking official sites')).toBeInTheDocument()
  })

  it('citation: chip opens a preview with domain and checked date; Escape closes it and returns focus', async () => {
    show(turn())
    const chip = screen.getByRole('button', { name: 'Source 1' })
    chip.focus()
    fireEvent.click(chip)
    const preview = await screen.findByRole('dialog')
    expect(within(preview).getByText('Tax code declaration (IR330)')).toBeInTheDocument()
    expect(within(preview).getByText('ird.govt.nz · checked 25 Oct 2026')).toBeInTheDocument()
    expect(within(preview).getByRole('link', { name: /Open on ird.govt.nz/ })).toHaveAttribute('href', 'https://www.ird.govt.nz/ir330')
    fireEvent.keyDown(document.activeElement!, { key: 'Escape' })
    await vi.waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
    expect(chip).toHaveFocus()
  })

  it('sources: the toggle expands the numbered list in place', async () => {
    show(turn())
    fireEvent.click(screen.getByRole('button', { name: '1 source' }))
    expect(screen.getByRole('button', { name: 'Hide sources' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Tax code declaration \(IR330\)/ })).toHaveAttribute('href', 'https://www.ird.govt.nz/ir330')
  })

  it('interrupted: what arrived stays, plus Retry', async () => {
    const onRetry = vi.fn()
    show(turn({ status: 'interrupted', parts: answer.slice(0, 1) }), { onRetry })
    expect(screen.getByText('Yes, you can start work before it arrives.')).toBeInTheDocument()
    expect(screen.getByText('The answer stopped partway.')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }))
    expect(onRetry).toHaveBeenCalled()
  })

  it('failed before any text: not counted, plus Retry', () => {
    show(turn({ status: 'failed', parts: [] }))
    expect(screen.getByText("Something went wrong before the answer started. This question wasn't counted.")).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument()
  })

  it('cut short: says so and offers the rest', async () => {
    const onFollowUp = vi.fn()
    show(turn({ parts: [...answer, { type: 'notice', kind: 'truncated' }] }), { onFollowUp })
    expect(screen.getByText('This answer was cut short.')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Want the rest?' }))
    expect(onFollowUp).toHaveBeenCalledWith('Want the rest?')
  })

  it('stopped after text', () => {
    show(turn({ status: 'cancelled', parts: answer.slice(0, 1) }))
    expect(screen.getByText('You stopped this answer.')).toBeInTheDocument()
  })

  it('official sites unavailable', () => {
    show(turn({ parts: [{ type: 'notice', kind: 'official_unavailable' }, ...answer] }))
    expect(screen.getByText("Official sites didn't respond. Answering from the checked guide only.")).toBeInTheDocument()
  })

  it('check note: the unverified text under the answer', () => {
    show(turn({ parts: [...answer, { type: 'unverified', text: 'Double-check "the usual 2 days".' }] }))
    expect(screen.getByText('Double-check "the usual 2 days".')).toBeInTheDocument()
    expect(screen.getByText('Yes, you can start work before it arrives.')).toBeInTheDocument()
  })

  it('task card shows the page title for its task, not the API name; one follow-up is a button', async () => {
    const onFollowUp = vi.fn()
    show(
      turn({
        parts: [
          ...answer,
          { type: 'task_link', taskKey: 'T08', title: 'Get your IRD number' },
          { type: 'follow_up', text: 'What goes on the tax code declaration?' },
          { type: 'follow_up', text: 'A second one' },
        ],
      }),
      { onFollowUp },
    )
    expect(screen.getByRole('link', { name: /Apply for your IRD number/ })).toHaveAttribute('href', '/app/roadmap?task=T08')
    expect(screen.queryByText('A second one')).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'What goes on the tax code declaration?' }))
    expect(onFollowUp).toHaveBeenCalledWith('What goes on the tax code declaration?')
  })

  it('memory: Remembered pill with Undo', async () => {
    const onUndoMemory = vi.fn()
    show(turn({ parts: [...answer, { type: 'memory_saved', memoryId: 'm1', text: 'your partner arrives in December' }] }), { onUndoMemory })
    expect(screen.getByText('Remembered: your partner arrives in December')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
    expect(onUndoMemory).toHaveBeenCalledWith('m1')
  })

  it('Copy writes the answer text to the clipboard', async () => {
    const write = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', { value: { writeText: write }, configurable: true })
    show(turn())
    fireEvent.click(screen.getByRole('button', { name: 'Copy' }))
    expect(write.mock.calls[0][0]).toContain('Register for myIR.')
  })

  it('crisis: the crisis card comes first, with three tel: rows and no motion', () => {
    const { container } = show(
      turn({
        question: "I'm not coping",
        parts: [
          { type: 'text', text: 'Lifeline NZ: 0800 543 354 …', citations: [], block: 'crisis' },
          { type: 'text', text: 'That sounds like a lot at once.', citations: [] },
        ],
      }),
    )
    const card = screen.getByText("If you're struggling, you don't have to carry it alone.").closest('section')!
    expect(card.compareDocumentPosition(screen.getByText('That sounds like a lot at once.')) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    const links = within(card).getAllByRole('link')
    expect(links.map(a => a.getAttribute('href'))).toEqual(['tel:1737', 'tel:0800543354', 'tel:111'])
    expect(within(card).getByText('Free call or text, any time. Need to Talk?')).toBeInTheDocument()
    expect(within(card).getByText('Lifeline')).toBeInTheDocument()
    expect(within(card).getByText('In an emergency')).toBeInTheDocument()
    expect(screen.queryByText('Lifeline NZ: 0800 543 354 …')).toBeNull()
    expect(container.querySelector('section [class*="animate"], section .guide-settle')).toBeNull()
  })

  it('crisis numbers match the API', () => {
    const registry = readFileSync(`${import.meta.dirname}/../../../../api/src/core/prompts/registry.ts`, 'utf8')
    const crisis = registry.match(/GUIDE_CRISIS_TEXT =\s*'([^']+)'/)![1]
    for (const n of ['1737', '0800 543 354', '111']) expect(crisis).toContain(n)
  })
})

describe('Banner', () => {
  it('cap', () => {
    render(<Banner banner={{ kind: 'cap', resetAt: '2026-10-30T11:00:00.000Z' }} dailyCap={20} />)
    expect(screen.getByText("That's the 20 questions for today. You can ask again after midnight.")).toBeInTheDocument()
    // O1 (owner 2026-10-30): the cap makes no model call, so the crisis line is always there
    expect(screen.getByText(/Need to talk\? Free call or text/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '1737' })).toHaveAttribute('href', 'tel:1737')
  })

  it('busy', () => {
    render(<Banner banner={{ kind: 'busy' }} dailyCap={20} />)
    expect(screen.getByText("An answer is still coming in another window. You can ask here once it's done.")).toBeInTheDocument()
    expect(screen.queryByText(/Need to talk/)).toBeNull()
  })
})
