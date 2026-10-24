import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { Toaster } from '@/components/ui/toaster'
import type { TaskDetailApiResponse } from '@/lib/api'
import { buildRouteView } from '@/lib/route-view'
import { apiTask, priya, roadmap } from '@/test/roadmap-fixtures'

const getTaskDetail = vi.fn()
const completeTask = vi.fn()
const reopenTask = vi.fn()
const back = vi.fn()
const router = { back } // stable, like Next's
vi.mock('@/lib/api', () => ({
  getTaskDetail: (id: string, token: string) => getTaskDetail(id, token),
  completeTask: (id: string, token: string) => completeTask(id, token),
  reopenTask: (id: string, token: string) => reopenTask(id, token),
}))
vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({ auth: { getSession: async () => ({ data: { session: { access_token: 'tok' } } }) } }),
}))
vi.mock('next/navigation', () => ({ useRouter: () => router }))

const { TaskSheet } = await import('./task-sheet')

function detail(over: Partial<TaskDetailApiResponse> = {}): TaskDetailApiResponse {
  return {
    taskId: 'T08',
    name: 'IRD Number Application',
    status: 'NOT_STARTED',
    isBlocked: false,
    estimatedDuration: '1 hour',
    processingTime: null,
    governmentSourceUrl: 'https://www.ird.govt.nz/managing-my-tax/ird-numbers',
    lastVerified: '2026-03-03',
    taskType: 'FREE',
    consequenceLine: 'Your employer needs it before your first payday.',
    steps: ['Have your passport ready.', 'Apply online at ird.govt.nz.'],
    documentsRequired: [],
    commonMistakes: [],
    watchOuts: [],
    cost: null,
    relatedTasks: [],
    professionalAdviceRequired: false,
    professionalAdviceNote: null,
    ...over,
  }
}

function withWhy() {
  const r = priya()
  r.phases.flatMap(p => p.tasks).find(t => t.taskId === 'T08')!.consequenceLine =
    'Your employer needs it before your first payday.'
  return r
}
const route = () => buildRouteView(withWhy(), '2026-10-21')

function sheet(taskId: string, props: Partial<{ onClose(): void; onChanged(): void }> = {}) {
  const onClose = props.onClose ?? vi.fn()
  const onChanged = props.onChanged ?? vi.fn()
  const r = render(
    <>
      <TaskSheet taskId={taskId} route={route()} onClose={onClose} onChanged={onChanged} />
      <Toaster />
    </>,
  )
  return { ...r, onClose, onChanged }
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(new Date('2026-10-24T01:00:00.000Z')) // 24 Oct in NZ
  getTaskDetail.mockImplementation(async (id: string) => detail({ taskId: id }))
  completeTask.mockResolvedValue(undefined)
  reopenTask.mockResolvedValue(undefined)
})
afterEach(() => vi.useRealTimers())

