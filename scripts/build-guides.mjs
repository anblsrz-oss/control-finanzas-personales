// Genera las imágenes (public/guias/*.webp) y los PDF de las guías paso a paso.
//
//   node scripts/build-guides.mjs images   → recorta, difumina y marca las capturas crudas
//   node scripts/build-guides.mjs pdf      → genera los 3 PDF (necesita Chrome y playwright-core)
//   node scripts/build-guides.mjs          → ambas cosas
//
// Las capturas crudas viven en ../guias-crudos (fuera de public/). Cada imagen
// final se define en IMAGES: recorte [x, y, ancho, alto] en píxeles de la
// captura original, zonas a difuminar (datos personales) y recuadros de
// resalte. Las coordenadas de los recuadros son de la captura ORIGINAL, no del
// recorte. El texto de los pasos sale de src/features/help/guides/guides.data.json,
// el mismo archivo que usa la app, para que app y PDF digan lo mismo.
import fs from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath, pathToFileURL } from 'node:url'
import sharp from 'sharp'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const RAW = path.resolve(ROOT, '..', 'guias-crudos')
const OUT = path.join(ROOT, 'public', 'guias')
const PDF_OUT = path.resolve(ROOT, '..', 'guias-pdf')
const DATA = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/features/help/guides/guides.data.json'), 'utf8'))

const PHONE_CROP = [0, 92, 1220, 2468] // quita barra de estado y de navegación
const HL = '#ef4444' // color de los recuadros

