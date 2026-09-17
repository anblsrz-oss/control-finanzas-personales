import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useCreateTransaction, useUpdateTransaction, useDeleteTransaction } from '@/hooks/useTransactions'
import {
  parseLocalDate,
  lastDayOfMonth,
  monthStartISO,
  todayISO,
  toISODate,
  formatMonthLabel,
} from '@/lib/dates'

export interface YieldRecord {
  id: string
  user_id: string
  account_id: string
  period_month: string
  expected_growth: number | null
  actual_growth: number | null
  verified: boolean
  transaction_id: string | null
  created_at: string
}

export function useYieldRecords(userId?: string, accountId?: string) {
  return useQuery({
    queryKey: ['yield_records', userId, accountId],
    queryFn: async () => {
      if (!userId) return []

      let query = supabase
        .from('yield_records')
        .select('*')
        .eq('user_id', userId)

      if (accountId) {
        query = query.eq('account_id', accountId)
      }

      const { data, error } = await query.order('period_month', {
        ascending: false,
      })
      if (error) throw error
      return (data || []) as YieldRecord[]
    },
    enabled: !!userId,
  })
}

export function useDeleteYield() {
  const queryClient = useQueryClient()
  const deleteTx = useDeleteTransaction()
  return useMutation({
    mutationFn: async ({ id, userId }: { id: string; userId: string }) => {
      const { data: existing } = await supabase
        .from('yield_records')
        .select('transaction_id')
        .eq('id', id)
        .maybeSingle()

      if (existing?.transaction_id) {
        await deleteTx.mutateAsync({
          id: existing.transaction_id,
          userId,
          reason: 'Rendimiento eliminado',
        })
      }

      const { error } = await supabase
        .from('yield_records')
        .delete()
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: (_data, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ['yield_records', userId] })
      queryClient.invalidateQueries({ queryKey: ['account_balances', userId] })
      queryClient.invalidateQueries({ queryKey: ['transactions', userId] })
    },
  })
}

// La fecha de la transacción de rendimiento: si el mes elegido es el mes en
// curso, hoy (el interés todavía se está devengando); si es un mes pasado,
// su último día (cuando de verdad se abonó).
function yieldTransactionDate(periodMonth: string): string {
  if (periodMonth === monthStartISO()) return todayISO()
  const ref = parseLocalDate(periodMonth)
  const day = lastDayOfMonth(ref.getFullYear(), ref.getMonth())
  return toISODate(new Date(ref.getFullYear(), ref.getMonth(), day))
}

const YIELD_CATEGORY_NAME = 'Rendimientos'

export function useCreateOrUpdateYield() {
  const queryClient = useQueryClient()
  const createTx = useCreateTransaction()
  const updateTx = useUpdateTransaction()

  return useMutation({
    mutationFn: async (input: {
      userId: string
      accountId: string
      accountCurrency: string
      periodMonth: string
      expectedGrowth?: number
      actualGrowth?: number
      verified?: boolean
    }) => {
      // Verificar si ya existe el registro para este mes
      const { data: existing } = await supabase
        .from('yield_records')
        .select('id, transaction_id')
        .eq('account_id', input.accountId)
        .eq('period_month', input.periodMonth)
        .maybeSingle()

      let transactionId: string | null = existing?.transaction_id ?? null

      // Al verificar, además de guardar la comparación, se contabiliza de
      // verdad: se crea o actualiza una transacción de ingreso ligada a este
      // registro, con la categoría de sistema "Rendimientos".
      if (input.verified && input.actualGrowth != null) {
        const { data: category } = await supabase
          .from('categories')
          .select('id')
          .eq('is_system', true)
          .eq('name', YIELD_CATEGORY_NAME)
          .maybeSingle()

        const txDate = yieldTransactionDate(input.periodMonth)
        const concept = `${YIELD_CATEGORY_NAME} — ${formatMonthLabel(input.periodMonth)}`

        if (transactionId) {
          await updateTx.mutateAsync({
            id: transactionId,
            userId: input.userId,
            kind: 'income',
            amount: input.actualGrowth,
            currency: input.accountCurrency,
            concept,
            categoryId: category?.id ?? null,
            accountId: input.accountId,
            txDate,
          })
        } else {
          const created = await createTx.mutateAsync({
            userId: input.userId,
            kind: 'income',
            amount: input.actualGrowth,
            currency: input.accountCurrency,
            concept,
            categoryId: category?.id,
            accountId: input.accountId,
            txDate,
            source: 'yield',
          })
          transactionId = created.id
        }
      }

      if (existing) {
        // Actualizar
        const { data, error } = await supabase
          .from('yield_records')
          .update({
            expected_growth: input.expectedGrowth,
            actual_growth: input.actualGrowth,
            verified: input.verified,
            transaction_id: transactionId,
          })
          .eq('id', existing.id)
          .select()
          .single()
        if (error) throw error
        return data
      } else {
        // Crear nuevo
        const { data, error } = await supabase
          .from('yield_records')
          .insert([
            {
              user_id: input.userId,
              account_id: input.accountId,
              period_month: input.periodMonth,
              expected_growth: input.expectedGrowth,
              actual_growth: input.actualGrowth,
              verified: input.verified,
              transaction_id: transactionId,
            },
          ])
          .select()
          .single()
        if (error) throw error
        return data
      }
    },
    onSuccess: (_data, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ['yield_records', userId] })
      queryClient.invalidateQueries({ queryKey: ['account_balances', userId] })
      queryClient.invalidateQueries({ queryKey: ['transactions', userId] })
      queryClient.invalidateQueries({ queryKey: ['transactions_summary', userId] })
      queryClient.invalidateQueries({ queryKey: ['category_totals', userId] })
    },
  })
}