describe('TaskSheet', () => {
  it('leg and duration, title, consequence, steps, action link and source line', async () => {
    sheet('T08')
    const aside = screen.getByRole('complementary', { name: 'Apply for your IRD number' })
    expect(within(aside).getByText('Week 1, 1 hour')).toBeInTheDocument()
    expect(within(aside).getByRole('heading', { level: 2 })).toHaveTextContent('Apply for your IRD number')
    expect(within(aside).getByText('Your employer needs it before your first payday.')).toBeInTheDocument()
    const steps = await within(aside).findAllByRole('listitem')
    expect(steps.map(s => s.textContent)).toEqual(['Have your passport ready.', 'Apply online at ird.govt.nz.'])
    const action = within(aside).getByRole('link', { name: 'Open the IRD application (opens in a new tab)' })
    expect(action).toHaveAttribute('href', 'https://www.ird.govt.nz/managing-my-tax/ird-numbers')
    expect(action).toHaveAttribute('target', '_blank')
    expect(within(aside).getByText(/^Source:/)).toHaveTextContent('Source: ird.govt.nz, checked 3 March 2026')
    expect(getTaskDetail).toHaveBeenCalledWith('T08', 'tok')
  })

  it('a step with inline items: lead line and a nested list, no markdown markers', async () => {
    getTaskDetail.mockResolvedValueOnce(detail({ steps: ['You will need: - **Your passport** - Your visa details'] }))
    sheet('T08')
    const step = await screen.findByText('You will need:')
    const items = within(step.closest('li')!).getAllByRole('listitem')
    expect(items.map(i => i.textContent)).toEqual(['Your passport', 'Your visa details'])
  })

  it('no checked date when lastVerified is null', async () => {
    getTaskDetail.mockResolvedValueOnce(detail({ lastVerified: null }))
    sheet('T08')
    expect(await screen.findByText(/^Source:/)).toHaveTextContent(/^Source: ird\.govt\.nz$/)
  })

  it('Mark as done: stamp and toast; Undo reopens, stamp gone, route refetched', async () => {
    const { onChanged } = sheet('T08')
    fireEvent.click(screen.getByRole('button', { name: 'Mark as done' }))
    expect(await screen.findByRole('img', { name: 'Done 24 Oct' })).toBeInTheDocument()
    expect(completeTask).toHaveBeenCalledWith('T08', 'tok')
    expect(screen.queryByRole('button', { name: 'Mark as done' })).toBeNull()
    expect(screen.getByRole('button', { name: 'Mark as not done' })).toBeInTheDocument()
    expect(await screen.findByText('Marked as done')).toBeInTheDocument()
    expect(onChanged).toHaveBeenCalledTimes(1)

    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
    await waitFor(() => expect(reopenTask).toHaveBeenCalledWith('T08', 'tok'))
    await waitFor(() => expect(screen.queryByRole('img', { name: /^Done/ })).toBeNull())
    expect(screen.getByRole('button', { name: 'Mark as done' })).toBeInTheDocument()
    expect(onChanged).toHaveBeenCalledTimes(2)
  })

  it('a done task: stamp with its day, quiet Mark as not done, no primary, no action link', async () => {
    const { onChanged } = sheet('T07')
    expect(screen.getByRole('img', { name: 'Done 22 Oct' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Mark as done' })).toBeNull()
    expect(document.querySelectorAll('button.bg-ink')).toHaveLength(0)
    expect(screen.queryByRole('link', { name: /opens in a new tab/ })).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Mark as not done' }))
    await waitFor(() => expect(reopenTask).toHaveBeenCalledWith('T07', 'tok'))
    await waitFor(() => expect(screen.queryByRole('img', { name: /^Done/ })).toBeNull())
    expect(onChanged).toHaveBeenCalledTimes(1)
  })

  it('a blocked task: no Mark button, the sub says what it needs', () => {
    sheet('T09')
    expect(screen.getByText('Week 1, Needs your IRD number first')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /^Mark as/ })).toBeNull()
  })

  it('a failed save says so and leaves the task as it was', async () => {
    completeTask.mockRejectedValueOnce(new Error('down'))
    const { onChanged } = sheet('T08')
    fireEvent.click(screen.getByRole('button', { name: 'Mark as done' }))
    expect(await screen.findByText("Couldn't mark it as done. Check your connection, then try again.")).toBeInTheDocument()
    expect(screen.queryByRole('img', { name: /^Done/ })).toBeNull()
    expect(onChanged).not.toHaveBeenCalled()
  })

  it('Esc and Close call onClose', () => {
    const { onClose } = sheet('T08')
    fireEvent.keyDown(document, { key: 'Escape' })
    fireEvent.click(screen.getByRole('button', { name: 'Close task' }))
    expect(onClose).toHaveBeenCalledTimes(2)
  })

  it('opened from another task: Back is named after it and pops history', () => {
    const props = { route: route(), onClose: vi.fn(), onChanged: vi.fn() }
    const { rerender } = render(<TaskSheet taskId="T08" {...props} />)
    expect(screen.queryByRole('button', { name: /Apply for your IRD number/ })).toBeNull()
    rerender(<TaskSheet taskId="T10" {...props} />)
    fireEvent.click(screen.getByRole('button', { name: 'Back to Apply for your IRD number' }))
    expect(back).toHaveBeenCalledTimes(1)
    // the browser pops to ?task=T08: no Back left
    rerender(<TaskSheet taskId="T08" {...props} />)
    expect(screen.queryByRole('button', { name: /^Back to/ })).toBeNull()
  })

  it('unknown task id: nothing rendered', () => {
    const { container } = render(
      <TaskSheet taskId="T99" route={buildRouteView(roadmap([apiTask('T01')]), '2026-10-21')} onClose={vi.fn()} onChanged={vi.fn()} />,
    )
    expect(container).toBeEmptyDOMElement()
  })
})
