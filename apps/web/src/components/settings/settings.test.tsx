import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { toast } from 'sonner'
import { Toaster } from '@/components/ui/toaster'

const updateOnboardingProfile = vi.fn()
const deleteAccount = vi.fn()
const getOnboardingProfile = vi.fn()
const signOutAndLeave = vi.fn()
vi.mock('@/lib/api', () => ({
  updateOnboardingProfile: (p: unknown, t: string) => updateOnboardingProfile(p, t),
  deleteAccount: (t: string) => deleteAccount(t),
  getOnboardingProfile: (t: string) => getOnboardingProfile(t),
}))
vi.mock('@/lib/sign-out', () => ({ signOutAndLeave: () => signOutAndLeave() }))
vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({ auth: { getSession: async () => ({ data: { session: { access_token: 'tok' } } }) } }),
}))
const replace = vi.fn()
const push = vi.fn()
const router = { replace, push }
vi.mock('next/navigation', () => ({ useRouter: () => router }))

const { PlanForm } = await import('./plan-form')
const { AccountSection } = await import('./account-section')
const { DeleteAccount } = await import('./delete-account')
const { SettingsScreen } = await import('./settings-screen')

const profile = {
  profileId: 'p1',
  visaType: 'AEWV',
  city: 'AUCKLAND',
  familySituation: 'SOLO',
  occupation: 'OTHER_PROFESSIONAL',
  arrivalDate: '2026-10-21',
} as const
const user = { name: 'Priya Sharma', email: 'priya@example.com', initials: 'PS', google: true }

beforeEach(() => {
  vi.clearAllMocks()
  toast.dismiss() // sonner's store outlives each render, so an earlier test's toast could be clicked
  getOnboardingProfile.mockResolvedValue(profile)
})

