import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { Toaster } from '@/components/ui/toaster'
import type { TaskDetailApiResponse } from '@/lib/api'
import { buildRouteView } from '@/lib/route-view'
import { apiTask, priya, roadmap } from '@/test/roadmap-fixtures'

const getTaskDetail = vi.fn()
const lastTaskDetail = vi.fn()
const completeTask = vi.fn()
const reopenTask = vi.fn()
vi.mock('@/lib/api', () => ({
  getTaskDetail: (id: string, token: string) => getTaskDetail(id, token),
  lastTaskDetail: (id: string) => lastTaskDetail(id),
  completeTask: (id: string, token: string) => completeTask(id, token),
  reopenTask: (id: string, token: string) => reopenTask(id, token),
}))
vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({ auth: { getSession: async () => ({ data: { session: { access_token: 'tok' } } }) } }),
}))

const { TaskSheet } = await import('./task-sheet')
const { useGuideStore } = await import('@/lib/stores/guideStore')
const desk = () => within(screen.getByTestId('task-desktop'))

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
  lastTaskDetail.mockReset()
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
    expect(screen.getByRole('article', { name: 'Apply for your IRD number' })).toBeInTheDocument()
    const page = desk()
    expect(page.getByText('Week 1 · 1 hour')).toBeInTheDocument()
    expect(page.getByRole('heading', { level: 1 })).toHaveTextContent('Apply for your IRD number')
    expect(page.getByText('Your employer needs it before your first payday.')).toBeInTheDocument()
    const steps = within(await page.findByRole('region', { name: 'Steps' })).getAllByRole('listitem')
    expect(steps.map(s => s.textContent)).toEqual(['1Have your passport ready.', '2Apply online at ird.govt.nz.'])
    const action = page.getByRole('link', { name: 'Open the IRD application (opens in a new tab)' })
    expect(action).toHaveAttribute('href', 'https://www.ird.govt.nz/managing-my-tax/ird-numbers')
    expect(action).toHaveAttribute('target', '_blank')
    const sources = page.getByRole('complementary')
    const only = within(within(sources).getByRole('region', { name: 'Sources' }))
    expect(only.getByText('checked 3 Mar 2026')).toBeInTheDocument()
    expect(only.getAllByRole('listitem')).toHaveLength(1)
    expect(only.getByRole('link', { name: 'Official page (opens in a new tab)' })).toHaveAttribute('target', '_blank')
    expect(only.getByText('ird.govt.nz')).toBeInTheDocument()
    expect(getTaskDetail).toHaveBeenCalledWith('T08', 'tok')
  })

  it('task bar: back to the roadmap, place in the leg, previous and next task in route order', () => {
    sheet('T08')
    const bar = desk().getByRole('navigation', { name: 'Tasks' })
    expect(within(bar).getByRole('link', { name: 'Roadmap' })).toHaveAttribute('href', '/app/roadmap')
    expect(within(bar).getByText('Week 1 · task 1 of 3')).toBeInTheDocument()
    expect(within(bar).getByRole('link', { name: 'Previous task: Open a bank account' })).toHaveAttribute(
      'href',
      '/app/roadmap?task=T07',
    )
    expect(within(bar).getByRole('link', { name: 'Next task: Give your employer a tax code (IR330)' })).toHaveAttribute(
      'href',
      '/app/roadmap?task=T09',
    )
    expect(within(bar).getByText('Next task')).toBeInTheDocument()
  })

  it('first and last task: no previous, no next', () => {
    const { unmount } = sheet('T01')
    const pn = () => within(desk().getByRole('navigation', { name: 'Tasks' }))
    expect(pn().queryByRole('link', { name: /^Previous task/ })).toBeNull()
    expect(pn().getByRole('link', { name: /^Next task/ })).toBeInTheDocument()
    unmount()
    sheet('T20')
    expect(pn().queryByRole('link', { name: /^Next task/ })).toBeNull()
    expect(pn().getByRole('link', { name: /^Previous task/ })).toBeInTheDocument()
  })

  it("have ready and good to know (mistakes, then watch-outs); none when the KB has none", async () => {
    getTaskDetail.mockResolvedValueOnce(
      detail({ documentsRequired: ['Your passport details'], commonMistakes: ['Applying twice.'], watchOuts: ['Applying is free.'] }),
    )
    const { unmount } = sheet('T08')
    const need = await desk().findByRole('region', { name: 'Have ready' })
    expect(within(need).getAllByRole('listitem').map(i => i.textContent)).toEqual(['Your passport details'])
    const know = desk().getByRole('region', { name: 'Good to know' })
    expect(within(know).getAllByRole('listitem').map(i => i.textContent)).toEqual(['Applying twice.', 'Applying is free.'])
    unmount()

    sheet('T08')
    await desk().findByRole('region', { name: 'Steps' })
    expect(desk().queryByRole('region', { name: 'Have ready' })).toBeNull()
    expect(desk().queryByRole('region', { name: 'Good to know' })).toBeNull()
  })

  it('an empty detail (retired task) renders without a source line or an empty link', async () => {
    getTaskDetail.mockResolvedValue(detail({ steps: [], governmentSourceUrl: '', lastVerified: null }))
    sheet('T08')
    await waitFor(() => expect(getTaskDetail).toHaveBeenCalled())
    expect(desk().queryByRole('link', { name: /opens in a new tab/ })).toBeNull()
    expect(desk().queryByRole('region', { name: 'Sources' })).toBeNull()
  })

  it('a phone number in a step is a tel link and keeps its citation number', async () => {
    const src = { itemId: 'T08.steps.0', title: 'Plunket', url: 'https://www.plunket.org.nz/contact', checked: '2026-10-25' }
    getTaskDetail.mockResolvedValueOnce(
      detail({ steps: ['Call 0800 184 803'], sources: { steps: [src] } }),
    )
    sheet('T08')
    const tel = await desk().findByRole('link', { name: '0800 184 803' })
    expect(tel).toHaveAttribute('href', 'tel:0800184803')
    const item = tel.closest('li')!
    expect(within(item).getByRole('link', { name: /^Source: Plunket/ })).toHaveTextContent('1')
  })

  it('Sources sit in the side column, after the status; no Ask box there', async () => {
    sheet('T08')
    await desk().findByRole('region', { name: 'Sources' })
    const side = desk().getByRole('complementary')
    expect(within(side).getByRole('region', { name: 'Sources' })).toBeInTheDocument()
    const heads = within(side).getAllByRole('heading', { level: 2 }).map(h => h.textContent)
    expect(heads).toEqual(['Not started', 'Sources'])
    expect(within(side).queryByRole('textbox')).toBeNull()
  })

  it('a step with inline items: lead line and a nested list, no markdown markers', async () => {
    getTaskDetail.mockResolvedValueOnce(detail({ steps: ['You will need: - **Your passport** - Your visa details'] }))
    sheet('T08')
    const step = await desk().findByText('You will need:')
    const items = within(step.closest('li')!).getAllByRole('listitem')
    expect(items.map(i => i.textContent)).toEqual(['Your passport', 'Your visa details'])
  })

  it('no checked date when lastVerified is null', async () => {
    getTaskDetail.mockResolvedValueOnce(detail({ lastVerified: null }))
    sheet('T08')
    const card = within(await desk().findByRole('region', { name: 'Sources' }))
    expect(card.getByText('Links open in a new tab')).toBeInTheDocument()
    expect(card.getByText('ird.govt.nz')).toBeInTheDocument()
  })

  it('Mark as done: stamp and toast; Undo reopens, stamp gone, route refetched', async () => {
    const { onChanged } = sheet('T08')
    fireEvent.click(desk().getByRole('button', { name: 'Mark as done' }))
    expect(await desk().findByRole('img', { name: 'Done 24 Oct' })).toBeInTheDocument()
    expect(completeTask).toHaveBeenCalledWith('T08', 'tok')
    expect(desk().queryByRole('button', { name: 'Mark as done' })).toBeNull()
    expect(desk().getByRole('button', { name: 'Mark as not done' })).toBeInTheDocument()
    expect(await screen.findByText('Marked as done')).toBeInTheDocument()
    expect(onChanged).toHaveBeenCalledTimes(1)

    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
    await waitFor(() => expect(reopenTask).toHaveBeenCalledWith('T08', 'tok'))
    await waitFor(() => expect(desk().queryByRole('img', { name: /^Done/ })).toBeNull())
    expect(desk().getByRole('button', { name: 'Mark as done' })).toBeInTheDocument()
    expect(onChanged).toHaveBeenCalledTimes(2)
  })

  it('a done task: stamp with its day, quiet Mark as not done, no primary, no action link', async () => {
    const { onChanged } = sheet('T07')
    expect(desk().getByRole('img', { name: 'Done 22 Oct' })).toBeInTheDocument()
    expect(desk().queryByRole('button', { name: 'Mark as done' })).toBeNull()
    expect(document.querySelectorAll('button.bg-surface-inverse')).toHaveLength(0)
    expect(desk().queryByRole('link', { name: /opens in a new tab/ })).toBeNull()
    fireEvent.click(desk().getByRole('button', { name: 'Mark as not done' }))
    await waitFor(() => expect(reopenTask).toHaveBeenCalledWith('T07', 'tok'))
    await waitFor(() => expect(desk().queryByRole('img', { name: /^Done/ })).toBeNull())
    expect(onChanged).toHaveBeenCalledTimes(1)
  })

  it('a blocked task: no Mark button; the meta says what it needs and links to it', () => {
    sheet('T09')
    expect(desk().getByText(/Waits on your IRD number/)).toBeInTheDocument()
    expect(desk().queryByRole('button', { name: /^Mark as/ })).toBeNull()
    const first = desk().getByText(/^Do this first:/)
    expect(within(first).getByRole('link', { name: 'Apply for your IRD number' })).toHaveAttribute('href', '/app/roadmap?task=T08')
  })

  it('a failed save says so and leaves the task as it was', async () => {
    completeTask.mockRejectedValueOnce(new Error('down'))
    const { onChanged } = sheet('T08')
    fireEvent.click(desk().getByRole('button', { name: 'Mark as done' }))
    expect(await desk().findByText("Couldn't mark it as done. Check your connection, then try again.")).toBeInTheDocument()
    expect(desk().queryByRole('img', { name: /^Done/ })).toBeNull()
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
      const why = desk().getByText(/^Your employer needs it/)
      const ref = await within(why).findByRole('link', { name: 'Source: Tax codes for individuals, checked 24 October 2026' })
      expect(ref).toHaveTextContent('1')
      expect(ref).toHaveAttribute('href', CODES.url)
      expect(ref).toHaveAttribute('target', '_blank')
      expect(ref).toHaveAttribute('rel', 'noopener noreferrer')

      const step = (t: string) => desk().getByText(t, { exact: false }).closest('li')!
      const refs = await waitFor(() => threeSteps.map(t => within(step(t)).getByRole('link')))
      expect(refs.map(r => r.textContent)).toEqual(['2', '2', '1'])
      expect(refs[0]).toHaveAccessibleName(`Source: ${NEW.title}, checked 25 October 2026`)
      expect(refs[0]).toHaveAttribute('href', NEW.url)
      expect(refs[0]).toHaveAttribute('rel', 'noopener noreferrer')

      const list = desk().getByRole('region', { name: 'Sources' })
      expect(within(list).getByText('checked 25 Oct 2026')).toBeInTheDocument()
      const items = within(list).getAllByRole('listitem')
      expect(items.map(i => i.textContent)).toEqual([
        '1Tax codes for individuals (opens in a new tab)ird.govt.nz',
        `2${NEW.title} (opens in a new tab)ird.govt.nz`,
      ])
      const title = within(items[0]).getByRole('link')
      expect(title).toHaveAttribute('href', CODES.url)
      expect(title).toHaveAttribute('target', '_blank')
      expect(title).toHaveAttribute('rel', 'noopener noreferrer')
      expect(desk().queryByText(/^Source:/)).toBeNull()
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
      const num = (t: string) => within(desk().getByText(t, { exact: false }).closest('li')!).getByRole('link').textContent
      await waitFor(() => expect(num('Your passport details')).toBe('2'))
      expect(num('Apply as a new arrival.')).toBe('3')
      expect(num('Applying is free.')).toBe('1')
      expect(within(desk().getByRole('region', { name: 'Sources' })).getAllByRole('listitem')).toHaveLength(3)
    })

    it('fewer sources than steps and no why source: every step renders, unmatched lines have no number', async () => {
      getTaskDetail.mockResolvedValueOnce(detail({ steps: threeSteps, sources: { steps: [WORK] } }))
      sheet('T08')
      const step = (t: string) => desk().getByText(t, { exact: false }).closest('li')!
      await waitFor(() => expect(within(step(threeSteps[0])).getByRole('link')).toHaveTextContent('1'))
      expect(within(step(threeSteps[1])).queryByRole('link')).toBeNull()
      expect(within(step(threeSteps[2])).queryByRole('link')).toBeNull()
      expect(within(desk().getByText(/^Your employer needs it/)).queryByRole('link')).toBeNull()
      expect(within(desk().getByRole('region', { name: 'Sources' })).getAllByRole('listitem')).toHaveLength(1)
    })

    it('no cited sources: no numbers; the official page is the one source', async () => {
      sheet('T08')
      const card = within(await desk().findByRole('region', { name: 'Sources' }))
      expect(card.getAllByRole('listitem')).toHaveLength(1)
      expect(card.getByRole('link', { name: 'Official page (opens in a new tab)' })).toHaveAttribute('target', '_blank')
      expect(desk().queryByRole('link', { name: /^Source:/ })).toBeNull()
    })
  })
})

