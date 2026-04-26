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
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'
const E2E_TEST_EMAIL = process.env.E2E_TEST_EMAIL ?? 'e2e-test@landednz.dev'
const E2E_TEST_PASSWORD = process.env.E2E_TEST_PASSWORD ?? 'E2eTestPw99!'
const USER_ID_FILE = path.join(__dirname, '.e2e-user-id')
const AUTH_FILE = path.join(__dirname, 'playwright-auth.json')

// @supabase/ssr encodes session cookies as: "base64-" + base64url(JSON.stringify(session))
// The cookie name is derived from the Supabase URL: sb-{url-hostname-sanitised}-auth-token
function encodeSessionCookie(session: object): string {
  return 'base64-' + Buffer.from(JSON.stringify(session)).toString('base64url')
}

// Derives the @supabase/ssr cookie name from the project URL.
// Logic mirrors supabase-js: `sb-${hostname.split(".")[0]}-auth-token`
// For http://127.0.0.1:54321 → hostname=127.0.0.1 → first part=127 → sb-127-auth-token
function getSupabaseCookieName(supabaseUrl: string): string {
  const hostname = new URL(supabaseUrl).hostname
  const firstPart = hostname.split('.')[0]
  return `sb-${firstPart}-auth-token`
}

export default async function globalSetup(_config: FullConfig) {
  if (!SERVICE_ROLE_KEY) {
    throw new Error(
      '[E2E Setup] SUPABASE_SERVICE_ROLE_KEY is required.\n' +
        'Add to apps/web/.env.test (gitignored):\n' +
        '  SUPABASE_SERVICE_ROLE_KEY=<key from `supabase status`>\n' +
        '  E2E_TEST_EMAIL=e2e-test@landednz.dev\n' +
        '  E2E_TEST_PASSWORD=E2eTestPw99!',
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

  // Create fresh test user with email+password (not magic-link-only)
  const { data: createData, error: createError } = await supabase.auth.admin.createUser({
    email: E2E_TEST_EMAIL,
    password: E2E_TEST_PASSWORD,
    email_confirm: true,
  })
  if (createError || !createData.user) {
    throw new Error(`[E2E Setup] Failed to create test user: ${createError?.message}`)
  }
  const userId = createData.user.id
  fs.writeFileSync(USER_ID_FILE, userId, 'utf-8')

  // Sign in via REST API to get real access/refresh tokens
  // Using password flow — magic links use implicit flow (hash tokens) which cannot
  // be processed by the server-side /auth/callback PKCE handler.
  const tokenRes = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: ANON_KEY,
    },
    body: JSON.stringify({ email: E2E_TEST_EMAIL, password: E2E_TEST_PASSWORD }),
  })
  if (!tokenRes.ok) {
    throw new Error(`[E2E Setup] Password sign-in failed: ${tokenRes.status} ${await tokenRes.text()}`)
  }
  const session = await tokenRes.json()

  // Register user in Prisma via the Fastify API (non-fatal — auth middleware upserts on first request)
  try {
    await fetch(`${API_URL}/auth/verify`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${session.access_token}` },
    })
  } catch {
    // API not running — user will be created on first authenticated API call
  }

  // Inject real Supabase SSR session cookie directly into the browser context.
  // @supabase/ssr stores sessions as: "base64-" + base64url(JSON.stringify(session))
  // This avoids browser-based OAuth flows that require human interaction.
  const cookieName = getSupabaseCookieName(SUPABASE_URL)
  const cookieValue = encodeSessionCookie(session)

  const browser = await chromium.launch()
  const context = await browser.newContext()
  await context.addCookies([
    {
      name: cookieName,
      value: cookieValue,
      domain: 'localhost',
      path: '/',
      httpOnly: false,
      secure: false,
      sameSite: 'Lax',
    },
  ])

  // Verify auth works: navigate to /roadmap — should redirect to /onboarding (no profile yet)
  const page = await context.newPage()
  await page.goto('http://localhost:3000/roadmap')
  await page.waitForURL(/localhost:3000\/(roadmap|onboarding)/, { timeout: 20000 })

  await context.storageState({ path: AUTH_FILE })
  await browser.close()

  console.log(
    `[E2E Setup] Auth state saved for ${E2E_TEST_EMAIL} (${userId}), ` +
    `cookie: ${cookieName}, ` +
    `final URL: ${page.url()}`,
  )
}