/** name: { src, crop, blur: [[x,y,w,h]], box: [[x,y,w,h]] } */
const IMAGES = {
  // ---- Instalar fuera de Google Play
  'apk-01': { src: 'apk-01.png', crop: PHONE_CROP, box: [[195, 1315, 830, 185]] },
  'apk-02': { src: 'apk-02.png', crop: [0, 1000, 1220, 900], box: [[520, 1630, 610, 120]] },
  'apk-03': { src: 'apk-03.png', crop: [0, 80, 1220, 900], box: [[30, 640, 1160, 210]] },
  'apk-04': { src: 'apk-04-bloqueo-RAW-recortar.png', crop: [80, 990, 1070, 720], box: [[740, 1545, 350, 110]] },
  'apk-05': { src: 'apk-04-fuente-apagada.png', crop: [0, 80, 1220, 1000], box: [[950, 630, 220, 140]] },
  'apk-06': { src: 'apk-04-peligro-marcado.png', crop: PHONE_CROP, box: [[60, 2070, 1040, 170], [630, 2300, 520, 190]] },
  'apk-07': { src: 'apk-05.png', crop: [80, 1040, 1070, 610], box: [[880, 1490, 230, 110]] },
  'apk-08': { src: 'apk-08.png', crop: PHONE_CROP, box: [[610, 2300, 540, 190]] },
  'apk-09': { src: 'apk-06-playprotect-bloqueo-RAW-recortar.png', crop: [30, 575, 1160, 1555], box: [[120, 1890, 990, 160]] },
  'apk-10': { src: 'apk-07-playprotect-ajustes.png', crop: [0, 80, 1220, 1650], box: [[950, 610, 215, 130]] },
  'apk-11': { src: 'apk-07-playprotect-pausar.png', crop: [30, 430, 1160, 1830], box: [[120, 1820, 990, 155]] },
  'apk-12': { src: 'apk-09-sms-negado.png', crop: [60, 670, 1100, 1360], box: [[900, 1810, 200, 90]] },

  // ---- Conectar correo (web de escritorio + pantallas de Google del teléfono)
  'correo-01': { src: 'pc-correo-2x.png', crop: [0, 100, 1250, 760], box: [[16, 798, 325, 55]] },
  'correo-02': { src: 'pc-correo-2x.png', crop: [385, 235, 1490, 430], box: [[420, 425, 1425, 95], [420, 570, 230, 60]] },
  'correo-03': { src: 'pc-correo-2x.png', crop: [385, 675, 1490, 415], box: [[617, 868, 325, 58]] },
  'correo-04': {
    src: 'correo-04-elegir-cuenta-RAW-difuminar.png', crop: PHONE_CROP,
    blur: [[60, 1140, 1100, 200], [60, 1620, 1100, 170], [60, 1840, 1100, 250]],
    box: [[50, 1395, 1120, 185]],
  },
  'correo-05': { src: 'correo-05-no-verificada-RAW-difuminar.png', crop: PHONE_CROP, box: [[60, 1465, 500, 90]] },
  'correo-06': { src: 'correo-06-avanzada-RAW-difuminar.png', crop: PHONE_CROP, box: [[60, 1930, 1000, 100]] },
  'correo-07': { src: 'correo-07-consent-volviendo-RAW.png', crop: PHONE_CROP, box: [[640, 2385, 510, 150]] },
  'correo-08': { src: 'correo-07a-acceso-adicional-RAW-difuminar.png', crop: PHONE_CROP, box: [[70, 1565, 1080, 940]] },
  'correo-09': { src: 'correo-07d-casilla-marcada.png', crop: PHONE_CROP, box: [[200, 440, 930, 400], [60, 1270, 1100, 265]] },
  'correo-10': { src: 'pc-correo-2x.png', crop: [385, 675, 1490, 415], box: [[420, 868, 185, 58], [957, 868, 215, 58]] },
  'correo-11': { src: 'pc-correo-2x.png', crop: [385, 1100, 1490, 262], box: [[423, 1229, 230, 55]] },
  'correo-12': { src: 'pc-transacciones-2x.png', crop: [385, 420, 1510, 150], box: [[828, 458, 110, 45], [1405, 503, 115, 36]] },

  // ---- Notificaciones
  'notif-01': { src: 'notif-01-menu-mas.png', crop: [0, 1160, 1220, 1400], box: [[905, 1635, 285, 300]] },
  'notif-02': { src: 'notif-02-pagina.png', crop: PHONE_CROP, box: [[105, 1135, 700, 155]] },
  'notif-03': { src: 'notif-02b-aviso.png', crop: PHONE_CROP, box: [[630, 2310, 495, 155]] },
  'notif-04': { src: 'notif-03-real-atenuado.png', crop: PHONE_CROP, box: [[50, 1410, 1120, 215]] },
  'notif-05': { src: 'notif-05-ficha-app-xiaomi.png', crop: PHONE_CROP, box: [[30, 1960, 1160, 150]] },
  'notif-06': { src: 'notif-03-lista.png', crop: PHONE_CROP, box: [[30, 1180, 1160, 190]] },
  'notif-07': { src: 'notif-03b-toggle-off.png', crop: PHONE_CROP, box: [[30, 1395, 1160, 180]] },
  'notif-08': { src: 'notif-04-peligro-marcado.png', crop: PHONE_CROP, box: [[60, 2070, 1090, 170], [625, 2305, 520, 185]] },
  'notif-09': { src: 'notif-04b-activado.png', crop: PHONE_CROP, box: [[30, 1420, 1160, 135]] },
  'notif-10': { src: 'notif-06-acceso-concedido.png', crop: PHONE_CROP, box: [[100, 905, 500, 95]] },
  'notif-11': { src: 'notif-08-activar-captura.png', crop: PHONE_CROP, box: [[105, 840, 690, 145]] },
  'notif-12': { src: 'notif-09-activada.png', crop: PHONE_CROP, box: [[100, 670, 570, 90]] },
  'notif-13': { src: 'notif-10-ultimos-avisos.png', crop: [0, 1050, 1220, 1180], box: [[100, 1965, 1030, 175]] },

  // ---- Ajustes de batería / inicio automático en Xiaomi (HyperOS)
  'bat-01': { src: 'bat-xiaomi-01-autoinicio-off.png', crop: [0, 92, 1220, 470], box: [[970, 366, 185, 110]] },
  'bat-02': { src: 'bat-xiaomi-01-autoinicio-on.png', crop: [0, 92, 1220, 470], box: [[970, 366, 185, 110]] },
  'bat-03': { src: 'bat-xiaomi-02-ficha-app.png', crop: PHONE_CROP, box: [[40, 1545, 1140, 255]] },
  'bat-04': { src: 'bat-xiaomi-03-bateria-sin-restricciones.png', crop: PHONE_CROP, box: [[40, 1830, 1140, 250]] },
  // En "Recientes" se ve la miniatura de la app (saldos): se difumina.
  'bat-05': {
    src: 'bat-xiaomi-04-recientes-menu-RAW-difuminar.png', crop: PHONE_CROP,
    blur: [[40, 890, 560, 1180]], box: [[690, 1178, 175, 175]],
  },
  // Solo el título de la tarjeta con el candado (el resto muestra otras apps y datos).
  'bat-06': { src: 'bat-xiaomi-05-recientes-bloqueada-RAW-difuminar.png', crop: [50, 790, 560, 130], box: [[498, 830, 65, 62]] },
}

