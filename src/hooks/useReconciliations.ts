import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type {
  ReconcileBuckets,
  StatementReconciliationRow,
  TransactionRow,
} from '@/types/db'

// Transacciones a comparar contra un estado de cuenta: las que tocan la
// tarjeta o cuenta elegida en el rango del periodo. Para una tarjeta de
// crédito se incluyen también los pagos hechos a su línea (kind
// 'card_payment', que no llevan card_id) para poder casar el abono que
// aparece en el estado de cuenta.
export function useReconcileTransactions(params: {
  userId?: string
  cardId?: string
  accountId?: string
  creditLineId?: string | null
  startDate?: string
  endDate?: string
}) {
  const { userId, cardId, accountId, creditLineId, startDate, endDate } = params
  return useQuery({
    queryKey: [
      'reconcile_transactions',
      userId,
      cardId,
      accountId,
      creditLineId,
      startDate,
      endDate,
    ],
    queryFn: async () => {
      if (!userId || (!cardId && !accountId) || !startDate || !endDate) return []
      const ors: string[] = []
      if (cardId) ors.push(`card_id.eq.${cardId}`)
      if (accountId) {
        ors.push(`account_id.eq.${accountId}`, `to_account_id.eq.${accountId}`)
      }
      if (creditLineId) ors.push(`to_credit_line_id.eq.${creditLineId}`)

      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .is('family_id', null)
        .gte('tx_date', startDate)
        .lte('tx_date', endDate)
        .or(ors.join(','))
        .order('tx_date', { ascending: true })
      if (error) throw error
      return (data || []) as TransactionRow[]
    },
    enabled: !!userId && (!!cardId || !!accountId) && !!startDate && !!endDate,
  })
}

// Historial de conciliaciones de estado de cuenta (snapshots guardados).
export function useReconciliations(userId?: string) {
  return useQuery({
    queryKey: ['statement_reconciliations', userId],
    queryFn: async () => {
      if (!userId) return []
      const { data, error } = await supabase
        .from('statement_reconciliations')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
      if (error) throw error
      return (data || []) as StatementReconciliationRow[]
    },
    enabled: !!userId,
  })
}

export interface SaveReconciliationInput {
  userId: string
  cardId?: string
  accountId?: string
  periodStart: string
  periodEnd: string
  currency: string
  statementTotal: number
  appTotal: number
  buckets: ReconcileBuckets
}

export function useSaveReconciliation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: SaveReconciliationInput) => {
      const { error } = await supabase.from('statement_reconciliations').insert([
        {
          user_id: input.userId,
          card_id: input.cardId ?? null,
          account_id: input.accountId ?? null,
          period_start: input.periodStart,
          period_end: input.periodEnd,
          currency: input.currency,
          statement_total: input.statementTotal,
          app_total: input.appTotal,
          matched_count: input.buckets.matched.length,
          amount_mismatch_count: input.buckets.amountMismatch.length,
          missing_in_app_count: input.buckets.missingInApp.length,
          missing_in_statement_count: input.buckets.missingInStatement.length,
          result: input.buckets,
        },
      ])
      if (error) throw error
    },
    onSuccess: (_data, input) => {
      queryClient.invalidateQueries({
        queryKey: ['statement_reconciliations', input.userId],
      })
      queryClient.invalidateQueries({ queryKey: ['monthly_usage', 'reconcile'] })
    },
  })
}
