// Reglas de correo SIN regex: quien no sabe escribir expresiones regulares
// describe dónde está cada dato ("el monto viene después de: por") o pega un
// correo de ejemplo y escribe lo que ve en él; aquí se convierte a los mismos
// regex que ya entiende el backend (_shared/parseEmail.ts → stageFromEmail):
//   - amountRegex: el PRIMER grupo no nulo es la cifra;
//   - conceptRegex / last4Regex: el grupo 1.
// Todos se compilan con la bandera 'i'. Dejar un campo vacío conserva los
// patrones automáticos del backend (Total → monto con moneda → cifra suelta;
// terminación genérica; asunto como concepto).
//
// previewRule replica (en simple) lo que hará el backend con un texto, para
// mostrar una vista previa antes de guardar.

export interface SimpleRuleFields {
  amountBefore: string
  conceptBefore: string
  conceptAfter: string
  last4Before: string
}

export const EMPTY_SIMPLE: SimpleRuleFields = {
  amountBefore: '',
  conceptBefore: '',
  conceptAfter: '',
  last4Before: '',
}

export function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

// Texto literal escapado, tolerante a espacios/saltos de línea distintos.
// Si empieza con letra/dígito, se ancla a inicio de palabra para que "en" no
// coincida dentro de "Movimiento".
function literal(s: string): string {
  const body = escapeRe(s.trim()).replace(/\s+/g, '\\s+')
  return /^[A-Za-z0-9_]/.test(s.trim()) ? `\\b${body}` : body
}

const CURRENCY_TOKEN = '(?:US\\$|MX\\$|\\$|MXN|USD|EUR)'

export function amountRegexFrom(before: string): string {
  if (!before.trim()) return ''
  return `${literal(before)}\\s*:?\\s*${CURRENCY_TOKEN}?\\s*([\\d.,]*\\d)`
}

export function conceptRegexFrom(before: string, after: string): string {
  if (!before.trim()) return ''
  return after.trim()
    ? `${literal(before)}\\s*(.+?)\\s*${literal(after)}`
    : `${literal(before)}\\s*([^\\n.,;]+)`
}

export function last4RegexFrom(before: string): string {
  if (!before.trim()) return ''
  return `${literal(before)}\\D{0,6}(\\d{4})`
}

export function regexesFromSimple(f: SimpleRuleFields) {
  return {
    amountRegex: amountRegexFrom(f.amountBefore),
    conceptRegex: conceptRegexFrom(f.conceptBefore, f.conceptAfter),
    last4Regex: last4RegexFrom(f.last4Before),
  }
}

/** Error legible si el patrón no compila; null si es válido o está vacío. */
export function regexError(pattern: string): string | null {
  if (!pattern.trim()) return null
  try {
    new RegExp(pattern, 'i')
    return null
  } catch (e) {
    return e instanceof Error ? e.message : String(e)
  }
}

// --- Copia de parseEmail.ts (backend) para la vista previa ---

export function parseAmountString(raw: string): number | null {
  const s = raw.trim()
  const lastComma = s.lastIndexOf(',')
  const lastDot = s.lastIndexOf('.')
  let normalized: string
  if (lastComma !== -1 && lastDot !== -1) {
    normalized =
      lastComma > lastDot ? s.replace(/\./g, '').replace(',', '.') : s.replace(/,/g, '')
  } else if (lastComma !== -1) {
    normalized =
      s.length - lastComma - 1 === 2 && s.indexOf(',') === lastComma
        ? s.replace(',', '.')
        : s.replace(/,/g, '')
  } else {
    normalized = s
  }
  const n = parseFloat(normalized)
  return Number.isFinite(n) ? n : null
}

const CURRENCY_AMOUNT =
  /(US\$|MX\$|\$|MXN|USD|EUR)\s*([\d,]+(?:\.\d{2})?)|([\d,]+(?:\.\d{2})?)\s*(US\$|MX\$|\$|MXN|USD|EUR)/i
const TOTAL_AMOUNT = /\btotal\b\s*:?\s*(US\$|MX\$|\$|USD|MXN|EUR)?\s*([\d,]+(?:\.\d{2})?)/i
const LOOSE_AMOUNT = /([\d,]+\.\d{2})/
const GENERIC_LAST4 =
  /(?:terminaci[oó]n|terminada en|final(?:iza)?(?:\s+en)?|\*{2,}|[·•]{2,}|x{2,})\s*(\d{4})/i

function safeRe(pattern?: string): RegExp | null {
  if (!pattern) return null
  try {
    return new RegExp(pattern, 'i')
  } catch {
    return null
  }
}

export interface RulePreview {
  amount: number | null
  concept: string | null
  last4: string | null
  /** true si el dato salió de los patrones automáticos (campo vacío). */
  autoAmount: boolean
  autoConcept: boolean
  autoLast4: boolean
}

