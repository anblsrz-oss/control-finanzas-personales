import type { ReactNode } from 'react'
import { Route } from 'react-router-dom'
import { LANGUAGES } from '@/i18n/languages'
import { PageGuard } from '@/components/layout/PageGuard'
import { LandingPage } from '@/features/landing/LandingPage'
import { ProductPage } from '@/features/landing/ProductPage'
import { AboutPage } from '@/features/landing/AboutPage'
import { PrivacyPolicyPage } from '@/features/legal/PrivacyPolicyPage'
import { TermsPage } from '@/features/legal/TermsPage'
import { CookiePolicyPage } from '@/features/legal/CookiePolicyPage'
import { InstallApkPage } from '@/features/help/InstallApkPage'

// Páginas públicas multi-idioma: cada una se sirve en /x (es) y en /<código>/x (resto de idiomas,
// ver LANGUAGES). Cada una debe estar también en SEO_ROUTES (lib/seoRoutes.ts). Las comparten
// App (navegador) y el prerender (prerender/entry-server.tsx), que las renderiza a HTML estático.
// La landing en español ("/") no está aquí: es el índice de las rutas privadas y la decide ProtectedRoute.
const PREFIXES = LANGUAGES.map((l) => (l.code === 'es' ? '' : `/${l.code}`))
const pages = (slug: string, element: ReactNode) =>
  PREFIXES.map((p) => <Route key={p + slug} path={p + slug} element={element} />)

export const publicRoutes = (
  <>
    {PREFIXES.filter(Boolean).map((p) => <Route key={p} path={p} element={<LandingPage />} />)}
    {/* Sin PageGuard: son públicas y se ven igual con sesión. */}
    {pages('/registrar-gastos-automaticamente', <ProductPage path="/registrar-gastos-automaticamente" />)}
    {pages('/escanear-tickets', <ProductPage path="/escanear-tickets" />)}
    {pages('/control-de-tarjetas-y-msi', <ProductPage path="/control-de-tarjetas-y-msi" />)}
    {pages('/presupuesto-personal-y-familiar', <ProductPage path="/presupuesto-personal-y-familiar" />)}
    {pages('/quienes-somos', <AboutPage />)}
    {pages('/privacidad', <PageGuard to="/privacidad"><PrivacyPolicyPage /></PageGuard>)}
    {pages('/terminos', <PageGuard to="/terminos"><TermsPage /></PageGuard>)}
    {pages('/cookies', <PageGuard to="/cookies"><CookiePolicyPage /></PageGuard>)}
    {/* Sin PageGuard: la necesita quien aún no tiene la app instalada. */}
    {pages('/instalar-android', <InstallApkPage />)}
  </>
)
