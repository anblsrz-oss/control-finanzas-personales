import { test } from 'node:test'
import assert from 'node:assert/strict'
import { reconcileStatement, tokenOverlap } from './statementReconcile.ts'
import type { StatementLine, TransactionRow } from '../types/db.ts'

const opts = { targetCurrency: 'MXN', instrument: 'card' as const }
const line = (concept: string, amount: number, txDate: string): StatementLine => ({
  concept, amount, txDate, currency: 'MXN', kind: 'expense', isCardPayment: false, isInstallment: false,
})
const tx = (id: string, concept: string, amount: number, tx_date: string) =>
  ({ id, concept, amount, tx_date, currency: 'MXN', base_amount: amount, kind: 'expense' }) as unknown as TransactionRow

test('el concepto del banco con ruido empata con el de la app', () => {
  assert.ok(tokenOverlap('NME 1105131N NETFLIX CIU', 'Netflix') > 0)
  assert.ok(tokenOverlap('MERPAGO*MERCADOLIBRE CIUDAD DE MEX', 'Mercado Libre compra') > 0)
  assert.ok(tokenOverlap('MERPAGO*MERCADOLIBRE', 'MercadoLibre') > 0)
})

test('mismo monto con fecha desfasada 6 días y concepto parecido: coincide', () => {
  const r = reconcileStatement([line('NME 1 NETFLIX CIU', 269, '2026-05-29')], [tx('a', 'Netflix', 269, '2026-06-04')], opts)
  assert.equal(r.matched.length, 1)
  assert.equal(r.missingInApp.length, 0)
})

test('desfase grande sin parecido de concepto no se empareja', () => {
  const r = reconcileStatement([line('OXXO', 93, '2026-05-22')], [tx('a', 'Netflix', 93, '2026-06-01')], opts)
  assert.equal(r.matched.length, 0)
  assert.equal(r.missingInApp.length, 1)
})

test('dos cargos del mismo monto: cada línea toma su transacción', () => {
  const r = reconcileStatement(
    [line('OXXO', 50, '2026-06-01'), line('FARMACIA', 50, '2026-06-02')],
    [tx('f', 'Farmacia', 50, '2026-06-02'), tx('o', 'Oxxo', 50, '2026-06-01')],
    opts,
  )
  assert.equal(r.matched.length, 2)
  assert.deepEqual(r.matched.map((m) => `${m.line.concept}:${m.tx.id}`).sort(), ['FARMACIA:f', 'OXXO:o'])
})

test('monto cercano pero distinto va a amountMismatch', () => {
  const r = reconcileStatement([line('CINEMEX', 276, '2026-06-06')], [tx('a', 'Cine', 260, '2026-06-06')], opts)
  assert.equal(r.amountMismatch.length, 1)
  assert.equal(r.amountMismatch[0].diff, -16)
})

test('compra marcada como pago por el OCR (signo invertido) aún empata con su gasto', () => {
  const l = { ...line('DME 18021244 DLO*UBER RIDE CIU', 25.95, '2026-07-10'), isCardPayment: true }
  const r = reconcileStatement([l], [tx('u', 'Uber', 25.95, '2026-07-09')], opts)
  assert.equal(r.matched.length, 1)
})

test('monto con centavos empata a 6 días aunque el concepto no se parezca', () => {
  const r = reconcileStatement([line('DME 18021244 DLO*UBER RIDE CIU', 49.94, '2026-07-16')], [tx('u', 'Taxi', 49.94, '2026-07-10')], opts)
  assert.equal(r.matched.length, 1)
})

test('un pago real a la tarjeta no se empareja con un gasto del mismo monto', () => {
  const l = { ...line('SU PAGO GRACIAS', 25.97, '2026-07-08'), isCardPayment: true }
  const r = reconcileStatement([l], [tx('u', 'Uber', 25.97, '2026-07-08')], opts)
  assert.equal(r.matched.length, 0)
})

test('movimientos de la app fuera del periodo del estado de cuenta no cuentan como faltantes', () => {
  const r = reconcileStatement(
    [line('OXXO', 50, '2026-06-10'), line('FARMACIA', 80, '2026-06-20')],
    [tx('a', 'Oxxo', 50, '2026-06-10'), tx('b', 'Farmacia', 80, '2026-06-20'), tx('viejo', 'Antes', 30, '2026-05-25'), tx('nuevo', 'Despues', 30, '2026-07-05'), tx('borde', 'Borde', 30, '2026-06-22')],
    opts,
  )
  assert.deepEqual(r.missingInStatement.map((t) => t.id), ['borde'])
})

