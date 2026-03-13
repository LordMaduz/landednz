import { useState, useEffect } from 'react'
import { Linking } from 'react-native'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../services/supabase'
import { authVerify } from '../services/api'

// Google OAuth using Supabase signInWithOAuth + React Native Linking API
// Flow: signInWithOAuth → Linking.openURL → Safari → Supabase → landednz://auth/callback deep link
// See docs/google-oauth-setup.md for Supabase Google provider configuration

// Temporary: mock session type to test crash
type MockSession = { user: { id: string } } | null

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
    session: null, // Start without session to show LoginScreen
    loading: true, // Start with loading to check existing session
    error: null,
  })

  // Check for existing session on mount
  useEffect(() => {
    // Test: Add back getSession call to see if this causes crash
    supabase.auth.getSession().then(({ data: { session } }) => {
      setState((prev) => ({ ...prev, session, loading: false }))
    })

    // setState((prev) => ({ ...prev, loading: false }))

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setState((prev) => ({ ...prev, session, loading: false }))

        // Call auth/verify after successful sign in
        if (event === 'SIGNED_IN' && session?.access_token) {
          try {
            await authVerify(session.access_token)
          } catch (error) {
            console.warn('Auth verify failed:', error)
            // Don't block the auth flow if API call fails
          }
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  // Handle deep link for OAuth callback
  useEffect(() => {
    const handleDeepLink = async (url: string) => {
      if (url.startsWith('landednz://auth/callback')) {
        // Extract access_token from URL fragment
        const fragment = url.split('#')[1]
        const params = new URLSearchParams(fragment)
        const accessToken = params.get('access_token')
        const refreshToken = params.get('refresh_token')

        if (accessToken) {
          try {
            // Manually create session with tokens
            await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken || ''
            })
          } catch (error) {
            console.warn('Failed to set session:', error)
          }
        }
      }
    }

    const linkingListener = Linking.addEventListener('url', ({ url }) => {
      handleDeepLink(url)
    })

    return () => linkingListener?.remove()
  }, [])

  async function signInWithGoogle(): Promise<void> {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }))

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: 'landednz://auth/callback',
        },
      })

      if (error) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: error.message
        }))
        return
      }

      // Open the OAuth URL in browser
      if (data.url) {
        await Linking.openURL(data.url)
      }
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }))
    }
  }

  async function signOut(): Promise<void> {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        setState((prev) => ({ ...prev, error: error.message }))
      }
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Unknown error'
      }))
    }
  }

  return { ...state, signInWithGoogle, signOut }
}
