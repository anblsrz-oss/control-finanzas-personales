// Etiquetas y colores de los presupuestos. Aquí NO se recalcula nada: el
// consumo, el porcentaje y el semáforo los devuelve budget_status_at() en
// servidor, porque el correo y el push (fases siguientes) corren sin React y
// deben dar exactamente el mismo número que la app.

import { parseLocalDate } from '@/lib/dates'
import { activeLocale } from '@/i18n'
import type { BudgetPeriod, BudgetStatus } from '@/types/db'

export const BUDGET_PERIODS: BudgetPeriod[] = ['daily', 'weekly', 'biweekly', 'monthly']

// Claves naturales en español, como el resto del proyecto.
export const BUDGET_PERIOD_LABELS: Record<BudgetPeriod, string> = {
  daily: 'Diario',
  weekly: 'Semanal',
  biweekly: 'Quincenal',
  monthly: 'Mensual',
}

// Cómo se delimita cada periodo, para explicarlo en el formulario.
export const BUDGET_PERIOD_HINTS: Record<BudgetPeriod, string> = {
  daily: 'Se reinicia cada día.',
  weekly: 'De lunes a domingo.',
  biweekly: 'Del 1 al 15 y del 16 a fin de mes.',
  monthly: 'Del día 1 a fin de mes.',
}

// Semáforo. Los mismos hex que usa CHART_META.budget para que la barra de la
// gráfica y el punto de la lista no se despeguen nunca.
export const BUDGET_STATUS_COLORS: Record<BudgetStatus, string> = {
  ok: '#16a34a',
  warn: '#f59e0b',
  over: '#ef4444',
}

export const GENERAL_BUDGET_LABEL = 'General (todas las categorías)'
export const GENERAL_BUDGET_ICON = '🎯'

/** Umbral por defecto si el perfil aún no cargó. Igual al default del SQL. */
export const DEFAULT_ALERT_THRESHOLD = 80

/**
 * Rango del periodo en texto corto. Ej: "1–31 ago" o "5 ago" si es de un día.
 * Las fechas vienen de columnas `date`, así que van por parseLocalDate para
 * no correrse un día en México.
 */
export function budgetRangeLabel(start: string, end: string): string {
  const a = parseLocalDate(start)
  const b = parseLocalDate(end)
  const locale = activeLocale()
  if (start === end) {
    return a.toLocaleDateString(locale, { day: 'numeric', month: 'short' })
  }
  const sameMonth = a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear()
  const from = sameMonth
    ? a.toLocaleDateString(locale, { day: 'numeric' })
    : a.toLocaleDateString(locale, { day: 'numeric', month: 'short' })
  const to = b.toLocaleDateString(locale, { day: 'numeric', month: 'short' })
  return `${from}–${to}`
}

/** Porcentaje listo para pintar. percent es null solo si amount fuera 0. */
export function budgetPercent(percent: number | null): number {
  return percent ?? 0
}
