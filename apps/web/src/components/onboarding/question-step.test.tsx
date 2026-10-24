import { fireEvent, render, screen } from '@testing-library/react'
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

describe('QuestionStep', () => {
  it('step 1: Continue is disabled until an option is chosen; Home instead of Back', () => {
    search = 'step=1'
    render(<QuestionStep />)
    expect(screen.getByText('Step 1 of 5')).toBeInTheDocument()
    expect(screen.getByRole('progressbar', { name: 'Question' })).toHaveAttribute('aria-valuenow', '1')
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

  it('step 2: Back goes to step 1; the step lives in ?step=', () => {
    search = 'step=2'
    useOnboardingStore.setState({ answers: { visaType: 'AEWV' } })
    render(<QuestionStep />)
    expect(screen.getByText('Step 2 of 5')).toBeInTheDocument()
    expect(screen.getByRole('progressbar', { name: 'Question' })).toHaveAttribute('aria-valuenow', '2')
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

  it('step 5: the date question ends with "See my roadmap"', () => {
    search = 'step=5'
    useOnboardingStore.setState({
      answers: { visaType: 'AEWV', city: 'AUCKLAND', familySituation: 'SOLO', occupation: 'TECHNOLOGY' },
    })
    render(<QuestionStep />)
    const see = screen.getByRole('button', { name: 'See my roadmap' })
    expect(see).toBeDisabled()
    fireEvent.change(screen.getByLabelText('Arrival date'), { target: { value: '2027-01-14' } })
    expect(see).toBeEnabled()
  })
})
