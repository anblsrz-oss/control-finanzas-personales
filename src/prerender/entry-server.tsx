import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom/server'
import { Route, Routes } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import i18n from '@/i18n'
import { publicRoutes } from '@/publicRoutes'
import { LandingPage } from '@/features/landing/LandingPage'
import { headTags } from '@/hooks/usePageMeta'
import { seoPageMeta } from '@/lib/seoJsonLd'
import { PRICES } from '@/lib/pricing'
import { APP_NAME, SEO_ROUTES, absoluteUrl, localePath, type Lang, type SeoRoute } from '@/lib/seoRoutes'

// Entrada SSR del prerender (scripts/prerender.mjs la compila con Vite y la carga en Node).
// Sin App ni auth: solo las rutas públicas, sin sesión, con la config real de la app sembrada
// en la caché de react-query (misma query key que useAppConfig) para que los planes muestren
// los límites reales del admin.

export { APP_NAME, SEO_ROUTES, PRICES, absoluteUrl, localePath }

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

export interface RenderedPage {
  lang: Lang
  /** <title>, <meta>, <link> y JSON-LD, listos para insertar antes de </head>. */
  head: string
  /** HTML de la página para el interior de #root. */
  body: string
}

export async function renderPage(route: SeoRoute, lang: Lang, appConfig: unknown): Promise<RenderedPage> {
  await i18n.changeLanguage(lang)
  const queryClient = new QueryClient()
  queryClient.setQueryData(['app_config'], appConfig)

  const body = renderToString(
    <QueryClientProvider client={queryClient}>
      <StaticRouter location={localePath(route.path, lang)}>
        <Routes>
          {publicRoutes}
          {/* En el navegador "/" la sirve ProtectedRoute (ver publicRoutes.tsx). */}
          <Route path="/" element={<LandingPage />} />
        </Routes>
      </StaticRouter>
    </QueryClientProvider>,
  )

  const meta = seoPageMeta(route, lang)
  const tags = headTags(meta)
    .filter((t) => t.attrs)
    .map((t) => `<${t.tag} ${Object.entries(t.attrs!).map(([k, v]) => `${k}="${esc(v)}"`).join(' ')} />`)
  // "<" escapado para que ningún texto cierre el <script> antes de tiempo.
  const ld = meta.jsonLd
    ? [`<script type="application/ld+json">${JSON.stringify(meta.jsonLd).replace(/</g, '\u003c')}</script>`]
    : []
  return { lang, head: [`<title>${esc(meta.title)}</title>`, ...tags, ...ld].join('\n    '), body }
}
