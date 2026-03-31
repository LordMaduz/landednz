import { create } from 'zustand'

interface OnboardingStore {
  revealComplete: boolean
  setRevealComplete: () => void
  activeHint: 1 | 2 | 3 | null
  dismissHint: () => void
}

export const useOnboardingStore = create<OnboardingStore>((set) => ({
  revealComplete: false,
  setRevealComplete: () => set({ revealComplete: true }),
  activeHint: 1,
  dismissHint: () => set((state) => ({
    activeHint: state.activeHint === 1 ? 2 : state.activeHint === 2 ? 3 : null
  })),
}))
