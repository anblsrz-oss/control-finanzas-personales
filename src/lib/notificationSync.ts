// Captura de cargos leyendo las NOTIFICACIONES PUSH de otras apps — SOLO
// Android. Es la alternativa cuando el banco no manda SMS: casi todos avisan
// con una notificación de su app ("Compra aprobada por $250.00 en OXXO").
//
// Arquitectura:
//  - PaymentNotificationListener.java (NotificationListenerService) recibe las
//    notificaciones, AUN CON LA APP CERRADA, filtra por las apps que el usuario
//    marcó (Preferences `notif_packages`) y hace POST a la Edge Function
//    `ingest-notification` con el mismo TOKEN DE DISPOSITIVO que la captura de
//    SMS (ver ensureDeviceToken en smsSync.ts). Si no hay red, las encola.
//  - La Edge Function parsea, descarta promociones/códigos y deduplica también
//    contra lo que llegó por SMS o correo del mismo cargo.
//  - El permiso es especial ("Acceso a notificaciones"): no hay diálogo, se
//    abre la pantalla de Ajustes y el usuario lo activa a mano.

import { registerPlugin } from '@capacitor/core'
import { Preferences } from '@capacitor/preferences'
import {
  ensureDeviceToken,
  isAndroidNative,
  PREF_NOTIF_ON,
  releaseDeviceTokenIfUnused,
} from '@/lib/smsSync'

const PREF_PACKAGES = 'notif_packages'

export interface InstalledApp {
  packageName: string
  label: string
  icon: string | null // data URL
}

interface NotificationCapturePlugin {
  isAccessGranted(): Promise<{ granted: boolean }>
  openAccessSettings(): Promise<void>
  listInstalledApps(): Promise<{ apps: InstalledApp[] }>
  flushQueue(): Promise<{ pending: number }>
}
const NotificationCapture = registerPlugin<NotificationCapturePlugin>('NotificationCapture')

export async function isNotificationAccessGranted(): Promise<boolean> {
  if (!isAndroidNative()) return false
  try {
    return (await NotificationCapture.isAccessGranted()).granted
  } catch {
    return false
  }
}

export async function openNotificationAccessSettings(): Promise<void> {
  if (!isAndroidNative()) return
  await NotificationCapture.openAccessSettings()
}

export async function listInstalledApps(): Promise<InstalledApp[]> {
  if (!isAndroidNative()) return []
  const { apps } = await NotificationCapture.listInstalledApps()
  return [...apps].sort((a, b) => a.label.localeCompare(b.label, 'es'))
}

export async function isNotificationCaptureEnabled(): Promise<boolean> {
  const { value } = await Preferences.get({ key: PREF_NOTIF_ON })
  return value === 'true'
}

export async function getListenedPackages(): Promise<string[]> {
  const { value } = await Preferences.get({ key: PREF_PACKAGES })
  return (value ?? '').split(',').map((s) => s.trim()).filter(Boolean)
}

export async function setListenedPackages(packages: string[]): Promise<void> {
  await Preferences.set({ key: PREF_PACKAGES, value: [...new Set(packages)].join(',') })
}

export async function enableNotificationCapture(
  userId: string,
  packages: string[],
): Promise<void> {
  if (!isAndroidNative()) throw new Error('Solo disponible en la app de Android')
  await ensureDeviceToken(userId)
  await setListenedPackages(packages)
  await Preferences.set({ key: PREF_NOTIF_ON, value: 'true' })
}

export async function disableNotificationCapture(userId: string): Promise<void> {
  await Preferences.set({ key: PREF_NOTIF_ON, value: 'false' })
  await releaseDeviceTokenIfUnused(userId)
}

// Al reanudar la app: manda lo que quedó en la cola sin red y pide al sistema
// reconectar el servicio si algún fabricante lo mató. No lanza.
export async function flushNotificationQueueSilently(): Promise<void> {
  try {
    if (!isAndroidNative() || !(await isNotificationCaptureEnabled())) return
    await NotificationCapture.flushQueue()
  } catch (e) {
    console.warn('flush de notificaciones falló:', e)
  }
}
