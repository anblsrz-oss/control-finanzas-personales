// Prerender de las páginas públicas (solo web: Vercel o PRERENDER=1; ver vite.config.ts).
// Lo llama vite-plugin-pwa justo antes de generar el service worker, cuando dist/ ya tiene el
// bundle del cliente. Genera:
//  - dist/<ruta>/index.html para cada ruta de SEO_ROUTES × cada idioma de LANGUAGES (HTML real dentro de #root).
//  - dist/app-shell.html: el index.html del SPA sin contenido de landing, destino del rewrite
//    de vercel.json para rutas privadas/desconocidas (noindex, no es la landing).
//  - dist/sitemap.xml y dist/llms.txt desde SEO_ROUTES.
// Si falta algo (config real de la app, una página que renderiza vacía) el build FALLA:
// mejor no publicar que publicar límites o páginas inventados.
import { build, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { createHash } from 'node:crypto'
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

async function fetchAppConfig(env) {
  const url = env.VITE_SUPABASE_URL
  const key = env.VITE_SUPABASE_ANON_KEY
  if (!url || !key) {
    throw new Error('Prerender: faltan VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY para leer los límites reales de app_config.')
  }
  const res = await fetch(`${url}/rest/v1/app_config?select=*&limit=1`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
  })
  if (!res.ok) {
    await res.text() // libera la conexión; si no, Node en Windows aborta al salir
    throw new Error(`Prerender: no se pudo leer app_config (HTTP ${res.status}). No se publican límites inventados.`)
  }
  const rows = await res.json()
  if (!Array.isArray(rows) || rows.length !== 1) {
    throw new Error('Prerender: app_config no devolvió su fila única. No se publican límites inventados.')
  }
  return rows[0]
}

async function loadEntryServer(root) {
  const outDir = join(root, 'dist-ssr')
  await build({
    root,
    configFile: false,
    mode: 'production',
    logLevel: 'warn',
    plugins: [react()],
    resolve: { alias: { '@': join(root, 'src') } },
    define: { __APP_VERSION__: JSON.stringify('prerender') },
    build: {
      ssr: 'src/prerender/entry-server.tsx',
      outDir,
      emptyOutDir: true,
      copyPublicDir: false,
      rollupOptions: { output: { entryFileNames: 'entry-server.mjs' } },
    },
  })
  return { mod: await import(pathToFileURL(join(outDir, 'entry-server.mjs')).href), outDir }
}

const write = async (file, content) => {
  await mkdir(dirname(file), { recursive: true })
  await writeFile(file, content)
}

