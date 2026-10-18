// Interés de una compra diferida a meses CON intereses. Sin dependencias para
// poder probarlo con `node --test src/lib/interest.test.ts`.

export type InterestRateMode = 'monthly' | 'total'

/**
 * Interés total (en monto) de diferir `total` a `months` mensualidades.
 * - 'total': porcentaje sobre la compra (12% → total × 0.12).
 * - 'monthly': tasa mensual con pago fijo (amortización francesa), como la
 *   cobra el banco: mensualidad = P·r / (1 − (1 + r)^−n).
 */
export function interestFromRate(
  total: number,
  months: number,
  rate: number,
  mode: InterestRateMode,
): number {
  if (!(total > 0) || !(months > 0) || !(rate > 0)) return 0
  if (mode === 'total') return round2(total * (rate / 100))
  const r = rate / 100
  const payment = (total * r) / (1 - Math.pow(1 + r, -months))
  return round2(payment * months - total)
}

const round2 = (n: number) => Math.round(n * 100) / 100
