// Registro de push (FCM) para los avisos de presupuesto. No-op en web: el
// token solo existe en la app nativa Android/iOS.
//
// A diferencia del correo, aquí no hay un checkbox de opt-in: el push está
// implícito en tener la app instalada y sesión iniciada, que es justo cuando
// se llama registerPush(). Si el usuario no quiere avisos, la salida honesta
// es desinstalar o revocar el permiso de notificaciones del sistema — no hay
// una preferencia intermedia en este MVP.
import { Capacitor } from '@capacitor/core'
import { supabase } from '@/lib/supabase'

function isNative(): boolean {
  return Capacitor.isNativePlatform()
}

// Evita registrar el mismo token dos veces en la misma sesión de la app (el
// listener 'registration' puede disparar más de una vez).
let lastRegisteredToken: string | null = null

/**
 * Pide permiso, registra el dispositivo en FCM y sube el token a
 * push_tokens. Debe llamarse con sesión activa (upsert necesita user_id).
 * Todos los fallos se tragan: un push que no llegó no puede tumbar el login.
 */
export async function registerPush(userId: string): Promise<void> {
  if (!isNative()) return

  try {
    const { PushNotifications } = await import('@capacitor/push-notifications')

    let perm = await PushNotifications.checkPermissions()
    if (perm.receive === 'prompt') {
      perm = await PushNotifications.requestPermissions()
    }
    if (perm.receive !== 'granted') return

    // El listener puede tardar; se registra ANTES de llamar a register().
    await PushNotifications.addListener('registration', (token) => {
      void upsertToken(userId, token.value)
    })
    await PushNotifications.addListener('registrationError', (err) => {
      console.warn('Registro de push falló:', err.error)
    })

    // pushNotificationActionPerformed = el usuario tocó la notificación
    // (app en segundo plano o cerrada). En primer plano no hace falta
    // manejarlo aparte: el aviso ya vive en budget_alerts y el banner/badge
    // in-app lo recogen solos en el siguiente refresco.
    await PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
      const url = action.notification.data?.url
      if (typeof url === 'string' && url.startsWith('/')) {
        window.location.assign(url)
      }
    })

    await PushNotifications.register()
  } catch (e) {
    console.warn('No se pudo inicializar push:', e)
  }
}

async function upsertToken(userId: string, token: string): Promise<void> {
  if (token === lastRegisteredToken) return
  lastRegisteredToken = token
  const { error } = await supabase.from('push_tokens').upsert(
    {
      user_id: userId,
      token,
      platform: Capacitor.getPlatform(),
      last_seen_at: new Date().toISOString(),
    },
    { onConflict: 'token' },
  )
  if (error) console.warn('No se pudo guardar el token de push:', error.message)
}

/**
 * Al cerrar sesión, desasocia ESTE dispositivo (no todos los del usuario: si
 * tiene el teléfono y una tablet, cerrar sesión en uno no debe apagar el push
 * del otro). Debe llamarse ANTES de supabase.auth.signOut(): después ya no
 * hay sesión y RLS (push_tokens_all_own) rechaza el delete.
 */
export async function unregisterPush(): Promise<void> {
  if (!isNative() || !lastRegisteredToken) return
  await supabase.from('push_tokens').delete().eq('token', lastRegisteredToken)
  lastRegisteredToken = null
}
