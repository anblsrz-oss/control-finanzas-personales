import { useEffect } from 'react'
import { AppUpdate, AppUpdateAvailability, FlexibleUpdateInstallStatus } from '@capawesome/capacitor-app-update'

// Solo Play: pide a Google Play que baje la versión nueva en segundo plano y,
// al terminar la descarga, la instala (reinicia la app). Falla en silencio:
// fuera de Play (sideload, debug) la API no responde y no pasa nada.
export function PlayUpdatePrompt() {
  useEffect(() => {
    let remove: (() => void) | undefined
    ;(async () => {
      try {
        const info = await AppUpdate.getAppUpdateInfo()
        if (info.updateAvailability !== AppUpdateAvailability.UPDATE_AVAILABLE || !info.flexibleUpdateAllowed) return
        const h = await AppUpdate.addListener('onFlexibleUpdateStateChange', (s) => {
          if (s.installStatus === FlexibleUpdateInstallStatus.DOWNLOADED) void AppUpdate.completeFlexibleUpdate()
        })
        remove = () => void h.remove()
        await AppUpdate.startFlexibleUpdate()
      } catch {
        /* sin Play Store o sin conexión */
      }
    })()
    return () => remove?.()
  }, [])
  return null
}