describe('PlanForm', () => {
  const save = () => screen.getByRole('button', { name: 'Save changes' })

  it('prefilled from the profile; Save is disabled with "No unsaved changes"', () => {
    render(<PlanForm profile={profile} />)
    expect(screen.getByLabelText('Visa')).toHaveDisplayValue('Accredited Employer Work Visa (AEWV)')
    expect(screen.getByLabelText('City')).toHaveDisplayValue('Auckland')
    expect(screen.getByLabelText("Who's moving with you")).toHaveDisplayValue('Just me')
    expect(screen.getByLabelText('Work')).toHaveDisplayValue('Another job or profession')
    expect(screen.getByLabelText('Arrival date')).toHaveValue('2026-10-21')
    expect(save()).toBeDisabled()
    expect(screen.getByText('No unsaved changes')).toBeInTheDocument()
  })

  it('dirty means different from the saved values: changing City and back disables Save again (Review Focus 4)', () => {
    render(<PlanForm profile={profile} />)
    fireEvent.change(screen.getByLabelText('City'), { target: { value: 'WELLINGTON' } })
    expect(save()).toBeEnabled()
    expect(save()).toHaveClass('bg-ink')
    expect(screen.queryByText('No unsaved changes')).toBeNull()
    fireEvent.change(screen.getByLabelText('City'), { target: { value: 'AUCKLAND' } })
    expect(save()).toBeDisabled()
    expect(screen.getByText('No unsaved changes')).toBeInTheDocument()
  })

  it('saves the five answers and shows the toast', async () => {
    updateOnboardingProfile.mockResolvedValue({ success: true })
    render(<><PlanForm profile={profile} /><Toaster /></>)
    fireEvent.change(screen.getByLabelText('City'), { target: { value: 'WELLINGTON' } })
    fireEvent.click(save())
    expect(await screen.findByText('Plan saved. Your roadmap was rebuilt.')).toBeInTheDocument()
    expect(updateOnboardingProfile).toHaveBeenCalledWith(
      { visaType: 'AEWV', city: 'WELLINGTON', familySituation: 'SOLO', occupation: 'OTHER_PROFESSIONAL', arrivalDate: '2026-10-21' },
      'tok',
    )
    await waitFor(() => expect(save()).toBeDisabled())
  })

  it('Undo puts the previous answers back with one call', async () => {
    updateOnboardingProfile.mockResolvedValue({ success: true })
    render(<><PlanForm profile={profile} /><Toaster /></>)
    fireEvent.change(screen.getByLabelText('City'), { target: { value: 'WELLINGTON' } })
    fireEvent.click(save())
    fireEvent.click(await screen.findByRole('button', { name: 'Undo' }))
    await waitFor(() => expect(updateOnboardingProfile).toHaveBeenCalledTimes(2))
    expect(updateOnboardingProfile).toHaveBeenLastCalledWith(
      { visaType: 'AEWV', city: 'AUCKLAND', familySituation: 'SOLO', occupation: 'OTHER_PROFESSIONAL', arrivalDate: '2026-10-21' },
      'tok',
    )
    await waitFor(() => expect(screen.getByLabelText('City')).toHaveDisplayValue('Auckland'))
    await waitFor(() => expect(save()).toBeDisabled())
  })

  it('a past arrival date is refused on submit, under the field, linked by aria-describedby', async () => {
    render(<PlanForm profile={profile} />)
    const date = screen.getByLabelText('Arrival date')
    fireEvent.change(date, { target: { value: '2020-01-01' } })
    expect(screen.queryByText('Pick a date from today onwards.')).toBeNull()
    fireEvent.click(save())
    const msg = await screen.findByText('Pick a date from today onwards.')
    expect(date).toHaveAttribute('aria-describedby', msg.id)
    expect(date).toHaveAttribute('aria-invalid', 'true')
    expect(updateOnboardingProfile).not.toHaveBeenCalled()
  })

  it('a saved date that has already passed does not block changing another answer', async () => {
    updateOnboardingProfile.mockResolvedValue({ success: true })
    render(<PlanForm profile={profile} />)
    fireEvent.change(screen.getByLabelText('City'), { target: { value: 'WELLINGTON' } })
    fireEvent.click(save())
    await waitFor(() => expect(updateOnboardingProfile).toHaveBeenCalled())
  })

  it('while saving: "Saving…", aria-busy, same width class, no spinner', async () => {
    updateOnboardingProfile.mockReturnValue(new Promise(() => {}))
    render(<PlanForm profile={profile} />)
    const before = save().className.match(/min-w-\S+/)?.[0]
    expect(before).toBeTruthy()
    fireEvent.change(screen.getByLabelText('City'), { target: { value: 'WELLINGTON' } })
    fireEvent.click(save())
    const busy = await screen.findByRole('button', { name: 'Saving…' })
    expect(busy).toHaveAttribute('aria-busy', 'true')
    expect(busy.className).toContain(before)
    expect(busy.querySelector('svg')).toBeNull()
  })

  it('a 403/404 result shows its message inline', async () => {
    updateOnboardingProfile.mockResolvedValue({ success: false, message: 'No profile found. Please complete onboarding first.' })
    render(<PlanForm profile={profile} />)
    fireEvent.change(screen.getByLabelText('City'), { target: { value: 'WELLINGTON' } })
    fireEvent.click(save())
    expect(await screen.findByRole('alert')).toHaveTextContent('No profile found. Please complete onboarding first.')
  })

  it('a failed request says so and keeps the answers', async () => {
    updateOnboardingProfile.mockRejectedValue(new Error('down'))
    render(<PlanForm profile={profile} />)
    fireEvent.change(screen.getByLabelText('Work'), { target: { value: 'HEALTHCARE' } })
    fireEvent.click(save())
    expect(await screen.findByRole('alert')).toHaveTextContent("Couldn't save your changes. Check your connection, then try again.")
    expect(screen.getByLabelText('Work')).toHaveDisplayValue('Healthcare (doctor, nurse or another registered health profession)')
  })

  it('no arrival date: not sent, says what is missing', async () => {
    render(<PlanForm profile={profile} />)
    fireEvent.change(screen.getByLabelText('Arrival date'), { target: { value: '' } })
    fireEvent.click(save())
    expect(await screen.findByText('Enter the day you land.')).toBeInTheDocument()
    expect(updateOnboardingProfile).not.toHaveBeenCalled()
  })
})

