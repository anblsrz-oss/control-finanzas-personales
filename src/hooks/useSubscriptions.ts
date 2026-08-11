import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { todayISO } from '@/lib/dates'
import type {
  SubscriptionRow,
  SubscriptionAlertRow,
  SubscriptionBillingCycle,
  SubscriptionStatus,
} from '@/types/db'

// Todas las suscripciones del usuario (sugeridas, activas, pausadas,
// canceladas, ignoradas). La página las agrupa por status; un solo fetch
// evita cuatro queries por sección.
export function useSubscriptions(userId?: string) {
  return useQuery({
    queryKey: ['subscriptions', userId],
    queryFn: async () => {
      if (!userId) return []
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
      if (error) throw error
      return (data || []) as SubscriptionRow[]
    },
    enabled: !!userId,
  })
}

export function useCreateSubscription() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: {
      userId: string
      name: string
      merchantKey: string
      icon?: string | null
      amount: number
      currency: string
      billingCycle: SubscriptionBillingCycle
      nextChargeDate?: string | null
      cardId?: string | null
      accountId?: string | null
      categoryId?: string | null
    }) => {
      const { data, error } = await supabase
        .from('subscriptions')
        .insert([
          {
            user_id: input.userId,
            name: input.name,
            merchant_key: input.merchantKey,
            icon: input.icon ?? null,
            amount: input.amount,
            currency: input.currency,
            billing_cycle: input.billingCycle,
            next_charge_date: input.nextChargeDate ?? null,
            card_id: input.cardId ?? null,
            account_id: input.cardId ? null : (input.accountId ?? null),
            category_id: input.categoryId ?? null,
            status: 'active',
            detection_source: 'manual',
            confirmed_at: new Date().toISOString(),
          },
        ])
        .select()
        .single()
      if (error) throw error
      return data as SubscriptionRow
    },
    onSuccess: (_data, input) => invalidateSubscriptions(queryClient, input.userId),
  })
}

export function useUpdateSubscription() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: {
      id: string
      userId: string
      name?: string
      amount?: number
      currency?: string
      billingCycle?: SubscriptionBillingCycle
      nextChargeDate?: string | null
      cardId?: string | null
      accountId?: string | null
      categoryId?: string | null
      status?: SubscriptionStatus
    }) => {
      const updates: Record<string, any> = {}
      if (input.name !== undefined) updates.name = input.name
      if (input.amount !== undefined) updates.amount = input.amount
      if (input.currency !== undefined) updates.currency = input.currency
      if (input.billingCycle !== undefined) updates.billing_cycle = input.billingCycle
      if (input.nextChargeDate !== undefined) updates.next_charge_date = input.nextChargeDate
      if (input.cardId !== undefined) {
        updates.card_id = input.cardId
        if (input.cardId) updates.account_id = null
      }
      if (input.accountId !== undefined && !input.cardId) updates.account_id = input.accountId
      if (input.categoryId !== undefined) updates.category_id = input.categoryId
      if (input.status !== undefined) updates.status = input.status

      const { error } = await supabase.from('subscriptions').update(updates).eq('id', input.id)
      if (error) throw error
    },
    onSuccess: (_data, input) => invalidateSubscriptions(queryClient, input.userId),
  })
}

// Confirmar una sugerencia: pasa a 'active' y congela confirmed_at.
export function useConfirmSubscription() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: { id: string; userId: string }) => {
      const { error } = await supabase
        .from('subscriptions')
        .update({ status: 'active', confirmed_at: new Date().toISOString() })
        .eq('id', input.id)
      if (error) throw error
    },
    onSuccess: (_data, input) => invalidateSubscriptions(queryClient, input.userId),
  })
}

// Descartar una sugerencia ("no es suscripción"): 'ignored' es DEFINITIVO —
// el índice de dedupe en servidor sigue bloqueando ese comercio+tarjeta/cuenta,
// así que nunca se vuelve a sugerir (a diferencia de cancelar una activa).
export function useDismissSuggestedSubscription() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: { id: string; userId: string }) => {
      const { error } = await supabase
        .from('subscriptions')
        .update({ status: 'ignored' })
        .eq('id', input.id)
      if (error) throw error
    },
    onSuccess: (_data, input) => invalidateSubscriptions(queryClient, input.userId),
  })
}

export function useDeleteSubscription() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id }: { id: string; userId: string }) => {
      const { error } = await supabase.from('subscriptions').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: (_data, input) => invalidateSubscriptions(queryClient, input.userId),
  })
}

// Detector genérico (comercios fuera del catálogo conocido). Bajo demanda
// desde el botón "Buscar más suscripciones" — nunca se dispara solo.
export function useDetectSubscriptions() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (_input: { userId: string }) => {
      const { data, error } = await supabase.rpc('detect_recurring_subscriptions', {
        p_today: todayISO(),
      })
      if (error) throw error
      return (data || []) as SubscriptionRow[]
    },
    onSuccess: (data, input) => {
      if (data.length > 0) invalidateSubscriptions(queryClient, input.userId)
    },
  })
}

// Avisos ------------------------------------------------------------------

export function useRecordSubscriptionAlerts() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (_input: { userId: string }) => {
      const { data, error } = await supabase.rpc('record_subscription_alerts', {
        p_today: todayISO(),
      })
      if (error) throw error
      return (data || []) as SubscriptionAlertRow[]
    },
    onSuccess: (data, input) => {
      if (data.length > 0) {
        queryClient.invalidateQueries({ queryKey: ['subscription_alerts', input.userId] })
        queryClient.invalidateQueries({
          queryKey: ['subscription_alerts_unread_count', input.userId],
        })
      }
    },
  })
}

export interface SubscriptionAlertWithSubscription extends SubscriptionAlertRow {
  subscription: { name: string; icon: string | null } | null
}

export function useUnreadSubscriptionAlerts(userId?: string) {
  return useQuery({
    queryKey: ['subscription_alerts', userId],
    queryFn: async () => {
      if (!userId) return []
      const { data, error } = await supabase
        .from('subscription_alerts')
        .select('*, subscription:subscriptions(name, icon)')
        .eq('user_id', userId)
        .is('read_at', null)
        .order('created_at', { ascending: false })
      if (error) throw error
      return (data || []) as SubscriptionAlertWithSubscription[]
    },
    enabled: !!userId,
  })
}

export function useUnreadSubscriptionAlertsCount(userId?: string) {
  return useQuery({
    queryKey: ['subscription_alerts_unread_count', userId],
    queryFn: async () => {
      if (!userId) return 0
      const { count, error } = await supabase
        .from('subscription_alerts')
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

export function useMarkSubscriptionAlertRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: { id?: string; userId: string }) => {
      let query = supabase
        .from('subscription_alerts')
        .update({ read_at: new Date().toISOString() })
        .eq('user_id', input.userId)
        .is('read_at', null)
      if (input.id) query = query.eq('id', input.id)
      const { error } = await query
      if (error) throw error
    },
    onSuccess: (_data, input) => {
      queryClient.invalidateQueries({ queryKey: ['subscription_alerts', input.userId] })
      queryClient.invalidateQueries({
        queryKey: ['subscription_alerts_unread_count', input.userId],
      })
    },
  })
}

function invalidateSubscriptions(
  queryClient: ReturnType<typeof useQueryClient>,
  userId: string,
): void {
  queryClient.invalidateQueries({ queryKey: ['subscriptions', userId] })
}
