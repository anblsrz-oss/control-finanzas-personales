// Cálculo de rendimientos de cuentas de ahorro e inversión.
//
// Convenciones del mercado mexicano (bancos y SOFIPOs):
//  - La tasa publicada es ANUAL nominal (base del GAT nominal).
//  - El interés se devenga por DÍA sobre base 365, no dividiendo entre 12.
//    Por eso un mes de 31 días rinde más que uno de 28, y dividir entre 12
//    da un número que no cuadra con el estado de cuenta.
//  - La retención de ISR se calcula sobre el CAPITAL (no sobre el interés),
//    con una tasa anual que fija cada año la Ley de Ingresos. También se
//    devenga por día.

import {
  lastDayOfMonth,
  parseLocalDate,
  monthsElapsed,
  toISODate as toLocalISO,
} from '@/lib/dates'

export type YieldRatePeriod = 'monthly' | 'annual'
export type YieldKind = 'demand' | 'term'

const DAYS_IN_YEAR = 365

/** Días del mes al que pertenece una fecha. */
export function daysInMonthOf(date: string | Date = new Date()): number {
  const d = parseLocalDate(date)
  return lastDayOfMonth(d.getFullYear(), d.getMonth())
}

/** Pasa una tasa capturada a su equivalente anual. */
export function toAnnualRate(rate: number, period: YieldRatePeriod): number {
  return period === 'annual' ? rate : rate * 12
}

/**
 * Tasa mensual equivalente, prorrateada por los días reales del mes.
 * Es lo que se muestra como referencia bajo el campo de captura.
 */
export function toMonthlyRate(
  rate: number,
  period: YieldRatePeriod,
  days: number = daysInMonthOf(),
): number {
  if (period === 'monthly') return rate
  return (rate / DAYS_IN_YEAR) * days
}

export interface YieldTier {
  minAmount: number
  rate: number
}

export interface ExpectedYieldInput {
  balance: number
  rate: number
  period: YieldRatePeriod
  kind: YieldKind
  /** Días a devengar. Por defecto, los del mes en curso. */
  days?: number
  /** Solo para plazo fijo: cuándo vence. */
  termEnd?: string | null
  termDays?: number | null
  /** Mes que se está calculando, "YYYY-MM-01". */
  periodMonth?: string
  withholdIsr?: boolean
  isrRate?: number | null
  /**
   * Tramos por monto (ej. SOFIPOs: primeros $50,000 a una tasa, el
   * excedente a otra). Marginales, como una tabla de ISR: cada tramo cubre
   * desde su minAmount hasta el minAmount del siguiente. Si vienen, sustituyen
   * a `rate` para el cálculo del bruto; el periodo/tipo/ISR siguen siendo los
   * de la cuenta, compartidos por todos los tramos.
   */
  tiers?: YieldTier[]
}

export interface ExpectedYieldResult {
  /** Interés antes de impuestos. */
  gross: number
  /** Retención de ISR estimada. */
  isr: number
  /** Lo que realmente se abona. */
  net: number
}

/**
 * Rendimiento esperado de un mes.
 * - A la vista: se devenga cada día del mes.
 * - Plazo fijo: el interés se paga completo al vencimiento, así que solo se
 *   reconoce en el mes en que vence; los demás meses dan cero.
 */
/** Bruto de un solo tramo de `balance` a una tasa dada, mismo criterio flat-vs-prorrateo que el general. */
function grossForRate(
  amount: number,
  rate: number,
  period: YieldRatePeriod,
  kind: YieldKind,
  accrualDays: number,
): number {
  const annual = toAnnualRate(rate, period)
  return period === 'monthly' && kind === 'demand'
    ? (amount * rate) / 100
    : (amount * (annual / 100) * accrualDays) / DAYS_IN_YEAR
}

/** Bruto marginal por tramos, tipo tabla de ISR: cada tramo solo cobra su tasa sobre la porción que le toca. */
function blendedGross(
  balance: number,
  tiers: YieldTier[],
  period: YieldRatePeriod,
  kind: YieldKind,
  accrualDays: number,
): number {
  const sorted = [...tiers].sort((a, b) => a.minAmount - b.minAmount)
  let gross = 0
  for (let i = 0; i < sorted.length; i++) {
    const tier = sorted[i]
    const nextMin = sorted[i + 1]?.minAmount ?? Infinity
    const slice = Math.max(0, Math.min(balance, nextMin) - tier.minAmount)
    if (slice <= 0) continue
    gross += grossForRate(slice, tier.rate, period, kind, accrualDays)
  }
  return gross
}

export function expectedYield(input: ExpectedYieldInput): ExpectedYieldResult {
  const {
    balance,
    rate,
    period,
    kind,
    termEnd,
    termDays,
    periodMonth,
    withholdIsr,
    isrRate,
    tiers,
  } = input
  const days = input.days ?? daysInMonthOf(periodMonth ?? new Date())

  let accrualDays = days
  if (kind === 'term') {
    // Sin fecha de vencimiento no hay nada que reconocer todavía.
    if (!termEnd) return { gross: 0, isr: 0, net: 0 }
    const end = parseLocalDate(termEnd)
    const ref = parseLocalDate(periodMonth ?? toLocalISO(new Date()))
    const sameMonth =
      end.getFullYear() === ref.getFullYear() && end.getMonth() === ref.getMonth()
    if (!sameMonth) return { gross: 0, isr: 0, net: 0 }
    // Al vencer se paga el interés de todo el plazo.
    accrualDays = termDays ?? days
  }

  // Una tasa capturada como MENSUAL significa "esto por mes", así que se
  // aplica plana: prorratearla por días cambiaría el significado de las
  // cuentas que ya existían. El prorrateo por días reales es propio de la
  // tasa anual, que es como la publican los bancos. Con tramos, cada uno
  // sigue la misma regla sobre la porción de saldo que le toca.
  const gross =
    tiers && tiers.length > 0
      ? blendedGross(balance, tiers, period, kind, accrualDays)
      : grossForRate(balance, rate, period, kind, accrualDays)

  // El ISR sí es siempre una tasa anual (Ley de Ingresos), sobre el capital,
  // sin importar los tramos.
  const isr = withholdIsr
    ? (balance * ((isrRate ?? 0) / 100) * accrualDays) / DAYS_IN_YEAR
    : 0

  return { gross, isr, net: gross - isr }
}

/** Días restantes de un plazo fijo (0 si ya venció o no aplica). */
export function daysToMaturity(termEnd?: string | null): number {
  if (!termEnd) return 0
  const diff = Math.round(
    (parseLocalDate(termEnd).getTime() - new Date().setHours(0, 0, 0, 0)) / 86_400_000,
  )
  return Math.max(0, diff)
}

export { monthsElapsed }
