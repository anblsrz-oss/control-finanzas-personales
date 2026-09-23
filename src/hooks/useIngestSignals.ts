import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { IngestSignalRow, NotificationAppCatalogRow } from '@/types/db'

// Últimos avisos procesados por los canales automáticos (para la página de
// captura de notificaciones: "qué llegó y qué se hizo con él").
export function useRecentIngestSignals(userId?: string, source?: IngestSignalRow['source'], limit = 20) {
  return useQuery({
    queryKey: ['ingest_signals', userId, source, limit],
    queryFn: async () => {
      if (!userId) return []
      let q = supabase
        .from('ingest_signals')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit)
      if (source) q = q.eq('source', source)
      const { data, error } = await q
      if (error) throw error
      return (data || []) as IngestSignalRow[]
    },
    enabled: !!userId,
  })
}

// Avisos agrupados por transacción, para "Recibido por: SMS · Notificación".
export function useSignalsByTransaction(userId: string | undefined, txIds: string[]) {
  const key = [...txIds].sort().join(',')
  return useQuery({
    queryKey: ['ingest_signals_by_tx', userId, key],
    queryFn: async () => {
      const map = new Map<string, IngestSignalRow[]>()
      if (!userId || txIds.length === 0) return map
      const { data, error } = await supabase
        .from('ingest_signals')
        .select('*')
        .eq('user_id', userId)
        .in('transaction_id', txIds)
      if (error) throw error
      for (const s of (data || []) as IngestSignalRow[]) {
        if (!s.transaction_id) continue
        const list = map.get(s.transaction_id) ?? []
        list.push(s)
        map.set(s.transaction_id, list)
      }
      return map
    },
    enabled: !!userId && txIds.length > 0,
  })
}

export function useNotificationAppCatalog() {
  return useQuery({
    queryKey: ['notification_app_catalog'],
    queryFn: async () => {
      const { data, error } = await supabase.from('notification_app_catalog').select('*')
      if (error) throw error
      return (data || []) as NotificationAppCatalogRow[]
    },
    staleTime: 60 * 60_000,
  })
}

// "Son distintos": quita la marca de posible duplicado.
export function useDismissPossibleDuplicate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id }: { id: string; userId: string }) => {
      const { error } = await supabase.rpc('dismiss_possible_duplicate', { p_tx_id: id })
      if (error) throw error
    },
    onSuccess: (_data, input) => {
      queryClient.invalidateQueries({ queryKey: ['transactions', input.userId] })
    },
  })
}

// Nombre corto del canal de un aviso: "SMS", "Correo", "Notificación BBVA".
export function signalLabel(s: IngestSignalRow, t: (k: string, o?: Record<string, unknown>) => string): string {
  if (s.source === 'sms') return 'SMS'
  if (s.source === 'email') return t('Correo')
  return t('Notificación {{app}}', { app: s.app_name ?? s.app_package ?? '' }).trim()
}
