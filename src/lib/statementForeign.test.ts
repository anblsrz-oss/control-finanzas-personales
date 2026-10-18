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
