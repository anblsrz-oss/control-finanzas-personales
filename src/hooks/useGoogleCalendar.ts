import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { EMAIL_SYNC_PROVIDER_KEY } from '@/hooks/useEmailSync'
import { startProviderOAuth } from '@/lib/nativeAuth'

// Scope aditivo sobre el proveedor 'google' de Supabase Auth, SEPARADO del
// de Gmail (gmail.readonly): Google trata cada consentimiento como un grant
// independiente, revocable por el usuario sin afectar al otro. Ver
// google_calendar_connections en 0050 para el porqué de la fila propia.
// calendar.app.created (mínimo privilegio, exigido en la verificación de
// Google): la app solo accede al calendario secundario que ella crea
// (google-calendar-connect), nunca al principal ni a otros eventos.
const CALENDAR_SCOPE = 'https://www.googleapis.com/auth/calendar.app.created'

// Pide consentimiento para crear eventos en el Calendar del usuario. Mismo
// patrón que connectGmail/connectOutlook en useEmailSync.ts, incluyendo el
// flag de sessionStorage: sin él, si el usuario visita después Sincronizar
// correo, esa página leería este token (el único que Supabase conserva) y
// lo confundiría con uno de Gmail — ver el chequeo explícito en su efecto.
export async function connectGoogleCalendar(): Promise<void> {
  sessionStorage.setItem(EMAIL_SYNC_PROVIDER_KEY, 'calendar')
  await startProviderOAuth({
    provider: 'google',
    scopes: CALENDAR_SCOPE,
    queryParams: { access_type: 'offline', prompt: 'consent' },
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
      const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
      const { data, error } = await supabase.functions.invoke('google-calendar-connect', {
        body: { providerToken, providerRefreshToken, timeZone },
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

// Desconectar: vía google-calendar-connect (action 'disconnect'), que borra
// en Google el calendario de recordatorios de la app (con sus eventos) y
// luego la fila. Conexiones antiguas en 'primary' solo borran la fila.
export function useDisconnectGoogleCalendar() {
  const queryClient = useQueryClient()
  return useMutation<void, Error, { userId: string }>({
    mutationFn: async () => {
      const { error } = await supabase.functions.invoke('google-calendar-connect', {
        body: { action: 'disconnect' },
      })
      if (error) throw error
    },
    onSuccess: (_d, vars) => {
      queryClient.invalidateQueries({ queryKey: ['google_calendar_connection', vars.userId] })
    },
  })
}
