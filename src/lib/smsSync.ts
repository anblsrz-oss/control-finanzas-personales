// Captura de SMS de alerta bancaria — SOLO Android (Capacitor).
// iOS bloquea por completo la lectura de SMS por apps de terceros.
//
// Arquitectura (ver plan / NATIVE_SETUP.md):
//  - Tiempo real: un BroadcastReceiver nativo propio (SmsReceiver.java) capta el
//    SMS al llegar, AUN CON LA APP CERRADA, y hace POST a la Edge Function
//    `ingest-sms` usando un TOKEN DE DISPOSITIVO guardado en Preferences. Es
//    necesario mantenerlo propio: el listener en tiempo real de
//    @ao627515/capacitor-sms-vault (startListening/addListener) solo notifica
//    al JS mientras el proceso de la app sigue vivo, no con la app forzada a
//    cerrar (su receiver se registra/desregistra dinámicamente con el plugin).
//  - Fallback: este módulo lee el inbox (SmsVault.getSmsList) y hace el MISMO
//    POST batch a `ingest-sms` (al abrir la app o con el botón "Sincronizar
//    ahora"), para no perder nada si el receptor fue throttleado por batería.
//
// El parseo (monto, ingreso/gasto, dedupe) vive TODO en la Edge Function, así
// que native, fallback y web comparten una sola implementación.
//
// Requiere en el proyecto Android:
//   npm i @ao627515/capacitor-sms-vault   &&   npx cap sync android
//   permisos READ_SMS / RECEIVE_SMS / POST_NOTIFICATIONS en AndroidManifest.xml
//   el plugin nativo SmsCapture (SmsCapturePlugin.java) para pedir permisos
//   (SmsVault también pide SEND_SMS/READ_PHONE_STATE que no usamos; se
//   eliminan del manifest final con tools:node="remove", ver AndroidManifest.xml).

import { Capacitor, registerPlugin } from '@capacitor/core'
import { Preferences } from '@capacitor/preferences'
import { SmsVault } from '@ao627515/capacitor-sms-vault'
import { supabase } from '@/lib/supabase'

// Claves en Preferences (SharedPreferences "CapacitorStorage"), que también lee
// el receptor nativo SmsReceiver.java.
const PREF_TOKEN = 'sms_ingest_token'
const PREF_URL = 'sms_supabase_url'
const PREF_ANON = 'sms_anon_key'
const PREF_SENDERS = 'sms_senders'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string

// Plugin nativo propio para pedir los permisos de SMS (READ_SMS + RECEIVE_SMS)
// y notificaciones en una sola secuencia. En web/iOS los métodos rechazan y se
// ignoran (guardamos con isAndroidNative()).
interface SmsCapturePlugin {
  requestPermissions(): Promise<{ granted: boolean }>
  hasPermissions(): Promise<{ granted: boolean }>
}
const SmsCapture = registerPlugin<SmsCapturePlugin>('SmsCapture')

export function isAndroidNative(): boolean {
  return Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android'
}

interface RawSms {
  address: string // remitente
  body: string
  date: number // epoch ms
}

export interface SyncResult {
  found: number
  inserted: number
  duplicates: number
}

// --- Token de dispositivo -------------------------------------------------

function randomToken(): string {
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)
  return [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('')
}

async function sha256hex(s: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s))
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

async function getStoredToken(): Promise<string | null> {
  const { value } = await Preferences.get({ key: PREF_TOKEN })
  return value ?? null
}

export async function isSmsCaptureEnabled(): Promise<boolean> {
  return (await getStoredToken()) !== null
}

