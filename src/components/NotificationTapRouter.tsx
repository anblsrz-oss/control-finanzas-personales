import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import type { PluginListenerHandle } from '@capacitor/core'
import { isNative } from '@/lib/nativeAuth'
import { onNotificationTap } from '@/lib/notificationSync'

// Al tocar una notificación, lleva al apartado que le corresponde:
//  - notificaciones propias (captura de SMS/notificaciones): "Movimiento
//    pendiente" → ese movimiento en /transacciones; presupuesto → /presupuestos.
//  - push de FCM (budget-alerts-push, subscription-alerts-push): data.url.
// Vive en App (no en registerPush) para escuchar desde el arranque: si la app
// se abrió tocando la notificación, el evento llega antes del login.
export function NotificationTapRouter() {
  const navigate = useNavigate()

  useEffect(() => {
    if (!isNative()) return
    const handles: PluginListenerHandle[] = []
    let cancelled = false

    const go = (route: unknown) => {
      if (typeof route === 'string' && route.startsWith('/')) navigate(route)
    }

    const keep = (h: PluginListenerHandle | null) => {
      if (!h) return
      if (cancelled) void h.remove()
      else handles.push(h)
    }

    void onNotificationTap(go).then(keep)
    void import('@capacitor/push-notifications')
      .then(({ PushNotifications }) =>
        PushNotifications.addListener('pushNotificationActionPerformed', (action) =>
          go(action.notification.data?.url),
        ),
      )
      .then(keep)
      .catch(() => {})

    return () => {
      cancelled = true
      handles.forEach((h) => void h.remove())
    }
  }, [navigate])

  return null
}
