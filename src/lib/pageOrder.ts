// Metadata y orden de las páginas reordenables por el admin (sidebar de
// escritorio, hoja "Más" en móvil y pasos del tutorial guiado). Fuente
// única para que los tres no se desincronicen. /admin queda fuera: solo es
// visible para admins y siempre va al final, no es reordenable.

export interface PageNavItem {
  to: string
  label: string
  icon: string
}

export const PAGE_NAV_ITEMS: PageNavItem[] = [
  { to: '/', label: 'Resumen', icon: '📊' },
  { to: '/cuentas', label: 'Cuentas', icon: '🏦' },
  { to: '/tarjetas', label: 'Tarjetas', icon: '💳' },
  { to: '/lineas-credito', label: 'Líneas de crédito', icon: '💠' },
  { to: '/transacciones', label: 'Transacciones', icon: '💸' },
  { to: '/presupuestos', label: 'Presupuestos', icon: '🎯' },
  { to: '/suscripciones', label: 'Suscripciones', icon: '🔁' },
  { to: '/importar', label: 'Importar', icon: '📥' },
  { to: '/recibos', label: 'Escanear recibo', icon: '🧾' },
  { to: '/familia', label: 'Familia', icon: '👨‍👩‍👧‍👦' },
  { to: '/correo', label: 'Sincronizar correo', icon: '📧' },
  { to: '/sms', label: 'Sincronizar SMS', icon: '📱' },
  { to: '/conectar', label: 'Conexión automática', icon: '🔗' },
  { to: '/categorias', label: 'Categorías', icon: '🏷️' },
  { to: '/rendimientos', label: 'Rendimientos', icon: '📈' },
  { to: '/reportes', label: 'Reportes', icon: '📑' },
  { to: '/configuracion', label: 'Configuración', icon: '⚙️' },
]

export const PAGE_IDS: string[] = PAGE_NAV_ITEMS.map((item) => item.to)

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
