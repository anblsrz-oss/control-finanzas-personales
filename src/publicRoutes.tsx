import { Route } from 'react-router-dom'
import { PageGuard } from '@/components/layout/PageGuard'
import { LandingPage } from '@/features/landing/LandingPage'
import { ProductPage } from '@/features/landing/ProductPage'
import { AboutPage } from '@/features/landing/AboutPage'
import { PrivacyPolicyPage } from '@/features/legal/PrivacyPolicyPage'
import { TermsPage } from '@/features/legal/TermsPage'
import { CookiePolicyPage } from '@/features/legal/CookiePolicyPage'
import { InstallApkPage } from '@/features/help/InstallApkPage'

// Páginas públicas bilingües: "en?/" las sirve en /x (es) y /en/x (en). Cada una debe estar
// también en SEO_ROUTES (lib/seoRoutes.ts). Las comparten App (navegador) y el prerender
// (prerender/entry-server.tsx), que las renderiza a HTML estático. La landing en español
// ("/") no está aquí: es el índice de las rutas privadas y la decide ProtectedRoute.
export const publicRoutes = (
  <>
    <Route path="/en" element={<LandingPage />} />
    {/* Sin PageGuard: son públicas y se ven igual con sesión. */}
    <Route path="en?/registrar-gastos-automaticamente" element={<ProductPage path="/registrar-gastos-automaticamente" />} />
    <Route path="en?/escanear-tickets" element={<ProductPage path="/escanear-tickets" />} />
    <Route path="en?/control-de-tarjetas-y-msi" element={<ProductPage path="/control-de-tarjetas-y-msi" />} />
    <Route path="en?/presupuesto-personal-y-familiar" element={<ProductPage path="/presupuesto-personal-y-familiar" />} />
    <Route path="en?/quienes-somos" element={<AboutPage />} />
    <Route path="en?/privacidad" element={<PageGuard to="/privacidad"><PrivacyPolicyPage /></PageGuard>} />
    <Route path="en?/terminos" element={<PageGuard to="/terminos"><TermsPage /></PageGuard>} />
    <Route path="en?/cookies" element={<PageGuard to="/cookies"><CookiePolicyPage /></PageGuard>} />
    {/* Sin PageGuard: la necesita quien aún no tiene la app instalada. */}
    <Route path="en?/instalar-android" element={<InstallApkPage />} />
  </>
)
