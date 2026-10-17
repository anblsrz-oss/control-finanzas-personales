// Une src/features/help/kb/*.json en el archivo que lee el asistente del backend
// (finzen-backend/supabase/functions/_shared/appKnowledge.ts). La KB es la
// misma que pinta /ayuda: una sola fuente, sin duplicar texto.
//   node scripts/build-kb.mjs
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const DIR = path.join(ROOT, 'src/features/help/kb')
const OUT = path.resolve(ROOT, '..', 'finzen-backend/supabase/functions/_shared/appKnowledge.ts')

const entries = fs
  .readdirSync(DIR)
  .filter((f) => f.endsWith('.json'))
  .sort()
  .flatMap((f) => JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8')))

const ids = new Set()
for (const e of entries) {
  const ok = e.id && e.title && e.route && e.summary && Array.isArray(e.steps) && Array.isArray(e.faq)
  if (!ok) throw new Error(`KB inválida: ${e.id ?? JSON.stringify(e).slice(0, 60)}`)
  if (ids.has(e.id)) throw new Error(`id repetido en la KB: ${e.id}`)
  ids.add(e.id)
}

// Módulo .ts (no .json): los .ts siempre se empaquetan al desplegar la función.
fs.writeFileSync(
  OUT,
  `// GENERADO por finzen-frontend/scripts/build-kb.mjs — no editar a mano.\nexport interface KbEntry {\n  id: string\n  title: string\n  route: string\n  featureKey: string | null\n  summary: string\n  steps: string[]\n  faq: { q: string; a: string }[]\n  canCreate?: string[]\n}\nexport const KB: KbEntry[] = ${JSON.stringify(entries.map(({ icon: _icon, ...rest }) => rest))}\n`,
)
console.log(`KB: ${entries.length} funciones → ${path.relative(ROOT, OUT)}`)
