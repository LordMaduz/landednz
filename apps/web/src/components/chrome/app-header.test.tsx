import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { AppHeader } from './app-header'

vi.mock('@/lib/supabase/client', () => ({ createClient: () => ({ auth: { signOut: vi.fn() } }) }))

const user = { name: 'Priya Sharma', initials: 'PS' }

describe('AppHeader', () => {
  it('desktop nav: Home, Roadmap, Settings; the active one is current', () => {
    render(<AppHeader active="roadmap" user={user} />)
    const nav = screen.getAllByRole('navigation', { name: 'Main' })[0]
    expect(within(nav).getAllByRole('link').map(l => l.textContent)).toEqual(['Home', 'Roadmap', 'Settings'])
    expect(within(nav).getByRole('link', { name: 'Roadmap' })).toHaveAttribute('aria-current', 'page')
    expect(within(nav).getByRole('link', { name: 'Home' })).not.toHaveAttribute('aria-current')
  })

  it('Settings is current in both the header and the phone tab bar', () => {
    render(<AppHeader active="settings" user={user} />)
    const navs = screen.getAllByRole('navigation', { name: 'Main' })
    expect(navs).toHaveLength(2)
    for (const nav of navs) {
      expect(within(nav).getByRole('link', { name: 'Settings' })).toHaveAttribute('aria-current', 'page')
      expect(within(nav).getAllByRole('link')).toHaveLength(3)
    }
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

  it('"/" on the page opens Ask; not while typing in a field', () => {
    const onAsk = vi.fn()
    render(
      <>
        <AppHeader active="home" user={user} onAsk={onAsk} />
        <input aria-label="Other field" />
      </>,
    )
    fireEvent.keyDown(document.body, { key: '/' })
    expect(onAsk).toHaveBeenCalledTimes(1)
    fireEvent.keyDown(screen.getByLabelText('Other field'), { key: '/' })
    expect(onAsk).toHaveBeenCalledTimes(1)
    expect(screen.getByRole('button', { name: /^Ask/ })).toHaveAttribute('aria-keyshortcuts', '/')
  })

  it('askDisabled disables Ask and the shortcut', () => {
    const onAsk = vi.fn()
    render(<AppHeader active="roadmap" user={user} onAsk={onAsk} askDisabled />)
    expect(screen.getByRole('button', { name: /^Ask/ })).toBeDisabled()
    fireEvent.keyDown(document.body, { key: '/' })
    expect(onAsk).not.toHaveBeenCalled()
  })

  it('names the account button after the user', () => {
    render(<AppHeader active={null} user={user} />)
    expect(screen.getByRole('button', { name: 'Account, Priya Sharma' })).toHaveAttribute('aria-haspopup', 'menu')
  })
})
