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

import type { StatementExtraction } from '@/hooks/useOcrReceipt'
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
// Segundo pase: el banco suele fechar el cargo días después/antes de la fecha registrada.
const WIDE_WINDOW_DAYS = 10
// Por encima de este % de diferencia relativa (y fuera de la tolerancia
// absoluta) se considera "monto distinto" en vez de descartar el emparejado.
const MISMATCH_MAX_RATIO = 0.15
const EPSILON = 0.01

function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100
}

// tx_date / txDate son 'YYYY-MM-DD'; se compara en UTC para no depender de la zona.
function daysBetween(a: string, b: string): number {
  return Math.abs(Date.parse(a.slice(0, 10)) - Date.parse(b.slice(0, 10))) / 86_400_000
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

// Prefijos de ruido que los bancos anteponen al comercio (CCO/NME/ANE/OCI…).
const NOISE = new Set(['cco', 'nme', 'ane', 'oci', 'nwm', 'mer', 'ciu', 'mex', 'str', 'pos', 'com'])

function tokenize(s: string): string[] {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    // Los códigos de referencia (con dígitos) no identifican al comercio.
    .filter((w) => w.length >= 3 && !/\d/.test(w) && !NOISE.has(w))
}

/** Tokens del concepto del banco que aparecen (igual o por prefijo) en el de la app. */
export function tokenOverlap(a: string, b: string): number {
  const ta = new Set(tokenize(a))
  const tb = tokenize(b)
  let n = 0
  for (const w of ta) {
    if (tb.some((x) => x === w || (Math.min(x.length, w.length) >= 4 && (x.startsWith(w) || w.startsWith(x))))) n++
  }
  return n
}

const PAYMENT_WORDS = /pago|gracias|abono|deposito|depósito|payment/i

interface Pair {
  li: number
  tx: TransactionRow
  amountDiff: number
  dateDiff: number
  overlap: number
}

/**
 * Empareja por mejor puntaje global (no línea por línea) en tres pasos:
 *  1. monto dentro de la tolerancia y fecha dentro de la ventana -> `matched`;
 *  2. lo restante, con ventana ancha, si el concepto se parece o el monto trae centavos
 *     (también ignorando el signo si el OCR confundió una compra con un pago) -> `matched`;
 *  3. lo restante con monto cercano (<= 15%) -> `amountMismatch`.
 * Las líneas sin pareja van a `missingInApp`.
 */
export function reconcileStatement(
  lines: StatementLine[],
  txns: TransactionRow[],
  opts: ReconcileOptions,
): ReconcileResult {
  const tol = opts.amountTolerance ?? DEFAULTS.amountTolerance
  const win = opts.dateWindowDays ?? DEFAULTS.dateWindowDays

  const sortedLines = [...lines].sort((a, b) => a.txDate.localeCompare(b.txDate))
  const targets = sortedLines.map((l) => lineSigned(l, opts))
  const txVals = new Map(txns.map((tx) => [tx.id, txSigned(tx, opts)]))
  const usedTx = new Set<string>()
  const lineTx = new Map<number, TransactionRow>()

  // Candidatas (línea, tx) del mismo signo dentro de `window` y con `accept(pair)`.
  function pairs(window: number, accept: (p: Pair) => boolean, anySign = false): Pair[] {
    const out: Pair[] = []
    sortedLines.forEach((line, li) => {
      if (lineTx.has(li)) return
      for (const tx of txns) {
        if (usedTx.has(tx.id)) continue
        const s = txVals.get(tx.id) as number
        if (!anySign && Math.sign(s) !== Math.sign(targets[li])) continue
        const dateDiff = daysBetween(tx.tx_date, line.txDate)
        if (dateDiff > window) continue
        const p = {
          li,
          tx,
          amountDiff: Math.abs(Math.abs(s) - Math.abs(targets[li])),
          dateDiff,
          overlap: tokenOverlap(line.concept, tx.concept ?? ''),
        }
        if (accept(p)) out.push(p)
      }
    })
    return out
  }

  function assign(cands: Pair[], mismatch?: MismatchPair[]) {
    cands.sort((a, b) => b.overlap - a.overlap || a.dateDiff - b.dateDiff || a.amountDiff - b.amountDiff)
    for (const p of cands) {
      if (lineTx.has(p.li) || usedTx.has(p.tx.id)) continue
      lineTx.set(p.li, p.tx)
      usedTx.add(p.tx.id)
      if (mismatch) {
        mismatch.push({
          line: sortedLines[p.li],
          tx: p.tx,
          diff: round2(targets[p.li] - (txVals.get(p.tx.id) as number)),
        })
      }
    }
  }

  const isMatch = (p: Pair) => p.amountDiff <= tol || p.amountDiff <= EPSILON
  assign(pairs(win, isMatch))
  const wide = Math.max(win, WIDE_WINDOW_DAYS)
  // Un monto con centavos casi no coincide por casualidad; uno redondo sí, y ahí exige concepto.
  const distinctive = (p: Pair) => p.overlap > 0 || Math.abs(Math.round(targets[p.li] * 100) % 100) !== 0
  assign(pairs(wide, (p) => isMatch(p) && distinctive(p)))
  // El OCR a veces marca como abono/pago una compra (Uber, Spotify…): reintenta sin signo,
  // salvo que el concepto sea de verdad un pago.
  assign(
    pairs(
      wide,
      (p) => isMatch(p) && distinctive(p) && !PAYMENT_WORDS.test(sortedLines[p.li].concept),
      true,
    ),
  )
  const amountMismatch: MismatchPair[] = []
  assign(
    pairs(win, (p) => p.amountDiff / Math.max(Math.abs(targets[p.li]), EPSILON) <= MISMATCH_MAX_RATIO),
    amountMismatch,
  )

  const mismatchLines = new Set(amountMismatch.map((m) => m.line))
  const matched: MatchedPair[] = []
  const missingInApp: StatementLine[] = []
  sortedLines.forEach((line, li) => {
    const tx = lineTx.get(li)
    if (!tx) missingInApp.push(line)
    else if (!mismatchLines.has(line)) matched.push({ line, tx })
  })

  const missingInStatement = txns.filter((tx) => !usedTx.has(tx.id))
  const statementTotal = round2(targets.reduce((sum, v) => sum + v, 0))
  const appTotal = round2(txns.reduce((sum, tx) => sum + (txVals.get(tx.id) as number), 0))

  return { matched, amountMismatch, missingInApp, missingInStatement, statementTotal, appTotal }
}

// "MONEDA EXTRANJERA: 5.00 USD TCT: 17.41": el importe del renglón ya viene convertido a la
// moneda del estado de cuenta; el OCR a veces lo etiqueta con la moneda extranjera (87.05 USD).
// Se quita la moneda para que se tome como la del instrumento.
const FOREIGN_RE = /\d[\d,]*(?:\.\d+)?\s*[A-Za-z]{3}\s*TCT/i

export function fixForeignCurrency(e: StatementExtraction): StatementExtraction {
  return fixInvertedKind(mergeForeignRows(e))
}

function mergeForeignRows(e: StatementExtraction): StatementExtraction {
  const out: StatementExtraction['transactions'] = []
  for (const raw of e.transactions) {
    const t =
      raw.currency && FOREIGN_RE.test(raw.concept ?? '') ? { ...raw, currency: null } : raw
    const prev = out[out.length - 1]
    // "MONEDA EXTRANJERA…" es el 2º renglón del cargo anterior (mismo importe, el del
    // renglón con la tasa): el OCR a veces lo parte en dos movimientos y inventa el monto del 1º.
    if (prev && /^\s*moneda extranjera/i.test(t.concept ?? '') && daysBetween(prev.txDate, t.txDate) <= 3) {
      out[out.length - 1] = { ...t, concept: `${prev.concept} ${t.concept}`.trim() }
    } else {
      out.push(t)
    }
  }
  return { ...e, transactions: out }
}

// Algunos estados de cuenta (NU) muestran las compras como importes positivos y el OCR las
// marca todas como "income". En una tarjeta lo normal es que casi todo sea compra: si más del
// 80% de los renglones que no son pago vienen como ingreso, se invierten (salvo devoluciones).
const REFUND_WORDS = /devoluci|reembolso|cancelaci|bonificaci|refund/i

function fixInvertedKind(e: StatementExtraction): StatementExtraction {
  const purchases = e.transactions.filter((t) => !t.isCardPayment)
  const incomes = purchases.filter((t) => t.kind === 'income')
  if (purchases.length < 3 || incomes.length / purchases.length <= 0.8) return e
  return {
    ...e,
    transactions: e.transactions.map((t) =>
      t.kind === 'income' && !t.isCardPayment && !REFUND_WORDS.test(t.concept ?? '')
        ? { ...t, kind: 'expense' as const }
        : t,
    ),
  }
}
