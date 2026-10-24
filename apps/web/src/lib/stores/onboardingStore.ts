import { create } from 'zustand'
import type { Answers } from '@/lib/answers'

// Onboarding answers in memory until "See my roadmap" posts them to the answers cookie (CW06: no localStorage)
interface OnboardingStore {
  answers: Partial<Answers>
  setAnswer: <K extends keyof Answers>(key: K, value: Answers[K]) => void
  setAnswers: (answers: Answers) => void
}

export const useOnboardingStore = create<OnboardingStore>((set) => ({
  answers: {},
  setAnswer: (key, value) => set((state) => ({ answers: { ...state.answers, [key]: value } })),
  setAnswers: (answers) => set({ answers }),
}))
