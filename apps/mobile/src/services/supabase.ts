import { createClient } from '@supabase/supabase-js'
import AsyncStorage from '@react-native-async-storage/async-storage'

// Hardcoded for release build - TODO: use proper env vars
const SUPABASE_URL = 'http://localhost:54321'
const SUPABASE_ANON_KEY = 'sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH'

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error(
    'Missing SUPABASE_URL or SUPABASE_ANON_KEY environment variables'
  )
}

// Singleton Supabase client with AsyncStorage for session persistence across app restarts.
// Import `supabase` everywhere auth/db access is needed in mobile.
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    // Enable automatic deep link URL processing for OAuth callbacks
    detectSessionInUrl: true,
  },
})
