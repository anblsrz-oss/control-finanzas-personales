// Utilidades de formato. Multimoneda: se formatea segun la moneda de cada cuenta.
// El locale sigue al idioma activo (es -> es-MX, en -> en-US).

import { activeLocale } from '@/i18n'
import { parseLocalDate } from '@/lib/dates'

export function formatMoney(amount: number, currency = 'MXN'): string {
  try {
    return new Intl.NumberFormat(activeLocale(), {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
    }).format(amount)
  } catch {
    // Si la moneda no es valida para Intl, caer a formato simple.
    return `${amount.toFixed(2)} ${currency}`
  }
}

export function formatDate(date: string | Date): string {
  // parseLocalDate distingue las columnas `date` ("YYYY-MM-DD", medianoche
  // local) de las `timestamptz` (que ya traen zona). Con `new Date()` a secas
  // las primeras se leian como UTC y se mostraba el dia anterior.
  const d = parseLocalDate(date)
  return new Intl.DateTimeFormat(activeLocale(), {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(d)
}

// Catálogo curado de monedas. Orden = orden en que aparecen en el buscador.
// `currency` es texto libre en la base de datos (columnas de accounts, cards,
// credit_lines, budgets, transactions), así que esta lista es solo la comodidad
// del selector: el CurrencyCombobox también acepta cualquier código ISO de 3
// letras que se teclee y no esté aquí.
export const CURRENCIES = [
  // Usadas hoy
  'MXN', 'USD', 'EUR', 'CAD', 'GBP',
  // Latinoamérica
  'DOP', 'BRL', 'ARS', 'COP', 'CLP', 'PEN', 'UYU', 'GTQ', 'CRC',
  'BOB', 'PYG', 'VES', 'HNL', 'NIO', 'PAB',
  // Otras comunes
  'JPY', 'CHF', 'CNY', 'AUD',
] as const
export type Currency = (typeof CURRENCIES)[number]

export const CURRENCIES_ARRAY = Array.from(CURRENCIES) as [string, ...string[]]

// Nombre en español de cada moneda del catálogo. Se usa en el buscador del
// CurrencyCombobox (para poder escribir "peso dominicano" o "libra") y como
// subtítulo de la opción.
export const CURRENCY_LABELS: Record<string, string> = {
  MXN: 'Peso mexicano',
  USD: 'Dólar estadounidense',
  EUR: 'Euro',
  CAD: 'Dólar canadiense',
  GBP: 'Libra esterlina',
  DOP: 'Peso dominicano',
  BRL: 'Real brasileño',
  ARS: 'Peso argentino',
  COP: 'Peso colombiano',
  CLP: 'Peso chileno',
  PEN: 'Sol peruano',
  UYU: 'Peso uruguayo',
  GTQ: 'Quetzal guatemalteco',
  CRC: 'Colón costarricense',
  BOB: 'Boliviano',
  PYG: 'Guaraní paraguayo',
  VES: 'Bolívar venezolano',
  HNL: 'Lempira hondureño',
  NIO: 'Córdoba nicaragüense',
  PAB: 'Balboa panameño',
  JPY: 'Yen japonés',
  CHF: 'Franco suizo',
  CNY: 'Yuan chino',
  AUD: 'Dólar australiano',
}

// Normaliza un código de moneda tecleado por el usuario ("dop" -> "DOP").
export function normalizeCurrencyCode(raw: string): string {
  return raw.trim().toUpperCase()
}

// ¿Es un código ISO 4217 plausible (3 letras)? No valida contra una lista real:
// solo forma. El tipo de cambio dirá si el par existe.
export function isValidCurrencyCode(raw: string): boolean {
  return /^[A-Z]{3}$/.test(normalizeCurrencyCode(raw))
}
