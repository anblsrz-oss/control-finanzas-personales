// Estado local del recorrido guiado y de "novedades". El "ya lo vio" del
// tutorial ahora vive en profiles.has_seen_tutorial (Supabase, por cuenta,
// no por dispositivo) — este store solo guarda el disparador transitorio
// para reabrirlo al instante desde Configuración ("Ver tutorial de nuevo"),
// sin esperar el round-trip de refrescar el perfil. lastSeenChangelogId
// sigue en localStorage (zustand persist), es una función aparte (🆕
// Novedades) y funciona igual dentro del WebView de Capacitor.

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const ONBOARDING_KEY = 'finzen-onboarding'

interface OnboardingState {
  lastSeenChangelogId: string | null
  markChangelogSeen: (id: string) => void
  tourForceOpen: boolean
  setTourForceOpen: (open: boolean) => void
  clearTourForceOpen: () => void
}

export const useOnboarding = create<OnboardingState>()(
  persist(
    (set) => ({
      lastSeenChangelogId: null,
      markChangelogSeen: (id) => set({ lastSeenChangelogId: id }),
      tourForceOpen: false,
      setTourForceOpen: (open) => set({ tourForceOpen: open }),
      clearTourForceOpen: () => set({ tourForceOpen: false }),
    }),
    {
      name: ONBOARDING_KEY,
      // tourForceOpen es puramente transitorio: no tiene sentido persistirlo
      // entre sesiones (si el usuario cierra a medio replay, no debe
      // reabrirse solo la próxima vez que entre).
      partialize: (state) => ({ lastSeenChangelogId: state.lastSeenChangelogId }),
    },
  ),
)
