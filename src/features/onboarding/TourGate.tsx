import { useEffect, useState } from 'react'
import { useAuth } from '@/store/useAuth'
import { useOnboarding } from '@/store/useOnboarding'
import { useMarkTutorialSeen } from '@/hooks/useProfile'
import { TourRunner } from './TourRunner'

// Decide si el recorrido guiado debe estar abierto: automáticamente para
// toda cuenta (nueva o preexistente) que no lo haya visto — sin el bypass
// por fecha de creación que tenía OnboardingTour.tsx —, o al instante desde
// "Ver tutorial de nuevo" en Configuración (tourForceOpen).
export function TourGate() {
  const { profile, session } = useAuth()
  const tourForceOpen = useOnboarding((s) => s.tourForceOpen)
  const clearTourForceOpen = useOnboarding((s) => s.clearTourForceOpen)
  const markSeen = useMarkTutorialSeen()
  // Cierre optimista: no esperar el round-trip de Supabase para ocultar el
  // overlay al terminar/omitir, igual que el Modal anterior.
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    if (tourForceOpen) setDismissed(false)
  }, [tourForceOpen])

  const shouldAutoOpen = !!profile && !profile.has_seen_tutorial
  const open = !dismissed && (shouldAutoOpen || tourForceOpen)

  const userId = session?.user?.id
  if (!open || !userId) return null

  function finish() {
    setDismissed(true)
    clearTourForceOpen()
    if (userId) markSeen.mutate({ userId, seen: true })
  }

  return <TourRunner onFinish={finish} />
}
