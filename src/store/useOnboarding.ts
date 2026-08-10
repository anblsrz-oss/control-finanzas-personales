// Estado local del tutorial guiado y de "novedades" (localStorage, funciona
// igual dentro del WebView de Capacitor). Mismo patrón que useSettings.ts.

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const ONBOARDING_KEY = 'finzen-onboarding'

interface OnboardingState {
  hasSeenTour: boolean
  lastSeenChangelogId: string | null
  markTourSeen: () => void
  markChangelogSeen: (id: string) => void
}

export const useOnboarding = create<OnboardingState>()(
  persist(
    (set) => ({
      hasSeenTour: false,
      lastSeenChangelogId: null,
      markTourSeen: () => set({ hasSeenTour: true }),
      markChangelogSeen: (id) => set({ lastSeenChangelogId: id }),
    }),
    { name: ONBOARDING_KEY },
  ),
)