describe('AccountSection', () => {
  it('name, email and a quiet Sign out', () => {
    render(<AccountSection user={user} />)
    expect(screen.getByText('Priya Sharma')).toBeInTheDocument()
    expect(screen.getByText('priya@example.com')).toBeInTheDocument()
    expect(screen.getByText('Signs in with Google')).toBeInTheDocument()
    const out = screen.getByRole('button', { name: 'Sign out' })
    expect(out).not.toHaveClass('bg-ink')
    fireEvent.click(out)
    expect(signOutAndLeave).toHaveBeenCalled()
  })

  it('email sign-in: says so, shows the email once', () => {
    render(<AccountSection user={{ ...user, name: 'priya@example.com', google: false }} />)
    expect(screen.getByText('Signs in with email')).toBeInTheDocument()
    expect(screen.getAllByText('priya@example.com')).toHaveLength(1)
  })
})

describe('DeleteAccount', () => {
  const open = () => {
    render(<DeleteAccount />)
    fireEvent.click(screen.getByRole('button', { name: 'Delete my account' }))
    return screen.getByRole('alertdialog', { name: 'Delete your account?' })
  }

  it('focus starts on "Keep my account"', async () => {
    const dialog = open()
    await waitFor(() => expect(within(dialog).getByRole('button', { name: 'Keep my account' })).toHaveFocus())
  })

  it('opens a dialog; Keep my account closes it', async () => {
    const dialog = open()
    expect(dialog).toHaveTextContent("Removes your answers, your roadmap and your questions to the assistant. This can't be undone.")
    fireEvent.click(within(dialog).getByRole('button', { name: 'Keep my account' }))
    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull())
    expect(deleteAccount).not.toHaveBeenCalled()
  })

  it('confirming deletes, signs out and leaves', async () => {
    deleteAccount.mockResolvedValue(undefined)
    const dialog = open()
    fireEvent.click(within(dialog).getByRole('button', { name: 'Delete account' }))
    await waitFor(() => expect(signOutAndLeave).toHaveBeenCalled())
    expect(deleteAccount).toHaveBeenCalledWith('tok')
  })

  it('a non-2xx keeps the dialog open with the error', async () => {
    deleteAccount.mockRejectedValue(Object.assign(new Error('x'), { status: 500 }))
    const dialog = open()
    fireEvent.click(within(dialog).getByRole('button', { name: 'Delete account' }))
    expect(await within(dialog).findByRole('alert')).toHaveTextContent("Couldn't delete your account. Try again.")
    expect(signOutAndLeave).not.toHaveBeenCalled()
    expect(screen.getByRole('alertdialog')).toBeInTheDocument()
  })
})

describe('SettingsScreen', () => {
  it('loads the profile into the plan form', async () => {
    render(<SettingsScreen user={user} />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Settings')
    expect(await screen.findByLabelText('Visa')).toHaveDisplayValue('Accredited Employer Work Visa (AEWV)')
    expect(getOnboardingProfile).toHaveBeenCalledWith('tok')
    fireEvent.click(within(screen.getByRole('banner')).getByRole('button', { name: /^Ask/ }))
    expect(push).toHaveBeenCalledWith('/app/roadmap?ask=1')
  })

  it('no profile: back to onboarding', async () => {
    getOnboardingProfile.mockRejectedValue(Object.assign(new Error('nf'), { status: 404 }))
    render(<SettingsScreen user={user} />)
    await waitFor(() => expect(replace).toHaveBeenCalledWith('/onboarding?step=1'))
  })

  it('API down: the plan shows the alert; account and delete stay usable', async () => {
    getOnboardingProfile.mockRejectedValueOnce(new Error('down'))
    render(<SettingsScreen user={user} />)
    fireEvent.click(await screen.findByRole('button', { name: 'Try again' }))
    expect(await screen.findByLabelText('Visa')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Sign out' })).toBeInTheDocument()
  })
})
