import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
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
  listMemories: async () => [{ id: 'm1', text: 'You start work on 9 November.', createdAt: '2026-10-30T01:00:00.000Z', updatedAt: '2026-10-30T01:00:00.000Z' }],
}))
vi.mock('@/lib/sign-out', () => ({ signOutAndLeave: () => signOutAndLeave() }))
vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({ auth: { getSession: async () => ({ data: { session: { access_token: 'tok' } } }) } }),
}))
const replace = vi.fn()
const push = vi.fn()
const router = { replace, push }
let search = new URLSearchParams()
let phone = false
vi.mock('next/navigation', () => ({ useRouter: () => router, useSearchParams: () => search }))

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
  search = new URLSearchParams()
  phone = false
  window.matchMedia = (q: string) => ({ matches: phone, media: q, addEventListener() {}, removeEventListener() {} }) as unknown as MediaQueryList
  toast.dismiss() // sonner's store outlives each render, so an earlier test's toast could be clicked
  getOnboardingProfile.mockResolvedValue(profile)
})

describe('PlanForm', () => {
  const saveBtn = () => screen.getByRole('button', { name: 'Save and rebuild' })
  const view = () => render(<><PlanForm profile={profile} account={<AccountSection user={user} />} /><Toaster /></>)

  it('the answers card has a Memory row; ?edit=memory opens the memory editor instead of an answer', async () => {
    view()
    expect(await screen.findByText('1 thing the guide remembers')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Manage/ })).toHaveAttribute('href', '/settings?edit=memory')
    cleanup()
    search = new URLSearchParams('edit=memory')
    view()
    expect(screen.getByRole('heading', { name: 'What the guide remembers' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Save and rebuild' })).toBeNull()
    expect(screen.queryByText(/changing/)).toBeNull()
  })

  it('lists the five answers with a Change button each; no select remains', () => {
    view()
    const items = within(screen.getByRole('list', { name: 'Your answers' })).getAllByRole('listitem')
    expect(items).toHaveLength(5)
    expect(items[0]).toHaveTextContent('Visa')
    expect(items[0]).toHaveTextContent('Accredited Employer Work Visa (AEWV)')
    expect(items[1]).toHaveTextContent('Auckland')
    expect(items[2]).toHaveTextContent("Who's moving")
    expect(items[2]).toHaveTextContent('Just me')
    expect(items[3]).toHaveTextContent('Another job or profession')
    expect(items[4]).toHaveTextContent('Arrival date')
    expect(items[4]).toHaveTextContent('Wed 21 Oct 2026')
    // the edited row says "· changing" and drops its Change button on desktop (CSS keeps it for the phone list)
    expect(within(items[0]).getByRole('button', { name: /^Change/ })).toHaveClass('narrow:hidden')
    expect(within(items[1]).getByRole('button', { name: /^Change/ })).not.toHaveClass('narrow:hidden')
    expect(items[0]).toHaveTextContent('Visa · changing')
    expect(document.querySelector('select')).toBeNull()
  })

  it('subline: full on desktop, shortened on phones', () => {
    view()
    expect(screen.getByText(/Your answers build your roadmap\./).closest('p')).toHaveTextContent(
      "Your answers build your roadmap. Change one and it's rebuilt; done tasks stay done.",
    )
  })

  it('no edit param: the editor shows Visa', () => {
    view()
    expect(screen.getByRole('heading', { level: 2, name: 'What visa are you on?' })).toBeInTheDocument()
    expect(screen.getAllByRole('radio').length).toBeGreaterThan(1)
  })

  it('?edit=nonsense falls back to Visa (Review Focus 5)', () => {
    search = new URLSearchParams('edit=nonsense')
    view()
    expect(screen.getByRole('heading', { level: 2, name: 'What visa are you on?' })).toBeInTheDocument()
  })

  it('?edit=city: label, question, rebuild line, 4 options, Cancel and Save and rebuild', () => {
    search = new URLSearchParams('edit=city')
    view()
    const editor = screen.getByRole('region', { name: 'Where do you live?' })
    expect(within(editor).getByText('City')).toBeInTheDocument()
    expect(editor).toHaveTextContent("Your roadmap is rebuilt for the new city. Tasks you've done stay done.")
    expect(within(editor).getAllByRole('radio')).toHaveLength(4)
    expect(within(editor).getByLabelText('Auckland')).toBeChecked()
    expect(within(editor).getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
    expect(saveBtn()).toBeDisabled()
    expect(screen.getByRole('list', { name: 'Your answers' }).children[1]).toHaveTextContent('City · changing')
  })

  it('?edit=arrivalDate shows the calendar', () => {
    search = new URLSearchParams('edit=arrivalDate')
    view()
    expect(screen.getByRole('grid')).toBeInTheDocument()
    expect(screen.queryAllByRole('radio')).toHaveLength(0)
  })

  it('Change pushes /settings?edit={key}', () => {
    view()
    fireEvent.click(screen.getByRole('button', { name: 'Change City' }))
    expect(push).toHaveBeenCalledWith('/settings?edit=city')
  })

  it('Save sends only the changed answer merged into the profile, then shows the toast', async () => {
    search = new URLSearchParams('edit=city')
    updateOnboardingProfile.mockResolvedValue({ success: true })
    view()
    fireEvent.click(screen.getByLabelText('Wellington region'))
    fireEvent.click(saveBtn())
    expect(await screen.findByText('Plan saved. Your roadmap was rebuilt.')).toBeInTheDocument()
    expect(updateOnboardingProfile).toHaveBeenCalledWith(
      { visaType: 'AEWV', city: 'WELLINGTON', familySituation: 'SOLO', occupation: 'OTHER_PROFESSIONAL', arrivalDate: '2026-10-21' },
      'tok',
    )
    await waitFor(() => expect(screen.getByRole('list', { name: 'Your answers' }).children[1]).toHaveTextContent('Wellington'))
  })

  it('on a phone Save returns to /settings', async () => {
    phone = true
    search = new URLSearchParams('edit=city')
    updateOnboardingProfile.mockResolvedValue({ success: true })
    view()
    fireEvent.click(screen.getByLabelText('Wellington region'))
    fireEvent.click(saveBtn())
    await waitFor(() => expect(replace).toHaveBeenCalledWith('/settings'))
  })

  it('Cancel restores the saved value; on a phone it goes back to /settings', () => {
    search = new URLSearchParams('edit=city')
    view()
    fireEvent.click(screen.getByLabelText('Wellington region'))
    expect(saveBtn()).toBeEnabled()
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(screen.getByLabelText('Auckland')).toBeChecked()
    expect(saveBtn()).toBeDisabled()
    expect(replace).not.toHaveBeenCalled()
    phone = true
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(replace).toHaveBeenCalledWith('/settings') // replace, so Back does not return to the editor
    expect(push).not.toHaveBeenCalled()
  })

  it('leaving the editor with Back drops the draft; reopening shows the saved value', () => {
    search = new URLSearchParams('edit=visaType')
    const ui = () => <PlanForm profile={profile} account={null} /> // a new element each time, or React skips the rerender
    const { rerender } = render(ui())
    fireEvent.click(screen.getByLabelText('Skilled Migrant Category Resident Visa'))
    search = new URLSearchParams()
    rerender(ui())
    search = new URLSearchParams('edit=visaType')
    rerender(ui())
    expect(screen.getByLabelText('Accredited Employer Work Visa (AEWV)')).toBeChecked()
    expect(saveBtn()).toBeDisabled()
  })

  it('changing back to the saved value makes Save disabled again', () => {
    search = new URLSearchParams('edit=city')
    view()
    fireEvent.click(screen.getByLabelText('Wellington region'))
    expect(saveBtn()).toBeEnabled()
    fireEvent.click(screen.getByLabelText('Auckland'))
    expect(saveBtn()).toBeDisabled()
  })

  it('a second save removes the first toast, so its Undo cannot overwrite newer answers', async () => {
    search = new URLSearchParams('edit=city')
    updateOnboardingProfile.mockResolvedValue({ success: true })
    view()
    fireEvent.click(screen.getByLabelText('Wellington region'))
    fireEvent.click(saveBtn())
    await screen.findByRole('button', { name: 'Undo' })
    fireEvent.click(screen.getByLabelText('Somewhere else in NZ'))
    fireEvent.click(saveBtn())
    await waitFor(() => expect(updateOnboardingProfile).toHaveBeenCalledTimes(2))
    await waitFor(() => expect(screen.getAllByRole('button', { name: 'Undo' })).toHaveLength(1))
    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
    await waitFor(() => expect(updateOnboardingProfile).toHaveBeenCalledTimes(3))
    expect(updateOnboardingProfile.mock.calls[2][0].city).toBe('WELLINGTON')
  })

  it('a saved date that has already passed does not block changing another answer', async () => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date('2030-01-01T00:00:00Z'))
    try {
      search = new URLSearchParams('edit=city')
      updateOnboardingProfile.mockResolvedValue({ success: true })
      view()
      fireEvent.click(screen.getByLabelText('Wellington region'))
      fireEvent.click(saveBtn())
      await waitFor(() => expect(updateOnboardingProfile).toHaveBeenCalled())
    } finally {
      vi.useRealTimers()
    }
  })

  it('Undo puts the previous answers back with one call', async () => {
    search = new URLSearchParams('edit=city')
    updateOnboardingProfile.mockResolvedValue({ success: true })
    view()
    fireEvent.click(screen.getByLabelText('Wellington region'))
    fireEvent.click(saveBtn())
    fireEvent.click(await screen.findByRole('button', { name: 'Undo' }))
    await waitFor(() => expect(updateOnboardingProfile).toHaveBeenCalledTimes(2))
    expect(updateOnboardingProfile.mock.calls[1][0].city).toBe('AUCKLAND')
    await waitFor(() => expect(screen.getByLabelText('Auckland')).toBeChecked())
  })

  it('a past arrival date is refused on submit, under the calendar', async () => {
    search = new URLSearchParams('edit=arrivalDate')
    view()
    const grid = screen.getByRole('grid')
    fireEvent.click(within(grid).getAllByRole('gridcell')[0]) // a day in the month of the saved date, in the past
    fireEvent.click(saveBtn())
    expect(await screen.findByText('Pick a date from today onwards.')).toBeInTheDocument()
    expect(updateOnboardingProfile).not.toHaveBeenCalled()
  })

  it('while saving: "Saving…", aria-busy, no spinner', async () => {
    search = new URLSearchParams('edit=city')
    updateOnboardingProfile.mockReturnValue(new Promise(() => {}))
    view()
    fireEvent.click(screen.getByLabelText('Wellington region'))
    fireEvent.click(saveBtn())
    const busy = await screen.findByRole('button', { name: 'Saving…' })
    expect(busy).toHaveAttribute('aria-busy', 'true')
    expect(busy.querySelector('svg')).toBeNull()
  })

  it('a 403/404 result shows its message inline', async () => {
    search = new URLSearchParams('edit=city')
    updateOnboardingProfile.mockResolvedValue({ success: false, message: 'No profile found. Please complete onboarding first.' })
    view()
    fireEvent.click(screen.getByLabelText('Wellington region'))
    fireEvent.click(saveBtn())
    expect(await screen.findByRole('alert')).toHaveTextContent('No profile found. Please complete onboarding first.')
  })

  it('a failed request says so and keeps the choice', async () => {
    search = new URLSearchParams('edit=occupation')
    updateOnboardingProfile.mockRejectedValue(new Error('down'))
    view()
    fireEvent.click(screen.getByLabelText(/^Healthcare/))
    fireEvent.click(saveBtn())
    expect(await screen.findByRole('alert')).toHaveTextContent("Couldn't save your changes. Check your connection, then try again.")
    expect(screen.getByLabelText(/^Healthcare/)).toBeChecked()
  })
})

