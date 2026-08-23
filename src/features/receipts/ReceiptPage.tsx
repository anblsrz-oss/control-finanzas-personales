import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/store/useAuth'
import { useAccounts } from '@/hooks/useAccounts'
import { useCards } from '@/hooks/useCards'
import { useCategories } from '@/hooks/useCategories'
import { useCreateTransaction } from '@/hooks/useTransactions'
import { useOcrReceipt, type ReceiptExtraction, type StatementExtraction } from '@/hooks/useOcrReceipt'
import { parseReceiptText } from '@/lib/receiptParser'
import { hashRow } from '@/lib/importParser'
import { extractFromPdf, extractPagesFromPdf } from '@/lib/pdfExtract'
import { downscaleImage, recognizeImage } from '@/lib/ocr'
import { useFxRate } from '@/hooks/useFxRate'
import { supabase } from '@/lib/supabase'
import { toBaseAmount } from '@/lib/fx'
import { CURRENCIES, formatMoney } from '@/lib/format'
import { todayISO } from '@/lib/dates'
import { parseCfdiXml, isCfdiXml, cfdiIsIncome } from '@/lib/cfdiParser'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'

const schema = z.object({
  // Un recibo puede ser un gasto (una compra) o un ingreso (p. ej. un CFDI
  // de nómina, que emite el patrón al trabajador).
  kind: z.enum(['income', 'expense']),
  amount: z.coerce.number().positive('Monto debe ser mayor a 0'),
  currency: z.string(),
  txDate: z.string().min(1, 'Fecha requerida'),
  concept: z.string().min(1, 'Concepto requerido'),
  categoryId: z.string().optional(),
  accountId: z.string().optional(),
  cardId: z.string().optional(),
})

type FormData = z.infer<typeof schema>

type DocMode = 'receipt' | 'statement'
type Step = 'capture' | 'ocr' | 'review' | 'done'

interface StatementRow {
  id: string
  include: boolean
  kind: 'income' | 'expense'
  amount: number
  currency: string
  txDate: string
  concept: string
  categoryId: string
  accountId: string
  cardId: string
  // Pagos a tarjeta y compras a meses necesitan datos que un estado de
  // cuenta no trae (línea de crédito a pagar, plazo/interés real) — se
  // detectan para avisar, pero no se seleccionan por default: se registran
  // mejor desde "Nueva transacción", que sí soporta ambos flujos completos.
  isCardPayment: boolean
  isInstallment: boolean
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(blob)
  })
}

