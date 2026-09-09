// Compara las líneas de un estado de cuenta (extraídas por OCR, edge
// ocr-receipt mode 'statement') contra las transacciones ya registradas en la
// app para la misma tarjeta/cuenta y periodo. Puro y sin dependencias de red:
// toda la lógica de emparejado vive aquí para poder testearla.
//
// Todo se normaliza a la moneda del instrumento (`targetCurrency`):
//  - transacción: `amount` si su moneda == targetCurrency, si no `base_amount`
//    (ya convertido a la moneda principal — mismo criterio que
//    computeLineStatement).
//  - línea del estado de cuenta: `amount` convertido con `lineRates` si su
//    moneda difiere del target (el llamador pasa las tasas que ya cachea).
//
// El signo de un movimiento depende del instrumento que se concilia: un
// `card_payment` es salida desde la cuenta origen pero abono (entra) en la
// tarjeta/línea.

import { parseLocalDate } from '@/lib/dates'
import type { StatementLine, TransactionRow } from '@/types/db'

export type { StatementLine }

export interface ReconcileOptions {
  /** Moneda del instrumento; decide amount vs base_amount y a qué convertir. */
  targetCurrency: string
  /** 'card' concilia una tarjeta; 'account' una cuenta. Cambia el signo de card_payment/transfer. */
  instrument: 'card' | 'account'
  /** Id de la cuenta que se concilia (para saber la dirección de una transferencia). */
  instrumentAccountId?: string
  /** monedaLínea -> unidades de targetCurrency por 1 unidad (para líneas en otra moneda). */
  lineRates?: Record<string, number>
  /** Diferencia de importe tolerada para considerar "coincide" (en targetCurrency). */
  amountTolerance?: number
  /** Ventana de días entre la fecha del estado de cuenta y la de la transacción. */
  dateWindowDays?: number
}

export interface MatchedPair {
  line: StatementLine
  tx: TransactionRow
}
export interface MismatchPair extends MatchedPair {
  /** importe(línea) - importe(tx), con signo, en targetCurrency. */
  diff: number
}

export interface ReconcileResult {
  matched: MatchedPair[]
  amountMismatch: MismatchPair[]
  missingInApp: StatementLine[]
  missingInStatement: TransactionRow[]
  /** Suma con signo de las líneas del estado de cuenta, en targetCurrency. */
  statementTotal: number
  /** Suma con signo de las transacciones consideradas, en targetCurrency. */
  appTotal: number
}

const DEFAULTS = { amountTolerance: 0.5, dateWindowDays: 4 }
// Por encima de este % de diferencia relativa (y fuera de la tolerancia
// absoluta) se considera "monto distinto" en vez de descartar el emparejado.
const MISMATCH_MAX_RATIO = 0.15
const EPSILON = 0.01

function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100
}

function daysBetween(a: string, b: string): number {
  const ms = parseLocalDate(a).getTime() - parseLocalDate(b).getTime()
  return Math.abs(ms) / 86_400_000
}

/** Importe con signo de una línea del estado de cuenta, en targetCurrency. */
function lineSigned(l: StatementLine, opts: ReconcileOptions): number {
  let v = Math.abs(l.amount)
  if (l.currency && l.currency !== opts.targetCurrency) {
    v *= opts.lineRates?.[l.currency] ?? 1
  }
  return l.isCardPayment || l.kind === 'income' ? v : -v
}

/** Importe con signo de una transacción, en targetCurrency. */
function txSigned(tx: TransactionRow, opts: ReconcileOptions): number {
  const raw = tx.currency === opts.targetCurrency ? tx.amount : tx.base_amount ?? tx.amount
  const abs = Math.abs(raw)
  switch (tx.kind) {
    case 'income':
    case 'refund':
      return abs
    case 'card_payment':
      // Abono en la tarjeta/línea; salida desde la cuenta origen.
      return opts.instrument === 'card' ? abs : -abs
    case 'transfer':
      return opts.instrumentAccountId && tx.to_account_id === opts.instrumentAccountId
        ? abs
        : -abs
    default:
      return -abs // expense
  }
}

function tokenize(s: string): Set<string> {
  return new Set(
    s
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((w) => w.length >= 3),
  )
}

function tokenOverlap(a: string, b: string): number {
  const ta = tokenize(a)
  const tb = tokenize(b)
  if (ta.size === 0 || tb.size === 0) return 0
  let n = 0
  for (const w of ta) if (tb.has(w)) n++
  return n
}

/**
 * Empareja de forma voraz: por cada línea del estado de cuenta (en orden de
 * fecha) busca la transacción no usada del mismo signo más parecida en importe
 * y fecha. Si el importe difiere poco -> `matched`; si difiere dentro de un
 * margen razonable -> `amountMismatch`; si no hay candidata -> `missingInApp`.
 */
export function reconcileStatement(
  lines: StatementLine[],
  txns: TransactionRow[],
  opts: ReconcileOptions,
): ReconcileResult {
  const tol = opts.amountTolerance ?? DEFAULTS.amountTolerance
  const win = opts.dateWindowDays ?? DEFAULTS.dateWindowDays

  const sortedLines = [...lines].sort((a, b) => a.txDate.localeCompare(b.txDate))
  const used = new Set<string>()

  const matched: MatchedPair[] = []
  const amountMismatch: MismatchPair[] = []
  const missingInApp: StatementLine[] = []

  for (const line of sortedLines) {
    const targetVal = lineSigned(line, opts)
    const candidates = txns.filter((tx) => {
      if (used.has(tx.id)) return false
      const s = txSigned(tx, opts)
      return Math.sign(s) === Math.sign(targetVal) && daysBetween(tx.tx_date, line.txDate) <= win
    })

    if (candidates.length === 0) {
      missingInApp.push(line)
      continue
    }

    // Mejor candidata: menor diferencia de importe, luego fecha más cercana,
    // luego mayor solape de concepto.
    const scored = candidates
      .map((tx) => {
        const s = txSigned(tx, opts)
        return {
          tx,
          amountDiff: Math.abs(Math.abs(s) - Math.abs(targetVal)),
          dateDiff: daysBetween(tx.tx_date, line.txDate),
          overlap: tokenOverlap(tx.concept ?? '', line.concept),
        }
      })
      .sort(
        (a, b) =>
          a.amountDiff - b.amountDiff ||
          a.dateDiff - b.dateDiff ||
          b.overlap - a.overlap,
      )

    const best = scored[0]
    const rel = Math.abs(targetVal) > 0 ? best.amountDiff / Math.abs(targetVal) : 1

    if (best.amountDiff <= tol || best.amountDiff <= EPSILON) {
      used.add(best.tx.id)
      matched.push({ line, tx: best.tx })
    } else if (rel <= MISMATCH_MAX_RATIO) {
      used.add(best.tx.id)
      amountMismatch.push({
        line,
        tx: best.tx,
        diff: round2(targetVal - txSigned(best.tx, opts)),
      })
    } else {
      missingInApp.push(line)
    }
  }

  const missingInStatement = txns.filter((tx) => !used.has(tx.id))

  const statementTotal = round2(
    sortedLines.reduce((sum, l) => sum + lineSigned(l, opts), 0),
  )
  const appTotal = round2(txns.reduce((sum, tx) => sum + txSigned(tx, opts), 0))

  return {
    matched,
    amountMismatch,
    missingInApp,
    missingInStatement,
    statementTotal,
    appTotal,
  }
}
