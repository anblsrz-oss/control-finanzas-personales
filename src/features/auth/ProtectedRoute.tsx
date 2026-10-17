import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/store/useAuth'
import { isNative } from '@/lib/nativeAuth'
import { LandingPage } from '@/features/landing/LandingPage'
import { hasStoredSession } from '@/lib/storedSession'

/**
 * Protege las rutas privadas. En la Fase 1 se conecta con el login real de Google.
 * Sin sesión: en web, "/" es la landing pública (se renderiza directo, sin redirect, para
 * que los buscadores la indexen) y cualquier otra ruta privada lleva a "/"; en la app nativa
 * se usa su propio inicio (/inicio).
 */
export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { t } = useTranslation()
  const { session, loading } = useAuth()
  const { pathname } = useLocation()

  if (loading) {
    // Visitante sin sesión guardada en "/": la landing de una vez, sin pasar por "Cargando…"
    // (la versión prerenderizada ya está en pantalla y no debe parpadear).
    if (!isNative() && pathname === '/' && !hasStoredSession()) return <LandingPage />
    return (
      <div className="flex min-h-screen items-center justify-center text-slate-500 dark:text-slate-400">
        {t('Cargando…')}
      </div>
    )
  }

  if (!session) {
    if (isNative()) return <Navigate to="/inicio" replace />
    return pathname === '/' ? <LandingPage /> : <Navigate to="/" replace />
  }

  return <>{children}</>
}
