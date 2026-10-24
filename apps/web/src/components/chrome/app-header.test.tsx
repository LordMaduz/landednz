import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { AppHeader } from './app-header'

vi.mock('@/lib/supabase/client', () => ({ createClient: () => ({ auth: { signOut: vi.fn() } }) }))

const user = { name: 'Priya Sharma', initials: 'PS' }

describe('AppHeader', () => {
  it('marks the active nav link', () => {
    render(<AppHeader active="roadmap" user={user} />)
    expect(screen.getByRole('link', { name: 'Roadmap' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('link', { name: 'Home' })).not.toHaveAttribute('aria-current')
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
