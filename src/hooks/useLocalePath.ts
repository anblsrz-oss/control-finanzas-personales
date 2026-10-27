import { useTranslation } from 'react-i18next'
import { findSeoRoute, localePath } from '@/lib/seoRoutes'
import { isLang } from '@/i18n/languages'

/**
 * Devuelve localePath ya ligado al idioma activo, para enlaces a páginas públicas
 * (/, /privacidad, …) que deben conservar el idioma. Las rutas fuera del registro SEO
 * (/login, /eliminar-cuenta…) no tienen versión con prefijo de idioma y se devuelven tal cual. i18n.language es el efectivo
 * en toda pantalla: el de la URL en páginas públicas (ver RouteMeta), el guardado en el resto.
 */
export function useLocalePath() {
  const { i18n } = useTranslation()
  return (path: string) =>
    findSeoRoute(path.split(/[?#]/)[0]) ? localePath(path, isLang(i18n.language) ? i18n.language : 'es') : path
}
