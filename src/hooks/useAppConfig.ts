import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/store/useAuth'
import type { AppConfigRow } from '@/types/db'
import { getFreeLimit, isFeaturePremium, type FeatureKey } from '@/lib/features'

// Valores por defecto (todo gratis) mientras carga o si no hay fila.
const DEFAULT_CONFIG: AppConfigRow = {
  id: true,
  free_max_accounts: 0,
  free_max_cards: 0,
  free_max_transactions: 0,
  free_max_budgets: 0,
  family_is_premium: false,
  budgets_is_premium: false,
  yields_is_premium: false,
  installments_is_premium: false,
  reports_filters_is_premium: false,
  dashboard_period_filter_is_premium: false,
  transactions_period_filter_is_premium: false,
  reconcile_is_premium: false,
  theme_colors: null,
  app_title: null,
  logo_url: null,
  page_order: null,
  feature_flags: {},
  hidden_pages: [],
  updated_at: '',
}

export function useAppConfig() {
  return useQuery({
    queryKey: ['app_config'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('app_config')
        .select('*')
        .maybeSingle()
      if (error) throw error
      return (data as AppConfigRow | null) ?? DEFAULT_CONFIG
    },
    staleTime: 1000 * 60 * 5,
  })
}

export function useUpdateAppConfig() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (patch: Partial<Omit<AppConfigRow, 'id' | 'updated_at'>>) => {
      const { error } = await supabase
        .from('app_config')
        .update({ ...patch, updated_at: new Date().toISOString() })
        .eq('id', true)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['app_config'] })
    },
  })
}

// 0 = ilimitado -> Infinity para comparar límites cómodamente.
function asLimit(n: number): number {
  return n && n > 0 ? n : Infinity
}

// Derechos del usuario: combina la config con su estado premium. Una feature
// está bloqueada solo si está marcada como premium Y el usuario no es premium.
export function useEntitlements() {
  const { profile } = useAuth()
  const { data: config = DEFAULT_CONFIG } = useAppConfig()
  const isPremium = !!profile?.is_premium
  // Genéricos sobre el registro lib/features.ts: bloqueada solo si está
  // marcada premium y el usuario no lo es; límite Infinity si es premium o 0.
  const canUse = (key: FeatureKey) => isPremium || !isFeaturePremium(config, key)
  const limitFor = (key: FeatureKey) => (isPremium ? Infinity : asLimit(getFreeLimit(config, key)))
  return {
    config,
    isPremium,
    canUse,
    limitFor,
    accountLimit: limitFor('accounts'),
    cardLimit: limitFor('cards'),
    transactionLimit: limitFor('transactions'),
    budgetLimit: limitFor('budgets'),
    canUseFamily: canUse('family'),
    canUseBudgets: canUse('budgets'),
    canUseYields: canUse('yields'),
    canUseInstallments: canUse('installments'),
    canUseReportsFilters: canUse('reports_filters'),
    canUseDashboardPeriodFilter: canUse('dashboard_period_filter'),
    canUseTransactionsPeriodFilter: canUse('transactions_period_filter'),
    canUseReconcile: canUse('reconcile'),
  }
}

// Uso del mes en curso de las funciones con límite mensual.
const MONTHLY_SOURCES: Record<'import' | 'receipts' | 'reconcile', { table: string; source?: string }> = {
  import: { table: 'statement_imports' },
  receipts: { table: 'transactions', source: 'receipt' },
  reconcile: { table: 'statement_reconciliations' },
}

export function useMonthlyUsage(key: keyof typeof MONTHLY_SOURCES, enabled = true) {
  const { session } = useAuth()
  const userId = session?.user?.id
  return useQuery({
    queryKey: ['monthly_usage', key, userId],
    enabled: !!userId && enabled,
    queryFn: async () => {
      const now = new Date()
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
      const { table, source } = MONTHLY_SOURCES[key]
      let q = supabase
        .from(table)
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId!)
        .gte('created_at', monthStart)
      if (source) q = q.eq('source', source)
      const { count, error } = await q
      if (error) throw error
      return count ?? 0
    },
  })
}

/** ¿El usuario ya llegó al límite mensual del plan gratis para esta función? */
export function useMonthlyLimit(key: keyof typeof MONTHLY_SOURCES) {
  const { limitFor } = useEntitlements()
  const limit = limitFor(key)
  // Sin límite no hace falta contar.
  const { data: used = 0 } = useMonthlyUsage(key, limit !== Infinity)
  return { limit, used, reached: used >= limit }
}
