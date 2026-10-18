import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  useCreateInstallmentPlan,
  useConfirmInstallmentPayments,
} from '@/hooks/useTransactions'
import {
  elapsedInstallments,
  installmentSchedule,
  isRetroactive,
  monthlyPayment,
} from '@/lib/installments'
import { formatMonthLabel } from '@/lib/dates'
import { formatMoney } from '@/lib/format'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { InterestFields, interestOf, type InterestValue } from './InterestFields'
import type { TransactionRow } from '@/types/db'

interface DeferDialogProps {
  transaction: TransactionRow | null
  userId?: string
  onClose: () => void
}

const NO_INTEREST: InterestValue = { interestFree: false, rateMode: 'monthly', rate: 0 }

// Diferir una compra con tarjeta de crédito YA registrada: el banco la pasó a
// meses (con o sin intereses) después de hacerla. Crea el plan ligado a la
// transacción original; computeLineStatement deja de sumar la compra completa
// y suma solo la mensualidad de cada ciclo.
export function DeferDialog({ transaction, userId, onClose }: DeferDialogProps) {
  const { t } = useTranslation()
  const createPlan = useCreateInstallmentPlan()
  const confirmPayments = useConfirmInstallmentPayments()

  const [months, setMonths] = useState('')
  const [interest, setInterest] = useState<InterestValue>(NO_INTEREST)
  const [startDate, setStartDate] = useState('')
  const [paidCount, setPaidCount] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (transaction) {
      setMonths('')
      setInterest(NO_INTEREST)
      setStartDate(transaction.tx_date)
      setPaidCount('')
      setError(null)
    }
  }, [transaction?.id])

  const total = transaction?.amount ?? 0
  const n = Number(months) || 0
  const interestAmount = interestOf(interest, total, n)
  const monthly = monthlyPayment(total, interestAmount, n)
  const retro = n > 0 && !!startDate && isRetroactive(startDate)
  const elapsed = retro ? elapsedInstallments(startDate, n) : 0
  const paid = Math.min(Number(paidCount) || 0, n)

  async function handleSubmit() {
    if (!userId || !transaction?.card_id) return
    if (!Number.isInteger(n) || n < 2) {
      setError(t('Escribe en cuántos meses (2 o más).'))
      return
    }
    if (!interest.interestFree && !(interest.rate > 0)) {
      setError(t('Escribe la tasa de interés o marca "Sin intereses".'))
      return
    }
    try {
      const plan = await createPlan.mutateAsync({
        userId,
        cardId: transaction.card_id,
        transactionId: transaction.id,
        description: transaction.concept || t('Compra'),
        totalAmount: total,
        currency: transaction.currency,
        months: n,
        isInterestFree: interest.interestFree,
        interestAmount,
        interestRate: interest.rate,
        interestRateMode: interest.rateMode,
        startDate,
      })
      if (paid > 0) {
        await confirmPayments.mutateAsync({
          userId,
          rows: installmentSchedule(startDate, n, monthly).slice(0, paid).map((s) => ({
            planId: plan.id,
            periodMonth: s.periodMonth,
            amount: s.amount,
          })),
        })
      }
      onClose()
    } catch (e) {
      setError((e as Error).message)
    }
  }

  const submitting = createPlan.isPending || confirmPayments.isPending

  return (
    <Modal open={!!transaction} title={t('Diferir compra a meses')} onClose={onClose}>
      {transaction && (
        <div className="grid gap-3">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            <strong>{transaction.concept || t('Sin concepto')}</strong>{' '}
            {t('por')} <strong>{formatMoney(total, transaction.currency)}</strong>
          </p>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label={t('Meses')}
              type="number"
              inputMode="numeric"
              min="2"
              max="48"
              value={months}
              onChange={(e) => setMonths(e.target.value)}
            />
            <Input
              label={t('Mes en que empezó el plan')}
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <InterestFields
            value={interest}
            onChange={setInterest}
            total={total}
            months={n}
            currency={transaction.currency}
          />
          {retro && (
            <Input
              label={t('¿Cuántas mensualidades ya pagaste? (empezó en {{month}}, van {{n}})', {
                month: formatMonthLabel(startDate),
                n: elapsed,
              })}
              type="number"
              inputMode="numeric"
              min="0"
              max={n}
              value={paidCount}
              onChange={(e) => setPaidCount(e.target.value)}
            />
          )}
          {error && <p className="text-xs text-line-scarlet">{error}</p>}
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={onClose}>
              {t('Cancelar')}
            </Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? t('Guardando…') : t('Diferir')}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  )
}
