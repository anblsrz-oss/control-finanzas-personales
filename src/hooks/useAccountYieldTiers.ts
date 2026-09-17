import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export interface AccountYieldTierRow {
  id: string
  account_id: string
  user_id: string
  min_amount: number
  rate: number
  created_at: string
}

export function useAccountYieldTiers(userId?: string) {
  return useQuery({
    queryKey: ['account_yield_tiers', userId],
    queryFn: async () => {
      if (!userId) return []
      const { data, error } = await supabase
        .from('account_yield_tiers')
        .select('*')
        .eq('user_id', userId)
        .order('min_amount', { ascending: true })
      if (error) throw error
      return (data || []) as AccountYieldTierRow[]
    },
    enabled: !!userId,
  })
}

// Reemplaza todos los tramos de una cuenta (borra + inserta), mismo patrón
// de guardado que transaction_lines: más simple que diffear fila por fila.
export function useSaveAccountYieldTiers() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: {
      userId: string
      accountId: string
      tiers: { min_amount: number; rate: number }[]
    }) => {
      const { error: deleteError } = await supabase
        .from('account_yield_tiers')
        .delete()
        .eq('account_id', input.accountId)
      if (deleteError) throw deleteError

      if (input.tiers.length === 0) return

      const { error: insertError } = await supabase.from('account_yield_tiers').insert(
        input.tiers.map((tier) => ({
          account_id: input.accountId,
          user_id: input.userId,
          min_amount: tier.min_amount,
          rate: tier.rate,
        })),
      )
      if (insertError) throw insertError
    },
    onSuccess: (_data, input) => {
      queryClient.invalidateQueries({ queryKey: ['account_yield_tiers', input.userId] })
    },
  })
}
