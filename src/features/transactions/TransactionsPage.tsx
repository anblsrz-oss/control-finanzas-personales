import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/store/useAuth'
import {
  useTransactions,
  useTransactionsCount,
  useDeleteTransaction,
  useConfirmTransaction,
  useTransactionDeletions,
  useInstallmentPlans,
  useTransactionLines,
} from '@/hooks/useTransactions'
import type { TransactionFilter } from '@/hooks/useTransactions'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { useSettings } from '@/store/useSettings'
import { useAccounts } from '@/hooks/useAccounts'
import { useCards } from '@/hooks/useCards'
import { useCreditLines } from '@/hooks/useCreditLines'
import { useCategories } from '@/hooks/useCategories'
import { useMyFamilies, useFamilyCards } from '@/hooks/useFamily'
import { useEntitlements } from '@/hooks/useAppConfig'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import { PremiumGate } from '@/components/ui/PremiumGate'
import { Card } from '@/components/ui/Card'
import { Modal } from '@/components/ui/Modal'
import { TransactionForm } from './TransactionForm'
import { RefundDialog } from './RefundDialog'
import { PossibleDuplicateNotice, ReceivedVia } from './CaptureInfo'
import { useDismissPossibleDuplicate, useSignalsByTransaction } from '@/hooks/useIngestSignals'
import {
  TransactionFilters,
  EMPTY_FILTERS,
  countActiveFilters,
} from './TransactionFilters'
import type { FilterState } from './TransactionFilters'
import { formatMoney, formatDate, CURRENCIES } from '@/lib/format'
import { Money } from '@/components/ui/Money'
import { monthStartISO, todayISO } from '@/lib/dates'
import type { TransactionRow } from '@/types/db'

