// Cada diccionario debe cubrir las mismas claves que en.ts y conservar los {{placeholders}}.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { en } from './en.ts'
import { LANGUAGES } from './languages.ts'

const ph = (s: string) => (s.match(/\{\{[^}]+\}\}/g) ?? []).sort().join('|')

for (const { code } of LANGUAGES) {
  if (code === 'es' || code === 'en') continue
  test(`locales/${code}: mismas claves y placeholders que en.ts`, async () => {
    const dict: Record<string, string> = (await import(`./locales/${code}.ts`))[code]
    assert.deepEqual(Object.keys(dict), Object.keys(en))
    for (const [k, v] of Object.entries(dict)) assert.equal(ph(v), ph(k), `placeholders de ${JSON.stringify(k)}`)
  })
}
