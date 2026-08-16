import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  useCreateTransaction,
  useTransactionRefunds,
  useCancelInstallmentPlan,
} from '@/hooks/useTransactions'
import { remainingRefundable, checkAndCancelMsiPlan } from '@/lib/refunds'
import { todayISO } from '@/lib/dates'
import { formatMoney } from '@/lib/format'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Money } from '@/components/ui/Money'
import type { InstallmentPlanRow, TransactionRow } from '@/types/db'

interface RefundDialogProps {
  transaction: TransactionRow | null
  userId?: string
  plans: InstallmentPlanRow[]
  onClose: () => void
}

// Reembolso/cancelación de una compra: crea una transacción 'refund'
// vinculada a la original (refund_of_transaction_id), copiando su
// cuenta/tarjeta/categoría/moneda. Soporta reembolsos parciales acumulados
// y, si la compra tiene un plan MSI y el reembolso acumulado alcanza el
// total, cancela las mensualidades restantes.
export function RefundDialog({ transaction, userId, plans, onClose }: RefundDialogProps) {
  const { t } = useTranslation()
  const refundsQuery = useTransactionRefunds(transaction?.id)
  const createTransaction = useCreateTransaction()
  const cancelPlan = useCancelInstallmentPlan()
  const refunds = refundsQuery.data || []

  const [amount, setAmount] = useState('')
  const [txDate, setTxDate] = useState(todayISO())
  const [notes, setNotes] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [cancelledPlan, setCancelledPlan] = useState(false)

  const remaining = transaction ? remainingRefundable(transaction, refunds) : 0
  const alreadyRefunded = transaction ? transaction.amount - remaining : 0

  // Recalcula el prellenado cada vez que se abre el diálogo para una
  // transacción distinta (o cambian sus reembolsos ya cargados).
  useEffect(() => {
    if (transaction) {
      setAmount(remaining > 0 ? String(remaining) : '')
      setTxDate(todayISO())
      setNotes('')
      setError(null)
      setCancelledPlan(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transaction?.id, refundsQuery.dataUpdatedAt])

  async function handleSubmit() {
    if (!userId || !transaction) return
    const value = Number(amount)
    if (!Number.isFinite(value) || value <= 0) {
      setError(t('Escribe un monto válido.'))
      return
    }

    try {
      await createTransaction.mutateAsync({
        userId,
        kind: 'refund',
        amount: value,
        currency: transaction.currency,
        concept: transaction.concept
          ? t('Reembolso: {{concept}}', { concept: transaction.concept })
          : t('Reembolso'),
        categoryId: transaction.category_id || undefined,
        accountId: transaction.account_id || undefined,
        cardId: transaction.card_id || undefined,
        refundOfTransactionId: transaction.id,
        txDate,
        notes: notes || undefined,
      })

      const cancelled = await checkAndCancelMsiPlan(
        userId,
        transaction.id,
        plans,
        [...refunds, { ...transaction, amount: value } as TransactionRow],
        cancelPlan,
      )
      if (cancelled) {
        setCancelledPlan(true)
        return
      }
      onClose()
    } catch (e) {
      setError((e as Error).message)
    }
  }

  const submitting = createTransaction.isPending || cancelPlan.isPending

  return (
    <Modal open={!!transaction} title={t('Reembolsar compra')} onClose={onClose}>
      {transaction && (
        <div className="grid gap-3">
          {cancelledPlan ? (
            <div className="space-y-3">
              <p className="rounded-lg bg-emerald-50 dark:bg-emerald-900/20 p-3 text-sm text-emerald-800 dark:text-emerald-200">
                ✅ {t('Reembolso registrado. Este plan de MSI se canceló: ya no se te cobrarán las mensualidades restantes.')}
              </p>
              <div className="flex justify-end">
                <Button onClick={onClose}>{t('Cerrar')}</Button>
              </div>
            </div>
          ) : (
            <>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                <strong>{transaction.concept || t('Sin concepto')}</strong>{' '}
                {t('por')} <strong>{formatMoney(transaction.amount, transaction.currency)}</strong>
              </p>
              {alreadyRefunded > 0 && (
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {t('Ya reembolsado')}{' '}
                  <Money amount={alreadyRefunded} currency={transaction.currency} />{' '}
                  {t('de')} <Money amount={transaction.amount} currency={transaction.currency} />
                </p>
              )}
              {remaining <= 0 ? (
                <p className="rounded-lg bg-amber-50 dark:bg-amber-900/20 p-2 text-xs text-amber-700 dark:text-amber-300">
                  {t('Esta compra ya se reembolsó por completo.')}
                </p>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label={t('Monto a reembolsar')}
                      type="number"
                      step="0.01"
                      max={remaining}
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                    />
                    <Input
                      label={t('Fecha')}
                      type="date"
                      value={txDate}
                      onChange={(e) => setTxDate(e.target.value)}
                    />
                  </div>
                  <Input
                    label={t('Notas (opcional)')}
                    placeholder={t('Ej: Cancelación del pedido, artículo devuelto…')}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                  {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" onClick={onClose}>
                      {t('Cancelar')}
                    </Button>
                    <Button onClick={handleSubmit} disabled={submitting}>
                      {submitting ? t('Guardando…') : t('Reembolsar')}
                    </Button>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      )}
    </Modal>
  )
}
