// API client for all backend calls.
// Imports shared types to ensure mobile/API type contract.

import type { ApiError, VisaType } from '@landednz/types'

// Placeholder for API service functions.
// Phase 2 will implement the actual API calls for onboarding, roadmap, etc.

export type { ApiError, VisaType }

// Example function signature for future implementation
export interface ApiClient {
  // Will be implemented in Phase 2 onwards
  // auth: { verify: (token: string) => Promise<AuthVerifyResponse> }
  // onboarding: { createProfile: (data: OnboardingData) => Promise<void> }
}

// TODO: Implement in Phase 2
export const apiClient: ApiClient = {} as ApiClient