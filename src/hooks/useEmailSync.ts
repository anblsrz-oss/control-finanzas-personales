import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

const GMAIL_SCOPE = 'https://www.googleapis.com/auth/gmail.readonly'
const OUTLOOK_SCOPE = 'offline_access https://graph.microsoft.com/Mail.Read'

// Supabase solo guarda en la sesión el provider_token del ÚLTIMO OAuth
// completado (Gmail, Outlook o Calendar, cualquiera que se haya usado más
// recientemente), y cada flujo de conexión recarga la página al volver del
// consentimiento (redirectTo: window.location.href). Este flag en
// sessionStorage sobrevive esa recarga y le dice a cada página a cuál de
// los proveedores pertenece el token recién leído — exportado aquí (no
// declarado en EmailSyncPage) para que useGoogleCalendar/SettingsPage
// puedan marcar 'calendar' sin que EmailSyncPage lo confunda con Gmail.
export const EMAIL_SYNC_PROVIDER_KEY = 'finzen_email_sync_provider'

// Pide consentimiento del scope de solo-lectura de Gmail. Provoca un nuevo flujo
// OAuth; al volver, la sesión trae `provider_token` para llamar a Gmail API.
export async function connectGmail(): Promise<void> {
  await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      scopes: GMAIL_SCOPE,
      redirectTo: window.location.href,
      queryParams: { access_type: 'offline', prompt: 'consent' },
    },
  })
}

// Igual que connectGmail pero contra Microsoft (Outlook/Azure AD). El scope
// `offline_access` es el que hace que Microsoft entregue un refresh_token
// (Google usa `access_type: 'offline'` para lo mismo).
export async function connectOutlook(): Promise<void> {
  await supabase.auth.signInWithOAuth({
    provider: 'azure',
    options: {
      scopes: OUTLOOK_SCOPE,
      redirectTo: window.location.href,
      queryParams: { prompt: 'consent' },
    },
  })
}

// Token del proveedor (Google u Microsoft, el que se haya conectado más
// recientemente) presente en la sesión tras el consentimiento (transitorio).
export async function getProviderToken(): Promise<string | null> {
  const { data } = await supabase.auth.getSession()
  return data.session?.provider_token ?? null
}

// Refresh token del proveedor (solo llega en el primer consentimiento offline).
export async function getProviderRefreshToken(): Promise<string | null> {
  const { data } = await supabase.auth.getSession()
  return (data.session as { provider_refresh_token?: string })?.provider_refresh_token ?? null
}

export interface GmailConnection {
  user_id: string
  email: string | null
  watch_expiration: string | null
}

// Estado de la captura en tiempo real (no incluye refresh_token: el cliente no
// tiene permiso sobre esa columna).
export function useGmailConnection(userId?: string) {
  return useQuery({
    queryKey: ['gmail_connection', userId],
    queryFn: async (): Promise<GmailConnection | null> => {
      if (!userId) return null
      const { data } = await supabase
        .from('gmail_connections')
        .select('user_id, email, watch_expiration')
        .eq('user_id', userId)
        .maybeSingle()
      return (data as GmailConnection) ?? null
    },
    enabled: !!userId,
  })
}

