import { useState, useEffect } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../services/supabase'

// TODO: AC-1-06 migration — implement Google OAuth using react-native-app-auth
// Full OAuth flow: signInWithGoogle, signOut, session persistence via Supabase
// See docs/google-oauth-setup.md for Supabase Google provider configuration

interface AuthState {
  session: Session | null
  loading: boolean
  error: string | null
}

interface UseAuthReturn extends AuthState {
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
}

export function useAuth(): UseAuthReturn {
  const [state, setState] = useState<AuthState>({
    session: null,
    loading: true,
    error: null,
  })

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setState((prev) => ({ ...prev, session, loading: false }))
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setState((prev) => ({ ...prev, session, loading: false }))
    })

    return () => subscription.unsubscribe()
  }, [])

  async function signInWithGoogle(): Promise<void> {
    // TODO: AC-1-06 — implement with react-native-app-auth
    setState((prev) => ({ ...prev, error: 'Google sign-in not yet implemented' }))
  }

  async function signOut(): Promise<void> {
    setState((prev) => ({ ...prev, loading: true, error: null }))
    try {
      await supabase.auth.signOut()
      setState({ session: null, loading: false, error: null })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sign out failed'
      setState((prev) => ({ ...prev, loading: false, error: message }))
    }
  }

  return { ...state, signInWithGoogle, signOut }
}
