import { useEffect } from 'react'
import { absoluteUrl, type Lang } from '@/lib/seoRoutes'

// React 18 no tiene tags de <head> nativos: se escriben a mano. Todo es idempotente
// (se busca la etiqueta por selector y se actualiza; si no aplica, se quita), así que
// sirve igual con las etiquetas por defecto de index.html que con las ya creadas.

export interface PageMeta {
  title: string
  description?: string
  lang: Lang
  /** Ruta pública sin prefijo de idioma (ej. '/privacidad'): activa canonical, hreflang y og:url. */
  path?: string
  noindex?: boolean
  jsonLd?: object
}

function setTag(tag: 'meta' | 'link', selector: string, attrs: Record<string, string> | null) {
  let el = document.head.querySelector(selector)
  if (!attrs) {
    el?.remove()
    return
  }
  if (!el) {
    el = document.createElement(tag)
    document.head.appendChild(el)
  }
  for (const [k, v] of Object.entries(attrs)) if (el.getAttribute(k) !== v) el.setAttribute(k, v)
}

/** Etiqueta <meta>/<link> de la página; attrs null = no aplica (en el navegador se quita). */
export interface HeadTag {
  tag: 'meta' | 'link'
  selector: string
  attrs: Record<string, string> | null
}

const nameMeta = (name: string, content?: string): HeadTag => ({
  tag: 'meta',
  selector: `meta[name="${name}"]`,
  attrs: content ? { name, content } : null,
})
const ogMeta = (property: string, content?: string): HeadTag => ({
  tag: 'meta',
  selector: `meta[property="${property}"]`,
  attrs: content ? { property, content } : null,
})

/** Todas las etiquetas <meta>/<link> de la página. Pura: la usa también el prerender (scripts/prerender.mjs). */
export function headTags({ title, description, lang, path, noindex }: PageMeta): HeadTag[] {
  return [
    nameMeta('description', description),
    nameMeta('robots', noindex ? 'noindex' : 'index, follow'),
    {
      tag: 'link',
      selector: 'link[rel="canonical"]',
      attrs: path ? { rel: 'canonical', href: absoluteUrl(path, lang) } : null,
    },
    ...(['es', 'en', 'x-default'] as const).map((l): HeadTag => ({
      tag: 'link',
      selector: `link[rel="alternate"][hreflang="${l}"]`,
      attrs: path ? { rel: 'alternate', hreflang: l, href: absoluteUrl(path, l === 'en' ? 'en' : 'es') } : null,
    })),
    ogMeta('og:title', title),
    ogMeta('og:description', description),
    ogMeta('og:type', 'website'),
    ogMeta('og:url', path ? absoluteUrl(path, lang) : undefined),
    ogMeta('og:locale', lang === 'en' ? 'en_US' : 'es_MX'),
  ]
}

function applyMeta(meta: PageMeta) {
  const { title, lang, jsonLd } = meta
  document.title = title
  document.documentElement.lang = lang
  for (const t of headTags(meta)) setTag(t.tag, t.selector, t.attrs)

  const ld = document.head.querySelector('script[type="application/ld+json"]')
  if (!jsonLd) {
    ld?.remove()
  } else {
    const el = ld ?? Object.assign(document.createElement('script'), { type: 'application/ld+json' })
    const text = JSON.stringify(jsonLd)
    if (el.textContent !== text) el.textContent = text
    if (!ld) document.head.appendChild(el)
  }
}

/**
 * Fija title, description, canonical, hreflang, Open Graph, robots y JSON-LD de la página.
 * Sin deps a propósito: corre en cada render, de modo que, si dos componentes lo llaman
 * (RouteMeta y una página hija), gana el que se renderiza después (p. ej. NotFoundPage).
 */
export function usePageMeta(meta: PageMeta) {
  useEffect(() => {
    applyMeta(meta)
  })
}