async function buildImage(name, spec) {
  const [cx, cy, cw, ch] = spec.crop
  const src = path.join(RAW, spec.src)
  if (!fs.existsSync(src)) throw new Error(`Falta la captura ${spec.src} (${name})`)
  const meta = await sharp(src).metadata()
  const w = Math.min(cw, meta.width - cx)
  const h = Math.min(ch, meta.height - cy)
  const isPhone = meta.width < 1400
  const targetW = isPhone ? 640 : 1100
  let img = sharp(await sharp(src).extract({ left: cx, top: cy, width: w, height: h }).toBuffer())

  const layers = []
  // Difuminado: zona recortada, desenfocada, vuelta a su sitio.
  for (const [bx, by, bw, bh] of spec.blur ?? []) {
    const region = await sharp(src)
      .extract({ left: Math.max(0, bx), top: Math.max(0, by), width: bw, height: bh })
      .blur(28)
      .toBuffer()
    layers.push({ input: region, left: bx - cx, top: by - cy })
  }
  // Recuadros de resalte (SVG a tamaño del recorte).
  const stroke = Math.max(4, Math.round(w / 200))
  const rects = (spec.box ?? [])
    .map(([bx, by, bw, bh]) => {
      const x = bx - cx, y = by - cy
      return `<rect x="${x}" y="${y}" width="${bw}" height="${bh}" rx="${Math.round(stroke * 2.5)}" fill="none" stroke="${HL}" stroke-width="${stroke}"/>`
    })
    .join('')
  if (rects) {
    layers.push({ input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">${rects}</svg>`), left: 0, top: 0 })
  }
  if (layers.length) img = sharp(await img.composite(layers).toBuffer())
  await img.resize({ width: Math.min(targetW, w) }).webp({ quality: 84 }).toFile(path.join(OUT, `${name}.webp`))
}

async function buildImages() {
  fs.mkdirSync(OUT, { recursive: true })
  let n = 0
  for (const [name, spec] of Object.entries(IMAGES)) {
    await buildImage(name, spec)
    n++
  }
  console.log(`${n} imágenes → ${path.relative(ROOT, OUT)}`)
}

// ---------------------------------------------------------------- PDF
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const rich = (s) => esc(s).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
const sub = (s) => s.replaceAll('{{contact}}', DATA.contact)

function guideHtml(id, logoDataUri) {
  const g = DATA.guides[id]
  const photo = (file) => {
    const p = path.join(OUT, file.replace(/\.[^.]+$/, '.webp'))
    return fs.existsSync(p) ? `data:image/webp;base64,${fs.readFileSync(p).toString('base64')}` : null
  }
  const steps = g.steps
    .map((s, i) => {
      const img = s.image ? photo(s.image) : null
      return `<li><div class="n">${i + 1}</div><div class="c"><p>${rich(sub(s.text))}</p>${img ? `<img src="${img}">` : ''}</div></li>`
    })
    .join('')
  const faq = g.faq.map((f) => `<div class="q"><b>${esc(f.q)}</b><p>${rich(sub(f.a))}</p></div>`).join('')
  const brand = id === 'notificaciones'
    ? `<h2>Si no captura: ajustes de batería por marca</h2>${DATA.brandGuides
        .map((b) => `<div class="q"><b>${esc(b.brands)}</b><ol class="brand">${b.steps
          .map((st) => {
            const img = st.image ? photo(st.image) : null
            return `<li>${rich(st.text)}${img ? `<img src="${img}">` : ''}</li>`
          })
          .join('')}</ol></div>`)
        .join('')}`
    : ''
  return `<!doctype html><html lang="es"><meta charset="utf-8"><style>
    @page { size: A4; margin: 16mm 14mm; }
    * { box-sizing: border-box; }
    body { font: 11pt/1.45 -apple-system, "Segoe UI", Roboto, Arial, sans-serif; color: #1e293b; margin: 0; }
    header { display: flex; align-items: center; gap: 12px; border-bottom: 3px solid #0d9488; padding-bottom: 10px; margin-bottom: 14px; }
    header img { width: 44px; height: 44px; }
    header small { color: #64748b; display: block; font-size: 9pt; }
    h1 { font-size: 19pt; margin: 0; line-height: 1.15; }
    h2 { font-size: 13pt; margin: 14px 0 6px; color: #0f766e; }
    .intro { margin: 0 0 12px; color: #334155; }
    .pre { background: #fffbeb; border: 1px solid #fcd34d; border-radius: 8px; padding: 8px 12px; margin: 0 0 14px; }
    ol.steps { list-style: none; margin: 0; padding: 0; }
    ol.steps > li { display: flex; gap: 12px; margin: 0 0 14px; break-inside: avoid; }
    .n { flex: none; width: 26px; height: 26px; border-radius: 50%; background: #0d9488; color: #fff; font-weight: 700; text-align: center; line-height: 26px; font-size: 11pt; }
    .c { min-width: 0; } .c p { margin: 2px 0 6px; }
    .c img { max-height: 82mm; max-width: 100%; border: 1px solid #cbd5e1; border-radius: 8px; display: block; }
    ol.brand img { max-height: 60mm; max-width: 100%; border: 1px solid #cbd5e1; border-radius: 8px; display: block; margin: 4px 0 6px; }
    ol.brand li { margin: 0 0 6px; break-inside: avoid; }
    .q { margin: 0 0 6px; } .q p { margin: 2px 0 0; } .q ol { margin: 4px 0 0 18px; padding: 0; }
    footer { margin-top: 10px; padding-top: 8px; border-top: 1px solid #e2e8f0; color: #64748b; font-size: 9pt; }
  </style>
  <header>${logoDataUri ? `<img src="${logoDataUri}">` : ''}<div><small>Mi Control de Finanzas Personales</small><h1>${esc(g.title)}</h1></div></header>
  <p class="intro">${esc(g.intro)}</p>
  ${g.prereq ? `<p class="pre">${rich(sub(g.prereq.text))}</p>` : ''}
  <ol class="steps">${steps}</ol>
  ${brand}
  ${faq ? `<h2>Preguntas frecuentes</h2>${faq}` : ''}
  <footer>¿Dudas? Escríbenos a ${esc(DATA.contact)}.${id === 'instalar-apk' ? ` Descarga oficial: ${esc(DATA.apkUrl)}` : ''}</footer>
  </html>`
}

async function buildPdfs() {
  const { chromium } = await import(process.env.PLAYWRIGHT_CORE ? pathToFileURL(process.env.PLAYWRIGHT_CORE).href : 'playwright-core')
  fs.mkdirSync(PDF_OUT, { recursive: true })
  // Logo con fondo transparente real (Logo_MCFP.png trae el tablero gris pintado en la imagen).
  const logoPath = path.join(ROOT, 'public', 'icon-source-1024.png')
  const logo = fs.existsSync(logoPath)
    ? `data:image/png;base64,${(await sharp(logoPath).resize(160).flatten({ background: '#ffffff' }).png().toBuffer()).toString('base64')}`
    : null
  const browser = await chromium.launch({
    executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: true,
  })
  for (const id of Object.keys(DATA.guides)) {
    const page = await browser.newPage()
    await page.setContent(guideHtml(id, logo), { waitUntil: 'load' })
    const file = path.join(PDF_OUT, DATA.guides[id].pdf)
    await page.pdf({ path: file, format: 'A4', printBackground: true, margin: { top: '16mm', bottom: '16mm', left: '14mm', right: '14mm' } })
    // Chrome deja las imágenes casi sin comprimir (2-3 MB por guía): se recomprimen con PyMuPDF si hay Python.
    const small = `${file}.small`
    const r = spawnSync('python', [path.join(ROOT, 'scripts', 'compress-pdf.py'), file, small], { stdio: 'ignore' })
    if (r.status === 0 && fs.existsSync(small)) fs.renameSync(small, file)
    else console.warn('  (sin compresión: falta python o pymupdf)')
    fs.copyFileSync(file, path.join(OUT, DATA.guides[id].pdf))
    await page.close()
    console.log('PDF', path.relative(ROOT, file))
  }
  await browser.close()
}

const mode = process.argv[2]
if (!mode || mode === 'images') await buildImages()
if (!mode || mode === 'pdf') await buildPdfs()
