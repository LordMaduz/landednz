import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { AppHeader } from './app-header'

vi.mock('@/lib/supabase/client', () => ({ createClient: () => ({ auth: { signOut: vi.fn() } }) }))

const user = { name: 'Priya Sharma', initials: 'PS' }

describe('AppHeader', () => {
  it('desktop nav: Home and Roadmap; the active one is current', () => {
    render(<AppHeader active="roadmap" user={user} />)
    const nav = screen.getAllByRole('navigation', { name: 'Main' })[0]
    expect(within(nav).getAllByRole('link').map(l => l.textContent)).toEqual(['Home', 'Roadmap'])
    expect(within(nav).getByRole('link', { name: 'Roadmap' })).toHaveAttribute('aria-current', 'page')
    expect(within(nav).getByRole('link', { name: 'Home' })).not.toHaveAttribute('aria-current')
    // current page: a 2 px ink line, no fill; every link takes the state layer
    expect(within(nav).getByRole('link', { name: 'Roadmap' })).toHaveClass("aria-[current=page]:after:bg-fg", "state")
    expect(within(nav).getByRole('link', { name: 'Home' })).toHaveClass('state')
  })

  it('phone tab bar: Home, Roadmap, You; You is current on Your details', () => {
    render(<AppHeader active="settings" user={user} />)
    const bar = screen.getAllByRole('navigation', { name: 'Main' })[1]
    expect(within(bar).getAllByRole('link').map(l => l.textContent)).toEqual(['Home', 'Roadmap', 'PSYou'])
    expect(within(bar).getByRole('link', { name: 'You' })).toHaveAttribute('href', '/settings')
    expect(within(bar).getByRole('link', { name: 'You' })).toHaveAttribute('aria-current', 'page')
  })

  it('account menu: who you are, Your details, Memory, then Sign out', async () => {
    render(<AppHeader active="home" user={{ ...user, email: 'priya@example.com' }} />)
    fireEvent.click(screen.getByRole('button', { name: 'Account, Priya Sharma' }))
    const menu = await screen.findByRole('menu')
    expect(within(menu).getByText('priya@example.com')).toBeInTheDocument()
    expect(within(menu).getAllByRole('menuitem').map(i => i.textContent)).toEqual(['Your details', 'Memory', 'Privacy', 'Terms', 'Sign out'])
    expect(within(menu).getByRole('menuitem', { name: 'Memory' })).toHaveAttribute('href', '/settings?edit=memory')
    expect(within(menu).getAllByRole('separator')).toHaveLength(3)
  })

  it('an email-only account shows its email once', async () => {
    render(<AppHeader active="home" user={{ name: 'e@example.com', initials: 'E', email: 'e@example.com' }} />)
    fireEvent.click(screen.getByRole('button', { name: 'Account, e@example.com' }))
    expect(within(await screen.findByRole('menu')).getAllByText('e@example.com')).toHaveLength(1)
  })

  it('shows the Google photo, and initials when it fails to load', () => {
    const { container } = render(<AppHeader active="home" user={{ ...user, avatar: 'https://lh3.googleusercontent.com/a/x' }} />)
    const imgs = container.querySelectorAll('img')
    expect(imgs.length).toBeGreaterThan(0)
    fireEvent.error(imgs[0])
    expect(within(screen.getByRole('button', { name: 'Account, Priya Sharma' })).getByText('PS')).toBeInTheDocument()
  })

  it('back replaces the brand on phones', () => {
    render(<AppHeader active={null} user={user} back={{ href: '/app/roadmap', label: 'Roadmap' }} />)
    const links = within(screen.getByRole('banner')).getAllByRole('link', { name: 'Roadmap' })
    expect(links.some(l => l.className.includes('max-narrow:flex'))).toBe(true)
  })

  it('the phone header keeps the wordmark; with back, the brand is hidden on phones instead', () => {
    const { unmount } = render(<AppHeader active="home" user={user} />)
    const word = screen.getByText('LandedNZ')
    expect(word.className).not.toMatch(/hidden/)
    expect(word.parentElement!.parentElement!.className).not.toMatch(/hidden/)
    unmount()
    render(<AppHeader active={null} user={user} back={{ href: '/app/roadmap', label: 'Roadmap' }} />)
    expect(screen.getByText('LandedNZ').closest('span[class*="max-narrow:hidden"]')).not.toBeNull()
    expect(screen.getByText('LandedNZ').className).not.toMatch(/hidden/)
  })

  it('has no Ask button in any state (D20)', () => {
    for (const active of ['home', 'roadmap', 'settings', null] as const) {
      const { unmount } = render(<AppHeader active={active} user={user} />)
      expect(screen.queryByRole('button', { name: /^Ask/ })).toBeNull()
      unmount()
    }
  })

  it('names the account button after the user', () => {
    render(<AppHeader active={null} user={user} />)
    expect(screen.getByRole('button', { name: 'Account, Priya Sharma' })).toHaveAttribute('aria-haspopup', 'menu')
  })
})
