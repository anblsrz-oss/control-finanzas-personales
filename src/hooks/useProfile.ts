import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/store/useAuth'

// Actualiza la moneda principal del usuario. La política profiles_update_own
// permite editar el propio perfil; el trigger protect_profile_privileged_cols
// impide tocar is_premium/is_admin. Tras guardar, refresca el perfil en el store.
export function useUpdateMainCurrency() {
  const refreshProfile = useAuth((s) => s.refreshProfile)
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: { userId: string; mainCurrency: string }) => {
      const { error } = await supabase
        .from('profiles')
        .update({ main_currency: input.mainCurrency })
        .eq('id', input.userId)
      if (error) throw error

      // Los presupuestos se crean en la moneda principal y su consumo se
      // calcula contra base_amount, que está convertido a esa misma moneda.
      // Si la principal cambia y los presupuestos se quedaran atrás, el
      // cálculo dejaría de cuadrar. Se arrastran con ella.
      const { error: budgetError } = await supabase
        .from('budgets')
        .update({ currency: input.mainCurrency })
        .eq('user_id', input.userId)
      if (budgetError) throw budgetError
    },
    onSuccess: async (_data, input) => {
      await refreshProfile()
      queryClient.invalidateQueries({ queryKey: ['budgets', input.userId] })
      queryClient.invalidateQueries({ queryKey: ['budget_status', input.userId] })
    },
  })
}

// Umbral de aviso por defecto para los presupuestos que no definen el suyo.
export function useUpdateBudgetAlertThreshold() {
  const refreshProfile = useAuth((s) => s.refreshProfile)
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: { userId: string; threshold: number }) => {
      const { error } = await supabase
        .from('profiles')
        .update({ budget_alert_threshold: input.threshold })
        .eq('id', input.userId)
      if (error) throw error
    },
    onSuccess: async (_data, input) => {
      await refreshProfile()
      // El umbral efectivo se calcula en servidor: hay que releer el estado.
      queryClient.invalidateQueries({ queryKey: ['budget_status', input.userId] })
    },
  })
}