describe('TaskSheet, Task details C', () => {
  const src = (n: number) => ({
    itemId: `T08.steps.${n}`,
    title: `Source ${n}`,
    url: `https://www.ird.govt.nz/page-${n}`,
    checked: '2026-10-25',
  })
  const manySteps = (n: number) => ({
    steps: Array.from({ length: n }, (_, i) => `Step number ${i}.`),
    sources: { steps: Array.from({ length: n }, (_, i) => src(i)) },
  })
  const withBestBy = (bestBy: string | null) => {
    const r = withWhy()
    r.phases.flatMap(p => p.tasks).find(t => t.taskId === 'T08')!.bestBy = bestBy
    return buildRouteView(r, '2026-10-21', new Date('2026-10-23T10:00:00+13:00'))
  }
  const rendered = (bestBy: string | null) =>
    render(<TaskSheet taskId="T08" route={withBestBy(bestBy)} onChanged={vi.fn()} />)
  const phone = () => within(screen.getByTestId('task-phone'))

  it('status card: best done by, and the undo line', () => {
    rendered('2026-11-15')
    const status = desk().getByRole('region', { name: 'Not started' })
    expect(within(status).getByText('Best done by Sun 15 Nov')).toBeInTheDocument()
    expect(within(status).getByText('You can undo this.')).toBeInTheDocument()
  })

  it('no bestBy: no "Best done by"', () => {
    rendered(null)
    expect(screen.queryByText(/Best done by/)).toBeNull()
  })

  it('Have ready follows Steps; only one Previous/Next pair, no bottom nav', async () => {
    getTaskDetail.mockResolvedValueOnce(detail({ documentsRequired: ['Your passport details'] }))
    rendered(null)
    const steps = await desk().findByRole('region', { name: 'Steps' })
    const ready = desk().getByRole('region', { name: 'Have ready' })
    expect(steps.compareDocumentPosition(ready) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByText("What you'll need")).toBeNull()
    expect(screen.queryByRole('navigation', { name: 'Previous and next task' })).toBeNull()
    expect(screen.getAllByRole('link', { name: /^Next task/ })).toHaveLength(1)
  })

  it('Sources: checked date, five shown, the rest behind "4 more sources"', async () => {
    getTaskDetail.mockResolvedValue(detail(manySteps(9)))
    rendered(null)
    const card = within(await desk().findByRole('region', { name: 'Sources' }))
    expect(card.getByText('checked 25 Oct 2026')).toBeInTheDocument()
    expect(card.getAllByRole('listitem')).toHaveLength(5)
    const more = card.getByRole('button', { name: '4 more sources' })
    expect(more).toHaveAttribute('aria-expanded', 'false')
    fireEvent.click(more)
    expect(more).toHaveAttribute('aria-expanded', 'true')
    expect(card.getAllByRole('listitem')).toHaveLength(9)
  })

  it('five sources or fewer: no more button', async () => {
    getTaskDetail.mockResolvedValue(detail(manySteps(5)))
    rendered(null)
    const card = within(await desk().findByRole('region', { name: 'Sources' }))
    expect(card.getAllByRole('listitem')).toHaveLength(5)
    expect(card.queryByRole('button', { name: /more sources/ })).toBeNull()
  })

  it('phone: tabs Steps, Good to know, Sources 9; Have ready in Steps; meta ends with best done by', async () => {
    getTaskDetail.mockResolvedValue(detail({ ...manySteps(9), documentsRequired: ['Your passport details'], watchOuts: ['Applying is free.'] }))
    rendered('2026-11-15')
    expect(phone().getByText(/· best done by Sun 15 Nov$/)).toBeInTheDocument()
    const panel = await phone().findByRole('tabpanel')
    await within(panel).findByText('Step number 0.', { exact: false })
    const tabs = phone().getAllByRole('tab')
    expect(tabs.map(t => t.textContent)).toEqual(['Steps', 'Good to know', 'Sources 9'])
    expect(within(panel).getByText('Have ready')).toBeInTheDocument()
    expect(within(panel).getByText('Step number 0.', { exact: false })).toBeInTheDocument()
    fireEvent.click(tabs[1])
    expect(await phone().findByText('Applying is free.')).toBeInTheDocument()
  })

  it('phone action bar: Mark as done and Ask', () => {
    rendered(null)
    const bar = phone().getByRole('group', { name: 'Task actions' })
    expect(within(bar).getByRole('button', { name: 'Mark as done' })).toBeInTheDocument()
    expect(within(bar).getByRole('button', { name: 'Ask' })).toBeInTheDocument()
  })

  it('phone Steps panel: its heading is screen-reader only; the desktop one is visible', async () => {
    rendered(null)
    const h = await phone().findByRole('heading', { level: 2, name: 'Steps' })
    expect(h.className).toContain('sr-only')
    expect(desk().getByRole('heading', { level: 2, name: 'Steps' }).className).not.toContain('sr-only')
  })

  it('no sources: no Sources tab on phone', () => {
    getTaskDetail.mockResolvedValue(detail({ governmentSourceUrl: '', steps: [] }))
    rendered(null)
    expect(phone().getAllByRole('tab').map(t => t.textContent)).toEqual(['Steps', 'Good to know'])
  })

  it('phone Ask opens the guide on this task', () => {
    const openPane = vi.fn()
    useGuideStore.setState({ openPane })
    rendered(null)
    fireEvent.click(within(phone().getByRole('group', { name: 'Task actions' })).getByRole('button', { name: 'Ask' }))
    expect(openPane).toHaveBeenCalledWith({ kind: 'task', taskKey: 'T08' })
    expect(phone().queryByRole('textbox')).toBeNull()
  })
})

describe('TaskSheet opened again', () => {
  it('the steps fetched last draw at once', () => {
    lastTaskDetail.mockImplementation((id: string) => detail({ taskId: id, steps: ['Remembered step'] }))
    getTaskDetail.mockReturnValue(new Promise(() => {}))
    sheet('T08')
    expect(desk().getByText('Remembered step')).toBeInTheDocument()
  })
})
