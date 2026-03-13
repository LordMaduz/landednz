// API client for all backend calls.
// Imports shared types to ensure mobile/API type contract.

import type { ApiError, AuthVerifyResponse } from '@landednz/types'

export type { ApiError, AuthVerifyResponse }

// Hardcoded for release build - TODO: use proper env vars
const API_BASE_URL = 'http://127.0.0.1:3000'

// POST /auth/verify — verify Supabase JWT and upsert User in app DB.
// Called once after successful OAuth sign-in.
export async function authVerify(accessToken: string): Promise<AuthVerifyResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/verify`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({}),
  })

  if (!response.ok) {
    const error: ApiError = await response.json()
    throw new Error(`Auth verify failed: ${error.message}`)
  }

  return response.json()
}
