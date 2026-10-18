import { useMemo, useState } from 'react'
import { flushSync } from 'react-dom'
import { CircleCheck, Minus, Plus, TriangleAlert } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/store/useAuth'
import { useAccounts } from '@/hooks/useAccounts'
import { useCards } from '@/hooks/useCards'
import { useCreditLines } from '@/hooks/useCreditLines'
import { useEntitlements, useMonthlyLimit } from '@/hooks/useAppConfig'
import { useCreateTransaction } from '@/hooks/useTransactions'
import { useOcrReceipt, type StatementExtraction } from '@/hooks/useOcrReceipt'
import {
  useReconciliations,
  useReconcilePlans,
  useReconcileTransactions,
  useSaveReconciliation,
} from '@/hooks/useReconciliations'
import { ingestStatementFile } from '@/lib/statementIngest'
import { hashRow } from '@/lib/importParser'
import { supabase } from '@/lib/supabase'
import {
  reconcileStatement,
  type ReconcileResult,
  type StatementLine,
} from '@/lib/statementReconcile'
import { monthStartISO, parseLocalDate, toISODate, todayISO } from '@/lib/dates'
import { PageHeader } from '@/components/ui/PageHeader'
import { PremiumLocked } from '@/components/ui/PremiumLocked'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Money } from '@/components/ui/Money'
import { formatDate } from '@/lib/format'
import type { ReconcileBuckets } from '@/types/db'

function toLine(tx: StatementExtraction['transactions'][number]): StatementLine {
  return {
    amount: tx.amount,
    currency: tx.currency,
    txDate: tx.txDate,
    concept: tx.concept ?? '',
    kind: tx.kind,
    isCardPayment: tx.isCardPayment,
    isInstallment: tx.isInstallment,
  }
}

// external_id estable para no duplicar al reintentar "Agregar faltantes".
function reconcileExternalId(instrumentId: string, l: StatementLine): string {
  return 'rec_' + hashRow([instrumentId, l.txDate, l.amount, l.concept]).slice(4)
}

function shiftISO(iso: string, days: number): string {
  const d = parseLocalDate(iso)
  d.setDate(d.getDate() + days)
  return toISODate(d)
}