describe('AccountSection', () => {
  it('name, email and a quiet Sign out', () => {
    render(<AccountSection user={user} />)
    expect(screen.getByText('priya@example.com')).toBeInTheDocument()
    expect(screen.getByText(/signs in with Google/i)).toBeInTheDocument()
    const out = screen.getByRole('button', { name: 'Sign out' })
    expect(out).not.toHaveClass('bg-ink')
    fireEvent.click(out)
    expect(signOutAndLeave).toHaveBeenCalled()
  })

  it('email sign-in: says so, shows the email once', () => {
    render(<AccountSection user={{ ...user, google: false }} />)
    expect(screen.getByText(/signs in with email/i)).toBeInTheDocument()
  })
})

describe('DeleteAccount', () => {
  const open = () => {
    render(<DeleteAccount />)
    fireEvent.click(screen.getByRole('button', { name: /^Delete account/ }))
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
  it('a direct load of ?edit=arrivalDate shows the editor with a Settings back link', async () => {
    search = new URLSearchParams('edit=arrivalDate')
    render(<SettingsScreen user={user} />)
    expect(await screen.findByRole('grid')).toBeInTheDocument()
    expect(document.querySelector('header a[href="/settings"]:not([aria-current])')).toHaveTextContent('Settings')
  })

  it('loads the profile into the answers list and editor', async () => {
    render(<SettingsScreen user={user} />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Settings')
    expect(await screen.findByRole('heading', { level: 2, name: 'What visa are you on?' })).toBeInTheDocument()
    expect(getOnboardingProfile).toHaveBeenCalledWith('tok')
    expect(within(screen.getByRole('banner')).queryByRole('button', { name: /^Ask/ })).toBeNull()
  })

  it('mounting closes the guide and clears its page, so there is no ask bar (D21)', async () => {
    const { useGuideStore } = await import('@/lib/stores/guideStore')
    useGuideStore.setState({ open: true, page: { kind: 'home' } })
    render(<SettingsScreen user={user} />)
    await vi.waitFor(() => expect(useGuideStore.getState()).toMatchObject({ open: false, page: null }))
    expect(screen.queryByRole('button', { name: /^Ask about/ })).toBeNull()
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
    expect(await screen.findByRole('heading', { level: 2, name: 'What visa are you on?' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Sign out' })).toBeInTheDocument()
  })
})
