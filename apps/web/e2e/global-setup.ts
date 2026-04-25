import { chromium, FullConfig } from '@playwright/test'
import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

// globalSetup runs outside the Next.js context — env files must be loaded manually
function loadEnvFile(filePath: string) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8')
    for (const line of content.split('\n')) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const eqIdx = trimmed.indexOf('=')
      if (eqIdx === -1) continue
      const key = trimmed.substring(0, eqIdx).trim()
      const val = trimmed.substring(eqIdx + 1).trim().replace(/^["'](.*)["']$/, '$1')
      if (key && !(key in process.env)) {
        process.env[key] = val
      }
    }
  } catch {
    // File not found — env vars must be set in shell
  }
}

const WEB_DIR = path.join(__dirname, '..')
loadEnvFile(path.join(WEB_DIR, '.env.local'))
loadEnvFile(path.join(WEB_DIR, '.env.test'))

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'http://127.0.0.1:54321'
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
const E2E_TEST_EMAIL = process.env.E2E_TEST_EMAIL ?? 'e2e-test@landednz.dev'
const USER_ID_FILE = path.join(__dirname, '.e2e-user-id')
const AUTH_FILE = path.join(__dirname, 'playwright-auth.json')

export default async function globalSetup(_config: FullConfig) {
  if (!SERVICE_ROLE_KEY) {
    throw new Error(
      '[E2E Setup] SUPABASE_SERVICE_ROLE_KEY is required.\n' +
        'Add it to apps/web/.env.test (gitignored):\n' +
        '  SUPABASE_SERVICE_ROLE_KEY=<key from `supabase status`>\n' +
        '  E2E_TEST_EMAIL=e2e-test@landednz.dev',
    )
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  // Delete any existing test user to ensure clean state for re-runs
  const { data: existingUsersData } = await supabase.auth.admin.listUsers()
  const existing = existingUsersData?.users.find(u => u.email === E2E_TEST_EMAIL)
  if (existing) {
    await supabase.auth.admin.deleteUser(existing.id)
  }

  // Create fresh test user with confirmed email
  const { data: createData, error: createError } = await supabase.auth.admin.createUser({
    email: E2E_TEST_EMAIL,
    email_confirm: true,
  })
  if (createError || !createData.user) {
    throw new Error(`[E2E Setup] Failed to create test user: ${createError?.message}`)
  }
  const userId = createData.user.id
  fs.writeFileSync(USER_ID_FILE, userId, 'utf-8')

  // Generate magic link with redirect_to pointing to our /auth/callback route.
  // Flow: Supabase verifies token → redirects to localhost:3000/auth/callback?code=...
  //       → callback route calls exchangeCodeForSession → sets real Supabase SSR cookies
  //       → redirects to /roadmap
  const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
    type: 'magiclink',
    email: E2E_TEST_EMAIL,
    options: { redirectTo: 'http://localhost:3000/auth/callback' },
  })
  if (linkError || !linkData.properties?.action_link) {
    throw new Error(`[E2E Setup] Failed to generate magic link: ${linkError?.message}`)
  }

  // Navigate a real browser through the auth flow to acquire genuine Supabase SSR cookies.
  // Using sb-dev=1 fake cookie is NOT sufficient — middleware.ts uses getUser() and
  // roadmap/page.tsx uses getSession(), both requiring real Supabase SSR cookies.
  const browser = await chromium.launch()
  const context = await browser.newContext()
  const page = await context.newPage()

  await page.goto(linkData.properties.action_link)

  // Wait until we're PAST /auth/callback, not just at it.
  // waitForURL(/localhost:3000/) returns the moment the URL changes to /auth/callback?code=...,
  // BEFORE the callback response (Set-Cookie headers) is received by the browser.
  // /roadmap or /onboarding confirm the full redirect chain completed — cookies are set.
  await page.waitForURL(/localhost:3000\/(roadmap|onboarding)/, { timeout: 20000 })

  await context.storageState({ path: AUTH_FILE })
  await browser.close()

  console.log(`[E2E Setup] Real auth state saved for ${E2E_TEST_EMAIL} (${userId})`)
}
