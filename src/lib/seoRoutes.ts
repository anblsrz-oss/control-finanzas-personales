// Registro de páginas públicas indexables (SEO multi-idioma). Textos de docs/seo/copy.md
// (es/en) y lib/seoTranslations.ts (resto de idiomas).
// Solo importa archivos sin dependencias, así se prueba directo con node (seoRoutes.test.ts).
//
// Para añadir una página pública: una línea en BASE_ROUTES (+ sus textos en seoTranslations.ts)
// y su <Route path=":lang?/slug"> en publicRoutes.tsx. Los metadatos (title, description,
// canonical, hreflang) salen de aquí.

import { LANGUAGES, type Lang } from '../i18n/languages.ts'
import { SEO_TRANSLATIONS } from './seoTranslations.ts'

export type { Lang }

export const SITE_ORIGIN = 'https://controlfinanzaspersonales.com'
export const APP_NAME = 'Mi Control de Finanzas Personales'

export interface SeoRoute {
  /** Ruta en español, sin prefijo de idioma ('/' es la landing). */
  path: string
  title: Record<Lang, string>
  description: Record<Lang, string>
}

type BaseRoute = Omit<SeoRoute, 'title' | 'description'> & {
  title: Record<'es' | 'en', string>
  description: Record<'es' | 'en', string>
}

const BASE_ROUTES: BaseRoute[] = [
  { path: '/',
    title: { es: `App para controlar tus gastos personales | ${APP_NAME}`, en: `Personal expense tracker app | ${APP_NAME}` },
    description: { es: 'Registra tus gastos, cuentas, tarjetas y meses sin intereses en una sola app. Captura automática en Android, escaneo de tickets y presupuestos. Empieza gratis.', en: 'Track your expenses, accounts, credit cards and installment plans in one app. Automatic capture on Android, receipt scanning and budgets. Start for free.' } },
  { path: '/registrar-gastos-automaticamente',
    title: { es: `Registra tus gastos automáticamente en Android | ${APP_NAME}`, en: `Log your expenses automatically on Android | ${APP_NAME}` },
    description: { es: 'La app de Android registra tus compras a partir de las notificaciones de tu banco, sin darnos acceso a tu banca en línea. Revisa y corrige cada movimiento.', en: "The Android app logs your purchases from your bank's notifications, without access to your online banking. Review and edit every transaction." } },
  { path: '/escanear-tickets',
    title: { es: `Escanea tus tickets y facturas | ${APP_NAME}`, en: `Scan your receipts and invoices | ${APP_NAME}` },
    description: { es: 'Toma una foto de tu ticket o sube el PDF de tu factura y la app registra el monto, la fecha y el comercio por ti.', en: 'Snap a photo of your receipt or upload your invoice PDF and the app logs the amount, date and merchant for you.' } },
  { path: '/control-de-tarjetas-y-msi',
    title: { es: `Controla tus tarjetas, fechas de corte y MSI | ${APP_NAME}`, en: `Track your credit cards, statement dates and installments | ${APP_NAME}` },
    description: { es: 'Registra tus tarjetas de crédito y lleva el control de fechas de corte, pagos y meses sin intereses mes a mes. No somos un banco: tú registras tus tarjetas.', en: "Log your credit cards and keep track of statement dates, payments and interest-free installments month by month. We're not a bank: you log your own cards." } },
  { path: '/presupuesto-personal-y-familiar',
    title: { es: `Presupuesto personal y familiar | ${APP_NAME}`, en: `Personal and family budgeting | ${APP_NAME}` },
    description: { es: 'Pon presupuestos por categoría, recibe avisos antes de pasarte y comparte con tu familia solo las tarjetas y gastos que elijas.', en: 'Set budgets by category, get alerts before you overspend and share only the cards and expenses you choose with your family.' } },
  { path: '/quienes-somos',
    title: { es: `Quiénes somos | ${APP_NAME}`, en: `About us | ${APP_NAME}` },
    description: { es: 'Mi Control de Finanzas Personales es una app de ALCE-Soft para llevar el control de tus gastos personales, con tus datos privados.', en: 'Mi Control de Finanzas Personales is an app by ALCE-Soft to keep track of your personal expenses, with your data kept private.' } },
  // Páginas existentes: copy.md solo da el title; la description la redactó el desarrollo.
  { path: '/instalar-android',
    title: { es: `Cómo instalar la app en Android | ${APP_NAME}`, en: `How to install the Android app | ${APP_NAME}` },
    description: { es: 'Guía con imágenes para descargar e instalar la app en Android paso a paso, incluida la autorización de orígenes desconocidos.', en: 'Illustrated step-by-step guide to download and install the app on Android, including allowing unknown sources.' } },
  { path: '/privacidad',
    title: { es: `Política de privacidad | ${APP_NAME}`, en: `Privacy policy | ${APP_NAME}` },
    description: { es: 'Qué datos recopila la app, cómo los usamos y qué derechos tienes sobre ellos. Tus datos son solo tuyos.', en: 'What data the app collects, how we use it and what rights you have over it. Your data stays yours.' } },
  { path: '/terminos',
    title: { es: `Términos y condiciones | ${APP_NAME}`, en: `Terms and conditions | ${APP_NAME}` },
    description: { es: 'Términos y condiciones de uso de Mi Control de Finanzas Personales.', en: 'Terms and conditions for using Mi Control de Finanzas Personales.' } },
  { path: '/cookies',
    title: { es: `Política de cookies | ${APP_NAME}`, en: `Cookie policy | ${APP_NAME}` },
    description: { es: 'La app no usa cookies de rastreo ni publicidad; solo guarda en tu navegador lo necesario para funcionar.', en: 'The app uses no tracking or advertising cookies; it only stores in your browser what it needs to work.' } },
]

