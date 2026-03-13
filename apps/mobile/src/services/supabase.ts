import { createClient } from '@supabase/supabase-js'
import AsyncStorage from '@react-native-async-storage/async-storage'

const supabaseUrl = process.env['SUPABASE_URL']
const supabaseAnonKey = process.env['SUPABASE_ANON_KEY']

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing SUPABASE_URL or SUPABASE_ANON_KEY environment variables'
  )
}

// Singleton Supabase client with AsyncStorage for session persistence across app restarts.
// Import `supabase` everywhere auth/db access is needed in mobile.
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    // Deep link URL handling is done manually in useAuth — not via detectSessionInUrl
    detectSessionInUrl: false,
  },
})