export async function prerender({ root, outDir, workbox }) {
  const env = loadEnv('production', root, 'VITE_')
  const appConfig = await fetchAppConfig(env)
  const { mod, outDir: ssrDir } = await loadEntryServer(root)
  const LANGS = mod.LANGUAGES.map((l) => l.code)
  try {
    const built = await readFile(join(outDir, 'index.html'), 'utf8')
    // Base común: index.html del cliente sin los metadatos y el contenido de la landing.
    const base = built
      .replace(/<title>[\s\S]*?<\/title>\s*/, '')
      .replace(/<meta\s+(?:name="description"|property="og:[a-z:]+")[^>]*>\s*/g, '')
    const rootRe = /<div id="root">[\s\S]*?<\/div>/
    if (!rootRe.test(base) || !base.includes('</head>')) throw new Error('Prerender: dist/index.html no tiene la forma esperada.')
    const page = (lang, head, body) =>
      base
        .replace('<html lang="es">', `<html lang="${lang}" dir="${mod.LANGUAGES.find((l) => l.code === lang).dir}">`)
        .replace('</head>', () => `\n    ${head}\n  </head>`)
        .replace(rootRe, () => `<div id="root">${body}</div>`)

    // Shell SPA: sin contenido, noindex (las rutas que lo reciben son privadas o no existen;
    // cada pantalla fija luego su meta con RouteMeta).
    const shell = page('es', `<title>${mod.APP_NAME}</title>\n    <meta name="robots" content="noindex" />`, '')
    await write(join(outDir, 'app-shell.html'), shell)

    // Quien ya tiene sesión y abre "/" va al panel: sin esto vería la landing hasta que React
    // monte. La clave es la que usa supabase-js (sb-<ref>-auth-token).
    const authKey = `sb-${new URL(env.VITE_SUPABASE_URL).hostname.split('.')[0]}-auth-token`
    const guardJs = `try{if(localStorage.getItem(${JSON.stringify(authKey)}))document.documentElement.dataset.auth=1}catch(e){}`
    const guard = `<script>${guardJs}</script>\n    <style>html[data-auth] #prerender{display:none}</style>`

    // El script es inline: la CSP de vercel.json debe permitirlo por su hash, o con la CSP
    // estricta el navegador lo bloquearía y quien tiene sesión vería la landing un instante.
    // Si el script (o el proyecto de Supabase) cambia, el build falla con el valor a poner.
    const guardHash = `'sha256-${createHash('sha256').update(guardJs).digest('base64')}'`
    const vercelCfg = await readFile(join(root, 'vercel.json'), 'utf8')
    if (!vercelCfg.includes(guardHash)) {
      throw new Error(`Prerender: añade ${guardHash} a script-src de la CSP en vercel.json (hash del script que oculta la landing con sesión).`)
    }

    // Vercel no sirve el index.html de una carpeta si la URL no termina en "/": sin un rewrite
    // explícito, /privacidad caería en el shell vacío. Se simula el orden de "rewrites" (el primero
    // que coincide gana) para cada página pública.
    const rewriteRe = (source) => new RegExp(`^${source.replace(/:(\w+)\(/g, '(?<$1>')}$`)
    const { rewrites } = JSON.parse(vercelCfg)
    for (const route of mod.SEO_ROUTES) {
      for (const lang of LANGS) {
        const url = mod.localePath(route.path, lang)
        if (url === '/') continue
        const hit = rewrites.find((r) => rewriteRe(r.source).test(url))
        const groups = hit ? url.match(rewriteRe(hit.source)).groups ?? {} : {}
        const dest = hit?.destination.replace(/:(\w+)/g, (_, k) => groups[k])
        if (dest !== `${url}/index.html`) {
          throw new Error(`Prerender: vercel.json no lleva ${url} a ${url}/index.html; añade la página a "rewrites" antes del catch-all.`)
        }
      }
    }

    for (const route of mod.SEO_ROUTES) {
      for (const lang of LANGS) {
        const { head, body } = await mod.renderPage(route, lang, appConfig)
        if (!body.includes('<h1')) throw new Error(`Prerender: ${mod.localePath(route.path, lang)} se renderizó sin <h1> (¿redirigió o quedó vacía?).`)
        const withGuard = route.path === '/' ? `${head}\n    ${guard}` : head
        const file = join(outDir, mod.localePath(route.path, lang), 'index.html')
        await write(file, page(lang, withGuard, `<div id="prerender">${body}</div>`))
      }
    }

    // sitemap.xml: una entrada por URL, con sus alternativas de idioma.
    const entries = mod.SEO_ROUTES.flatMap((r) =>
      LANGS.map((lang) => {
        const alt = (hreflang, l) => `<xhtml:link rel="alternate" hreflang="${hreflang}" href="${mod.absoluteUrl(r.path, l)}"/>`
        return `  <url><loc>${mod.absoluteUrl(r.path, lang)}</loc>${LANGS.map((l) => alt(l, l)).join('')}${alt('x-default', 'es')}</url>`
      }),
    )
    await write(
      join(outDir, 'sitemap.xml'),
      `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${entries.join('\n')}\n</urlset>\n`,
    )

    // llms.txt: plantilla + precios y páginas del registro.
    const pages = [
      ...mod.SEO_ROUTES.map((r) => `- [${r.title.es}](${mod.absoluteUrl(r.path, 'es')})`),
      ...LANGS.filter((l) => l !== 'es').map((l) => `- [${l}](${mod.absoluteUrl('/', l)})`),
    ].join('\n')
    const template = await readFile(join(dirname(fileURLToPath(import.meta.url)), 'llms.template.md'), 'utf8')
    await write(
      join(outDir, 'llms.txt'),
      template.replace('{{monthly}}', mod.PRICES.monthly).replace('{{yearly}}', mod.PRICES.yearly).replace('{{pages}}', pages),
    )

    // Service worker: la navegación offline cae en el shell, no en la landing. Se saca todo el
    // HTML del precache (index.html ya no es el shell) y se precachea app-shell.html con la
    // revisión del archivo final.
    workbox.globIgnores = [...(workbox.globIgnores ?? ['**/node_modules/**/*']), '**/*.html']
    workbox.additionalManifestEntries = [
      ...(workbox.additionalManifestEntries ?? []),
      { url: 'app-shell.html', revision: createHash('md5').update(shell).digest('hex') },
    ]
    workbox.navigateFallback = 'app-shell.html'
  } finally {
    await rm(ssrDir, { recursive: true, force: true })
  }
}