export function ReconcilePage() {
  const { t } = useTranslation()
  const { session } = useAuth()
  const userId = session?.user?.id
  const { canUseReconcile } = useEntitlements()
  const reconcileLimit = useMonthlyLimit('reconcile')

  const accounts = useAccounts(userId).data || []
  const cards = useCards(userId).data || []
  const creditLines = useCreditLines(userId).data || []
  const historyQuery = useReconciliations(userId)
  const ocr = useOcrReceipt()
  const createTx = useCreateTransaction()
  const saveReconciliation = useSaveReconciliation()

  // target = "account:<id>" | "card:<id>" | "line:<id>" (línea de crédito: todas sus tarjetas)
  const [target, setTarget] = useState('')
  const [periodStart, setPeriodStart] = useState(monthStartISO())
  const [periodEnd, setPeriodEnd] = useState(todayISO())
  const [file, setFile] = useState<File | null>(null)
  const [progress, setProgress] = useState(0)
  // `ocr.isPending` solo cubre la llamada a la edge; leer el PDF antes también tarda.
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [extraction, setExtraction] = useState<StatementExtraction | null>(null)
  const [lineRates, setLineRates] = useState<Record<string, number>>({})
  const [amountTolerance, setAmountTolerance] = useState('0.5')
  const [dateWindowDays, setDateWindowDays] = useState('4')
  const [selectedMissing, setSelectedMissing] = useState<Record<number, boolean>>({})
  const [addResult, setAddResult] = useState<string | null>(null)
  const [savedNote, setSavedNote] = useState<string | null>(null)
  const [openHistoryId, setOpenHistoryId] = useState<string | null>(null)

  const [type, id] = target.split(':')
  const account = type === 'account' ? accounts.find((a) => a.id === id) : undefined
  const selectedCard = type === 'card' ? cards.find((c) => c.id === id) : undefined
  const creditLine = type === 'line' ? creditLines.find((l) => l.id === id) : undefined
  const creditLineId = creditLine?.id ?? selectedCard?.credit_line_id ?? null
  const lineCards = creditLine ? cards.filter((c) => c.credit_line_id === creditLine.id) : []
  // Tarjetas cuyas compras entran a la comparación (una línea trae física y virtual).
  const cardIds = selectedCard ? [selectedCard.id] : lineCards.map((c) => c.id)
  const lastLast4 = extraction?.accountLast4
  // Tarjeta a la que se asignan las compras faltantes que se agreguen / se guarda la conciliación.
  const bookCard = selectedCard ?? (lastLast4 ? lineCards.find((c) => c.last4 === lastLast4) : undefined) ?? lineCards[0]
  const targetCurrency = account?.currency || selectedCard?.currency || creditLine?.currency || 'MXN'
  const instrumentName = account?.name || selectedCard?.name || creditLine?.name || ''

  // Las transacciones de la app se piden según las fechas del propio estado de
  // cuenta (± margen), no las de Desde/Hasta: un corte que cruza de mes las recortaba.
  const queryRange = useMemo(() => {
    const dates = (extraction?.transactions ?? []).map((tx) => tx.txDate).filter(Boolean).sort()
    if (dates.length === 0) return null
    const pad = Math.max(Number(dateWindowDays) || 4, 10)
    return { start: shiftISO(dates[0], -pad), end: shiftISO(dates[dates.length - 1], pad) }
  }, [extraction, dateWindowDays])

  const txnsQuery = useReconcileTransactions({
    userId,
    cardIds,
    accountId: account?.id,
    creditLineId,
    startDate: queryRange?.start,
    endDate: queryRange?.end,
  })

  const plansQuery = useReconcilePlans({ userId, cardIds })

  const lines: StatementLine[] = useMemo(
    () => (extraction?.transactions ?? []).map(toLine),
    [extraction],
  )

  const result: ReconcileResult | null = useMemo(() => {
    if (!extraction || txnsQuery.isLoading || plansQuery.isLoading) return null
    return reconcileStatement(lines, txnsQuery.data || [], {
      targetCurrency,
      instrument: account ? 'account' : 'card',
      instrumentAccountId: account?.id,
      lineRates,
      amountTolerance: Number(amountTolerance) || 0.5,
      dateWindowDays: Number(dateWindowDays) || 4,
      plans: plansQuery.data,
    })
  }, [
    extraction,
    lines,
    txnsQuery.data,
    txnsQuery.isLoading,
    plansQuery.data,
    plansQuery.isLoading,
    targetCurrency,
    account,
    lineRates,
    amountTolerance,
    dateWindowDays,
  ])

  const buckets: ReconcileBuckets | null = result && {
    matched: [
      ...result.matched.map((m) => ({ line: m.line, txId: m.tx.id })),
      // Mensualidad MSI: se guarda con la compra del plan (o el id del plan si no tiene compra).
      ...result.installments.map((i) => ({ line: i.line, txId: i.plan.transaction_id ?? i.plan.id })),
    ],
    amountMismatch: result.amountMismatch.map((m) => ({
      line: m.line,
      txId: m.tx.id,
      diff: m.diff,
    })),
    missingInApp: result.missingInApp,
    missingInStatement: result.missingInStatement.map((tx) => ({
      id: tx.id,
      concept: tx.concept ?? '',
      amount: tx.amount,
      currency: tx.currency,
      tx_date: tx.tx_date,
    })),
  }

  async function runComparison() {
    if (!file || !target) return
    // Primero y de forma síncrona: el botón responde al instante, antes de re-renderizar el resto.
    flushSync(() => setBusy(true))
    setError(null)
    setNotice(null)
    setExtraction(null)
    setSavedNote(null)
    setAddResult(null)
    setSelectedMissing({})
    setProgress(0)
    // Deja pintar el botón en "Analizando…" antes de que pdfjs ocupe el hilo principal.
    await new Promise<void>((r) => requestAnimationFrame(() => setTimeout(r, 0)))
    try {
      // Mitad del avance = leer el archivo; la otra mitad = análisis (no mide su avance,
      // así que se acerca al 95% poco a poco y solo llega a 100% cuando hay resultado).
      let analyzing = false
      let creep: ReturnType<typeof setInterval> | undefined
      let ex: StatementExtraction
      let truncated: boolean | undefined
      try {
        ;({ extraction: ex, truncated } = await ingestStatementFile(
          file,
          (input) => {
            analyzing = true
            setProgress(0.5)
            creep = setInterval(() => setProgress((p) => Math.min(0.95, p + (0.95 - p) * 0.06)), 400)
            return ocr.mutateAsync(input) as Promise<StatementExtraction>
          },
          (p) => {
            if (!analyzing) setProgress(p * 0.5)
          },
        ))
      } finally {
        clearInterval(creep)
      }
      setProgress(1)
      if (!ex.transactions || ex.transactions.length === 0) {
        setError(t('No se detectaron movimientos en el documento. Intenta con otro archivo.'))
        return
      }
      if (truncated) {
        setNotice(t('El PDF tiene más de 8 páginas; solo se analizaron las primeras 8.'))
      }
      // Una línea agrupa física y virtual (y puede traer una no registrada): no se avisa por last4.
      const knownLast4 = (selectedCard ? [selectedCard] : []).map((c) => c.last4).filter(Boolean)
      if (
        ex.accountLast4 &&
        (knownLast4.length > 0 || !!account) &&
        // El OCR a veces corta un dígito (362 por 2362): se acepta si uno termina en el otro.
        !knownLast4.some((k) => k && (k.endsWith(ex.accountLast4 as string) || (ex.accountLast4 as string).endsWith(k))) &&
        account?.account_last4 !== ex.accountLast4 &&
        account?.account_number_last4 !== ex.accountLast4
      ) {
        setNotice(
          t('El estado de cuenta parece ser de otra tarjeta/cuenta (termina en {{last4}}). Revisa que elegiste la correcta.', {
            last4: ex.accountLast4,
          }),
        )
      }
      setExtraction(ex)
      setBusy(false) // el resultado ya se muestra; las tasas de cambio siguen en segundo plano
      // El periodo guardado refleja lo que realmente cubre el estado de cuenta.
      const ds = ex.transactions.map((tx) => tx.txDate).filter(Boolean).sort()
      if (ds.length > 0) {
        setPeriodStart(ds[0])
        setPeriodEnd(ds[ds.length - 1])
      }

      // Tasas de cambio para las líneas en otra moneda distinta a la del
      // instrumento (en segundo plano; el matcher las usa cuando llegan).
      const foreign = Array.from(
        new Set(ex.transactions.map((tx) => tx.currency).filter(Boolean)),
      ).filter((c) => c && c !== targetCurrency) as string[]
      setLineRates({})
      for (const c of foreign) {
        try {
          const { data } = await supabase.functions.invoke('fx-rate', {
            body: { base: c, quote: targetCurrency },
          })
          const rate = (data as { rate?: number } | null)?.rate
          if (rate) setLineRates((prev) => ({ ...prev, [c]: rate }))
        } catch {
          /* el usuario ve el desajuste y puede corregir la transacción */
        }
      }
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  async function addSelectedMissing() {
    if (!userId || !result) return
    const toAdd = result.missingInApp.filter(
      (l, i) => selectedMissing[i] && !l.isCardPayment && !l.isInstallment,
    )
    let added = 0
    let existed = 0
    let failed = 0
    for (const l of toAdd) {
      try {
        await createTx.mutateAsync({
          userId,
          kind: l.kind,
          amount: l.amount,
          currency: l.currency || targetCurrency,
          concept: l.concept,
          accountId: account?.id,
          cardId: bookCard?.id,
          txDate: l.txDate,
          source: 'receipt',
          externalId: reconcileExternalId(id, l),
        })
        added++
      } catch (e) {
        if ((e as { code?: string }).code === '23505') existed++
        else failed++
      }
    }
    setAddResult(
      t('Agregadas: {{added}} · Ya existían: {{existed}} · Con error: {{failed}}', {
        added,
        existed,
        failed,
      }),
    )
    setSelectedMissing({})
  }

  async function save() {
    if (!userId || !result || !buckets) return
    await saveReconciliation.mutateAsync({
      userId,
      cardId: bookCard?.id,
      accountId: account?.id,
      periodStart,
      periodEnd,
      currency: targetCurrency,
      statementTotal: result.statementTotal,
      appTotal: result.appTotal,
      buckets,
    })
    setSavedNote(t('Conciliación guardada.'))
  }

  const targetLabel = (r: { card_id: string | null; account_id: string | null }) =>
    accounts.find((a) => a.id === r.account_id)?.name ||
    cards.find((c) => c.id === r.card_id)?.name ||
    t('Cuenta/tarjeta eliminada')

  if (!canUseReconcile) {
    return (
      <>
        <PageHeader
          title={t('Conciliación')}
          subtitle={t('Compara el estado de cuenta del banco con lo que registraste.')}
          helpId="conciliacion"
          tourTarget="conciliacion"
        />
        <PremiumLocked />
      </>
    )
  }

  return (
    <>
      <PageHeader
        title={t('Conciliación')}
        subtitle={t('Compara el estado de cuenta del banco con lo que registraste.')}
        helpId="conciliacion"
        tourTarget="conciliacion"
      />

      {reconcileLimit.reached && <PremiumLocked className="mb-4" message={t('Plan gratis: llegaste al límite de {{n}} conciliaciones este mes. Actualiza a Premium para conciliar más.', { n: reconcileLimit.limit })} />}

      <Card className="mb-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <Select
            label={t('Tarjeta o cuenta')}
            value={target}
            onChange={(e) => {
              setTarget(e.target.value)
              setExtraction(null)
            }}
            options={[
              { value: '', label: t('Selecciona…') },
              ...accounts.map((a) => ({ value: `account:${a.id}`, label: `🏦 ${a.name}` })),
              ...creditLines.map((l) => ({ value: `line:${l.id}`, label: `🗂️ ${t('Línea')} ${l.name}` })),
              ...cards.map((c) => ({ value: `card:${c.id}`, label: `💳 ${c.name}` })),
            ]}
          />
          <div className="grid grid-cols-2 gap-2">
            <Input
              label={t('Desde')}
              type="date"
              value={periodStart}
              onChange={(e) => setPeriodStart(e.target.value)}
            />
            <Input
              label={t('Hasta')}
              type="date"
              value={periodEnd}
              onChange={(e) => setPeriodEnd(e.target.value)}
            />
          </div>
        </div>

        <div className="mt-3">
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
            {t('Estado de cuenta (PDF o imagen)')}
          </label>
          <input
            type="file"
            accept="application/pdf,image/*"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="block w-full text-sm text-slate-600 dark:text-slate-300 file:mr-3 file:rounded-lg file:border-0 file:bg-brand-500 file:px-3 file:py-2 file:text-sm file:font-medium file:text-white"
          />
        </div>

        <div className="mt-3 flex items-center gap-3">
          <Button
            data-tour="conciliacion"
            onClick={runComparison}
            disabled={!file || !target || busy || reconcileLimit.reached}
            className={busy ? 'animate-pulse' : ''}
          >
            {busy && (
              <span
                aria-hidden
                className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
              />
            )}
            {busy ? t('Analizando…') : t('Comparar')}
          </Button>
          {busy && progress > 0 && (
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {Math.round(progress * 100)}%
            </span>
          )}
        </div>

        {error && <p className="mt-2 text-sm text-line-scarlet">{error}</p>}
        {notice && (
          <p className="mt-2 rounded-lg bg-line-amber/10 p-2 text-xs text-line-amber">
            {notice}
          </p>
        )}
      </Card>

      {extraction && (
        <>
          <Card className="mb-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <Input
                label={t('Tolerancia de monto')}
                type="number"
                step="0.01"
                value={amountTolerance}
                onChange={(e) => setAmountTolerance(e.target.value)}
              />
              <Input
                label={t('Días de margen')}
                type="number"
                value={dateWindowDays}
                onChange={(e) => setDateWindowDays(e.target.value)}
              />
            </div>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              {t('{{lines}} movimientos en el estado de cuenta · comparando contra {{name}} ({{currency}})', {
                lines: lines.length,
                name: instrumentName,
                currency: targetCurrency,
              })}
            </p>
          </Card>

          {txnsQuery.isLoading || !result ? (
            <Card>
              <p className="text-sm text-slate-500 dark:text-slate-400">{t('Comparando…')}</p>
            </Card>
          ) : (
            <div className="grid gap-4">
              <Card>
                <div className="flex flex-wrap gap-4 text-sm">
                  <span>
                    {t('Total estado de cuenta:')}{' '}
                    <strong>
                      <Money amount={result.statementTotal} currency={targetCurrency} />
                    </strong>
                  </span>
                  <span>
                    {t('Total registrado:')}{' '}
                    <strong>
                      <Money amount={result.appTotal} currency={targetCurrency} />
                    </strong>
                  </span>
                  <span>
                    {t('Diferencia:')}{' '}
                    <strong>
                      <Money
                        amount={result.statementTotal - result.appTotal}
                        currency={targetCurrency}
                      />
                    </strong>
                  </span>
                </div>
              </Card>

              {/* Falta en la app */}
              <Card>
                <h3 className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                  <Plus className="mr-1.5 inline h-4 w-4 align-[-2px]" aria-hidden="true" /> {t('En el estado de cuenta, no en la app')} ({result.missingInApp.length})
                </h3>
                {result.missingInApp.length === 0 ? (
                  <p className="text-xs text-slate-500 dark:text-slate-400">{t('Nada 🎉')}</p>
                ) : (
                  <>
                    <div className="grid gap-1.5">
                      {result.missingInApp.map((l, i) => (
                        <label
                          key={i}
                          className="flex items-center gap-2 rounded border border-slate-200 dark:border-slate-700 p-2 text-sm"
                        >
                          <input
                            type="checkbox"
                            disabled={l.isCardPayment || l.isInstallment}
                            checked={!!selectedMissing[i]}
                            onChange={(e) =>
                              setSelectedMissing((p) => ({ ...p, [i]: e.target.checked }))
                            }
                          />
                          <span className="flex-1">
                            {l.concept || t('Sin concepto')}{' '}
                            <span className="text-xs text-slate-400">
                              {formatDate(l.txDate)}
                              {l.isCardPayment && ` · ${t('pago a tarjeta — regístralo desde Transacciones')}`}
                              {l.isInstallment &&
                                ` · ${t('meses sin intereses — regístrala como compra a meses en Transacciones')}`}
                            </span>
                          </span>
                          <Money amount={l.amount} currency={l.currency || targetCurrency} />
                        </label>
                      ))}
                    </div>
                    <div className="mt-2 flex items-center gap-3">
                      <Button
                        variant="secondary"
                        onClick={addSelectedMissing}
                        disabled={
                          createTx.isPending ||
                          !Object.values(selectedMissing).some(Boolean)
                        }
                      >
                        {t('Agregar seleccionadas')}
                      </Button>
                      {addResult && (
                        <span className="text-xs text-slate-500 dark:text-slate-400">{addResult}</span>
                      )}
                    </div>
                  </>
                )}
              </Card>

              {/* Monto distinto */}
              <Card>
                <h3 className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                  <TriangleAlert className="mr-1.5 inline h-4 w-4 align-[-2px]" aria-hidden="true" /> {t('Monto distinto')} ({result.amountMismatch.length})
                </h3>
                {result.amountMismatch.length === 0 ? (
                  <p className="text-xs text-slate-500 dark:text-slate-400">{t('Nada 🎉')}</p>
                ) : (
                  <div className="grid gap-1.5">
                    {result.amountMismatch.map((m, i) => (
                      <div
                        key={i}
                        className="flex flex-wrap items-center gap-2 rounded border border-line-amber/30 p-2 text-sm"
                      >
                        <span className="flex-1">
                          {m.line.concept || t('Sin concepto')}{' '}
                          <span className="text-xs text-slate-400">{formatDate(m.line.txDate)}</span>
                        </span>
                        <span className="text-xs">
                          {t('estado de cuenta')}:{' '}
                          <Money amount={m.line.amount} currency={m.line.currency || targetCurrency} />
                          {' · '}
                          {t('app')}: <Money amount={m.tx.amount} currency={m.tx.currency} />
                        </span>
                        <Link
                          to="/transacciones"
                          className="text-xs font-medium text-brand-600 hover:underline dark:text-brand-400"
                        >
                          {t('Editar')}
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              {/* Falta en el estado de cuenta */}
              <Card>
                <h3 className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                  <Minus className="mr-1.5 inline h-4 w-4 align-[-2px]" aria-hidden="true" /> {t('En la app, no en el estado de cuenta')} ({result.missingInStatement.length})
                </h3>
                {result.missingInStatement.length === 0 ? (
                  <p className="text-xs text-slate-500 dark:text-slate-400">{t('Nada 🎉')}</p>
                ) : (
                  <div className="grid gap-1.5">
                    {result.missingInStatement.map((tx) => (
                      <div
                        key={tx.id}
                        className="flex items-center gap-2 rounded border border-slate-200 dark:border-slate-700 p-2 text-sm"
                      >
                        <span className="flex-1">
                          {tx.concept || t('Sin concepto')}{' '}
                          <span className="text-xs text-slate-400">{formatDate(tx.tx_date)}</span>
                        </span>
                        <Money amount={tx.amount} currency={tx.currency} />
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              {/* Mensualidades MSI empatadas con un plan */}
              {result.installments.length > 0 && (
                <Card>
                  <h3 className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                    <CircleCheck className="mr-1.5 inline h-4 w-4 align-[-2px]" aria-hidden="true" /> {t('Mensualidades a meses')} ({result.installments.length})
                  </h3>
                  <div className="grid gap-1">
                    {result.installments.map((i, k) => (
                      <div key={k} className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                        <span className="flex-1 truncate">
                          {i.plan.description || i.line.concept || t('Sin concepto')}
                          {i.n && i.m ? ` · ${i.n}/${i.m}` : ''} · {t('plan registrado')}
                        </span>
                        <Money amount={i.line.amount} currency={i.line.currency || targetCurrency} />
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Coinciden */}
              <Card>
                <h3 className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                  <CircleCheck className="mr-1.5 inline h-4 w-4 align-[-2px]" aria-hidden="true" /> {t('Coinciden')} ({result.matched.length})
                </h3>
                <div className="grid gap-1">
                  {result.matched.map((m, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <span className="flex-1 truncate">
                        {m.line.concept || t('Sin concepto')} · {formatDate(m.line.txDate)}
                      </span>
                      <Money amount={m.line.amount} currency={m.line.currency || targetCurrency} />
                    </div>
                  ))}
                </div>
              </Card>

              <div className="flex items-center gap-3">
                <Button onClick={save} disabled={saveReconciliation.isPending}>
                  {t('Guardar conciliación')}
                </Button>
                {savedNote && (
                  <span className="text-xs text-line-green">{savedNote}</span>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* Historial */}
      <Card className="mt-6">
        <h3 className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-200">
          {t('Conciliaciones guardadas')}
        </h3>
        {(historyQuery.data || []).length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">{t('Aún no guardas ninguna.')}</p>
        ) : (
          <div className="grid gap-2">
            {(historyQuery.data || []).map((r) => (
              <div key={r.id} className="rounded-lg border border-slate-200 dark:border-slate-700 p-3 text-sm">
                <button
                  type="button"
                  onClick={() => setOpenHistoryId(openHistoryId === r.id ? null : r.id)}
                  className="flex w-full items-center justify-between gap-2 text-left"
                >
                  <span className="font-medium text-slate-800 dark:text-slate-100">
                    {targetLabel(r)}{' '}
                    <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
                      {formatDate(r.period_start)} – {formatDate(r.period_end)}
                    </span>
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    <CircleCheck className="mr-1.5 inline h-4 w-4 align-[-2px]" aria-hidden="true" /> {r.matched_count} · ⚠️ {r.amount_mismatch_count} · ➕ {r.missing_in_app_count} · ➖{' '}
                    {r.missing_in_statement_count}
                  </span>
                </button>
                {openHistoryId === r.id && r.result && 'missingInApp' in r.result && (
                  <pre className="mt-2 max-h-64 overflow-auto rounded bg-canvas p-2 text-xs text-slate-600 dark:text-slate-300">
                    {JSON.stringify(r.result, null, 2)}
                  </pre>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </>
  )
}
