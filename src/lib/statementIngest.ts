// Sube un estado de cuenta (PDF o imagen) y devuelve sus movimientos ya
// estructurados por la edge function ocr-receipt (mode 'statement'). Extrae el
// flujo que ya usaba ReceiptPage para reutilizarlo en la página de Conciliación.

import { extractPagesFromPdf } from '@/lib/pdfExtract'
import { downscaleImage } from '@/lib/ocr'
import type { StatementExtraction } from '@/hooks/useOcrReceipt'

export function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(blob)
  })
}

export interface StatementIngestResult {
  extraction: StatementExtraction
  previewDataUrl?: string
  /** El PDF tenía más de 8 páginas; solo se analizaron las primeras 8. */
  truncated?: boolean
}

type RunOcr = (input: {
  mode: 'statement'
  images?: string[]
  text?: string
}) => Promise<StatementExtraction>

export async function ingestStatementFile(
  file: File,
  runOcr: RunOcr,
  onProgress?: (p: number) => void,
): Promise<StatementIngestResult> {
  if (file.type === 'application/pdf') {
    // Lazy-load: pdfjs-dist (~1-2 MB, cacheado) queda fuera del bundle inicial.
    const pages = await extractPagesFromPdf(file, 8, onProgress)
    const extraction = await runOcr(
      pages.mode === 'text'
        ? { mode: 'statement', text: pages.text }
        : { mode: 'statement', images: pages.images },
    )
    return {
      extraction,
      previewDataUrl: pages.previewDataUrl,
      truncated: pages.truncated,
    }
  }

  const blob = await downscaleImage(file)
  const dataUrl = await blobToDataUrl(blob)
  onProgress?.(0.7)
  const extraction = await runOcr({ mode: 'statement', images: [dataUrl] })
  onProgress?.(1)
  return { extraction, previewDataUrl: dataUrl }
}
