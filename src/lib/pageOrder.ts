// Metadata y orden de las páginas reordenables por el admin (sidebar de
// escritorio, hoja "Más" en móvil y pasos del tutorial guiado). Fuente
// única para que los tres no se desincronicen. /admin queda fuera: solo es
// visible para admins y siempre va al final, no es reordenable.

import { isPlayBuild, PLAY_HIDDEN_PAGES } from '@/lib/distribution'

export interface PageNavItem {
  to: string
  label: string
  icon: string
}

const ALL_PAGE_NAV_ITEMS: PageNavItem[] = [
  { to: '/', label: 'Resumen', icon: '📊' },
  { to: '/cuentas', label: 'Cuentas', icon: '🏦' },
  { to: '/tarjetas', label: 'Tarjetas', icon: '💳' },
  { to: '/lineas-credito', label: 'Líneas de crédito', icon: '💠' },
  { to: '/transacciones', label: 'Transacciones', icon: '💸' },
  { to: '/presupuestos', label: 'Presupuestos', icon: '🎯' },
  { to: '/suscripciones', label: 'Suscripciones', icon: '🔁' },
  { to: '/importar', label: 'Importar', icon: '📥' },
  { to: '/recibos', label: 'Escanear recibo', icon: '🧾' },
  { to: '/conciliacion', label: 'Conciliación', icon: '🧮' },
  { to: '/familia', label: 'Familia', icon: '👨‍👩‍👧‍👦' },
  { to: '/correo', label: 'Sincronizar correo', icon: '📧' },
  { to: '/sms', label: 'Sincronizar SMS', icon: '📱' },
  { to: '/captura-notificaciones', label: 'Captura por notificaciones', icon: '🔔' },
  { to: '/categorias', label: 'Categorías', icon: '🏷️' },
  { to: '/rendimientos', label: 'Rendimientos', icon: '📈' },
  { to: '/reportes', label: 'Reportes', icon: '📑' },
  { to: '/ayuda', label: 'Preguntas frecuentes', icon: '❓' },
  { to: '/configuracion', label: 'Configuración', icon: '⚙️' },
]

/** ¿La página no existe en este build? (p. ej. /sms en Google Play). Aplica también a admins. */
export function isPageUnavailable(to: string): boolean {
  return isPlayBuild() && PLAY_HIDDEN_PAGES.includes(to)
}

export const PAGE_NAV_ITEMS: PageNavItem[] = ALL_PAGE_NAV_ITEMS.filter(
  (item) => !isPageUnavailable(item.to),
)

export const PAGE_IDS: string[] = PAGE_NAV_ITEMS.map((item) => item.to)

// Páginas que el admin no puede ocultar (la app no tendría a dónde volver).
export const UNHIDEABLE_PAGES = ['/', '/configuracion']

/** ¿La ruta está oculta por el admin (appConfig.hidden_pages) o no existe en este build? */
export function isPageHidden(to: string, hidden: string[] | null | undefined): boolean {
  if (isPageUnavailable(to)) return true
  if (!hidden || UNHIDEABLE_PAGES.includes(to)) return false
  return hidden.includes(to)
}

/**
 * Reordena `items` según `order` (array de rutas, típicamente
 * appConfig.page_order). Sin `order` (null/vacío) devuelve `items` tal
 * cual. Cualquier `to` ausente de `order` cae al final, conservando su
 * orden relativo original (sort estable) — cubre páginas nuevas agregadas
 * después de que el admin guardó su orden.
 */
export function orderByPageOrder<T extends { to: string }>(
  items: T[],
  order: string[] | null | undefined,
): T[] {
  if (!order || order.length === 0) return items
  const rank = new Map(order.map((to, i) => [to, i]))
  return [...items].sort((a, b) => {
    const ra = rank.has(a.to) ? rank.get(a.to)! : Infinity
    const rb = rank.has(b.to) ? rank.get(b.to)! : Infinity
    return ra - rb
  })
}
