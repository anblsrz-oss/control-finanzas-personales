// i18n con "claves naturales": el texto en español ES la clave. Para español
// no hay diccionario (t devuelve la clave tal cual); para el resto se traduce
// con el mapa de su archivo (en.ts, locales/<code>.ts). Ventaja: el código sigue
// siendo legible en español y solo se mantiene un diccionario por idioma.
// Inglés va en el bundle; los demás se cargan al elegirlos (changeLang), así no
// engordan la descarga inicial.

import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { useSettings } from '@/store/useSettings'
import { en } from './en'
import { langInfo } from './languages'

type Dictionary = Record<string, string>

const loaders = import.meta.glob<Record<string, Dictionary>>('./locales/*.ts')

async function loadLocale(code: string): Promise<void> {
  if (code === 'es' || i18n.hasResourceBundle(code, 'translation')) return
  const load = loaders[`./locales/${code}.ts`]
  if (load) i18n.addResourceBundle(code, 'translation', (await load())[code])
}

/** Cambia el idioma de i18next cargando antes su diccionario (sin él se vería español). */
export async function changeLang(code: string): Promise<void> {
  await loadLocale(code)
  await i18n.changeLanguage(code)
  syncHtmlDir(code)
}

// dir="rtl" para árabe; el <html lang> lo fija usePageMeta.
function syncHtmlDir(code: string) {
  if (typeof document !== 'undefined') document.documentElement.dir = langInfo(code).dir
}

const initial = useSettings.getState().language

void i18n
  .use(initReactI18next)
  .init({
    resources: { en: { translation: en } },
    lng: initial === 'en' ? 'en' : 'es',
    fallbackLng: 'es',
    // Claves naturales: sin namespaces ni anidación por puntos.
    keySeparator: false,
    nsSeparator: false,
    interpolation: { escapeValue: false },
    returnEmptyString: false,
  })
  .then(() => (initial === 'es' || initial === 'en' ? syncHtmlDir(initial) : changeLang(initial)))

// Mantener i18next sincronizado con el store de ajustes.
useSettings.subscribe((state, prev) => {
  if (state.language !== prev.language) void changeLang(state.language)
})

export default i18n

// Locale para Intl (fechas/moneda) según el idioma activo.
export function activeLocale(): string {
  return langInfo(i18n.language).locale
}
