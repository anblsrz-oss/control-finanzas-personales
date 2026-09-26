// Canal por el que se distribuye este build. Lo fija el CI al compilar:
//  - 'play': versión de Google Play (VITE_DISTRIBUTION=play).
//  - cualquier otro valor / sin definir: web y APK de GitHub.
//
// Google Play pone reglas que el APK directo no tiene:
//  - Sin permisos de SMS (solo los permite a la app de mensajes predeterminada):
//    la captura por SMS se oculta; la de notificaciones sí se permite.
//  - La app no puede actualizarse fuera de Play: se apaga NativeUpdatePrompt.
//  - Premium no puede comprarse con Stripe dentro de la app ni puede decirse
//    "cómpralo en la web" (política contra desvío de pagos). Se oculta la
//    compra; quien ya pagó en la web entra con Premium igual.
export function isPlayBuild(): boolean {
  return import.meta.env.VITE_DISTRIBUTION === 'play'
}

/** Páginas que no existen en el build de Play. */
export const PLAY_HIDDEN_PAGES: readonly string[] = ['/sms']
