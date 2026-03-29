import { create } from 'zustand'

interface OnboardingStore {
  revealComplete: boolean
  setRevealComplete: () => void
}

export const useOnboardingStore = create<OnboardingStore>((set) => ({
  revealComplete: false,
  setRevealComplete: () => set({ revealComplete: true }),
}))