test('las líneas de MSI (fecha de compra antigua) no estiran el periodo', () => {
  const msi = { ...line('MERPAGO 4/12', 666.33, '2026-05-26'), isInstallment: true }
  const r = reconcileStatement(
    [msi, line('OXXO', 50, '2026-08-20'), line('FARMACIA', 80, '2026-09-10')],
    [tx('a', 'Oxxo', 50, '2026-08-20'), tx('b', 'Farmacia', 80, '2026-09-10'), tx('jun', 'Compra de junio', 30, '2026-06-15')],
    opts,
  )
  assert.deepEqual(r.missingInStatement.map((t) => t.id), [])
})

// --- MSI: el estado de cuenta trae la mensualidad; la app, la compra completa + un plan ---
import { parseInstallmentIndex } from './statementReconcile.ts'
const plan = (id: string, monthly: number, months: number, txId: string | null, desc = 'Consola') => ({
  id, transaction_id: txId, description: desc, months, monthly_payment: monthly, currency: 'MXN',
})
const msiLine = (concept: string, amount: number, txDate = '2026-05-26') => ({ ...line(concept, amount, txDate), isInstallment: true })

test('parseInstallmentIndex entiende "4 de 12", "8/12" y descarta lo que no es', () => {
  assert.deepEqual(parseInstallmentIndex('Compra en MERPAGO*MERCADOLIBRE 4 de 12'), { n: 4, m: 12 })
  assert.deepEqual(parseInstallmentIndex('Mercadopago *Mercadol - 8/12 | RFC: S.I.'), { n: 8, m: 12 })
  assert.equal(parseInstallmentIndex('Compra 13/12'), null)
  assert.equal(parseInstallmentIndex('Tienda 2026'), null)
})

test('la mensualidad MSI empata con su plan y oculta la compra completa', () => {
  const r = reconcileStatement(
    [msiLine('Compra en MERPAGO*MERCADOLIBRE 4 de 12', 666.33)],
    [tx('compra', 'Consola Ps5', 7995.96, '2026-06-26')],
    { ...opts, plans: [plan('p1', 666.33, 12, 'compra')] },
  )
  assert.equal(r.installments.length, 1)
  assert.equal(r.installments[0].n, 4)
  assert.equal(r.missingInApp.length, 0)
  assert.equal(r.missingInStatement.length, 0)
  assert.equal(r.appTotal, r.statementTotal)
})

test('MSI: mismo monto pero otro plazo no empata, y queda como faltante', () => {
  const r = reconcileStatement([msiLine('Mercadol 5/12', 166.67)], [], { ...opts, plans: [plan('p1', 166.67, 6, null)] })
  assert.equal(r.installments.length, 0)
  assert.equal(r.missingInApp.length, 1)
})

test('MSI: un plan empata una sola mensualidad por estado de cuenta', () => {
  const r = reconcileStatement(
    [msiLine('Mercadol 4/12', 100), msiLine('Otra tienda 2/12', 100)],
    [],
    { ...opts, plans: [plan('p1', 100, 12, null)] },
  )
  assert.equal(r.installments.length, 1)
  assert.equal(r.missingInApp.length, 1)
})

test('MSI: los renglones de intereses/IVA del plan no se empatan como mensualidad', () => {
  const r = reconcileStatement([msiLine('Compra diferida - Cm Del Mayab - intereses 3/3', 56.48)], [], { ...opts, plans: [plan('p1', 56.48, 3, null)] })
  assert.equal(r.installments.length, 0)
})

test('MSI: con intereses empata por el monto de la mensualidad registrada', () => {
  const p = { ...plan('p1', 500, 6, null), payments: [512.34] }
  const r = reconcileStatement([msiLine('Tienda 2 de 6', 512.34)], [], { ...opts, plans: [p] })
  assert.equal(r.installments.length, 1)
})

test('MSI: "iva" solo cuenta como palabra (Activa/Nativa no son renglón de IVA)', () => {
  const r = reconcileStatement([msiLine('Tienda Nativa 3/12', 80)], [], { ...opts, plans: [plan('p1', 80, 12, null)] })
  assert.equal(r.installments.length, 1)
})
