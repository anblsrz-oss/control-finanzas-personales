import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { todayISO } from '@/lib/dates'
import type {
  BudgetRow,
  BudgetStatusRow,
  BudgetAlertRow,
  BudgetPeriod,
} from '@/types/db'

// Los presupuestos configurados, tal cual están en la tabla. Para la pantalla
// de administración (crear/editar/borrar). Lo que se muestra al usuario con
// su consumo sale de useBudgetStatus.
export function useBudgets(userId?: string) {
  return useQuery({
    queryKey: ['budgets', userId],
    queryFn: async () => {
      if (!userId) return []
      const { data, error } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', userId)
        .order('category_id', { nullsFirst: true })
        .order('created_at')
      if (error) throw error
      return (data || []) as BudgetRow[]
    },
    enabled: !!userId,
  })
}

// Estado calculado de cada presupuesto: consumo, %, semáforo y rango del
// periodo vigente.
//
// Se pasa la fecha LOCAL del dispositivo, no se usa current_date: en Supabase
// current_date es UTC, y a las 19:00 del último día del mes en México ya es el
// día siguiente en UTC — el periodo saltaría antes de tiempo.
//
// La fecha entra en la queryKey a propósito: al cruzar la medianoche la query
// cambia de clave sola y el periodo se recalcula sin recargar la app.
export function useBudgetStatus(userId?: string) {
  const today = todayISO()
  return useQuery({
    queryKey: ['budget_status', userId, today],
    queryFn: async () => {
      if (!userId) return []
      const { data, error } = await supabase.rpc('budget_status_at', {
        p_today: today,
      })
      if (error) throw error
      return (data || []) as BudgetStatusRow[]
    },
    enabled: !!userId,
  })
}

export function useCreateBudget() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: {
      userId: string
      /** null = presupuesto general. */
      categoryId: string | null
      amount: number
      currency: string
      period: BudgetPeriod
      alertThreshold?: number | null
      notes?: string | null
    }) => {
      const { data, error } = await supabase
        .from('budgets')
        .insert([
          {
            user_id: input.userId,
            category_id: input.categoryId,
            amount: input.amount,
            currency: input.currency,
            period: input.period,
            alert_threshold: input.alertThreshold ?? null,
            notes: input.notes?.trim() || null,
          },
        ])
        .select()
        .single()
      if (error) throw error
      return data as BudgetRow
    },
    onSuccess: (_data, input) => invalidateBudgets(queryClient, input.userId),
  })
}

export function useUpdateBudget() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: {
      id: string
      userId: string
      categoryId?: string | null
      amount?: number
      period?: BudgetPeriod
      alertThreshold?: number | null
      isActive?: boolean
      notes?: string | null
    }) => {
      const updates: Record<string, any> = { updated_at: new Date().toISOString() }
      if (input.categoryId !== undefined) updates.category_id = input.categoryId
      if (input.amount !== undefined) updates.amount = input.amount
      if (input.period !== undefined) updates.period = input.period
      if (input.alertThreshold !== undefined) updates.alert_threshold = input.alertThreshold
      if (input.isActive !== undefined) updates.is_active = input.isActive
      if (input.notes !== undefined) updates.notes = input.notes?.trim() || null

      const { error } = await supabase.from('budgets').update(updates).eq('id', input.id)
      if (error) throw error
    },
    onSuccess: (_data, input) => invalidateBudgets(queryClient, input.userId),
  })
}

export function useDeleteBudget() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id }: { id: string; userId: string }) => {
      const { error } = await supabase.from('budgets').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: (_data, input) => invalidateBudgets(queryClient, input.userId),
  })
}

// Avisos ------------------------------------------------------------------

// Registra los avisos que falten y devuelve SOLO los nuevos, que son los que
// hay que mostrar. Es idempotente: el índice único (budget_id, period_start,
// level) impide que el mismo umbral avise dos veces en el mismo periodo, sin
// importar cuántas veces se llame ni desde cuántos dispositivos.
export function useRecordBudgetAlerts() {
  const queryClient = useQueryClient()
  return useMutation({
    // userId no se manda: la función lo toma de auth.uid() en servidor. Se pide
    // igual para poder invalidar las queries del usuario en onSuccess.
    mutationFn: async (_input: { userId: string }) => {
      const { data, error } = await supabase.rpc('record_budget_alerts', {
        p_today: todayISO(),
      })
      if (error) throw error
      return (data || []) as BudgetAlertRow[]
    },
    onSuccess: (data, input) => {
      // Solo invalidar si hubo avisos nuevos: en la mayoría de las llamadas
      // (cada vez que la app vuelve a primer plano) no hay nada que refrescar.
      if (data.length > 0) {
        queryClient.invalidateQueries({ queryKey: ['budget_alerts', input.userId] })
        queryClient.invalidateQueries({
          queryKey: ['budget_alerts_unread_count', input.userId],
        })
      }
    },
  })
}

// Avisos sin leer, con el presupuesto y la categoría para poder redactarlos.
export function useUnreadBudgetAlerts(userId?: string) {
  return useQuery({
    queryKey: ['budget_alerts', userId],
    queryFn: async () => {
      if (!userId) return []
      const { data, error } = await supabase
        .from('budget_alerts')
        .select('*, budget:budgets(category_id, period, category:categories(name, icon, color))')
        .eq('user_id', userId)
        .is('read_at', null)
        .order('created_at', { ascending: false })
      if (error) throw error
      return (data || []) as BudgetAlertWithBudget[]
    },
    enabled: !!userId,
  })
}

// Conteo para el badge de la navegación. Mismo patrón que usePendingCount: la
// captura automática (SMS/correo) puede generar avisos desde el servidor sin
// pasar por una mutación del cliente, así que se refresca sola.
export function useUnreadBudgetAlertsCount(userId?: string) {
  return useQuery({
    queryKey: ['budget_alerts_unread_count', userId],
    queryFn: async () => {
      if (!userId) return 0
      const { count, error } = await supabase
        .from('budget_alerts')
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

export function useMarkBudgetAlertRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: { id?: string; userId: string }) => {
      let query = supabase
        .from('budget_alerts')
        .update({ read_at: new Date().toISOString() })
        .eq('user_id', input.userId)
        .is('read_at', null)
      // Sin id, descarta todos los pendientes de una vez.
      if (input.id) query = query.eq('id', input.id)
      const { error } = await query
      if (error) throw error
    },
    onSuccess: (_data, input) => {
      queryClient.invalidateQueries({ queryKey: ['budget_alerts', input.userId] })
      queryClient.invalidateQueries({
        queryKey: ['budget_alerts_unread_count', input.userId],
      })
    },
  })
}

/** Aviso con el presupuesto y la categoría embebidos, para poder redactarlo. */
export interface BudgetAlertWithBudget extends BudgetAlertRow {
  budget: {
    category_id: string | null
    period: BudgetPeriod
    category: { name: string; icon: string | null; color: string | null } | null
  } | null
}

// El estado depende de los presupuestos Y de las transacciones, así que
// siempre se invalidan juntos.
function invalidateBudgets(
  queryClient: ReturnType<typeof useQueryClient>,
  userId: string,
): void {
  queryClient.invalidateQueries({ queryKey: ['budgets', userId] })
  queryClient.invalidateQueries({ queryKey: ['budget_status', userId] })
}