// Activa la captura automática: pide permisos, genera y registra un token de
// dispositivo (hash en BD, token en claro en Preferences) y guarda la config
// que el receptor nativo necesita para llamar a la Edge Function.
export async function enableSmsCapture(
  userId: string,
  senders: string[],
): Promise<void> {
  if (!isAndroidNative()) throw new Error('Solo disponible en la app de Android')

  const res = await SmsCapture.requestPermissions()
  if (!res?.granted) {
    throw new Error(
      'Se necesitan los permisos de SMS para la captura automática. Actívalos en Ajustes.',
    )
  }

  const token = randomToken()
  const tokenHash = await sha256hex(token)
  const label = `${Capacitor.getPlatform()} ${new Date().toISOString().slice(0, 10)}`

  const { error } = await supabase
    .from('sms_device_tokens')
    .insert({ user_id: userId, token_hash: tokenHash, device_label: label })
  if (error) throw error

  await Preferences.set({ key: PREF_TOKEN, value: token })
  await Preferences.set({ key: PREF_URL, value: SUPABASE_URL })
  await Preferences.set({ key: PREF_ANON, value: ANON_KEY })
  await Preferences.set({ key: PREF_SENDERS, value: senders.join(',') })
}

// Desactiva la captura: revoca el token en BD y limpia Preferences.
export async function disableSmsCapture(userId: string): Promise<void> {
  const token = await getStoredToken()
  if (token) {
    const tokenHash = await sha256hex(token)
    await supabase
      .from('sms_device_tokens')
      .delete()
      .eq('user_id', userId)
      .eq('token_hash', tokenHash)
  }
  await Preferences.remove({ key: PREF_TOKEN })
  await Preferences.remove({ key: PREF_URL })
  await Preferences.remove({ key: PREF_ANON })
  await Preferences.remove({ key: PREF_SENDERS })
}

// Mantiene actualizada la lista de remitentes que el receptor nativo usa para
// filtrar (llamar cuando el usuario edita sus reglas de SMS).
export async function updateSmsSenders(senders: string[]): Promise<void> {
  if (!(await isSmsCaptureEnabled())) return
  await Preferences.set({ key: PREF_SENDERS, value: senders.join(',') })
}

// --- Lectura de inbox (fallback) -----------------------------------------

async function readInbox(sinceDays: number): Promise<RawSms[]> {
  if (!isAndroidNative()) return []
  try {
    const perm = await SmsVault.checkPermissions()
    if (perm.readSms !== 'granted') {
      await SmsVault.requestPermissions()
    }
    const since = Date.now() - sinceDays * 86400_000
    const res = await SmsVault.getSmsList({
      filter: { minDate: since, maxCount: 500 },
    })
    return res.messages as RawSms[]
  } catch (e) {
    console.warn('Plugin de SMS no disponible:', e)
    return []
  }
}

// Envía un lote de SMS crudos a la Edge Function `ingest-sms`. El parseo,
// detección de ingreso/gasto y dedupe ocurren en el servidor.
async function postToIngest(token: string, messages: RawSms[]): Promise<SyncResult> {
  const resp = await fetch(`${SUPABASE_URL}/functions/v1/ingest-sms`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: ANON_KEY,
      Authorization: `Bearer ${ANON_KEY}`,
    },
    body: JSON.stringify({
      token,
      tzOffsetMinutes: new Date().getTimezoneOffset(),
      messages,
    }),
  })
  const data = await resp.json().catch(() => ({}))
  if (!resp.ok) throw new Error(data.error || `Error ${resp.status}`)
  return {
    found: data.found ?? messages.length,
    inserted: data.inserted ?? 0,
    duplicates: data.duplicates ?? 0,
  }
}

// Lee el inbox y lo sincroniza contra `ingest-sms`. Usado por el botón manual y
// por el auto-sync al reanudar la app. Requiere captura activa (token guardado).
export async function syncSmsNow(sinceDays = 30): Promise<SyncResult> {
  if (!isAndroidNative()) return { found: 0, inserted: 0, duplicates: 0 }
  const token = await getStoredToken()
  if (!token) throw new Error('La captura automática no está activada.')
  const inbox = await readInbox(sinceDays)
  if (inbox.length === 0) return { found: 0, inserted: 0, duplicates: 0 }
  return postToIngest(token, inbox)
}

// Auto-sync silencioso (al reanudar la app). No lanza: solo registra en consola.
export async function autoSyncSmsSilently(sinceDays = 7): Promise<void> {
  try {
    if (!(await isSmsCaptureEnabled())) return
    await syncSmsNow(sinceDays)
  } catch (e) {
    console.warn('auto-sync SMS falló:', e)
  }
}
