import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { AmountlessSignalRow } from '@/types/db'

// Avisos de salida SIN monto (p. ej. "¡Enviamos tu transferencia!" de Mercado
// Pago). Los crea ingest-notification; se cierran solos cuando llega el
// correo/SMS con monto del mismo envío, o a mano desde Transacciones.

export function useOpenAmountlessSignals(userId?: string) {
  return useQuery({
    queryKey: ['amountless_signals', userId, 'open'],
    queryFn: async () => {
      if (!userId) return []
      const { data, error } = await supabase
        .from('amountless_signals')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'open')
        .order('occurred_at', { ascending: false })
        .limit(20)
      if (error) throw error
      return (data || []) as AmountlessSignalRow[]
    },
    enabled: !!userId,
  })
}

export function useAmountlessSignal(id?: string | null) {
  return useQuery({
    queryKey: ['amountless_signals', 'one', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('amountless_signals')
        .select('*')
        .eq('id', id!)
        .maybeSingle()
      if (error) throw error
      return (data ?? null) as AmountlessSignalRow | null
    },
    enabled: !!id,
  })
}

// Registrado a mano: se liga a la transacción creada y se le copia la hora
// real del aviso, para que si después llega el correo/SMS con el mismo monto
// se fusione con ella en vez de duplicarla (dedupe de ±10 min).
export function useCompleteAmountlessSignal() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ signal, transactionId }: {
      signal: AmountlessSignalRow
      transactionId: string
    }) => {
      const { error } = await supabase
        .from('amountless_signals')
        .update({
          status: 'completed',
          transaction_id: transactionId,
          completed_at: new Date().toISOString(),
        })
        .eq('id', signal.id)
      if (error) throw error
      await supabase
        .from('transactions')
        .update({ occurred_at: signal.occurred_at })
        .eq('id', transactionId)
        .is('occurred_at', null)
    },
    onSuccess: (_d, input) => {
      queryClient.invalidateQueries({ queryKey: ['amountless_signals'] })
      queryClient.invalidateQueries({ queryKey: ['transactions', input.signal.user_id] })
    },
  })
}

export function useDismissAmountlessSignal() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      const { error } = await supabase
        .from('amountless_signals')
        .update({ status: 'dismissed', completed_at: new Date().toISOString() })
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['amountless_signals'] })
    },
  })
}
