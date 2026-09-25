import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/store/useAuth'
import { useAccounts } from '@/hooks/useAccounts'
import { useCards } from '@/hooks/useCards'
import { useEntitlements, useMonthlyLimit } from '@/hooks/useAppConfig'
import { useCreateTransaction } from '@/hooks/useTransactions'
import { useOcrReceipt, type StatementExtraction } from '@/hooks/useOcrReceipt'
import {
  useReconciliations,
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
import { monthStartISO, todayISO } from '@/lib/dates'
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

export function ReconcilePage() {
  const { t } = useTranslation()
  const { session } = useAuth()
  const userId = session?.user?.id
  const { canUseReconcile } = useEntitlements()
  const reconcileLimit = useMonthlyLimit('reconcile')

  const accounts = useAccounts(userId).data || []
  const cards = useCards(userId).data || []
  const historyQuery = useReconciliations(userId)
  const ocr = useOcrReceipt()
  const createTx = useCreateTransaction()
  const saveReconciliation = useSaveReconciliation()

  // target = "account:<id>" | "card:<id>"
  const [target, setTarget] = useState('')
  const [periodStart, setPeriodStart] = useState(monthStartISO())
  const [periodEnd, setPeriodEnd] = useState(todayISO())
  const [file, setFile] = useState<File | null>(null)
  const [progress, setProgress] = useState(0)
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
  const card = type === 'card' ? cards.find((c) => c.id === id) : undefined
  const creditLineId = card?.credit_line_id ?? null
  const targetCurrency = account?.currency || card?.currency || 'MXN'
  const instrumentName = account?.name || card?.name || ''

  const txnsQuery = useReconcileTransactions({
    userId,
    cardId: card?.id,
    accountId: account?.id,
    creditLineId,
    startDate: extraction ? periodStart : undefined,
    endDate: extraction ? periodEnd : undefined,
  })

  const lines: StatementLine[] = useMemo(
    () => (extraction?.transactions ?? []).map(toLine),
    [extraction],
  )

  const result: ReconcileResult | null = useMemo(() => {
    if (!extraction || txnsQuery.isLoading) return null
    return reconcileStatement(lines, txnsQuery.data || [], {
      targetCurrency,
      instrument: account ? 'account' : 'card',
      instrumentAccountId: account?.id,
      lineRates,
      amountTolerance: Number(amountTolerance) || 0.5,
      dateWindowDays: Number(dateWindowDays) || 4,
    })
  }, [
    extraction,
    lines,
    txnsQuery.data,
    txnsQuery.isLoading,
    targetCurrency,
    account,
    lineRates,
    amountTolerance,
    dateWindowDays,
  ])

  const buckets: ReconcileBuckets | null = result && {
    matched: result.matched.map((m) => ({ line: m.line, txId: m.tx.id })),
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
    setError(null)
    setNotice(null)
    setExtraction(null)
    setSavedNote(null)
    setAddResult(null)
    setSelectedMissing({})
    setProgress(0)
    try {
      const { extraction: ex, truncated } = await ingestStatementFile(
        file,
        (input) => ocr.mutateAsync(input) as Promise<StatementExtraction>,
        setProgress,
      )
      if (!ex.transactions || ex.transactions.length === 0) {
        setError(t('No se detectaron movimientos en el documento. Intenta con otro archivo.'))
        return
      }
      if (truncated) {
        setNotice(t('El PDF tiene más de 8 páginas; solo se analizaron las primeras 8.'))
      }
      if (
        ex.accountLast4 &&
        card?.last4 &&
        ex.accountLast4 !== card.last4 &&
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
    }
  }

  async function addSelectedMissing() {
    if (!userId || !result) return
    const toAdd = result.missingInApp.filter(
      (l, i) => selectedMissing[i] && !l.isCardPayment,
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
          cardId: card?.id,
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
      cardId: card?.id,
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
            disabled={!file || !target || ocr.isPending || reconcileLimit.reached}
          >
            {ocr.isPending ? t('Analizando…') : t('Comparar')}
          </Button>
          {ocr.isPending && progress > 0 && (
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {Math.round(progress * 100)}%
            </span>
          )}
        </div>

        {error && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>}
        {notice && (
          <p className="mt-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 p-2 text-xs text-amber-700 dark:text-amber-300">
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
                  ➕ {t('En el estado de cuenta, no en la app')} ({result.missingInApp.length})
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
                            disabled={l.isCardPayment}
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
                              {l.isInstallment && ` · ${t('meses sin intereses')}`}
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
                  ⚠️ {t('Monto distinto')} ({result.amountMismatch.length})
                </h3>
                {result.amountMismatch.length === 0 ? (
                  <p className="text-xs text-slate-500 dark:text-slate-400">{t('Nada 🎉')}</p>
                ) : (
                  <div className="grid gap-1.5">
                    {result.amountMismatch.map((m, i) => (
                      <div
                        key={i}
                        className="flex flex-wrap items-center gap-2 rounded border border-amber-200 dark:border-amber-800 p-2 text-sm"
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
                  ➖ {t('En la app, no en el estado de cuenta')} ({result.missingInStatement.length})
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

              {/* Coinciden */}
              <Card>
                <h3 className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                  ✅ {t('Coinciden')} ({result.matched.length})
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
                  <span className="text-xs text-green-600 dark:text-green-400">{savedNote}</span>
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
                    ✅ {r.matched_count} · ⚠️ {r.amount_mismatch_count} · ➕ {r.missing_in_app_count} · ➖{' '}
                    {r.missing_in_statement_count}
                  </span>
                </button>
                {openHistoryId === r.id && r.result && 'missingInApp' in r.result && (
                  <pre className="mt-2 max-h-64 overflow-auto rounded bg-slate-50 dark:bg-slate-900 p-2 text-xs text-slate-600 dark:text-slate-300">
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
