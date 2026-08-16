// Regenera src/data/emojiCodepoints.json y descarga los SVG de Twemoji
// usados por el catálogo de src/data/emojiCategories.json hacia public/emoji/.
// Ejecutar con `npm run emoji:sync` cada vez que se agreguen emojis nuevos
// al catálogo. Requiere conexión a internet (CDN jsdelivr); el resultado se
// commitea para que la app funcione offline (APK vía Capacitor).
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import twemoji from '@twemoji/api'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const categoriesPath = join(root, 'src/data/emojiCategories.json')
const codepointsPath = join(root, 'src/data/emojiCodepoints.json')
const assetsDir = join(root, 'public/emoji')
const CDN_BASE = 'https://cdn.jsdelivr.net/gh/jdecked/twemoji@latest/assets/svg/'

const categories = JSON.parse(readFileSync(categoriesPath, 'utf-8'))
const emojis = [...new Set(categories.flatMap((g) => g.emojis))]

function codepointOf(emoji) {
  let codepoint = null
  twemoji.parse(emoji, {
    callback(icon) {
      codepoint = icon
      return false
    },
  })
  if (!codepoint) throw new Error(`No se pudo calcular el codepoint de: ${emoji}`)
  return codepoint
}

if (!existsSync(assetsDir)) mkdirSync(assetsDir, { recursive: true })

const map = {}
const missing = []
for (const emoji of emojis) {
  let codepoint
  try {
    codepoint = codepointOf(emoji)
  } catch (err) {
    missing.push({ emoji, codepoint: '?', status: err.message })
    continue
  }
  map[emoji] = codepoint
  const dest = join(assetsDir, `${codepoint}.svg`)
  if (existsSync(dest)) continue
  const res = await fetch(`${CDN_BASE}${codepoint}.svg`)
  if (!res.ok) {
    missing.push({ emoji, codepoint, status: res.status })
    continue
  }
  writeFileSync(dest, Buffer.from(await res.arrayBuffer()))
  console.log(`descargado ${codepoint}.svg (${emoji})`)
}

writeFileSync(codepointsPath, JSON.stringify(map, null, 2) + '\n')
console.log(`\n${Object.keys(map).length} emojis mapeados en ${codepointsPath}`)

if (missing.length) {
  console.error(`\n${missing.length} SVG no encontrados en el CDN:`)
  for (const m of missing) console.error(`  ${m.emoji} -> ${m.codepoint} (HTTP ${m.status})`)
  process.exitCode = 1
}
