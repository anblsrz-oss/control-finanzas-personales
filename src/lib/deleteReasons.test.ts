import { test } from 'node:test'
import assert from 'node:assert/strict'
import { userDeleteReasons } from './deleteReasons.ts'

const d = (...reasons: (string | null)[]) => reasons.map((reason) => ({ reason }))
const DEFAULTS = ['Duplicado', 'Error de captura', 'Monto incorrecto']

test('un motivo nuevo se agrega; los que ya son rápidos no se repiten', () => {
  assert.deepEqual(userDeleteReasons(d('Compra devuelta', 'duplicado', 'ERROR DE CAPTURA'), DEFAULTS), ['Compra devuelta'])
})

test('ignora acentos y mayúsculas al deduplicar y conserva la escritura más reciente', () => {
  assert.deepEqual(userDeleteReasons(d('Cobro duplicádo banco', 'cobro duplicado BANCO'), DEFAULTS), ['Cobro duplicádo banco'])
})

test('los más usados primero; a igual uso, el más reciente', () => {
  const out = userDeleteReasons(d('B', 'A', 'A', 'C'), DEFAULTS)
  assert.deepEqual(out, ['A', 'B', 'C'])
})

test('descarta vacíos, frases largas y el texto automático de duplicado de aviso', () => {
  const out = userDeleteReasons(
    d(null, '  ', 'x'.repeat(41), 'Duplicado de otro aviso (SMS/correo/notificación)', 'Regalo'),
    DEFAULTS,
  )
  assert.deepEqual(out, ['Regalo'])
})

test('respeta el máximo', () => {
  assert.equal(userDeleteReasons(d('a1', 'a2', 'a3', 'a4'), DEFAULTS, 2).length, 2)
})