export function ReceiptPage() {
  const { t } = useTranslation()
  const { session, profile } = useAuth()
  const userId = session?.user?.id
  const mainCurrency = profile?.main_currency ?? 'MXN'
  const { data: accounts = [] } = useAccounts(userId)
  const { data: cards = [] } = useCards(userId)
  const { data: categories = [] } = useCategories(userId)
  const createTransaction = useCreateTransaction()
  const ocrReceipt = useOcrReceipt()

  const [docMode, setDocMode] = useState<DocMode>('receipt')
  const [step, setStep] = useState<Step>('capture')
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const [rawText, setRawText] = useState('')
  const [showRaw, setShowRaw] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [noticeMsg, setNoticeMsg] = useState<string | null>(null)
  const [lastFailedFile, setLastFailedFile] = useState<File | null>(null)
  const fileRef = useRef<File | null>(null)

  // Modo "estado de cuenta": lista editable de movimientos detectados.
  const [statementRows, setStatementRows] = useState<StatementRow[]>([])
  const [commonAccountId, setCommonAccountId] = useState('')
  const [commonCardId, setCommonCardId] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveSummary, setSaveSummary] = useState<{
    saved: number
    duplicates: number
    failed: number
  } | null>(null)
  // Tipo de cambio hacia mainCurrency por cada moneda distinta detectada en
  // los movimientos (ej. si el estado de cuenta trae compras en USD y MXN).
  // Se autocompleta con fx-rate y el usuario puede corregirlo.
  const [fxRates, setFxRates] = useState<Record<string, string>>({})

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      kind: 'expense',
      currency: mainCurrency,
      txDate: todayISO(),
    },
  })

  const kind = form.watch('kind')
  const isIncome = kind === 'income'
  const currency = form.watch('currency')
  const amountRaw = form.watch('amount')
  const txDate = form.watch('txDate')
  const needsFx = !!currency && currency !== mainCurrency
  // Se pide el tipo de cambio de la fecha capturada (no la de hoy).
  const fxQuery = useFxRate(currency, mainCurrency, needsFx, txDate)
  // Tipo de cambio editable: se prellena con el automático de la fecha, pero el
  // usuario puede corregirlo (p. ej. con el valor real de su estado de cuenta).
  const [rateInput, setRateInput] = useState('')
  useEffect(() => {
    if (!needsFx) {
      setRateInput('')
    } else if (fxQuery.data?.rate) {
      setRateInput(String(fxQuery.data.rate))
    }
  }, [needsFx, fxQuery.data?.rate])
  const effectiveRate = needsFx ? Number(rateInput) || 0 : 1
  const basePreview = toBaseAmount(Number(amountRaw) || 0, effectiveRate)

  async function handleFile(file: File) {
    fileRef.current = file
    setErrorMsg(null)
    setNoticeMsg(null)
    setLastFailedFile(null)
    const isXml =
      file.type.includes('xml') || file.name.toLowerCase().endsWith('.xml')
    if (isXml) {
      await runXmlExtraction(file)
    } else if (file.type === 'application/pdf') {
      await runPdfExtraction(file)
    } else {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
      setPreviewUrl(URL.createObjectURL(file))
      await runImageOcr(file)
    }
  }

  // Factura CFDI (XML): extracción exacta de los atributos, sin OCR ni IA.
  async function runXmlExtraction(file: File) {
    setStep('ocr')
    setProgress(1)
    try {
      const text = await file.text()
      if (!isCfdiXml(text)) {
        setErrorMsg(t('El XML no parece una factura CFDI (SAT). Verifica el archivo.'))
        setStep('capture')
        return
      }
      const cfdi = parseCfdiXml(text)
      if (previewUrl) URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
      // Nómina (tipo "N") = ingreso para quien recibe el CFDI.
      const income = cfdiIsIncome(cfdi.tipo)
      setRawText(
        `Emisor: ${cfdi.merchant ?? '—'}\nRFC: ${cfdi.rfc ?? '—'}\n` +
          `Total: ${cfdi.amount ?? '—'} ${cfdi.currency ?? ''}\nFecha: ${cfdi.txDate ?? '—'}\n` +
          `Tipo: ${cfdi.tipo ?? '—'}${income ? ' (nómina → ingreso)' : ''}`,
      )
      form.reset({
        kind: income ? 'income' : 'expense',
        amount: (cfdi.amount ?? undefined) as number | undefined,
        currency: cfdi.currency ?? mainCurrency,
        txDate: cfdi.txDate ?? todayISO(),
        concept: cfdi.concept ?? cfdi.merchant ?? '',
        categoryId: '',
        accountId: '',
        cardId: '',
      })
      setStep('review')
    } catch (err: any) {
      setErrorMsg(
        t('No se pudo leer el XML: {{error}}.', {
          error: err?.message ?? t('error desconocido'),
        }),
      )
      setStep('capture')
    }
  }

  // Busca una cuenta o tarjeta propia cuyos últimos 4 dígitos coincidan con
  // los detectados en el comprobante (mismo criterio que ya usa la captura
  // automática por correo/SMS: cruzar `last4` contra account_last4 /
  // account_number_last4 / cards.last4).
  function matchAccountOrCard(last4: string | null | undefined): {
    accountId: string
    cardId: string
  } {
    if (!last4) return { accountId: '', cardId: '' }
    const account = accounts.find(
      (a) => a.account_last4 === last4 || a.account_number_last4 === last4,
    )
    if (account) return { accountId: account.id, cardId: '' }
    const card = cards.find((c) => c.last4 === last4)
    if (card) return { accountId: '', cardId: card.id }
    return { accountId: '', cardId: '' }
  }

  // Un comprobante de transferencia trae dos cuentas (origen y destino) y no
  // siempre queda claro cuál es la del usuario, así que se prueban ambas
  // contra sus cuentas/tarjetas propias: se prefiere la que correspondería
  // según el tipo (origen si es egreso, destino si es ingreso), pero si esa
  // no coincide con ninguna cuenta propia y la otra sí, se usa la otra.
  function matchTransferAccount(extraction: ReceiptExtraction): {
    accountId: string
    cardId: string
  } {
    const originMatch = matchAccountOrCard(extraction.originLast4)
    const destinationMatch = matchAccountOrCard(extraction.destinationLast4)
    const hasMatch = (m: { accountId: string; cardId: string }) => !!(m.accountId || m.cardId)
    const preferred = extraction.kind === 'income' ? destinationMatch : originMatch
    const fallback = extraction.kind === 'income' ? originMatch : destinationMatch
    return hasMatch(preferred) ? preferred : fallback
  }

  // Aplica los datos que devolvió el modelo de IA al formulario de revisión
  // de un recibo (una sola transacción) y avanza al paso siguiente.
  function applyReceiptExtraction(extraction: ReceiptExtraction) {
    setRawText(JSON.stringify(extraction, null, 2))
    const match = matchTransferAccount(extraction)
    form.reset({
      kind: extraction.kind,
      amount: (extraction.amount ?? undefined) as number | undefined,
      currency: extraction.currency || mainCurrency,
      txDate: extraction.txDate || todayISO(),
      concept: extraction.concept || extraction.merchant || '',
      categoryId: '',
      accountId: match.accountId,
      cardId: extraction.kind === 'income' ? '' : match.cardId,
    })
    setStep('review')
  }

  // Aplica los movimientos detectados por la IA en un estado de cuenta a la
  // lista editable de la revisión. Cada movimiento conserva la moneda que
  // detectó la IA (un estado de cuenta puede traer compras en MXN y USD
  // mezcladas, p. ej. en el extranjero).
  async function applyStatementExtraction(extraction: StatementExtraction) {
    setRawText(JSON.stringify(extraction, null, 2))
    // El estado de cuenta completo es de una sola tarjeta/cuenta: se busca
    // una vez y se aplica a todos los movimientos (igual que el selector
    // común, que el usuario puede seguir corrigiendo).
    const docMatch = matchAccountOrCard(extraction.accountLast4)
    const rows: StatementRow[] = (extraction.transactions ?? []).map((tx, i) => ({
      id: `row_${i}`,
      // Un pago a tarjeta o una compra a meses necesitan datos que este
      // flujo no captura (línea de crédito, plazo/interés) — se detectan
      // pero se dejan sin marcar para no registrarlos mal por accidente.
      include: !tx.isCardPayment && !tx.isInstallment,
      kind: tx.kind,
      amount: tx.amount,
      currency: tx.currency || mainCurrency,
      txDate: tx.txDate || todayISO(),
      concept: tx.concept || '',
      categoryId: '',
      accountId: docMatch.accountId,
      cardId: tx.kind === 'income' ? '' : docMatch.cardId,
      isCardPayment: tx.isCardPayment,
      isInstallment: tx.isInstallment,
    }))
    if (rows.length === 0) {
      setErrorMsg(t('No se detectaron movimientos en el documento. Intenta con otro archivo.'))
      setStep('capture')
      return
    }
    setStatementRows(rows)
    setCommonAccountId(docMatch.cardId ? '' : docMatch.accountId)
    setCommonCardId(docMatch.cardId)
    setFxRates({})
    setStep('review')

    // Busca en segundo plano el tipo de cambio de cada moneda distinta a la
    // principal, para no tener que llamarlo por fila (violaría las reglas de
    // hooks) ni bloquear el paso a la revisión.
    const foreignCurrencies = Array.from(new Set(rows.map((r) => r.currency))).filter(
      (c) => c && c !== mainCurrency,
    )
    for (const c of foreignCurrencies) {
      try {
        const { data } = await supabase.functions.invoke('fx-rate', {
          body: { base: c, quote: mainCurrency },
        })
        const rate = (data as { rate?: number } | null)?.rate
        if (rate) setFxRates((prev) => ({ ...prev, [c]: String(rate) }))
      } catch {
        // El usuario puede escribirlo manualmente en la revisión.
      }
    }
  }

  // Antes del OCR local heredado (fallback): aplica el texto vía la
  // heurística de regex de `receiptParser.ts`. Solo se usa cuando la
  // extracción con IA falla, y solo tiene sentido para un recibo individual.
  function applyLocalReceiptFallback(text: string) {
    setRawText(text)
    const extracted = parseReceiptText(text)
    form.reset({
      kind: 'expense',
      amount: (extracted.amount ?? undefined) as number | undefined,
      currency: mainCurrency,
      txDate: extracted.txDate ?? todayISO(),
      concept: extracted.merchant ?? '',
      categoryId: '',
      accountId: '',
      cardId: '',
    })
    setStep('review')
  }

  async function runImageOcr(file: File) {
    setStep('ocr')
    setProgress(0.4)
    try {
      const blob = await downscaleImage(file)
      const dataUrl = await blobToDataUrl(blob)
      setProgress(0.7)
      const extraction = await ocrReceipt.mutateAsync({ mode: docMode, images: [dataUrl] })
      setProgress(1)
      if (docMode === 'statement') await applyStatementExtraction(extraction as StatementExtraction)
      else applyReceiptExtraction(extraction as ReceiptExtraction)
    } catch (err: any) {
      if (docMode === 'receipt') setLastFailedFile(file)
      setErrorMsg(
        t('No se pudo leer el documento con IA: {{error}}.', {
          error: err?.message ?? t('error desconocido'),
        }),
      )
      setStep('capture')
    }
  }

  async function runPdfExtraction(file: File) {
    setStep('ocr')
    setProgress(0)
    try {
      if (docMode === 'statement') {
        // Lazy-load: pdfjs-dist (~1-2 MB, cacheado) queda fuera del bundle inicial.
        const pages = await extractPagesFromPdf(file, 8, setProgress)
        if (previewUrl) URL.revokeObjectURL(previewUrl)
        setPreviewUrl(pages.previewDataUrl)
        if (pages.truncated) {
          setNoticeMsg(
            t('El PDF tiene más de 8 páginas; solo se analizaron las primeras 8.'),
          )
        }
        const extraction = await ocrReceipt.mutateAsync(
          pages.mode === 'text'
            ? { mode: 'statement', text: pages.text }
            : { mode: 'statement', images: pages.images },
        )
        await applyStatementExtraction(extraction as StatementExtraction)
      } else {
        const { text, previewDataUrl } = await extractFromPdf(file, setProgress)
        if (previewUrl) URL.revokeObjectURL(previewUrl)
        setPreviewUrl(previewDataUrl)
        const extraction = await ocrReceipt.mutateAsync({ mode: 'receipt', text })
        applyReceiptExtraction(extraction as ReceiptExtraction)
      }
    } catch (err: any) {
      if (docMode === 'receipt') setLastFailedFile(file)
      setErrorMsg(
        t('No se pudo leer el PDF con IA: {{error}}. Intenta con otro archivo o con una foto.', {
          error: err?.message ?? t('error desconocido'),
        }),
      )
      setStep('capture')
    }
  }

  // Respaldo si la IA falla: repite el flujo local de tesseract.js + regex
  // que ya existía antes de agregar el OCR con IA. Solo aplica a recibos
  // individuales (la heurística de regex no separa varios movimientos).
  async function runLocalFallback() {
    const file = lastFailedFile
    if (!file) return
    setLastFailedFile(null)
    setErrorMsg(null)
    setStep('ocr')
    setProgress(0)
    try {
      if (file.type === 'application/pdf') {
        const { text, previewDataUrl } = await extractFromPdf(file, setProgress)
        if (previewUrl) URL.revokeObjectURL(previewUrl)
        setPreviewUrl(previewDataUrl)
        applyLocalReceiptFallback(text)
      } else {
        const text = await recognizeImage(file, setProgress)
        applyLocalReceiptFallback(text)
      }
    } catch (err: any) {
      setErrorMsg(
        t('No se pudo leer el ticket: {{error}}.', {
          error: err?.message ?? t('error desconocido'),
        }),
      )
      setStep('capture')
    }
  }

  function onSubmit(data: FormData) {
    if (!userId) return
    const income = data.kind === 'income'
    // Un ingreso entra a una cuenta: no tiene sentido (ni lo reflejan las
    // vistas de saldo) asignarlo a una tarjeta.
    if (income && !data.accountId) {
      alert(t('Selecciona la cuenta donde entró el dinero'))
      return
    }
    if (!income && !data.accountId && !data.cardId) {
      alert(t('Selecciona una cuenta o tarjeta'))
      return
    }
    const rate = data.currency !== mainCurrency ? effectiveRate : 1
    if (data.currency !== mainCurrency && (!rate || rate <= 0)) {
      alert(t('No se obtuvo el tipo de cambio. Intenta de nuevo o registra el gasto desde Transacciones.'))
      return
    }
    createTransaction.mutate(
      {
        userId,
        kind: data.kind,
        amount: data.amount,
        currency: data.currency,
        fxRate: rate,
        baseAmount: toBaseAmount(data.amount, rate),
        concept: data.concept,
        categoryId: data.categoryId,
        accountId: data.accountId,
        cardId: income ? undefined : data.cardId,
        txDate: data.txDate,
        source: 'receipt',
        // El tipo entra en el hash: un ingreso y un gasto del mismo día e
        // importe no deben considerarse duplicados entre sí.
        externalId: hashRow([
          'receipt',
          data.kind,
          data.txDate,
          data.amount,
          data.concept,
        ]),
      },
      {
        onSuccess: () => setStep('done'),
        onError: (error: any) => {
          if (error?.code === '23505') {
            alert(t('Este recibo ya fue registrado (movimiento duplicado).'))
          } else {
            alert(`Error: ${error.message}`)
          }
        },
      },
    )
  }

  function updateRow(id: string, patch: Partial<StatementRow>) {
    setStatementRows((rows) => rows.map((r) => (r.id === id ? { ...r, ...patch } : r)))
  }

  function applyCommonAccount(id: string) {
    setCommonAccountId(id)
    setCommonCardId('')
    setStatementRows((rows) => rows.map((r) => ({ ...r, accountId: id, cardId: '' })))
  }

  function applyCommonCard(id: string) {
    setCommonCardId(id)
    setCommonAccountId('')
    setStatementRows((rows) => rows.map((r) => ({ ...r, cardId: id, accountId: '' })))
  }

  async function saveStatementRows() {
    if (!userId) return
    const included = statementRows.filter((r) => r.include)
    if (included.length === 0) {
      alert(t('Selecciona al menos un movimiento'))
      return
    }
    for (const r of included) {
      if (!r.accountId && !r.cardId) {
        alert(t('Cada movimiento marcado necesita una cuenta o tarjeta'))
        return
      }
      if (r.currency !== mainCurrency && !(Number(fxRates[r.currency]) > 0)) {
        alert(
          t('Falta el tipo de cambio de {{currency}} → {{main}}. Complétalo arriba antes de guardar.', {
            currency: r.currency,
            main: mainCurrency,
          }),
        )
        return
      }
    }
    setSaving(true)
    let saved = 0
    let duplicates = 0
    let failed = 0
    for (const r of included) {
      const rate = r.currency === mainCurrency ? 1 : Number(fxRates[r.currency]) || 1
      try {
        await createTransaction.mutateAsync({
          userId,
          kind: r.kind,
          amount: r.amount,
          currency: r.currency,
          fxRate: rate,
          baseAmount: toBaseAmount(r.amount, rate),
          concept: r.concept,
          categoryId: r.categoryId || undefined,
          accountId: r.accountId || undefined,
          cardId: r.kind === 'income' ? undefined : r.cardId || undefined,
          txDate: r.txDate,
          source: 'receipt',
          externalId: hashRow(['receipt', r.kind, r.txDate, r.amount, r.concept]),
        })
        saved++
      } catch (err: any) {
        if (err?.code === '23505') duplicates++
        else {
          failed++
          console.error('No se pudo guardar un movimiento del estado de cuenta', err)
        }
      }
    }
    setSaving(false)
    setSaveSummary({ saved, duplicates, failed })
    setStep('done')
  }

  function resetAll() {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(null)
    setRawText('')
    setShowRaw(false)
    setErrorMsg(null)
    setNoticeMsg(null)
    setLastFailedFile(null)
    fileRef.current = null
    setStatementRows([])
    setCommonAccountId('')
    setCommonCardId('')
    setSaveSummary(null)
    setFxRates({})
    form.reset({
      kind: 'expense',
      currency: mainCurrency,
      txDate: todayISO(),
    })
    setStep('capture')
  }

  // Las categorías siguen al tipo de movimiento elegido.
  const availableCategories = categories.filter((c) => c.kind === kind)

  // Monedas distintas a la principal presentes en el estado de cuenta: cada
  // una necesita su propio tipo de cambio antes de poder guardar.
  const foreignCurrenciesInRows = Array.from(
    new Set(statementRows.map((r) => r.currency)),
  ).filter((c) => c && c !== mainCurrency)

  return (
    <div>
      <PageHeader
        title={t('Escanear recibo')}
        subtitle={t('Toma una foto del ticket o sube un estado de cuenta y registra los movimientos automáticamente')}
        helpId="recibos"
      />

      {step === 'capture' && (
        <Card>
          {errorMsg && (
            <p className="mb-4 rounded-lg bg-red-50 dark:bg-red-900/20 p-3 text-sm text-red-700 dark:text-red-300">
              {errorMsg}
            </p>
          )}
          {lastFailedFile && (
            <div className="mb-4 flex items-center justify-between gap-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 p-3">
              <p className="text-sm text-amber-700 dark:text-amber-300">
                {t('¿Quieres intentar con el OCR local (más lento y menos preciso)?')}
              </p>
              <Button type="button" size="sm" variant="secondary" onClick={runLocalFallback}>
                {t('Intentar')}
              </Button>
            </div>
          )}

          <div className="mb-6 flex justify-center gap-2">
            <button
              type="button"
              onClick={() => setDocMode('receipt')}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                docMode === 'receipt'
                  ? 'bg-brand-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
              }`}
            >
              🧾 {t('Recibo')}
            </button>
            <button
              type="button"
              onClick={() => setDocMode('statement')}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                docMode === 'statement'
                  ? 'bg-brand-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
              }`}
            >
              📄 {t('Estado de cuenta')}
            </button>
          </div>

          <div className="flex flex-col items-center gap-4 py-6">
            <span className="text-5xl">{docMode === 'statement' ? '📄' : '🧾'}</span>
            <p className="text-center text-sm text-slate-600 dark:text-slate-300">
              {docMode === 'statement'
                ? t('Sube el PDF de tu estado de cuenta (banco o tarjeta). Vamos a leer los movimientos y podrás revisarlos antes de guardar.')
                : t('Fotografía el ticket con buena luz y lo más plano posible, o sube un PDF o XML (factura CFDI) de tu recibo. Después podrás revisar y corregir los datos detectados.')}
            </p>
            <label className="cursor-pointer" data-tour="recibos">
              <span className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-600 px-6 py-3 text-base font-medium text-white transition-colors hover:bg-brand-700">
                📷 {t('Tomar foto')}
              </span>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0]
                  if (f) void handleFile(f)
                  e.target.value = ''
                }}
              />
            </label>
            <label className="cursor-pointer text-sm text-brand-700 dark:text-brand-500 underline">
              {docMode === 'statement'
                ? t('o subir un PDF')
                : t('o subir una imagen, PDF o XML (factura)')}
              <input
                type="file"
                accept={
                  docMode === 'statement'
                    ? 'application/pdf'
                    : 'image/*,application/pdf,text/xml,application/xml,.xml'
                }
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0]
                  if (f) void handleFile(f)
                  e.target.value = ''
                }}
              />
            </label>
          </div>
        </Card>
      )}

      {step === 'ocr' && (
        <Card>
          <div className="flex flex-col items-center gap-4 py-6">
            {previewUrl && (
              <img
                src={previewUrl}
                alt="Documento"
                className="max-h-64 rounded-lg border border-slate-200 dark:border-slate-700 object-contain"
              />
            )}
            <p className="text-sm text-slate-600 dark:text-slate-300">
              {t('Analizando el documento con IA…')}
            </p>
            <div className="h-2 w-full max-w-xs overflow-hidden rounded-full bg-slate-200 dark:bg-slate-600">
              <div
                className="h-full bg-brand-600 transition-all"
                style={{ width: `${Math.round(progress * 100)}%` }}
              />
            </div>
          </div>
        </Card>
      )}

      {step === 'review' && docMode === 'receipt' && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <p className="mb-3 text-sm font-semibold text-slate-800 dark:text-slate-100">
              {t('Revisa y corrige los datos')}
            </p>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <Select
                label={t('Tipo')}
                options={[
                  { value: 'expense', label: `💸 ${t('Egreso')}` },
                  { value: 'income', label: `💰 ${t('Ingreso')}` },
                ]}
                {...form.register('kind', {
                  // Al cambiar de tipo, la categoría y la tarjeta anteriores
                  // dejan de aplicar.
                  onChange: () => {
                    form.setValue('categoryId', '')
                    form.setValue('cardId', '')
                  },
                })}
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label={t('Monto')}
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  {...form.register('amount')}
                  error={form.formState.errors.amount?.message}
                />
                <Select
                  label={t('Moneda')}
                  options={CURRENCIES.map((c) => ({ value: c, label: c }))}
                  {...form.register('currency')}
                />
              </div>
              {needsFx && (
                <div className="space-y-2 rounded-lg border border-sky-200 dark:border-sky-800 bg-sky-50 dark:bg-sky-900/20 p-3">
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label={t('Tipo de cambio ({{from}}→{{to}})', {
                        from: currency,
                        to: mainCurrency,
                      })}
                      type="number"
                      step="0.0001"
                      value={rateInput}
                      onChange={(e) => setRateInput(e.target.value)}
                      placeholder={fxQuery.isLoading ? t('Obteniendo…') : '0.00'}
                    />
                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
                        {t('Equivale a')}
                      </label>
                      <p className="rounded-lg bg-white dark:bg-slate-800 px-3 py-2 text-sm font-semibold text-slate-800 dark:text-slate-100">
                        ≈ {formatMoney(basePreview, mainCurrency)}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-sky-700 dark:text-sky-300">
                    {fxQuery.isError
                      ? t('No se obtuvo el tipo de cambio automático. Escríbelo manualmente.')
                      : t('Se toma el tipo de cambio de la fecha del movimiento. Puedes ajustarlo si lo necesitas.')}
                  </p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label={t('Fecha')}
                  type="date"
                  {...form.register('txDate')}
                  error={form.formState.errors.txDate?.message}
                />
                <Select
                  label={t('Categoría')}
                  options={[
                    { value: '', label: t('Sin categoría') },
                    ...availableCategories.map((c) => ({
                      value: c.id,
                      label: `${c.icon} ${t(c.name)}`,
                    })),
                  ]}
                  {...form.register('categoryId')}
                />
              </div>
              <Input
                label={t('Concepto / comercio')}
                placeholder={t('Ej: Supermercado')}
                {...form.register('concept')}
                error={form.formState.errors.concept?.message}
              />
              <div className={isIncome ? '' : 'grid grid-cols-2 gap-4'}>
                <Select
                  label={isIncome ? t('Cuenta donde entró el dinero') : t('Cuenta')}
                  options={[
                    { value: '', label: t('Selecciona una cuenta') },
                    ...accounts.map((a) => ({ value: a.id, label: a.name })),
                  ]}
                  {...form.register('accountId')}
                />
                {/* Un ingreso entra a una cuenta, no a una tarjeta. */}
                {!isIncome && (
                  <Select
                    label={t('O tarjeta')}
                    options={[
                      { value: '', label: t('Selecciona una tarjeta') },
                      ...cards.map((c) => ({ value: c.id, label: c.name })),
                    ]}
                    {...form.register('cardId')}
                  />
                )}
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={createTransaction.isPending}>
                  {createTransaction.isPending
                    ? t('Guardando…')
                    : isIncome
                      ? t('Registrar ingreso')
                      : t('Registrar gasto')}
                </Button>
                <Button type="button" variant="ghost" onClick={resetAll}>
                  {t('Cancelar')}
                </Button>
              </div>
            </form>
          </Card>

          <Card>
            {previewUrl && (
              <img
                src={previewUrl}
                alt="Ticket"
                className="mx-auto max-h-72 rounded-lg border border-slate-200 dark:border-slate-700 object-contain"
              />
            )}
            <button
              type="button"
              className="mt-3 text-sm text-brand-700 dark:text-brand-500 underline"
              onClick={() => setShowRaw((v) => !v)}
            >
              {showRaw ? t('Ocultar texto detectado') : t('Ver texto detectado')}
            </button>
            {showRaw && (
              <pre className="mt-2 max-h-64 overflow-auto whitespace-pre-wrap rounded-lg bg-slate-50 dark:bg-slate-900 p-3 text-xs text-slate-600 dark:text-slate-300">
                {rawText || t('(sin texto)')}
              </pre>
            )}
          </Card>
        </div>
      )}

      {step === 'review' && docMode === 'statement' && (
        <Card className="grid gap-4">
          {noticeMsg && (
            <p className="rounded-lg bg-amber-50 dark:bg-amber-900/20 p-3 text-sm text-amber-700 dark:text-amber-300">
              {noticeMsg}
            </p>
          )}
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
              {t('Revisa los movimientos detectados ({{count}})', { count: statementRows.length })}
            </p>
            <Button type="button" variant="ghost" onClick={resetAll}>
              {t('Cancelar')}
            </Button>
          </div>

          {statementRows.some((r) => r.isCardPayment || r.isInstallment) && (
            <p className="rounded-lg bg-amber-50 dark:bg-amber-900/20 p-3 text-xs text-amber-700 dark:text-amber-300">
              {t('Los marcados 💳 (pago a tarjeta) y 🔁 (compra a meses) se detectaron pero se dejaron sin seleccionar: regístralos desde "Nueva transacción" para que se contabilicen correctamente (línea de crédito, plazo, etc.).')}
            </p>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              label={t('Cuenta para todos los movimientos')}
              value={commonAccountId}
              onChange={(e) => applyCommonAccount(e.target.value)}
              options={[
                { value: '', label: t('Selecciona una cuenta') },
                ...accounts.map((a) => ({ value: a.id, label: a.name })),
              ]}
            />
            <Select
              label={t('O tarjeta para todos los movimientos')}
              value={commonCardId}
              onChange={(e) => applyCommonCard(e.target.value)}
              options={[
                { value: '', label: t('Selecciona una tarjeta') },
                ...cards.map((c) => ({ value: c.id, label: c.name })),
              ]}
            />
          </div>

          {foreignCurrenciesInRows.length > 0 && (
            <div className="space-y-2 rounded-lg border border-sky-200 dark:border-sky-800 bg-sky-50 dark:bg-sky-900/20 p-3">
              <p className="text-xs font-medium text-sky-700 dark:text-sky-300">
                {t('Tipo de cambio hacia {{main}} (se autocompleta, puedes corregirlo)', {
                  main: mainCurrency,
                })}
              </p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {foreignCurrenciesInRows.map((c) => (
                  <div key={c}>
                    <label className="mb-1 block text-xs text-slate-600 dark:text-slate-300">
                      {c} → {mainCurrency}
                    </label>
                    <input
                      type="number"
                      step="0.0001"
                      value={fxRates[c] ?? ''}
                      onChange={(e) => setFxRates((prev) => ({ ...prev, [c]: e.target.value }))}
                      placeholder={t('Obteniendo…')}
                      className="w-full rounded border border-slate-300 dark:border-slate-600 px-2 py-1 text-sm"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="max-h-[28rem] overflow-auto rounded-lg border border-slate-200 dark:border-slate-700">
            <table className="w-full text-left text-sm">
              <thead className="sticky top-0 bg-slate-50 dark:bg-slate-900 text-xs text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="px-2 py-2"></th>
                  <th className="px-2 py-2">{t('Fecha')}</th>
                  <th className="px-2 py-2">{t('Concepto')}</th>
                  <th className="px-2 py-2">{t('Tipo')}</th>
                  <th className="px-2 py-2">{t('Categoría')}</th>
                  <th className="px-2 py-2">{t('Cuenta / tarjeta')}</th>
                  <th className="px-2 py-2">{t('Moneda')}</th>
                  <th className="px-2 py-2 text-right">{t('Monto')}</th>
                </tr>
              </thead>
              <tbody>
                {statementRows.map((r) => {
                  const rowCategories = categories.filter((c) => c.kind === r.kind)
                  return (
                    <tr
                      key={r.id}
                      className={`border-t border-slate-100 dark:border-slate-700 ${
                        r.include ? '' : 'opacity-40'
                      }`}
                    >
                      <td className="px-2 py-1.5">
                        <input
                          type="checkbox"
                          checked={r.include}
                          onChange={(e) => updateRow(r.id, { include: e.target.checked })}
                        />
                      </td>
                      <td className="px-2 py-1.5">
                        <input
                          type="date"
                          value={r.txDate}
                          onChange={(e) => updateRow(r.id, { txDate: e.target.value })}
                          className="w-36 rounded border border-slate-300 dark:border-slate-600 px-1.5 py-1 text-sm"
                        />
                      </td>
                      <td className="px-2 py-1.5">
                        <div className="flex items-center gap-1">
                          {r.isCardPayment && (
                            <span title={t('Pago a tarjeta detectado')}>💳</span>
                          )}
                          {r.isInstallment && (
                            <span title={t('Compra a meses (MSI) detectada')}>🔁</span>
                          )}
                          <input
                            type="text"
                            value={r.concept}
                            onChange={(e) => updateRow(r.id, { concept: e.target.value })}
                            className="w-48 rounded border border-slate-300 dark:border-slate-600 px-1.5 py-1 text-sm"
                          />
                        </div>
                      </td>
                      <td className="px-2 py-1.5">
                        <select
                          value={r.kind}
                          onChange={(e) =>
                            updateRow(r.id, {
                              kind: e.target.value as 'income' | 'expense',
                              categoryId: '',
                              cardId: e.target.value === 'income' ? '' : r.cardId,
                            })
                          }
                          className="rounded border border-slate-300 dark:border-slate-600 px-1.5 py-1 text-sm"
                        >
                          <option value="expense">💸 {t('Egreso')}</option>
                          <option value="income">💰 {t('Ingreso')}</option>
                        </select>
                      </td>
                      <td className="px-2 py-1.5">
                        <select
                          value={r.categoryId}
                          onChange={(e) => updateRow(r.id, { categoryId: e.target.value })}
                          className="w-32 rounded border border-slate-300 dark:border-slate-600 px-1.5 py-1 text-sm"
                        >
                          <option value="">{t('Sin categoría')}</option>
                          {rowCategories.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.icon} {t(c.name)}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-2 py-1.5">
                        {r.kind === 'income' ? (
                          <select
                            value={r.accountId}
                            onChange={(e) => updateRow(r.id, { accountId: e.target.value })}
                            className="w-36 rounded border border-slate-300 dark:border-slate-600 px-1.5 py-1 text-sm"
                          >
                            <option value="">{t('Selecciona una cuenta')}</option>
                            {accounts.map((a) => (
                              <option key={a.id} value={a.id}>
                                {a.name}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <select
                            value={r.accountId || r.cardId}
                            onChange={(e) => {
                              const val = e.target.value
                              const isCard = cards.some((c) => c.id === val)
                              updateRow(r.id, {
                                accountId: isCard ? '' : val,
                                cardId: isCard ? val : '',
                              })
                            }}
                            className="w-36 rounded border border-slate-300 dark:border-slate-600 px-1.5 py-1 text-sm"
                          >
                            <option value="">{t('Selecciona cuenta o tarjeta')}</option>
                            {accounts.map((a) => (
                              <option key={a.id} value={a.id}>
                                {a.name}
                              </option>
                            ))}
                            {cards.map((c) => (
                              <option key={c.id} value={c.id}>
                                💳 {c.name}
                              </option>
                            ))}
                          </select>
                        )}
                      </td>
                      <td className="px-2 py-1.5">
                        <select
                          value={r.currency}
                          onChange={(e) => updateRow(r.id, { currency: e.target.value })}
                          className="rounded border border-slate-300 dark:border-slate-600 px-1.5 py-1 text-sm"
                        >
                          {/* La IA a veces detecta una moneda fuera del catálogo fijo; se
                              agrega como opción extra para no perderla. */}
                          {Array.from(new Set([...CURRENCIES, r.currency])).map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-2 py-1.5 text-right">
                        <input
                          type="number"
                          step="0.01"
                          value={r.amount}
                          onChange={(e) => updateRow(r.id, { amount: Number(e.target.value) || 0 })}
                          className="w-24 rounded border border-slate-300 dark:border-slate-600 px-1.5 py-1 text-right text-sm"
                        />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div className="flex items-center gap-3">
            <Button type="button" onClick={saveStatementRows} disabled={saving}>
              {saving
                ? t('Guardando…')
                : t('Guardar seleccionadas ({{count}})', {
                    count: statementRows.filter((r) => r.include).length,
                  })}
            </Button>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t('Cada movimiento usa la moneda que detectó la IA; corrígela por fila si hace falta.')}
            </p>
          </div>
        </Card>
      )}

      {step === 'done' && (
        <Card className="animate-card-pop-in">
          <div className="flex flex-col items-center gap-4 py-6">
            <span className="animate-success-pop text-5xl">✅</span>
            {docMode === 'statement' && saveSummary ? (
              <p className="text-center text-sm text-slate-700 dark:text-slate-200">
                {t('Se guardaron {{saved}} movimientos.', { saved: saveSummary.saved })}
                {saveSummary.duplicates > 0 &&
                  ' ' + t('{{n}} ya estaban registrados (duplicados).', { n: saveSummary.duplicates })}
                {saveSummary.failed > 0 &&
                  ' ' + t('{{n}} no se pudieron guardar.', { n: saveSummary.failed })}
              </p>
            ) : (
              <p className="text-sm text-slate-700 dark:text-slate-200">
                {isIncome
                  ? t('Ingreso registrado correctamente.')
                  : t('Gasto registrado correctamente.')}
              </p>
            )}
            <div className="flex gap-2">
              <Button onClick={resetAll}>{t('Escanear otro')}</Button>
              <Link to="/transacciones">
                <Button variant="secondary">{t('Ver movimientos')}</Button>
              </Link>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
