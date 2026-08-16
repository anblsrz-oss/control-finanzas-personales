import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { EMAIL_SYNC_PROVIDER_KEY } from '@/hooks/useEmailSync'

// Scope aditivo sobre el proveedor 'google' de Supabase Auth, SEPARADO del
// de Gmail (gmail.readonly): Google trata cada consentimiento como un grant
// independiente, revocable por el usuario sin afectar al otro. Ver
// google_calendar_connections en 0050 para el porqué de la fila propia.
const CALENDAR_SCOPE = 'https://www.googleapis.com/auth/calendar.events'

// Pide consentimiento para crear eventos en el Calendar del usuario. Mismo
// patrón que connectGmail/connectOutlook en useEmailSync.ts, incluyendo el
// flag de sessionStorage: sin él, si el usuario visita después Sincronizar
// correo, esa página leería este token (el único que Supabase conserva) y
// lo confundiría con uno de Gmail — ver el chequeo explícito en su efecto.
export async function connectGoogleCalendar(): Promise<void> {
  sessionStorage.setItem(EMAIL_SYNC_PROVIDER_KEY, 'calendar')
  await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      scopes: CALENDAR_SCOPE,
      redirectTo: window.location.href,
      queryParams: { access_type: 'offline', prompt: 'consent' },
    },
  })
}

// Token del proveedor tras el consentimiento (reusa el mismo mecanismo que
// getProviderToken/getProviderRefreshToken de useEmailSync.ts — Supabase no
// distingue "para qué" se pidió, solo guarda el último token de sesión).
export { getProviderToken, getProviderRefreshToken } from '@/hooks/useEmailSync'

export interface GoogleCalendarConnection {
  user_id: string
  email: string | null
  calendar_id: string
}

export function useGoogleCalendarConnection(userId?: string) {
  return useQuery({
    queryKey: ['google_calendar_connection', userId],
    queryFn: async (): Promise<GoogleCalendarConnection | null> => {
      if (!userId) return null
      const { data } = await supabase
        .from('google_calendar_connections')
        .select('user_id, email, calendar_id')
        .eq('user_id', userId)
        .maybeSingle()
      return (data as GoogleCalendarConnection) ?? null
    },
    enabled: !!userId,
  })
}

// Guarda la conexión llamando a la Edge Function google-calendar-connect con
// el access token y el refresh token offline recién obtenidos.
export function useEnableGoogleCalendar() {
  const queryClient = useQueryClient()
  return useMutation<
    { ok: boolean; hasRefreshToken: boolean },
    Error,
    { userId: string; providerToken: string; providerRefreshToken: string | null }
  >({
    mutationFn: async ({ providerToken, providerRefreshToken }) => {
      const { data, error } = await supabase.functions.invoke('google-calendar-connect', {
        body: { providerToken, providerRefreshToken },
      })
      if (error) {
        let detail = error.message
        try {
          const ctx = (error as { context?: Response }).context
          const bodyJson = ctx && typeof ctx.json === 'function' ? await ctx.json() : null
          if (bodyJson?.error) detail = bodyJson.error
        } catch {
          /* deja el mensaje genérico */
        }
        throw new Error(detail)
      }
      return data
    },
    onSuccess: (_d, vars) => {
      queryClient.invalidateQueries({ queryKey: ['google_calendar_connection', vars.userId] })
    },
  })
}

// Desconectar: borra la fila directo (el cliente tiene permiso de delete,
// igual que gmail_connections/outlook_connections). Los recordatorios ya
// creados en el Calendar del usuario NO se borran de golpe: quedan huérfanos
// hasta que su suscripción/tarjeta/plan de origen se elimine (ver
// calendar_event_cleanup en 0052) o el propio usuario los borre a mano.
export function useDisconnectGoogleCalendar() {
  const queryClient = useQueryClient()
  return useMutation<void, Error, { userId: string }>({
    mutationFn: async ({ userId }) => {
      const { error } = await supabase
        .from('google_calendar_connections')
        .delete()
        .eq('user_id', userId)
      if (error) throw error
    },
    onSuccess: (_d, vars) => {
      queryClient.invalidateQueries({ queryKey: ['google_calendar_connection', vars.userId] })
    },
  })
}
