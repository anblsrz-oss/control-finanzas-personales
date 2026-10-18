// node --test src/lib/interest.test.ts
import test from 'node:test'
import assert from 'node:assert/strict'
import { interestFromRate } from './interest.ts'

test('sin tasa, sin meses o sin monto: 0 de interés', () => {
  assert.equal(interestFromRate(10000, 12, 0, 'monthly'), 0)
  assert.equal(interestFromRate(10000, 0, 2, 'monthly'), 0)
  assert.equal(interestFromRate(0, 12, 2, 'total'), 0)
})

test('% total: porcentaje directo sobre la compra', () => {
  assert.equal(interestFromRate(10000, 12, 12, 'total'), 1200)
})

test('% mensual: amortización de pago fijo (12 meses al 2% sobre $10,000)', () => {
  // Mensualidad 945.596 → interés 12 × 945.596 − 10,000 = 1,347.15
  assert.equal(interestFromRate(10000, 12, 2, 'monthly'), 1347.15)
})