/** Prefijo de idioma de la URL (/en, /pt…). El español no lleva prefijo. */
const PREFIX_RE = new RegExp(`^/(${LANGUAGES.filter((l) => l.code !== 'es').map((l) => l.code).join('|')})(?=/|$)`)

/** Quita el prefijo de idioma: '/en' → '/', '/pt/x' → '/x'. Lo demás queda igual. */
function stripLang(path: string): string {
  return path.replace(PREFIX_RE, '') || '/'
}

/** Idioma que fija el prefijo de la URL (/en…, /pt…); sin prefijo, español. */
export function langFromPath(pathname: string): Lang {
  return (PREFIX_RE.exec(pathname)?.[1] as Lang | undefined) ?? 'es'
}

/** '/x' ↔ '/en/x' (la landing: '/' ↔ '/en'). Conserva ?query y #hash; es idempotente. */
export function localePath(path: string, lang: Lang): string {
  const i = path.search(/[?#]/)
  const bare = stripLang(i < 0 ? path : path.slice(0, i))
  const rest = i < 0 ? '' : path.slice(i)
  return (lang === 'es' ? bare : bare === '/' ? `/${lang}` : `/${lang}${bare}`) + rest
}

export function absoluteUrl(path: string, lang: Lang): string {
  return SITE_ORIGIN + localePath(path, lang)
}

/** Entrada del registro para una URL (con o sin /en, con o sin "/" final). */
export function findSeoRoute(pathname: string): SeoRoute | undefined {
  const bare = stripLang(pathname)
  const path = bare.length > 1 && bare.endsWith('/') ? bare.slice(0, -1) : bare
  return SEO_ROUTES.find((r) => r.path === path)
}

// es/en vienen de BASE_ROUTES; el resto de idiomas, de seoTranslations.ts (sin el sufijo de marca).
export const SEO_ROUTES: SeoRoute[] = BASE_ROUTES.map((r) => {
  const title = { ...r.title } as Record<Lang, string>
  const description = { ...r.description } as Record<Lang, string>
  for (const { code } of LANGUAGES) {
    if (code === 'es' || code === 'en') continue
    const t = SEO_TRANSLATIONS[code][r.path]
    title[code] = `${t.title} | ${APP_NAME}`
    description[code] = t.description
  }
  return { ...r, title, description }
})
