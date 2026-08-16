import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { todayISO } from '@/lib/dates'
import type { CardPaymentAlertRow } from '@/types/db'

// Registra los avisos de pago de tarjeta/MSI próximos a vencer (RPC
// record_card_payment_alerts, ver migración 0051). Mismo patrón que
// useRecordSubscriptionAlerts.
export function useRecordCardPaymentAlerts() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (_input: { userId: string }) => {
      const { data, error } = await supabase.rpc('record_card_payment_alerts', {
        p_today: todayISO(),
      })
      if (error) throw error
      return (data || []) as CardPaymentAlertRow[]
    },
    onSuccess: (data, input) => {
      if (data.length > 0) {
        queryClient.invalidateQueries({ queryKey: ['card_payment_alerts', input.userId] })
        queryClient.invalidateQueries({
          queryKey: ['card_payment_alerts_unread_count', input.userId],
        })
      }
    },
  })
}

export interface CardPaymentAlertWithLabel extends CardPaymentAlertRow {
  card: { name: string } | null
  credit_line: { name: string } | null
  installment_plan: { description: string | null } | null
}

export function useUnreadCardPaymentAlerts(userId?: string) {
  return useQuery({
    queryKey: ['card_payment_alerts', userId],
    queryFn: async () => {
      if (!userId) return []
      const { data, error } = await supabase
        .from('card_payment_alerts')
        .select(
          '*, card:cards(name), credit_line:credit_lines(name), installment_plan:installment_plans(description)',
        )
        .eq('user_id', userId)
        .is('read_at', null)
        .order('due_date', { ascending: true })
      if (error) throw error
      return (data || []) as CardPaymentAlertWithLabel[]
    },
    enabled: !!userId,
  })
}

export function useUnreadCardPaymentAlertsCount(userId?: string) {
  return useQuery({
    queryKey: ['card_payment_alerts_unread_count', userId],
    queryFn: async () => {
      if (!userId) return 0
      const { count, error } = await supabase
        .from('card_payment_alerts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .is('read_at', null)
      if (error) throw error
      return count ?? 0
    },
    enabled: !!userId,
    refetchOnWindowFocus: true,
    refetchInterval: 60_000,
  })
}

export function useMarkCardPaymentAlertRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: { id?: string; userId: string }) => {
      let query = supabase
        .from('card_payment_alerts')
        .update({ read_at: new Date().toISOString() })
        .eq('user_id', input.userId)
        .is('read_at', null)
      if (input.id) query = query.eq('id', input.id)
      const { error } = await query
      if (error) throw error
    },
    onSuccess: (_data, input) => {
      queryClient.invalidateQueries({ queryKey: ['card_payment_alerts', input.userId] })
      queryClient.invalidateQueries({
        queryKey: ['card_payment_alerts_unread_count', input.userId],
      })
    },
  })
}
