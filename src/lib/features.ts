// Registro único de funciones configurables por el admin (premium sí/no y
// límite del plan gratis). El editor "Planes y límites" del admin y
// useEntitlements() se construyen a partir de esta lista.
//
// REGLA: toda función nueva de la app debe sumar su entrada aquí (además de su
// paso en onboarding/tourSteps.ts si es una página). Las funciones nuevas usan
// `flag` (se guardan en app_config.feature_flags, sin migración); las antiguas
// conservan sus columnas `*_is_premium` / `free_max_*`.

import type { AppConfigRow } from '@/types/db'

type LegacyPremiumColumn =
  | 'family_is_premium'
  | 'yields_is_premium'
  | 'installments_is_premium'
  | 'reports_filters_is_premium'
  | 'dashboard_period_filter_is_premium'
  | 'transactions_period_filter_is_premium'
  | 'reconcile_is_premium'
  | 'budgets_is_premium'

type LegacyLimitColumn =
  | 'free_max_accounts'
  | 'free_max_cards'
  | 'free_max_transactions'
  | 'free_max_budgets'

export type FeatureGroup = 'accounts' | 'capture' | 'analysis' | 'other'

export const FEATURE_GROUP_LABELS: Record<FeatureGroup, string> = {
  accounts: 'Cuentas y crédito',
  capture: 'Captura de movimientos',
  analysis: 'Análisis',
  other: 'Otros',
}

export interface FeatureDef {
  key: string
  label: string
  group: FeatureGroup
  // null = la función no se puede marcar premium (solo tiene límite).
  premium: { column: LegacyPremiumColumn } | { flag: true } | null
  limit?: { kind: 'count' | 'monthly'; column?: LegacyLimitColumn }
}

export const FEATURES = [
  // Cuentas y crédito
  { key: 'accounts', label: 'Cuentas', group: 'accounts', premium: null, limit: { kind: 'count', column: 'free_max_accounts' } },
  { key: 'pockets', label: 'Apartados (cajitas)', group: 'accounts', premium: { flag: true }, limit: { kind: 'count' } },
  { key: 'cards', label: 'Tarjetas', group: 'accounts', premium: null, limit: { kind: 'count', column: 'free_max_cards' } },
  { key: 'credit_lines', label: 'Líneas de crédito', group: 'accounts', premium: { flag: true }, limit: { kind: 'count' } },
  { key: 'installments', label: 'Meses sin intereses / diferido', group: 'accounts', premium: { column: 'installments_is_premium' } },
  { key: 'multicurrency', label: 'Cuentas en otras monedas', group: 'accounts', premium: { flag: true } },
  { key: 'yields', label: 'Rendimientos', group: 'accounts', premium: { column: 'yields_is_premium' } },
  { key: 'family', label: 'Plan familiar', group: 'accounts', premium: { column: 'family_is_premium' } },

  // Captura de movimientos
  { key: 'transactions', label: 'Transacciones', group: 'capture', premium: null, limit: { kind: 'count', column: 'free_max_transactions' } },
  { key: 'transaction_lines', label: 'Subpartidas', group: 'capture', premium: { flag: true } },
  { key: 'import', label: 'Importar estados de cuenta', group: 'capture', premium: { flag: true }, limit: { kind: 'monthly' } },
  { key: 'receipts', label: 'Escanear recibo', group: 'capture', premium: { flag: true }, limit: { kind: 'monthly' } },
  { key: 'email_sync', label: 'Sincronizar correo', group: 'capture', premium: { flag: true } },
  { key: 'sms_sync', label: 'Sincronizar SMS', group: 'capture', premium: { flag: true } },
  { key: 'notification_capture', label: 'Captura por notificaciones', group: 'capture', premium: { flag: true } },
  { key: 'subscriptions', label: 'Suscripciones', group: 'capture', premium: { flag: true }, limit: { kind: 'count' } },
  { key: 'subscriptions_auto', label: 'Cobro automático de suscripciones', group: 'capture', premium: { flag: true } },
  { key: 'categories_custom', label: 'Categorías propias', group: 'capture', premium: null, limit: { kind: 'count' } },

  // Análisis
  { key: 'budgets', label: 'Presupuestos', group: 'analysis', premium: { column: 'budgets_is_premium' }, limit: { kind: 'count', column: 'free_max_budgets' } },
  { key: 'reconcile', label: 'Conciliación con estados de cuenta', group: 'analysis', premium: { column: 'reconcile_is_premium' }, limit: { kind: 'monthly' } },
  { key: 'reports_filters', label: 'Filtros de reportes', group: 'analysis', premium: { column: 'reports_filters_is_premium' } },
  { key: 'dashboard_period_filter', label: 'Selector de periodo en Resumen', group: 'analysis', premium: { column: 'dashboard_period_filter_is_premium' } },
  { key: 'transactions_period_filter', label: 'Selector de periodo en Movimientos', group: 'analysis', premium: { column: 'transactions_period_filter_is_premium' } },
  { key: 'excel_export', label: 'Exportar a Excel', group: 'analysis', premium: { flag: true } },

  // Otros
  { key: 'calendar_reminders', label: 'Recordatorios en Google Calendar', group: 'other', premium: { flag: true } },
] as const satisfies readonly FeatureDef[]

export type FeatureKey = (typeof FEATURES)[number]['key']

export interface FeatureFlag {
  premium?: boolean
  free_limit?: number
}

export type FeatureFlags = Partial<Record<string, FeatureFlag>>

function getDef(key: FeatureKey): FeatureDef {
  return FEATURES.find((f) => f.key === key) as FeatureDef
}

/** ¿La función está marcada como premium en la config? */
export function isFeaturePremium(config: AppConfigRow, key: FeatureKey): boolean {
  const def = getDef(key)
  if (!def.premium) return false
  if ('column' in def.premium) return !!config[def.premium.column]
  return !!config.feature_flags?.[key]?.premium
}

/** Límite del plan gratis tal como está guardado (0 = ilimitado). */
export function getFreeLimit(config: AppConfigRow, key: FeatureKey): number {
  const def = getDef(key)
  if (!def.limit) return 0
  if (def.limit.column) return config[def.limit.column] ?? 0
  return config.feature_flags?.[key]?.free_limit ?? 0
}

/**
 * Construye el patch de app_config a partir de los valores editados en el
 * admin: las funciones antiguas van a su columna, las nuevas a feature_flags.
 */
export function buildFeaturePatch(
  config: AppConfigRow,
  values: Record<string, { premium: boolean; limit: number }>,
): Partial<AppConfigRow> {
  const patch: Record<string, unknown> = {}
  const flags: FeatureFlags = { ...(config.feature_flags ?? {}) }
  for (const f of FEATURES as readonly FeatureDef[]) {
    const v = values[f.key]
    if (!v) continue
    const flag: FeatureFlag = { ...(flags[f.key] ?? {}) }
    if (f.premium) {
      if ('column' in f.premium) patch[f.premium.column] = v.premium
      else flag.premium = v.premium
    }
    if (f.limit) {
      if (f.limit.column) patch[f.limit.column] = v.limit
      else flag.free_limit = v.limit
    }
    if (Object.keys(flag).length > 0) flags[f.key] = flag
  }
  patch.feature_flags = flags
  return patch as Partial<AppConfigRow>
}
