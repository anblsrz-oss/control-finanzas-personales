import { useMutation } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/store/useAuth'

// Borra la cuenta del usuario y todos sus datos (Edge Function delete-account:
// cancela Stripe, revoca Google y borra el usuario con cascade). Requisito de
// Google Play. Al terminar cierra la sesión local.
//
// Nota: no se llama al useAccounts.useDeleteAccount (ese borra una cuenta
// BANCARIA); de ahí el nombre distinto.
export function useDeleteMyAccount() {
  return useMutation({
    mutationFn: async () => {
      const { data: sess } = await supabase.auth.getSession()
      if (!sess.session) throw new Error('No session')

      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/delete-account`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${sess.session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ confirm: 'ELIMINAR' }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || data.error) throw new Error(data.error || 'No se pudo eliminar la cuenta')

      // El usuario ya no existe en el servidor: basta con limpiar la sesión
      // local (los push_tokens se borraron en cascada).
      await supabase.auth.signOut({ scope: 'local' }).catch(() => {})
      useAuth.setState({ session: null, profile: null })
    },
  })
}
