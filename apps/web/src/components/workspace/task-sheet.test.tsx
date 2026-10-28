import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { Toaster } from '@/components/ui/toaster'
import type { TaskDetailApiResponse } from '@/lib/api'
import { buildRouteView } from '@/lib/route-view'
import { apiTask, priya, roadmap } from '@/test/roadmap-fixtures'

const getTaskDetail = vi.fn()
const completeTask = vi.fn()
const reopenTask = vi.fn()
vi.mock('@/lib/api', () => ({
  getTaskDetail: (id: string, token: string) => getTaskDetail(id, token),
  completeTask: (id: string, token: string) => completeTask(id, token),
  reopenTask: (id: string, token: string) => reopenTask(id, token),
}))
vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({ auth: { getSession: async () => ({ data: { session: { access_token: 'tok' } } }) } }),
}))

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
const route = () => buildRouteView(withWhy(), '2026-10-21', new Date('2026-10-23T10:00:00+13:00'))

function sheet(taskId: string, props: Partial<{ onChanged(): void }> = {}) {
  const onChanged = props.onChanged ?? vi.fn()
  const r = render(
    <>
      <TaskSheet taskId={taskId} route={route()} onChanged={onChanged} />
      <Toaster />
    </>,
  )
  return { ...r, onChanged }
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
  it('a page: duration, title, consequence, steps, action link and source line', async () => {
    sheet('T08')
    const page = screen.getByRole('article', { name: 'Apply for your IRD number' })
    expect(within(page).getByText('1 hour')).toBeInTheDocument()
    expect(within(page).getByRole('heading', { level: 1 })).toHaveTextContent('Apply for your IRD number')
    expect(within(page).getByText('Your employer needs it before your first payday.')).toBeInTheDocument()
    const steps = within(await within(page).findByRole('region', { name: 'Steps' })).getAllByRole('listitem')
    expect(steps.map(s => s.textContent)).toEqual(['Have your passport ready.', 'Apply online at ird.govt.nz.'])
    const action = within(page).getByRole('link', { name: 'Open the IRD application (opens in a new tab)' })
    expect(action).toHaveAttribute('href', 'https://www.ird.govt.nz/managing-my-tax/ird-numbers')
    expect(action).toHaveAttribute('target', '_blank')
    const sources = within(page).getByRole('complementary')
    const only = within(within(sources).getByRole('region', { name: 'Sources' }))
    expect(only.getByText('All checked 3 Mar 2026 · open in a new tab')).toBeInTheDocument()
    expect(only.getAllByRole('listitem')).toHaveLength(1)
    expect(only.getByRole('link', { name: 'Official page (opens in a new tab)' })).toHaveAttribute('target', '_blank')
    expect(only.getByText('ird.govt.nz')).toBeInTheDocument()
    expect(getTaskDetail).toHaveBeenCalledWith('T08', 'tok')
  })

  it('task bar: back to the roadmap, place in the leg, previous and next task in route order', () => {
    sheet('T08')
    const bar = screen.getByRole('navigation', { name: 'Tasks' })
    expect(within(bar).getByRole('link', { name: 'Roadmap' })).toHaveAttribute('href', '/app/roadmap')
    expect(within(bar).getByText('Week 1, task 1 of 3')).toBeInTheDocument()
    expect(within(bar).getByRole('link', { name: 'Previous task: Open a bank account' })).toHaveAttribute(
      'href',
      '/app/roadmap?task=T07',
    )
    expect(within(bar).getByRole('link', { name: 'Next task: Give your employer a tax code (IR330)' })).toHaveAttribute(
      'href',
      '/app/roadmap?task=T09',
    )
  })

  it('bottom navigation: cards for the neighbouring tasks, visible Previous and Next in the bar', () => {
    sheet('T08')
    const bar = within(screen.getByRole('navigation', { name: 'Tasks' }))
    expect(bar.getByRole('link', { name: 'Previous task: Open a bank account' })).toHaveTextContent('Previous')
    expect(bar.getByRole('link', { name: 'Next task: Give your employer a tax code (IR330)' })).toHaveTextContent('Next')
    const pn = within(screen.getByRole('navigation', { name: 'Previous and next task' }))
    expect(pn.getByRole('link', { name: 'Previous task Open a bank account' })).toHaveAttribute('href', '/app/roadmap?task=T07')
    expect(pn.getByRole('link', { name: 'Next task Give your employer a tax code (IR330)' })).toHaveAttribute(
      'href',
      '/app/roadmap?task=T09',
    )
  })

  it('first and last task: no previous, no next', () => {
    const { unmount } = sheet('T01')
    const pn = () => within(screen.getByRole('navigation', { name: 'Previous and next task' }))
    expect(pn().queryByRole('link', { name: /^Previous task/ })).toBeNull()
    expect(pn().getByRole('link', { name: /^Next task/ })).toBeInTheDocument()
    expect(within(screen.getByRole('navigation', { name: 'Tasks' })).queryByRole('link', { name: /^Previous task/ })).toBeNull()
    unmount()
    sheet('T20')
    expect(pn().queryByRole('link', { name: /^Next task/ })).toBeNull()
    expect(pn().getByRole('link', { name: /^Previous task/ })).toBeInTheDocument()
  })

  it("what you'll need and good to know (mistakes, then watch-outs); none when the KB has none", async () => {
    getTaskDetail.mockResolvedValueOnce(
      detail({ documentsRequired: ['Your passport details'], commonMistakes: ['Applying twice.'], watchOuts: ['Applying is free.'] }),
    )
    const { unmount } = sheet('T08')
    const need = await screen.findByRole('region', { name: "What you'll need" })
    expect(within(need).getAllByRole('listitem').map(i => i.textContent)).toEqual(['Your passport details'])
    const know = screen.getByRole('region', { name: 'Good to know' })
    expect(within(know).getAllByRole('listitem').map(i => i.textContent)).toEqual(['Applying twice.', 'Applying is free.'])
    unmount()

    sheet('T08')
    await screen.findByRole('region', { name: 'Steps' })
    expect(screen.queryByRole('region', { name: "What you'll need" })).toBeNull()
    expect(screen.queryByRole('region', { name: 'Good to know' })).toBeNull()
  })

  it('an empty detail (retired task) renders without a source line or an empty link', async () => {
    getTaskDetail.mockResolvedValue(detail({ steps: [], governmentSourceUrl: '', lastVerified: null }))
    sheet('T08')
    await waitFor(() => expect(getTaskDetail).toHaveBeenCalled())
    expect(screen.queryByRole('link', { name: /opens in a new tab/ })).toBeNull()
    expect(screen.queryByRole('region', { name: 'Sources' })).toBeNull()
  })

  it('a phone number in a step is a tel link and keeps its citation number', async () => {
    const src = { itemId: 'T08.steps.0', title: 'Plunket', url: 'https://www.plunket.org.nz/contact', checked: '2026-10-25' }
    getTaskDetail.mockResolvedValueOnce(
      detail({ steps: ['Call 0800 184 803'], sources: { steps: [src] } }),
    )
    sheet('T08')
    const tel = await screen.findByRole('link', { name: '0800 184 803' })
    expect(tel).toHaveAttribute('href', 'tel:0800184803')
    const item = tel.closest('li')!
    expect(within(item).getByRole('link', { name: /^Source: Plunket/ })).toHaveTextContent('1')
  })

  it('Sources sit in the side column, after Ask', async () => {
    sheet('T08')
    await screen.findByRole('region', { name: 'Sources' })
    const side = screen.getByRole('complementary')
    expect(within(side).getByRole('region', { name: 'Sources' })).toBeInTheDocument()
    const heads = within(side).getAllByRole('heading', { level: 2 }).map(h => h.textContent)
    expect([heads[0], heads[1]?.startsWith('Ask about'), heads[2]]).toEqual(['Not started', true, 'Sources'])
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
    const card = within(await screen.findByRole('region', { name: 'Sources' }))
    expect(card.getByText('Links open in a new tab')).toBeInTheDocument()
    expect(card.getByText('ird.govt.nz')).toBeInTheDocument()
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

  it('a blocked task: no Mark button; the meta says what it needs and links to it', () => {
    sheet('T09')
    expect(screen.getByText('Waits on your IRD number')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /^Mark as/ })).toBeNull()
    const first = screen.getByText(/^Do this first:/)
    expect(within(first).getByRole('link', { name: 'Apply for your IRD number' })).toHaveAttribute('href', '/app/roadmap?task=T08')
  })

  it('a failed save says so and leaves the task as it was', async () => {
    completeTask.mockRejectedValueOnce(new Error('down'))
    const { onChanged } = sheet('T08')
    fireEvent.click(screen.getByRole('button', { name: 'Mark as done' }))
    expect(await screen.findByText("Couldn't mark it as done. Check your connection, then try again.")).toBeInTheDocument()
    expect(screen.queryByRole('img', { name: /^Done/ })).toBeNull()
    expect(onChanged).not.toHaveBeenCalled()
  })

  it('unknown task id: nothing rendered', () => {
    const { container } = render(
      <TaskSheet taskId="T99" route={buildRouteView(roadmap([apiTask('T01')]), '2026-10-21', new Date('2026-10-23T10:00:00+13:00'))} onChanged={vi.fn()} />,
    )
    expect(container).toBeEmptyDOMElement()
  })

  describe('per-line sources', () => {
    const NEW = {
      itemId: 'T08.steps.0',
      title: 'New arrival to New Zealand: IRD number application',
      url: 'https://www.ird.govt.nz/managing-my-tax/ird-numbers/ird-numbers-for-individuals/new-arrival-to-new-zealand---ird-number-application',
      checked: '2026-10-25',
    }
    const CODES = {
      itemId: 'T08.why.0',
      title: 'Tax codes for individuals',
      url: 'https://www.ird.govt.nz/income-tax/income-tax-for-individuals/tax-codes-and-tax-rates-for-individuals/tax-codes-for-individuals',
      checked: '2026-10-24',
    }
    const WORK = {
      itemId: 'T08.steps.2',
      title: 'Work or study in New Zealand',
      url: 'https://www.ird.govt.nz/situations/work-or-study-in-new-zealand',
      checked: '2026-10-25',
    }
    const threeSteps = ['Register for myIR.', 'Apply as a new arrival.', 'Give the IR330 to your employer.']

    it('numbers each line by its source, first appearance wins; one list of sources replaces the source line', async () => {
      getTaskDetail.mockResolvedValueOnce(
        detail({ steps: threeSteps, sources: { why: [CODES], steps: [NEW, NEW, CODES] } }),
      )
      sheet('T08')
      const why = screen.getByText(/^Your employer needs it/)
      const ref = await within(why).findByRole('link', { name: 'Source: Tax codes for individuals, checked 24 October 2026' })
      expect(ref).toHaveTextContent('1')
      expect(ref).toHaveAttribute('href', CODES.url)
      expect(ref).toHaveAttribute('target', '_blank')
      expect(ref).toHaveAttribute('rel', 'noopener noreferrer')

      const step = (t: string) => screen.getByText(t, { exact: false }).closest('li')!
      const refs = await waitFor(() => threeSteps.map(t => within(step(t)).getByRole('link')))
      expect(refs.map(r => r.textContent)).toEqual(['2', '2', '1'])
      expect(refs[0]).toHaveAccessibleName(`Source: ${NEW.title}, checked 25 October 2026`)
      expect(refs[0]).toHaveAttribute('href', NEW.url)
      expect(refs[0]).toHaveAttribute('rel', 'noopener noreferrer')

      const list = screen.getByRole('region', { name: 'Sources' })
      expect(within(list).getByText('All checked 25 Oct 2026 · open in a new tab')).toBeInTheDocument()
      const items = within(list).getAllByRole('listitem')
      expect(items.map(i => i.textContent)).toEqual([
        'Tax codes for individuals (opens in a new tab)ird.govt.nz',
        `${NEW.title} (opens in a new tab)ird.govt.nz`,
      ])
      const title = within(items[0]).getByRole('link')
      expect(title).toHaveAttribute('href', CODES.url)
      expect(title).toHaveAttribute('target', '_blank')
      expect(title).toHaveAttribute('rel', 'noopener noreferrer')
      expect(screen.queryByText(/^Source:/)).toBeNull()
      expect(within(list).queryByText(WORK.title)).toBeNull()
    })

    it('numbers run down the page: why, what you need, steps, good to know', async () => {
      getTaskDetail.mockResolvedValueOnce(
        detail({
          steps: ['Apply as a new arrival.'],
          documentsRequired: ['Your passport details'],
          watchOuts: ['Applying is free.'],
          sources: { why: [CODES], documents: [WORK], steps: [NEW], watchOuts: [CODES] },
        }),
      )
      sheet('T08')
      const num = (t: string) => within(screen.getByText(t, { exact: false }).closest('li')!).getByRole('link').textContent
      await waitFor(() => expect(num('Your passport details')).toBe('2'))
      expect(num('Apply as a new arrival.')).toBe('3')
      expect(num('Applying is free.')).toBe('1')
      expect(within(screen.getByRole('region', { name: 'Sources' })).getAllByRole('listitem')).toHaveLength(3)
    })

    it('fewer sources than steps and no why source: every step renders, unmatched lines have no number', async () => {
      getTaskDetail.mockResolvedValueOnce(detail({ steps: threeSteps, sources: { steps: [WORK] } }))
      sheet('T08')
      const step = (t: string) => screen.getByText(t, { exact: false }).closest('li')!
      await waitFor(() => expect(within(step(threeSteps[0])).getByRole('link')).toHaveTextContent('1'))
      expect(within(step(threeSteps[1])).queryByRole('link')).toBeNull()
      expect(within(step(threeSteps[2])).queryByRole('link')).toBeNull()
      expect(within(screen.getByText(/^Your employer needs it/)).queryByRole('link')).toBeNull()
      expect(within(screen.getByRole('region', { name: 'Sources' })).getAllByRole('listitem')).toHaveLength(1)
    })

    it('no cited sources: no numbers; the official page is the one source', async () => {
      sheet('T08')
      const card = within(await screen.findByRole('region', { name: 'Sources' }))
      expect(card.getAllByRole('listitem')).toHaveLength(1)
      expect(card.getByRole('link', { name: 'Official page (opens in a new tab)' })).toHaveAttribute('target', '_blank')
      expect(screen.queryByRole('link', { name: /^Source:/ })).toBeNull()
    })
  })
})
