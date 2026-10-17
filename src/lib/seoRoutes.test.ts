// Sin framework de tests en el proyecto: se corre con `npm test` (node:test, Node >= 22.6).
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { absoluteUrl, findSeoRoute, langFromPath, localePath } from './seoRoutes.ts'

test('localePath: español sin prefijo, inglés con /en', () => {
  assert.equal(localePath('/privacidad', 'en'), '/en/privacidad')
  assert.equal(localePath('/privacidad', 'es'), '/privacidad')
  assert.equal(localePath('/', 'en'), '/en')
  assert.equal(localePath('/', 'es'), '/')
})

test('localePath: idempotente y conserva query/hash', () => {
  assert.equal(localePath('/en/privacidad', 'en'), '/en/privacidad')
  assert.equal(localePath('/en/privacidad', 'es'), '/privacidad')
  assert.equal(localePath('/en', 'es'), '/')
  assert.equal(localePath('/#comentarios', 'en'), '/en#comentarios')
  assert.equal(localePath('/login?mode=signup', 'es'), '/login?mode=signup')
})

test('langFromPath: solo /en y /en/… son inglés', () => {
  assert.equal(langFromPath('/en'), 'en')
  assert.equal(langFromPath('/en/cookies'), 'en')
  assert.equal(langFromPath('/'), 'es')
  assert.equal(langFromPath('/cookies'), 'es')
  assert.equal(langFromPath('/entradas'), 'es')
})

test('findSeoRoute y absoluteUrl', () => {
  assert.equal(findSeoRoute('/en')?.path, '/')
  assert.equal(findSeoRoute('/en/terminos/')?.path, '/terminos')
  assert.equal(findSeoRoute('/cuentas'), undefined)
  assert.equal(absoluteUrl('/', 'es'), 'https://controlfinanzaspersonales.com/')
  assert.equal(absoluteUrl('/escanear-tickets', 'en'), 'https://controlfinanzaspersonales.com/en/escanear-tickets')
})
