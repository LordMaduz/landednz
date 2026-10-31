import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { GuideMemoryDto } from '@landednz/types'

const listMemories = vi.fn()
const updateMemory = vi.fn()
const deleteMemory = vi.fn()
vi.mock('@/lib/api', () => ({
  listMemories: (t: string) => listMemories(t),
  updateMemory: (id: string, text: string, t: string) => updateMemory(id, text, t),
  deleteMemory: (id: string, t: string) => deleteMemory(id, t),
}))
vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({ auth: { getSession: async () => ({ data: { session: { access_token: 'tok' } } }) } }),
}))

let { MemorySection, MemoryRow } = await import('./memory-section')

const mem = (id: string, text: string, createdAt: string): GuideMemoryDto => ({ id, text, createdAt, updatedAt: createdAt })
const three = [
  mem('m1', 'You start work on 9 November.', '2026-10-30T01:00:00.000Z'),
  mem('m2', 'Your partner arrives in December.', '2026-10-29T01:00:00.000Z'),
  mem('m3', "You'd rather bank with a branch near Newmarket.", '2026-10-29T02:00:00.000Z'),
]

beforeEach(async () => {
  vi.clearAllMocks()
  listMemories.mockResolvedValue(three)
  vi.resetModules() // the memory list is a module-level store
  ;({ MemorySection, MemoryRow } = await import('./memory-section'))
})

describe('MemorySection', () => {
  it('lists the memories with their date and the kept count', async () => {
    render(<MemorySection />)
    expect(screen.getByRole('heading', { name: 'What the guide remembers' })).toBeInTheDocument()
    expect(screen.getByText("Only things you told it. It uses them in answers. Delete one and it's gone for good.")).toBeInTheDocument()
    const items = await screen.findAllByRole('listitem')
    expect(items).toHaveLength(3)
    expect(items[0]).toHaveTextContent('You start work on 9 November.')
    expect(items[0]).toHaveTextContent('From the guide, 30 Oct')
    expect(screen.getByText('3 of 50 kept. Health and immigration problems are only kept if you ask.')).toBeInTheDocument()
  })

  it('Edit then Save sends the new text and shows it', async () => {
    updateMemory.mockResolvedValue({ ...three[1], text: 'Your partner arrives on 12 December.' })
    render(<MemorySection />)
    const row = (await screen.findAllByRole('listitem'))[1]
    fireEvent.click(within(row).getByRole('button', { name: 'Edit' }))
    expect(within(row).getByText('Edited facts are used from your next question.')).toBeInTheDocument()
    fireEvent.change(within(row).getByRole('textbox'), { target: { value: 'Your partner arrives on 12 December.' } })
    fireEvent.click(within(row).getByRole('button', { name: 'Save' }))
    await waitFor(() => expect(updateMemory).toHaveBeenCalledWith('m2', 'Your partner arrives on 12 December.', 'tok'))
    expect(await screen.findByText('Your partner arrives on 12 December.')).toBeInTheDocument()
    expect(screen.queryByRole('textbox')).toBeNull()
  })

  it('Cancel leaves the memory as it was', async () => {
    render(<MemorySection />)
    const row = (await screen.findAllByRole('listitem'))[1]
    fireEvent.click(within(row).getByRole('button', { name: 'Edit' }))
    fireEvent.change(within(row).getByRole('textbox'), { target: { value: 'changed' } })
    fireEvent.click(within(row).getByRole('button', { name: 'Cancel' }))
    expect(screen.getByText('Your partner arrives in December.')).toBeInTheDocument()
    expect(updateMemory).not.toHaveBeenCalled()
  })

  it('Delete removes the memory at once', async () => {
    deleteMemory.mockResolvedValue(undefined)
    render(<MemorySection />)
    const row = (await screen.findAllByRole('listitem'))[0]
    fireEvent.click(within(row).getByRole('button', { name: 'Delete' }))
    await waitFor(() => expect(deleteMemory).toHaveBeenCalledWith('m1', 'tok'))
    await waitFor(() => expect(screen.getAllByRole('listitem')).toHaveLength(2))
    expect(screen.getByText(/^2 of 50 kept\./)).toBeInTheDocument()
  })

  it('a failed delete keeps the memory and says so', async () => {
    deleteMemory.mockRejectedValue(new Error('down'))
    render(<MemorySection />)
    const row = (await screen.findAllByRole('listitem'))[0]
    fireEvent.click(within(row).getByRole('button', { name: 'Delete' }))
    expect(await screen.findByRole('alert')).toBeInTheDocument()
    expect(screen.getAllByRole('listitem')).toHaveLength(3)
  })

  it('empty list', async () => {
    listMemories.mockResolvedValue([])
    render(<MemorySection />)
    expect(await screen.findByText("The guide hasn't remembered anything yet.")).toBeInTheDocument()
  })
})

describe('MemoryRow', () => {
  it('shows the count and a Manage link to the editor', async () => {
    render(<MemoryRow open={false} />)
    expect(await screen.findByText('3 things the guide remembers')).toBeInTheDocument()
    expect(screen.getAllByText('Memory')).toHaveLength(2) // desktop label column + phone label line
    expect(screen.getByRole('link', { name: 'Manage memory' })).toHaveAttribute('href', '/settings?edit=memory')
  })
})
