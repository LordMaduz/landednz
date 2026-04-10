// Typed API client for the LandedNZ Fastify backend.
// All fetch calls to NEXT_PUBLIC_API_URL live here — flat exported functions, no class.

import type { VisaType, City, FamilySituation, Occupation } from '@landednz/types'

const API_URL = process.env.NEXT_PUBLIC_API_URL

// ─── Onboarding ───────────────────────────────────────────────────────────────

// Web-specific request type — mirrors API's CreateProfileRequest but cannot import
// from apps/api directly. Primitive types come from @landednz/types (CW04 compliant).
export interface SubmitProfilePayload {
  visaType: VisaType
  city: City
  familySituation: FamilySituation
  occupation: Occupation
  arrivalDate: string // ISO date, e.g. "2024-06-15"
}

export async function submitOnboardingProfile(
  payload: SubmitProfilePayload,
  token: string,
): Promise<void> {
  const res = await fetch(`${API_URL}/onboarding/profile`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  })

  // 409 = profile already exists — treat as success so refreshes don't block the user
  if (!res.ok && res.status !== 409) {
    throw new Error(`Profile submission failed: ${res.status}`)
  }
}
