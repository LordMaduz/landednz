import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'http://127.0.0.1:54321'
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
const USER_ID_FILE = path.join(__dirname, '.e2e-user-id')
const AUTH_FILE = path.join(__dirname, 'playwright-auth.json')

export default async function globalTeardown() {
  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  // Delete test user (cascades to Prisma profile)
  if (fs.existsSync(USER_ID_FILE)) {
    const userId = fs.readFileSync(USER_ID_FILE, 'utf-8').trim()
    if (userId) {
      await supabase.auth.admin.deleteUser(userId)
      console.log(`[E2E Teardown] Deleted test user ${userId}`)
    }
    fs.unlinkSync(USER_ID_FILE)
  }

  // Clean up auth state file
  if (fs.existsSync(AUTH_FILE)) {
    fs.unlinkSync(AUTH_FILE)
  }
}