export function TransactionsPage() {
  const { t } = useTranslation()
  const { session, profile } = useAuth()
  const userId = session?.user?.id
  const mainCurrency = profile?.main_currency ?? 'MXN'
  const [showForm, setShowForm] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [editingTx, setEditingTx] = useState<TransactionRow | null>(null)
  const [deleting, setDeleting] = useState<TransactionRow | null>(null)
  const [refunding, setRefunding] = useState<TransactionRow | null>(null)
  const [reason, setReason] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [viewingLinesTx, setViewingLinesTx] = useState<TransactionRow | null>(null)
  const formRef = useRef<HTMLDivElement>(null)
  const { transactionsViewMode, setTransactionsViewMode } = useSettings()

  // En móvil, al editar hay que llevar al usuario hasta el formulario de arriba.
  useEffect(() => {
    if (editingTx) {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [editingTx])

  // Al tocar la notificación "Movimiento pendiente" se llega con
  // ?status=pending&tx=<id>: se filtran los pendientes y se resalta ese.
  const [searchParams, setSearchParams] = useSearchParams()
  const urlStatus = searchParams.get('status')
  const focusTxId = searchParams.get('tx')
  const [highlightId, setHighlightId] = useState<string | null>(null)
  const [focusMissing, setFocusMissing] = useState(false)

  const [filters, setFilters] = useState<FilterState>({
    ...EMPTY_FILTERS,
    status: urlStatus === 'pending' ? 'pending' : '',
    startDate: monthStartISO(),
    endDate: todayISO(),
  })

  // La app ya estaba en esta página cuando se tocó la notificación.
  useEffect(() => {
    if (urlStatus === 'pending') setFilters((f) => ({ ...f, status: 'pending' }))
  }, [urlStatus, focusTxId])

  // El texto se debounce; el resto de los filtros se aplican de inmediato.
  const debouncedSearch = useDebouncedValue(filters.search, 300)

  // Memoizado: el objeto va dentro del queryKey de useTransactions, y una
  // identidad nueva en cada render refetchearía la lista sin motivo.
  const txFilter = useMemo<TransactionFilter>(() => {
    const parseAmount = (v: string) => {
      const n = Number(v)
      return v.trim() !== '' && Number.isFinite(n) ? n : undefined
    }
    return {
      kind: filters.kind || undefined,
      accountIds: filters.accountIds,
      cardIds: filters.cardIds,
      categoryIds: filters.categoryIds,
      currency: filters.currency || undefined,
      startDate: filters.startDate || undefined,
      endDate: filters.endDate || undefined,
      search: debouncedSearch.trim() || undefined,
      pending:
        filters.status === '' ? undefined : filters.status === 'pending',
      minAmount: parseAmount(filters.minAmount),
      maxAmount: parseAmount(filters.maxAmount),
    }
  }, [
    filters.kind,
    filters.accountIds,
    filters.cardIds,
    filters.categoryIds,
    filters.currency,
    filters.startDate,
    filters.endDate,
    filters.status,
    filters.minAmount,
    filters.maxAmount,
    debouncedSearch,
  ])

  const transactionsQuery = useTransactions(userId, txFilter)
  const totalCountQuery = useTransactionsCount(userId)
  const accountsQuery = useAccounts(userId)
  const cardsQuery = useCards(userId)
  const creditLinesQuery = useCreditLines(userId)
  const categoriesQuery = useCategories(userId)
  const deletionsQuery = useTransactionDeletions(userId)
  const plansQuery = useInstallmentPlans(userId)
  const deleteTx = useDeleteTransaction()
  const confirmTx = useConfirmTransaction()
  const dismissDuplicate = useDismissPossibleDuplicate()
  const { transactionLimit, canUseTransactionsPeriodFilter } = useEntitlements()

  // Tarjetas compartidas de mi familia (para registrar gastos familiares).
  const familiesQuery = useMyFamilies(userId)
  const familyId = familiesQuery.data?.[0]?.id
  const familyCardsQuery = useFamilyCards(familyId)

  const transactions = transactionsQuery.data || []

  // Lleva la vista al movimiento de la notificación y lo resalta unos segundos.
  // Se espera a que la lista ya venga con el filtro de pendientes aplicado.
  useEffect(() => {
    if (!focusTxId || transactionsQuery.isFetching || txFilter.pending !== true) return
    const found = transactions.some((tx) => tx.id === focusTxId)
    setFocusMissing(!found)
    const clearParam = () =>
      setSearchParams(
        (p) => {
          p.delete('tx')
          return p
        },
        { replace: true },
      )
    if (!found) {
      clearParam()
      return
    }
    setHighlightId(focusTxId)
    requestAnimationFrame(() =>
      document
        .getElementById(`tx-${focusTxId}`)
        ?.scrollIntoView({ behavior: 'smooth', block: 'center' }),
    )
    clearParam()
  }, [focusTxId, transactionsQuery.isFetching, txFilter.pending, transactions, setSearchParams])

  useEffect(() => {
    if (!highlightId) return
    const timer = window.setTimeout(() => setHighlightId(null), 4000)
    return () => window.clearTimeout(timer)
  }, [highlightId])

  const highlightClass = (id: string) =>
    highlightId === id ? 'ring-2 ring-amber-400 ring-offset-2 dark:ring-offset-slate-900' : ''

  // Avisos (SMS/correo/notificación) de las transacciones visibles que
  // vinieron de un canal automático, para "Recibido por ...".
  const signalsQuery = useSignalsByTransaction(
    userId,
    transactions
      .filter((tx) => tx.source === 'sms' || tx.source === 'email' || tx.source === 'notification')
      .map((tx) => tx.id),
  )
  const signalsByTx = signalsQuery.data
  // Contra el límite del plan se mide el histórico completo, no lo filtrado.
  const totalCount = totalCountQuery.data ?? 0
  const accounts = accountsQuery.data || []
  const cards = cardsQuery.data || []
  const creditLines = creditLinesQuery.data || []
  const categories = categoriesQuery.data || []
  const deletions = deletionsQuery.data || []
  const familyCards = familyCardsQuery.data || []
  const plans = plansQuery.data || []

  // Reembolsos vinculados entre las transacciones ya cargadas (best-effort:
  // solo cubre el rango de fechas filtrado actualmente, sin query aparte).
  const refundedTotalsByOriginal = useMemo(() => {
    const map = new Map<string, number>()
    for (const t of transactions) {
      if (t.kind === 'refund' && t.refund_of_transaction_id) {
        map.set(
          t.refund_of_transaction_id,
          (map.get(t.refund_of_transaction_id) || 0) + t.amount,
        )
      }
    }
    return map
  }, [transactions])

  // Subpartidas de las transacciones visibles, agrupadas por transaction_id
  // (una sola query para todo el listado, no una por fila).
  const txIds = useMemo(() => transactions.map((t) => t.id), [transactions])
  const linesByTxQuery = useTransactionLines(txIds)
  const linesByTx = linesByTxQuery.data ?? new Map()

  // Monedas ofrecidas en el filtro: el catálogo + las que ya usan las cuentas
  // y tarjetas del usuario + la principal (por si es exótica). Sin query extra.
  const currencyOptions = useMemo(() => {
    const set = new Set<string>([mainCurrency, ...CURRENCIES])
    for (const a of accounts) if (a.currency) set.add(a.currency)
    for (const c of cards) if (c.currency) set.add(c.currency)
    return Array.from(set)
  }, [accounts, cards, mainCurrency])

  const getAccountName = (id?: string) =>
    accounts.find((a) => a.id === id)?.name || '—'
  const getCardName = (id?: string) => cards.find((c) => c.id === id)?.name || '—'
  const getLineName = (id?: string) =>
    creditLines.find((l) => l.id === id)?.name || '—'
  const getCategoryName = (id?: string) =>
    categories.find((c) => c.id === id)?.name || '—'

  function openDelete(tx: TransactionRow) {
    setDeleting(tx)
    setReason('')
    setError(null)
  }

  // "Es duplicado": el mismo flujo de borrar con motivo, ya prellenado.
  function deleteAsDuplicate(tx: TransactionRow) {
    openDelete(tx)
    setReason(t('Duplicado de otro aviso (SMS/correo/notificación)'))
  }

  function duplicateNotice(tx: TransactionRow, compact: boolean) {
    return (
      <PossibleDuplicateNotice
        tx={tx}
        original={transactions.find((o) => o.id === tx.possible_duplicate_of)}
        onIsDuplicate={() => deleteAsDuplicate(tx)}
        onDistinct={() => dismissDuplicate.mutate({ id: tx.id, userId: userId! })}
        busy={dismissDuplicate.isPending}
        compact={compact}
      />
    )
  }

  async function confirmDelete() {
    if (!userId || !deleting) return
    if (!reason.trim()) {
      setError(t('Escribe el motivo de la eliminación.'))
      return
    }
    try {
      await deleteTx.mutateAsync({ id: deleting.id, userId, reason: reason.trim() })
      setDeleting(null)
      setReason('')
    } catch (e) {
      setError((e as Error).message)
    }
  }

  const kindLabel = (kind: string) =>
    kind === 'income'
      ? t('📥 Ingreso')
      : kind === 'expense'
        ? t('📤 Egreso')
        : kind === 'card_payment'
          ? t('💳 Pago de tarjeta')
          : kind === 'refund'
            ? t('↩️ Reembolso')
            : t('🔄 Transferencia')

  // Origen/destino que se muestra bajo el concepto, según el tipo.
  const flowLabel = (tx: TransactionRow) => {
    if (tx.kind === 'transfer') {
      return tx.is_external
        ? `${getAccountName(tx.account_id || undefined)} → ${t('cuenta externa')}`
        : `${getAccountName(tx.account_id || undefined)} → ${getAccountName(tx.to_account_id || undefined)}`
    }
    if (tx.kind === 'card_payment') {
      return `${getAccountName(tx.account_id || undefined)} → ${getLineName(tx.to_credit_line_id || undefined)}`
    }
    return tx.card_id
      ? getCardName(tx.card_id)
      : getAccountName(tx.account_id || undefined)
  }

  return (
    <>
      <PageHeader
        title={t('Transacciones')}
        subtitle={t('Ingresos, egresos y transferencias entre tus cuentas.')}
        helpId="transacciones"
        actions={
          <div className="flex flex-wrap gap-2">
            <Button
              variant="secondary"
              onClick={() => setShowHistory((v) => !v)}
            >
              {showHistory
                ? t('Ocultar historial')
                : t('Historial ({{count}})', { count: deletions.length })}
            </Button>
            {showForm ? (
              <Button onClick={() => setShowForm(false)}>{t('Cancelar')}</Button>
            ) : (
              <PremiumGate
                count={totalCount}
                limit={transactionLimit}
                lockedTooltip={t('Plan gratis: máximo {{n}} transacciones. Actualiza a Premium para registrar más.', { n: transactionLimit })}
              >
                <Button
                  data-tour="transacciones"
                  onClick={() => {
                    setEditingTx(null)
                    setShowForm(true)
                  }}
                >
                  {t('+ Nueva transacción')}
                </Button>
              </PremiumGate>
            )}
          </div>
        }
      />

      {!showForm && transactionLimit !== Infinity && totalCount >= transactionLimit && (
        <Card className="mb-4 border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20">
          <p className="text-sm text-amber-800 dark:text-amber-200">
            {t('Plan gratis: máximo {{n}} transacciones. Actualiza a Premium para registrar más.', { n: transactionLimit })}
          </p>
        </Card>
      )}

      {showForm && !editingTx && (
        <TransactionForm
          accounts={accounts}
          cards={cards}
          categories={categories}
          familyCards={familyCards}
          onSuccess={() => setShowForm(false)}
        />
      )}

      {editingTx && (
        <div ref={formRef} className="scroll-mt-4">
          {/* key = id: fuerza remontar al pasar de una transacción a otra, para
              no arrastrar los defaultValues de la anterior. */}
          <TransactionForm
            key={editingTx.id}
            accounts={accounts}
            cards={cards}
            categories={categories}
            familyCards={familyCards}
            transaction={editingTx}
            onSuccess={() => setEditingTx(null)}
            onCancel={() => setEditingTx(null)}
          />
        </div>
      )}

      {/* Historial de eliminaciones */}
      {showHistory && (
        <Card className="mb-4 border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900">
          <h3 className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-200">
            {t('Historial de transacciones eliminadas')}
          </h3>
          {deletions.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">{t('Aún no has eliminado ninguna.')}</p>
          ) : (
            <div className="grid gap-2">
              {deletions.map((d) => (
                <div
                  key={d.id}
                  className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-sm"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-medium text-slate-800 dark:text-slate-100">
                      {d.concept || t('Sin concepto')}{' '}
                      <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
                        {d.kind ? kindLabel(d.kind) : ''}
                      </span>
                    </span>
                    <span className="whitespace-nowrap font-semibold text-slate-700 dark:text-slate-200">
                      {d.amount != null
                        ? formatMoney(d.amount, d.currency || 'MXN')
                        : ''}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {d.tx_date ? formatDate(d.tx_date) : ''} •{' '}
                    {t('eliminada')} {formatDate(d.deleted_at)}
                  </p>
                  <p className="mt-1 text-xs text-slate-700 dark:text-slate-200">
                    <span className="font-medium">{t('Motivo:')}</span> {d.reason}
                  </p>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      <TransactionFilters
        value={filters}
        onChange={setFilters}
        accounts={accounts}
        cards={cards}
        categories={categories}
        currencyOptions={currencyOptions}
        resultCount={transactions.length}
        canUsePeriodFilter={canUseTransactionsPeriodFilter}
      />

      {focusMissing && (
        <Card className="mb-3 border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20">
          <div className="flex items-start justify-between gap-3">
            <p className="text-sm text-amber-800 dark:text-amber-200">
              {t('Ese movimiento ya no está pendiente o es de otro periodo. Aquí tienes los pendientes que quedan.')}
            </p>
            <button
              type="button"
              onClick={() => setFocusMissing(false)}
              className="shrink-0 text-xs font-medium text-amber-700 hover:underline dark:text-amber-300"
            >
              {t('Entendido')}
            </button>
          </div>
        </Card>
      )}

      {transactions.length > 0 && (
        <div className="mb-3 flex justify-end gap-1">
          <button
            type="button"
            onClick={() => setTransactionsViewMode('cards')}
            title={t('Vista de tarjetas')}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              transactionsViewMode === 'cards'
                ? 'bg-brand-600 text-white'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
            }`}
          >
            🗂️ {t('Tarjetas')}
          </button>
          <button
            type="button"
            onClick={() => setTransactionsViewMode('table')}
            title={t('Vista de tabla')}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              transactionsViewMode === 'table'
                ? 'bg-brand-600 text-white'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
            }`}
          >
            📋 {t('Tabla')}
          </button>
        </div>
      )}

      {transactions.length === 0 ? (
        <Card className="animate-empty-state-in border-dashed text-center">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {/* "No hay nada" y "no hay nada que cumpla el filtro" son
                situaciones distintas: la segunda tiene salida. */}
            {countActiveFilters(filters) > 0
              ? t('Ninguna transacción coincide con los filtros.')
              : t('Sin transacciones. Registra una para empezar.')}
          </p>
        </Card>
      ) : transactionsViewMode === 'table' ? (
        <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900 text-xs text-slate-500 dark:text-slate-400">
              <tr>
                <th className="px-3 py-2">{t('Fecha')}</th>
                <th className="px-3 py-2">{t('Concepto')}</th>
                <th className="px-3 py-2">{t('Categoría')}</th>
                <th className="px-3 py-2">{t('Cuenta / tarjeta')}</th>
                <th className="px-3 py-2">{t('Tipo')}</th>
                <th className="px-3 py-2 text-right">{t('Monto')}</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => {
                const lines = linesByTx.get(tx.id)
                const hasLines = !!lines?.length
                return (
                  <tr
                    key={tx.id}
                    id={`tx-${tx.id}`}
                    onClick={() => hasLines && setViewingLinesTx(tx)}
                    className={`border-t border-slate-100 dark:border-slate-700 ${
                      hasLines ? 'cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800' : ''
                    } ${tx.pending && highlightId !== tx.id ? 'opacity-70' : ''} ${
                      highlightId === tx.id ? 'bg-amber-50 dark:bg-amber-900/20' : ''
                    }`}
                  >
                    <td className="whitespace-nowrap px-3 py-2 text-slate-500 dark:text-slate-400">
                      {formatDate(tx.tx_date)}
                    </td>
                    <td className="px-3 py-2">
                      <span className="font-medium text-slate-800 dark:text-slate-100">
                        {tx.concept || t('Sin concepto')}
                      </span>
                      {hasLines && (
                        <span className="ml-1.5 rounded bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 text-[10px] font-medium text-slate-500 dark:text-slate-300">
                          🧾 {t('{{n}} líneas', { n: lines!.length })}
                        </span>
                      )}
                      {tx.pending && (
                        <span className="ml-1.5 rounded bg-amber-100 dark:bg-amber-900/40 px-1.5 py-0.5 text-[10px] font-medium text-amber-700 dark:text-amber-300">
                          {t('Pendiente')}
                        </span>
                      )}
                      <span onClick={(e) => e.stopPropagation()}>{duplicateNotice(tx, true)}</span>
                    </td>
                    <td className="px-3 py-2 text-slate-500 dark:text-slate-400">
                      {getCategoryName(tx.category_id || undefined)}
                    </td>
                    <td className="px-3 py-2 text-slate-500 dark:text-slate-400">{flowLabel(tx)}</td>
                    <td className="whitespace-nowrap px-3 py-2 text-slate-500 dark:text-slate-400">
                      {kindLabel(tx.kind)}
                    </td>
                    <td
                      className={`whitespace-nowrap px-3 py-2 text-right font-semibold ${
                        tx.kind === 'income' || tx.kind === 'refund'
                          ? 'text-green-600'
                          : 'text-slate-800 dark:text-slate-100'
                      }`}
                    >
                      {tx.kind === 'income' || tx.kind === 'refund'
                        ? '+'
                        : tx.kind === 'transfer' && !tx.is_external
                          ? ''
                          : '-'}
                      <Money amount={tx.amount} currency={tx.currency} />
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 text-right">
                      <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                        {tx.pending && (
                          <button
                            onClick={() => confirmTx.mutate({ id: tx.id, userId: userId! })}
                            disabled={confirmTx.isPending}
                            className="text-xs font-medium text-green-600 transition-colors hover:text-green-700 disabled:opacity-50"
                          >
                            ✓
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setShowForm(false)
                            setEditingTx(tx)
                          }}
                          className="text-xs font-medium text-brand-600 transition-colors hover:text-brand-800 dark:text-brand-400"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => openDelete(tx)}
                          className="text-xs font-medium text-red-500 transition-colors hover:text-red-700"
                        >
                          🗑
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid gap-3">
          {transactions.map((tx) => (
            <Card
              key={tx.id}
              id={`tx-${tx.id}`}
              className={`flex flex-col gap-3 transition-shadow sm:flex-row sm:items-start sm:justify-between ${highlightClass(tx.id)}`}
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="min-w-0 break-words text-lg font-semibold text-slate-800 dark:text-slate-100">
                    {tx.concept || t('Sin concepto')}
                  </span>
                  <span className="rounded bg-slate-100 dark:bg-slate-700 px-2 py-0.5 text-xs font-medium text-slate-600 dark:text-slate-300">
                    {kindLabel(tx.kind)}
                  </span>
                  {tx.pending && (
                    <span className="rounded bg-amber-100 dark:bg-amber-900/40 px-2 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-300">
                      {t('Pendiente')}
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {(tx.kind === 'income' || tx.kind === 'expense' || tx.kind === 'refund') &&
                    `${getCategoryName(tx.category_id || undefined)} • `}
                  {tx.kind === 'transfer' && tx.category_id &&
                    `${getCategoryName(tx.category_id)} • `}
                  {flowLabel(tx)} • {formatDate(tx.tx_date)}
                </p>
                {tx.notes && (
                  <p className="mt-1 text-xs italic text-slate-400 dark:text-slate-500">{tx.notes}</p>
                )}
                {duplicateNotice(tx, false)}
                <ReceivedVia signals={signalsByTx?.get(tx.id)} />
                {tx.kind === 'expense' && (refundedTotalsByOriginal.get(tx.id) ?? 0) > 0 && (
                  <p className="mt-1 text-xs font-medium text-brand-600 dark:text-brand-400">
                    ↩️ {t('Reembolsado')}{' '}
                    {formatMoney(refundedTotalsByOriginal.get(tx.id)!, tx.currency)}
                  </p>
                )}
                {(linesByTx.get(tx.id)?.length ?? 0) > 0 && (
                  <button
                    onClick={() => setViewingLinesTx(tx)}
                    className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400 underline transition-colors hover:text-brand-600"
                  >
                    🧾 {t('Ver detalle ({{n}} líneas)', { n: linesByTx.get(tx.id)!.length })}
                  </button>
                )}
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2 sm:flex-col sm:flex-nowrap sm:items-end">
                <p
                  className={`text-lg font-semibold ${
                    tx.kind === 'income' || tx.kind === 'refund'
                      ? 'text-green-600'
                      : 'text-slate-800 dark:text-slate-100'
                  }`}
                >
                  {tx.kind === 'income' || tx.kind === 'refund'
                    ? '+'
                    : tx.kind === 'transfer' && !tx.is_external
                      ? ''
                      : '-'}
                  <Money amount={tx.amount} currency={tx.currency} />
                </p>
                {tx.currency !== mainCurrency && (
                  <span className="text-xs text-slate-400 dark:text-slate-500">
                    ≈{' '}
                    <Money
                      amount={tx.base_amount ?? tx.amount}
                      currency={mainCurrency}
                    />
                  </span>
                )}
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  {tx.pending && (
                    <button
                      onClick={() => confirmTx.mutate({ id: tx.id, userId: userId! })}
                      disabled={confirmTx.isPending}
                      className="text-xs font-medium text-green-600 transition-colors hover:text-green-700 disabled:opacity-50"
                    >
                      ✓ {t('Confirmar')}
                    </button>
                  )}
                  {tx.kind === 'expense' && (
                    <button
                      onClick={() => setRefunding(tx)}
                      className="text-xs font-medium text-brand-600 transition-colors hover:text-brand-800 dark:text-brand-400"
                    >
                      ↩️ {t('Reembolsar')}
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setShowForm(false)
                      setEditingTx(tx)
                    }}
                    className="text-xs font-medium text-brand-600 transition-colors hover:text-brand-800 dark:text-brand-400"
                  >
                    ✏️ {t('Editar')}
                  </button>
                  <button
                    onClick={() => openDelete(tx)}
                    className="text-xs font-medium text-red-500 transition-colors hover:text-red-700"
                  >
                    🗑 {t('Eliminar')}
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal de motivo de eliminación */}
      <Modal
        open={!!deleting}
        title={t('Eliminar transacción')}
        onClose={() => setDeleting(null)}
      >
        {deleting && (
          <div className="grid gap-3">
            <p className="text-sm text-slate-600 dark:text-slate-300">
              {t('Vas a eliminar')}{' '}
              <strong>{deleting.concept || t('Sin concepto')}</strong>{' '}
              {t('por')}{' '}
              <strong>{formatMoney(deleting.amount, deleting.currency)}</strong>.{' '}
              {t('El balance de tus cuentas se ajustará automáticamente.')}
            </p>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
                {t('Motivo de la eliminación')} <span className="text-red-500">*</span>
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                placeholder={t('Ej. Registrada por error, duplicada, monto incorrecto…')}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-600 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
              {error && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>}
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setDeleting(null)}>
                {t('Cancelar')}
              </Button>
              <Button
                variant="danger"
                onClick={confirmDelete}
                disabled={deleteTx.isPending}
              >
                {deleteTx.isPending ? t('Eliminando…') : t('Eliminar')}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <RefundDialog
        transaction={refunding}
        userId={userId}
        plans={plans}
        onClose={() => setRefunding(null)}
      />

      {/* Detalle de subpartidas: modal superpuesto, no un expandir hacia abajo
          — al cerrarlo, la tabla/tarjetas quedan igual que antes. */}
      <Modal
        open={!!viewingLinesTx}
        title={viewingLinesTx?.concept || t('Detalle')}
        onClose={() => setViewingLinesTx(null)}
      >
        {viewingLinesTx && (
          <div className="grid gap-2">
            {(linesByTx.get(viewingLinesTx.id) ?? []).map((line: any) => (
              <div
                key={line.id}
                className="flex items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-700 pb-2 text-sm last:border-0 last:pb-0"
              >
                <div>
                  <p className="font-medium text-slate-800 dark:text-slate-100">{line.concept}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {getCategoryName(line.category_id || undefined)}
                  </p>
                </div>
                <span className="whitespace-nowrap font-semibold text-slate-700 dark:text-slate-200">
                  <Money amount={line.amount} currency={viewingLinesTx.currency} />
                </span>
              </div>
            ))}
            <div className="mt-1 flex items-center justify-between border-t border-slate-200 dark:border-slate-600 pt-2 text-sm font-semibold text-slate-800 dark:text-slate-100">
              <span>{t('Total')}</span>
              <Money amount={viewingLinesTx.amount} currency={viewingLinesTx.currency} />
            </div>
          </div>
        )}
      </Modal>
    </>
  )
}
