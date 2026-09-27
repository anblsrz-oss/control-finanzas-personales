// Actualización del APK desde dentro de la app — SOLO Android, build de GitHub.
// El plugin nativo (ApkInstallerPlugin.java) descarga el APK al caché de la app
// y abre el instalador del sistema; así no se depende de la pestaña del
// navegador, que se queda en "Descargando…" sin guardar el archivo.
// El build de Google Play no lo incluye (sin REQUEST_INSTALL_PACKAGES) y usa
// Play para actualizar.

import { registerPlugin, type PluginListenerHandle } from '@capacitor/core'
import { isAndroidNative } from '@/lib/smsSync'
import { isPlayBuild } from '@/lib/distribution'

interface ApkInstallerPlugin {
  canInstall(): Promise<{ granted: boolean }>
  openInstallSettings(): Promise<void>
  downloadAndInstall(opts: { url: string }): Promise<void>
  addListener(
    event: 'downloadProgress',
    cb: (data: { percent: number }) => void,
  ): Promise<PluginListenerHandle>
}

const ApkInstaller = registerPlugin<ApkInstallerPlugin>('ApkInstaller')

export const canInstallApkInApp = (): boolean => isAndroidNative() && !isPlayBuild()

export type ApkUpdateResult = 'installing' | 'needs_permission'

// needs_permission: se abrió la pantalla de Ajustes "Instalar apps desconocidas";
// el usuario la activa y vuelve a tocar Descargar. Lanza si falla la descarga.
export async function downloadAndInstallApk(
  url: string,
  onProgress?: (percent: number) => void,
): Promise<ApkUpdateResult> {
  const { granted } = await ApkInstaller.canInstall()
  if (!granted) {
    await ApkInstaller.openInstallSettings()
    return 'needs_permission'
  }
  const handle = onProgress
    ? await ApkInstaller.addListener('downloadProgress', (d) => onProgress(d.percent))
    : null
  try {
    await ApkInstaller.downloadAndInstall({ url })
    return 'installing'
  } finally {
    await handle?.remove()
  }
}
