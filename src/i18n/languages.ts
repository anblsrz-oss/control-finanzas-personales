// Registro único de idiomas. Sin imports a propósito: lo leen también node (tests) y el
// prerender. Para añadir un idioma: una fila aquí + src/i18n/locales/<code>.ts + su bandera
// en emojiCategories.json (npm run emoji:sync) + textos en lib/seoTranslations.ts.
// El español es el idioma base (sus textos son las claves de i18n) y va sin prefijo en la URL.

export const LANGUAGES = [
  { code: 'es', native: 'Español', flag: '🇲🇽', locale: 'es-MX', og: 'es_MX', dir: 'ltr' },
  { code: 'en', native: 'English', flag: '🇺🇸', locale: 'en-US', og: 'en_US', dir: 'ltr' },
  { code: 'pt', native: 'Português', flag: '🇧🇷', locale: 'pt-BR', og: 'pt_BR', dir: 'ltr' },
  { code: 'it', native: 'Italiano', flag: '🇮🇹', locale: 'it-IT', og: 'it_IT', dir: 'ltr' },
  { code: 'fr', native: 'Français', flag: '🇫🇷', locale: 'fr-FR', og: 'fr_FR', dir: 'ltr' },
  { code: 'de', native: 'Deutsch', flag: '🇩🇪', locale: 'de-DE', og: 'de_DE', dir: 'ltr' },
  { code: 'zh', native: '中文', flag: '🇨🇳', locale: 'zh-CN', og: 'zh_CN', dir: 'ltr' },
  { code: 'ja', native: '日本語', flag: '🇯🇵', locale: 'ja-JP', og: 'ja_JP', dir: 'ltr' },
  { code: 'ko', native: '한국어', flag: '🇰🇷', locale: 'ko-KR', og: 'ko_KR', dir: 'ltr' },
  { code: 'ru', native: 'Русский', flag: '🇷🇺', locale: 'ru-RU', og: 'ru_RU', dir: 'ltr' },
  { code: 'cs', native: 'Čeština', flag: '🇨🇿', locale: 'cs-CZ', og: 'cs_CZ', dir: 'ltr' },
  { code: 'el', native: 'Ελληνικά', flag: '🇬🇷', locale: 'el-GR', og: 'el_GR', dir: 'ltr' },
  { code: 'ar', native: 'العربية', flag: '🇸🇦', locale: 'ar-SA', og: 'ar_SA', dir: 'rtl' },
] as const

export type Lang = (typeof LANGUAGES)[number]['code']
export const DEFAULT_LANG: Lang = 'es'

export const isLang = (code: unknown): code is Lang => LANGUAGES.some((l) => l.code === code)

/** Datos del idioma; un código desconocido cae al español. */
export const langInfo = (code: string) => LANGUAGES.find((l) => l.code === code) ?? LANGUAGES[0]