export function previewRule(
  text: string,
  cfg: { amountRegex?: string; conceptRegex?: string; last4Regex?: string },
): RulePreview {
  let amount: number | null = null
  const amountRe = safeRe(cfg.amountRegex)
  if (amountRe) {
    const raw = text.match(amountRe)?.slice(1).find((g) => g != null)
    const n = raw ? parseAmountString(raw) : null
    amount = n != null && n > 0 ? n : null
  } else {
    const total = text.match(TOTAL_AMOUNT)
    const generic = text.match(CURRENCY_AMOUNT)
    const loose = text.match(LOOSE_AMOUNT)
    const raw = total?.[2] ?? generic?.[2] ?? generic?.[3] ?? loose?.[1]
    const n = raw ? parseAmountString(raw) : null
    amount = n != null && n > 0 ? n : null
  }

  const conceptRe = safeRe(cfg.conceptRegex)
  const concept = conceptRe ? text.match(conceptRe)?.[1]?.trim() || null : null

  const last4Re = safeRe(cfg.last4Regex)
  const last4 = (last4Re ? text.match(last4Re)?.[1] : text.match(GENERIC_LAST4)?.[1]) ?? null

  return {
    amount,
    concept,
    last4,
    autoAmount: !amountRe,
    autoConcept: !conceptRe,
    autoLast4: !last4Re,
  }
}

// --- Detección a partir de un correo de ejemplo ---

// Las 1-3 palabras inmediatamente antes de `idx`, en la misma línea, sin
// símbolos sueltos al final ("tarjeta ****" → "tarjeta"; "por $" → "por").
function wordsBefore(text: string, idx: number, max = 3): string {
  const line = text.slice(0, idx).split('\n').pop() ?? ''
  const tokens = line.trim().split(/\s+/).filter(Boolean)
  // Quita símbolos de moneda/enmascarado pegados al final.
  while (tokens.length && !/[\p{L}\p{N}]/u.test(tokens[tokens.length - 1])) tokens.pop()
  if (tokens.length) {
    tokens[tokens.length - 1] = tokens[tokens.length - 1].replace(/[^\p{L}\p{N}:]+$/u, '')
  }
  // Solo palabras fijas: una cifra o un monto ("$1,234.56 en") cambia de un
  // correo a otro, así que se corta ahí.
  const picked: string[] = []
  for (let i = tokens.length - 1; i >= 0 && picked.length < max; i--) {
    if (/[\d$€]/.test(tokens[i])) break
    picked.unshift(tokens[i])
  }
  return picked.join(' ').trim()
}

// La palabra inmediatamente después de `idx` en la misma línea.
function wordAfter(text: string, idx: number): string {
  const line = text.slice(idx).split('\n')[0] ?? ''
  const m = line.match(/^\s*([\p{L}\p{N}]+)/u)
  return m?.[1] ?? ''
}

export interface ExampleValues {
  amount?: string
  concept?: string
  last4?: string
}

export interface ExampleDetection {
  fields: Partial<SimpleRuleFields>
  /** Datos que se pidieron pero no se encontraron en el texto. */
  notFound: (keyof ExampleValues)[]
}

export function inferFromExample(text: string, values: ExampleValues): ExampleDetection {
  const fields: Partial<SimpleRuleFields> = {}
  const notFound: (keyof ExampleValues)[] = []

  if (values.amount?.trim()) {
    const target = parseAmountString(values.amount.replace(/[^\d.,]/g, ''))
    const re = /(?:US\$|MX\$|\$|MXN|USD|EUR)?\s*([\d.,]*\d)/gi
    let found = false
    for (const m of text.matchAll(re)) {
      const n = parseAmountString(m[1])
      if (target != null && n != null && Math.abs(n - target) < 0.005) {
        const before = wordsBefore(text, m.index ?? 0, 2)
        if (before) {
          fields.amountBefore = before
          found = true
          break
        }
      }
    }
    if (!found) notFound.push('amount')
  }

  if (values.concept?.trim()) {
    const c = values.concept.trim()
    const idx = text.toLowerCase().indexOf(c.toLowerCase())
    const before = idx >= 0 ? wordsBefore(text, idx, 2) : ''
    if (before) {
      fields.conceptBefore = before
      fields.conceptAfter = wordAfter(text, idx + c.length)
    } else {
      notFound.push('concept')
    }
  }

  if (values.last4?.trim()) {
    const l4 = values.last4.replace(/\D/g, '').slice(-4)
    const re = new RegExp(`(?<!\\d)${l4}(?!\\d)`, 'g')
    const m = l4.length === 4 ? re.exec(text) : null
    const before = m ? wordsBefore(text, m.index, 2) : ''
    if (before) fields.last4Before = before
    else notFound.push('last4')
  }

  return { fields, notFound }
}
