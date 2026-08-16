// Extracción de texto desde un PDF de un solo recibo/factura. Se carga
// perezosamente (import dinámico) para no inflar el bundle inicial.
//
// Estrategia: si el PDF tiene capa de texto real (la mayoría de facturas/
// recibos digitales), se usa directo — es instantáneo y mucho más preciso
// que el OCR. Si no (un PDF que es solo una foto escaneada), se renderiza la
// primera página a un canvas y se corre el mismo OCR que usamos para fotos.

export interface PdfExtraction {
  text: string
  // Data URL de la primera página renderizada, para mostrarla como preview.
  previewDataUrl: string
}

// Por debajo de esto, asumimos que el PDF no tiene texto embebido real.
const TEXT_THRESHOLD = 25

export async function extractFromPdf(
  file: File,
  onOcrProgress?: (p: number) => void,
): Promise<PdfExtraction> {
  const pdfjsLib = await import('pdfjs-dist')
  const workerUrl = (await import('pdfjs-dist/build/pdf.worker.min.mjs?url'))
    .default
  pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl

  const buffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise
  const page = await pdf.getPage(1)

  const viewport = page.getViewport({ scale: 2 })
  const canvas = document.createElement('canvas')
  canvas.width = viewport.width
  canvas.height = viewport.height
  const ctx = canvas.getContext('2d')!
  await page.render({ canvas, canvasContext: ctx, viewport }).promise
  const previewDataUrl = canvas.toDataURL('image/jpeg', 0.92)

  const textContent = await page.getTextContent()
  const embeddedText = textContent.items
    .map((item) => ('str' in item ? item.str : ''))
    .join(' ')
    .trim()

  if (embeddedText.length >= TEXT_THRESHOLD) {
    return { text: embeddedText, previewDataUrl }
  }

  // Sin capa de texto (PDF escaneado): OCR sobre la página ya renderizada.
  const blob: Blob = await new Promise((resolve) =>
    canvas.toBlob((b) => resolve(b ?? new Blob()), 'image/jpeg', 0.92),
  )
  const { createWorker } = await import('tesseract.js')
  const worker = await createWorker('spa', 1, {
    logger: (m) => {
      if (m.status === 'recognizing text') onOcrProgress?.(m.progress)
    },
  })
  const {
    data: { text },
  } = await worker.recognize(blob)
  await worker.terminate()

  return { text, previewDataUrl }
}

export interface PdfPagesExtraction {
  // 'text': todas (o casi todas) las páginas tienen capa de texto real —
  // se manda texto a la IA (más barato y preciso). 'images': hay que
  // mandar cada página como imagen (p. ej. un estado de cuenta escaneado).
  mode: 'text' | 'images'
  text: string
  images: string[]
  // true si el PDF tenía más páginas que `maxPages` y se recortó.
  truncated: boolean
  previewDataUrl: string
}

// Extracción multi-página, pensada para documentos largos (estados de
// cuenta) donde una sola página no alcanza. A diferencia de `extractFromPdf`
// (que solo lee la página 1), recorre hasta `maxPages` páginas y decide por
// documento completo si conviene mandar texto o imágenes a la IA.
export async function extractPagesFromPdf(
  file: File,
  maxPages = 8,
  onProgress?: (p: number) => void,
): Promise<PdfPagesExtraction> {
  const pdfjsLib = await import('pdfjs-dist')
  const workerUrl = (await import('pdfjs-dist/build/pdf.worker.min.mjs?url'))
    .default
  pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl

  const buffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise
  const pageCount = Math.min(pdf.numPages, maxPages)
  const truncated = pdf.numPages > maxPages

  const pageTexts: string[] = []
  const pageImages: string[] = []
  let previewDataUrl = ''

  for (let i = 1; i <= pageCount; i++) {
    const page = await pdf.getPage(i)
    const viewport = page.getViewport({ scale: 2 })
    const canvas = document.createElement('canvas')
    canvas.width = viewport.width
    canvas.height = viewport.height
    const ctx = canvas.getContext('2d')!
    await page.render({ canvas, canvasContext: ctx, viewport }).promise
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85)
    if (i === 1) previewDataUrl = dataUrl
    pageImages.push(dataUrl)

    const textContent = await page.getTextContent()
    const embeddedText = textContent.items
      .map((item) => ('str' in item ? item.str : ''))
      .join(' ')
      .trim()
    pageTexts.push(embeddedText)

    onProgress?.(i / pageCount)
  }

  // Si la gran mayoría de páginas trae capa de texto real, mandamos texto
  // (más barato y preciso que la imagen); si no, mandamos las imágenes.
  const pagesWithText = pageTexts.filter((t) => t.length >= TEXT_THRESHOLD).length
  const useText = pagesWithText >= Math.ceil(pageCount * 0.6)

  return {
    mode: useText ? 'text' : 'images',
    text: pageTexts
      .map((t, i) => `--- Página ${i + 1} ---\n${t}`)
      .join('\n\n'),
    images: pageImages,
    truncated,
    previewDataUrl,
  }
}
