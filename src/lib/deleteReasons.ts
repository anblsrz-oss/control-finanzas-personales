// Motivos propios del usuario para las "selecciones rápidas" del cuadro de eliminación:
// salen del historial de eliminadas (cada borrado ya guarda su motivo), así que un motivo
// nuevo aparece solo la próxima vez, en todos sus dispositivos y sin tabla nueva.

const MAX_LEN = 40 // frases largas son notas de un solo uso, no atajos
const AUTO_PREFIX = 'duplicado de otro aviso' // texto que la app prellena sola

const norm = (s: string) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()

/**
 * Motivos distintos del historial (más usados primero; a igual uso, el más reciente), sin los
 * que ya son rápidos por defecto. `deletions` viene ordenado del más reciente al más antiguo.
 */
export function userDeleteReasons(
  deletions: { reason: string | null }[],
  defaults: readonly string[],
  max = 6,
): string[] {
  const known = new Set(defaults.map(norm))
  const seen = new Map<string, { text: string; count: number; first: number }>()
  deletions.forEach((d, i) => {
    const text = (d.reason ?? '').trim()
    const key = norm(text)
    if (!text || text.length > MAX_LEN || known.has(key) || key.startsWith(AUTO_PREFIX)) return
    const prev = seen.get(key)
    if (prev) prev.count++
    else seen.set(key, { text, count: 1, first: i })
  })
  return [...seen.values()]
    .sort((a, b) => b.count - a.count || a.first - b.first)
    .slice(0, max)
    .map((r) => r.text)
}
