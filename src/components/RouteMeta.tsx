import { useLayoutEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { changeLang } from '@/i18n'
import { useAuth } from '@/store/useAuth'
import { useSettings } from '@/store/useSettings'
import { useAppConfig } from '@/hooks/useAppConfig'
import { usePageMeta } from '@/hooks/usePageMeta'
import { isNative } from '@/lib/nativeAuth'
import { hasStoredSession } from '@/lib/storedSession'
import { APP_NAME, findSeoRoute, langFromPath } from '@/lib/seoRoutes'
import { seoPageMeta } from '@/lib/seoJsonLd'

/**
 * Metadatos e idioma por URL. Va antes de <Routes> para que, si una página hija
 * llama usePageMeta (p. ej. el 404), su efecto corra después y gane.
 *
 * - Ruta del registro SEO (y '/' sin sesión en web): meta indexable en el idioma del prefijo.
 * - Cualquier otra (login, app privada, 404): noindex, con el título que configuró el admin.
 */
export function RouteMeta() {
  const { pathname } = useLocation()
  const { session, loading } = useAuth()
  const { data: appConfig } = useAppConfig()
  const storedLang = useSettings((s) => s.language)

  const route = findSeoRoute(pathname)
  // '/' es la landing solo sin sesión en web; con sesión o en la app nativa es el dashboard.
  // Mientras la auth carga, cuenta como landing si no hay sesión guardada (igual que ProtectedRoute).
  const isPublic =
    !!route && (pathname !== '/' || (!session && !isNative() && (!loading || !hasStoredSession())))
  const lang = isPublic ? langFromPath(pathname) : storedLang

  // En páginas públicas el prefijo de la URL manda sobre el idioma guardado. Sin sesión,
  // se guarda como preferencia (quien llega por /en sigue en inglés al ir a /login). Con
  // sesión se cambia solo i18n y se restaura al salir: abrir /en/privacidad no reescribe
  // la preferencia del usuario en la app privada.
  useLayoutEffect(() => {
    if (!isPublic) return
    if (!session) {
      useSettings.getState().setLanguage(lang)
      return
    }
    void changeLang(lang)
    return () => {
      void changeLang(useSettings.getState().language)
    }
  }, [isPublic, lang, session])

  usePageMeta(
    isPublic ? seoPageMeta(route, lang) : { title: appConfig?.app_title || APP_NAME, lang, noindex: true },
  )

  return null
}
