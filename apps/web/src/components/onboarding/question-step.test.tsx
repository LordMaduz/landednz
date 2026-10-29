import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useOnboardingStore } from '@/lib/stores/onboardingStore'

let search = ''
const router = { push: vi.fn(), replace: vi.fn() }
vi.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams(search),
  useRouter: () => router,
}))

const { QuestionStep } = await import('./question-step')

beforeEach(() => {
  vi.clearAllMocks()
  useOnboardingStore.setState({ answers: {} })
})

const ALL = { visaType: 'AEWV', city: 'AUCKLAND', familySituation: 'SOLO', occupation: 'OTHER_PROFESSIONAL' } as const

describe('QuestionStep', () => {
  it('step 1: rail of 5, Question 1 of 5, Continue disabled until chosen; Home instead of Back', () => {
    search = 'step=1'
    const { container } = render(<QuestionStep />)
    expect(screen.getByText('Question 1 of 5')).toBeInTheDocument()
    expect(screen.queryByText(/Step \d of 5/)).toBeNull()
    expect(container.querySelector('input[type=date]')).toBeNull()
    const rail = screen.getByRole('list', { name: 'Your answers' })
    expect(within(rail).getAllByRole('listitem')).toHaveLength(5)
    expect(within(rail).getByText('Answering now').closest('li')).toHaveAttribute('aria-current', 'step')
    expect(screen.getByText('You can change any answer later in Settings.')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1, name: 'What visa are you coming on?' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Back' })).toBeNull()
    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/')

    const next = screen.getByRole('button', { name: 'Continue' })
    expect(next).toBeDisabled()
    fireEvent.click(screen.getByRole('radio', { name: 'Accredited Employer Work Visa (AEWV)' }))
    expect(next).toBeEnabled()
    fireEvent.click(next)
    expect(router.push).toHaveBeenCalledWith('/onboarding?step=2')
  })

  it('step 2: answered questions show the answer and Change; the current one is marked', () => {
    search = 'step=2'
    useOnboardingStore.setState({ answers: { visaType: 'AEWV' } })
    render(<QuestionStep />)
    expect(screen.getByText('Question 2 of 5')).toBeInTheDocument()
    const rail = screen.getByRole('list', { name: 'Your answers' })
    const items = within(rail).getAllByRole('listitem')
    expect(items[0]).toHaveTextContent('Accredited Employer Work Visa (AEWV)')
    expect(within(items[0]).getAllByRole('link', { name: /Change/ })[0]).toHaveAttribute('href', '/onboarding?step=1')
    expect(items[1]).toHaveAttribute('aria-current', 'step')
    expect(items[1]).toHaveTextContent('Answering now')
    expect(items[2]).not.toHaveAttribute('aria-current')
    expect(within(items[2]).queryByRole('link')).toBeNull()
    expect(screen.getByRole('heading', { level: 1, name: 'Where will you live?' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Back' }))
    expect(router.push).toHaveBeenCalledWith('/onboarding?step=1')
  })

  it('a step whose earlier answers are missing goes back to the first unanswered one', () => {
    search = 'step=4'
    useOnboardingStore.setState({ answers: { visaType: 'AEWV' } })
    render(<QuestionStep />)
    expect(router.replace).toHaveBeenCalledWith('/onboarding?step=2')
  })

  it('step 5: a calendar, not a date input, and "See my roadmap"', () => {
    search = 'step=5'
    useOnboardingStore.setState({ answers: { ...ALL } })
    const { container } = render(<QuestionStep />)
    expect(container.querySelector('input[type=date]')).toBeNull()
    expect(screen.getByText('Already here? Pick the day you arrived.')).toBeInTheDocument()
    const see = screen.getByRole('button', { name: 'See my roadmap' })
    expect(see).toBeDisabled()
    fireEvent.click(screen.getAllByRole('gridcell')[10])
    expect(see).toBeEnabled()
    expect(useOnboardingStore.getState().answers.arrivalDate).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it('step 5: posts the answers, then goes to the preview; on failure the error shows', async () => {
    search = 'step=5'
    useOnboardingStore.setState({ answers: { ...ALL, arrivalDate: '2027-01-14' } })
    const fetchMock = vi.fn().mockResolvedValueOnce({ ok: false }).mockResolvedValueOnce({ ok: true })
    vi.stubGlobal('fetch', fetchMock)
    render(<QuestionStep />)
    fireEvent.click(screen.getByRole('button', { name: 'See my roadmap' }))
    expect(await screen.findByRole('alert')).toHaveTextContent("Couldn't build your roadmap")
    fireEvent.click(screen.getByRole('button', { name: 'See my roadmap' }))
    await waitFor(() => expect(router.push).toHaveBeenCalledWith('/onboarding/preview'))
    expect(fetchMock.mock.calls[0][0]).toBe('/api/onboarding-answers')
    vi.unstubAllGlobals()
  })
})
