import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/store/useAuth'
import { useAppConfig } from '@/hooks/useAppConfig'
import { isPageHidden } from '@/lib/pageOrder'

/**
 * Redirige al Resumen si el admin ocultó esta sección (app_config.hidden_pages).
 * Los admins siempre pueden entrar, para probarla antes de mostrarla.
 */
export function PageGuard({ to, children }: { to: string; children: ReactNode }) {
  const { profile } = useAuth()
  const { data: config } = useAppConfig()
  if (!profile?.is_admin && isPageHidden(to, config?.hidden_pages)) {
    return <Navigate to="/" replace />
  }
  return <>{children}</>
}