// Activa el push (users.watch) llamando a la Edge Function gmail-watch con el
// access token y el refresh token offline. Devuelve si quedó guardado el
// refresh_token (sin él, el push no puede renovarse).
export function useEnableGmailPush() {
  const queryClient = useQueryClient()
  return useMutation<
    { ok: boolean; expiration: string | null; hasRefreshToken: boolean },
    Error,
    { userId: string; providerToken: string; providerRefreshToken: string | null }
  >({
    mutationFn: async ({ providerToken, providerRefreshToken }) => {
      const { data, error } = await supabase.functions.invoke('gmail-watch', {
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
      queryClient.invalidateQueries({ queryKey: ['gmail_connection', vars.userId] })
    },
  })
}

// Desactiva el push: borra la conexión (el watch caduca solo y la renovación
// lo ignora al no existir la fila).
export function useDisableGmailPush() {
  const queryClient = useQueryClient()
  return useMutation<void, Error, { userId: string }>({
    mutationFn: async ({ userId }) => {
      const { error } = await supabase
        .from('gmail_connections')
        .delete()
        .eq('user_id', userId)
      if (error) throw error
    },
    onSuccess: (_d, vars) => {
      queryClient.invalidateQueries({ queryKey: ['gmail_connection', vars.userId] })
    },
  })
}

export interface OutlookConnection {
  user_id: string
  email: string | null
  watch_expiration: string | null
}

// Estado de la captura en tiempo real de Outlook (mismo patrón que
// useGmailConnection).
export function useOutlookConnection(userId?: string) {
  return useQuery({
    queryKey: ['outlook_connection', userId],
    queryFn: async (): Promise<OutlookConnection | null> => {
      if (!userId) return null
      const { data } = await supabase
        .from('outlook_connections')
        .select('user_id, email, watch_expiration')
        .eq('user_id', userId)
        .maybeSingle()
      return (data as OutlookConnection) ?? null
    },
    enabled: !!userId,
  })
}

// Activa el push (suscripción de Graph) llamando a la Edge Function
// outlook-watch con el access token y el refresh token offline.
export function useEnableOutlookPush() {
  const queryClient = useQueryClient()
  return useMutation<
    { ok: boolean; expiration: string | null; hasRefreshToken: boolean },
    Error,
    { userId: string; providerToken: string; providerRefreshToken: string | null }
  >({
    mutationFn: async ({ providerToken, providerRefreshToken }) => {
      const { data, error } = await supabase.functions.invoke('outlook-watch', {
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
      queryClient.invalidateQueries({ queryKey: ['outlook_connection', vars.userId] })
    },
  })
}

// Desactiva el push: borra la conexión (la suscripción de Graph expira sola
// y la renovación la ignora al no existir la fila).
export function useDisableOutlookPush() {
  const queryClient = useQueryClient()
  return useMutation<void, Error, { userId: string }>({
    mutationFn: async ({ userId }) => {
      const { error } = await supabase
        .from('outlook_connections')
        .delete()
        .eq('user_id', userId)
      if (error) throw error
    },
    onSuccess: (_d, vars) => {
      queryClient.invalidateQueries({ queryKey: ['outlook_connection', vars.userId] })
    },
  })
}

interface SyncResult {
  inserted: number
  found: number
  duplicates?: number
  error?: string
}

// Llama a la Edge Function sync-email con el token del proveedor del usuario
// (Gmail por defecto; pasar provider: 'outlook' para Microsoft).
export function useSyncEmail() {
  const queryClient = useQueryClient()
  return useMutation<
    SyncResult,
    Error,
    {
      userId: string
      providerToken: string
      accountId?: string
      sinceDays?: number
      provider?: 'gmail' | 'outlook'
    }
  >({
    mutationFn: async ({ providerToken, accountId, sinceDays, provider }) => {
      const { data, error } = await supabase.functions.invoke('sync-email', {
        body: { providerToken, accountId, sinceDays, provider },
      })
      if (error) {
        // En un fallo non-2xx, supabase-js pone la respuesta real en `context`;
        // extraemos el `error` del cuerpo para mostrar la causa, no el genérico.
        let detail = error.message
        try {
          const ctx = (error as { context?: Response }).context
          const body = ctx && typeof ctx.json === 'function' ? await ctx.json() : null
          if (body?.error) detail = body.error
        } catch {
          /* si no se puede leer el cuerpo, queda el mensaje genérico */
        }
        throw new Error(detail)
      }
      if ((data as SyncResult)?.error) throw new Error((data as SyncResult).error)
      return data as SyncResult
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ['transactions', vars.userId] })
      queryClient.invalidateQueries({ queryKey: ['transactions_pending_count', vars.userId] })
    },
  })
}
