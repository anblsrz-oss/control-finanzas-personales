import { PRICES } from '@/lib/pricing'
import { isPlayBuild } from '@/lib/distribution'
import { APP_NAME, absoluteUrl, findSeoRoute, type Lang, type SeoRoute } from '@/lib/seoRoutes'
import type { PageMeta } from '@/hooks/usePageMeta'

// '$1,037' → 1037
const priceNumber = (p: string) => Number(p.replace(/[^0-9.]/g, ''))

/** JSON-LD de la landing (copy.md §5). Sin aggregateRating: no hay reseñas reales. */
export function softwareAppJsonLd(lang: Lang) {
  const es = lang === 'es'
  const offer = (name: string, price: number) => ({ '@type': 'Offer', name, price, priceCurrency: 'MXN' })
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: APP_NAME,
    description: findSeoRoute('/')!.description[lang],
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'Android, Web',
    inLanguage: ['es', 'en'],
    url: absoluteUrl('/', lang),
    // En Google Play no se muestran precios (ver lib/distribution.ts).
    ...(isPlayBuild()
      ? {}
      : {
          offers: [
            offer(es ? 'Gratis' : 'Free', 0),
            offer(es ? 'Premium mensual' : 'Premium monthly', priceNumber(PRICES.monthly)),
            offer(es ? 'Premium anual' : 'Premium yearly', priceNumber(PRICES.yearly)),
          ],
        }),
    publisher: { '@type': 'Organization', name: 'ALCE-Soft', url: 'https://alce-soft.com' },
  }
}

/** JSON-LD de Quiénes somos (copy.md §5): el responsable de la app. */
export function organizationJsonLd() {
  return { '@context': 'https://schema.org', '@type': 'Organization', name: 'ALCE-Soft', url: 'https://alce-soft.com' }
}

/** Metadatos indexables de una ruta del registro. Los usan RouteMeta (navegador) y el prerender. */
export function seoPageMeta(route: SeoRoute, lang: Lang): PageMeta {
  return {
    title: route.title[lang],
    description: route.description[lang],
    lang,
    path: route.path,
    jsonLd: route.path === '/' ? softwareAppJsonLd(lang) : route.path === '/quienes-somos' ? organizationJsonLd() : undefined,
  }
}
