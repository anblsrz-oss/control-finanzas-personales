import { test } from 'node:test'
import assert from 'node:assert/strict'
import { fixForeignCurrency } from './statementReconcile.ts'
import type { StatementExtraction } from '../hooks/useOcrReceipt.ts'

const row = (concept: string, currency: string | null) =>
  ({ amount: 87.05, currency, txDate: '2026-06-20', concept, kind: 'expense', isCardPayment: false, isInstallment: false })

test('renglón de moneda extranjera: el importe ya está en la moneda del estado de cuenta', () => {
  const e = { accountLast4: null, transactions: [
    row('MONEDA EXTRANJERA: 5.00 USD TCT: 17.41 DEL 20 DE JUNIO', 'USD'),
    row('NETFLIX', 'USD'),
  ] } as StatementExtraction
  const out = fixForeignCurrency(e).transactions
  assert.equal(out[0].currency, null)
  assert.equal(out[1].currency, 'USD')
})

test('el 2º renglón "MONEDA EXTRANJERA" se une al comercio anterior en un solo movimiento', () => {
  const e = { accountLast4: null, transactions: [
    { ...row('PGS* PGSHARP ROOM B3 HK', null), amount: 100 },
    row('MONEDA EXTRANJERA: 5.00 USD TCT: 17.41 DEL 20 DE JUNIO', 'USD'),
    { ...row('NETFLIX', null), amount: 269 },
  ] } as StatementExtraction
  const out = fixForeignCurrency(e).transactions
  assert.equal(out.length, 2)
  assert.equal(out[0].amount, 87.05)
  assert.match(out[0].concept, /PGSHARP.*MONEDA EXTRANJERA/)
})

test('si casi todo viene como ingreso (NU), las compras se corrigen a gasto', () => {
  const r = (concept: string, kind: 'income' | 'expense', isCardPayment = false) =>
    ({ ...row(concept, 'MXN'), kind, isCardPayment })
  const e = { accountLast4: null, transactions: [
    r('Sams', 'income'), r('Udemy', 'income'), r('Oxxo', 'income'), r('Takis', 'income'),
    r('Devolución Amazon', 'income'), r('¡Gracias por tu pago!', 'income', true),
  ] } as StatementExtraction
  const kinds = fixForeignCurrency(e).transactions.map((t) => t.kind)
  assert.deepEqual(kinds, ['expense', 'expense', 'expense', 'expense', 'income', 'income'])
})

test('un estado de cuenta normal (gastos) no se toca', () => {
  const e = { accountLast4: null, transactions: [
    row('A', null), row('B', null), row('C', null),
  ] } as StatementExtraction
  assert.equal(fixForeignCurrency(e).transactions.every((t) => t.kind === 'expense'), true)
})
