// Ajustes de UI solo para la app nativa (Capacitor). No-op en web.
import { Capacitor } from '@capacitor/core'

// Barra de estado coherente con el tema: en modo oscuro los íconos (hora,
// batería) deben ser claros; con los oscuros por defecto quedaban casi
// invisibles sobre el fondo oscuro (Android 15+ dibuja la app bajo la barra).
export async function setNativeStatusBarStyle(dark: boolean): Promise<void> {
  if (!Capacitor.isNativePlatform()) return
  try {
    const { StatusBar, Style } = await import('@capacitor/status-bar')
    await StatusBar.setStyle({ style: dark ? Style.Dark : Style.Light })
    if (Capacitor.getPlatform() === 'android') {
      // En Android 15+ el color de fondo lo ignora el sistema; en versiones
      // anteriores sí se aplica.
      await StatusBar.setBackgroundColor({ color: dark ? '#0f172a' : '#0f766e' })
    }
  } catch {
    // Plugin no disponible en este entorno: ignorar.
  }
}

export async function initNativeUi(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return
  await setNativeStatusBarStyle(document.documentElement.classList.contains('dark'))
  try {
    const { SplashScreen } = await import('@capacitor/splash-screen')
    await SplashScreen.hide()
  } catch {
    // Plugin no disponible en este entorno: ignorar.
  }
}
