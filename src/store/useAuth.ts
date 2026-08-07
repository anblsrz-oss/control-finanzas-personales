import { create } from 'zustand'
import type { Session } from '@supabase/supabase-js'
import { App } from '@capacitor/app'
import { supabase } from '@/lib/supabase'
import { initNativeAuthListener } from '@/lib/nativeAuth'
import { autoSyncSmsSilently, isAndroidNative } from '@/lib/smsSync'
import { registerPush, unregisterPush } from '@/lib/pushNotifications'
import type { ProfileRow } from '@/types/db'

export type Profile = ProfileRow

interface AuthState {
  session: Session | null
  profile: Profile | null
  loading: boolean
  initialized: boolean
  init: () => Promise<void>
  refreshProfile: () => Promise<void>
  signOut: () => Promise<void>
}

async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle()

  if (error) {
    console.error('No se pudo cargar el perfil:', error.message)
    return null
  }
  return data as Profile | null
}

export const useAuth = create<AuthState>((set, get) => ({
  session: null,
  profile: null,
  loading: true,
  initialized: false,

  init: async () => {
    if (get().initialized) return
    set({ initialized: true })

    // App nativa: capturar el retorno del OAuth por deep link (no-op en web).
    initNativeAuthListener()

    // Android: red de seguridad de captura de SMS. Si el receptor nativo fue
    // retrasado por batería/Doze, al abrir/reanudar la app leemos el inbox y
    // sincronizamos los SMS pendientes. No-op si la captura no está activada.
    if (isAndroidNative()) {
      void autoSyncSmsSilently()
      App.addListener('appStateChange', ({ isActive }) => {
        if (isActive) void autoSyncSmsSilently()
      })
    }

    const {
      data: { session },
    } = await supabase.auth.getSession()

    const profile = session?.user
      ? await fetchProfile(session.user.id)
      : null
    set({ session, profile, loading: false })
    if (session?.user) void registerPush(session.user.id)

    supabase.auth.onAuthStateChange(async (_event, newSession) => {
      const newProfile = newSession?.user
        ? await fetchProfile(newSession.user.id)
        : null
      set({ session: newSession, profile: newProfile })
      if (newSession?.user) void registerPush(newSession.user.id)
    })
  },

  refreshProfile: async () => {
    const userId = get().session?.user?.id
    if (!userId) return
    set({ profile: await fetchProfile(userId) })
  },

  signOut: async () => {
    // Antes del signOut: después ya no hay sesión y RLS bloquea el delete.
    await unregisterPush()
    await supabase.auth.signOut()
    set({ session: null, profile: null })
  },
}))
