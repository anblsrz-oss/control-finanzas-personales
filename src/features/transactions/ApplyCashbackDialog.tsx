import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useApplyCashbackToCard } from '@/hooks/useTransactions'
import { todayISO } from '@/lib/dates'
import { formatMoney } from '@/lib/format'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import type { CreditLineRow, TransactionRow } from '@/types/db'

interface ApplyCashbackDialogProps {
  transaction: TransactionRow | null
  userId?: string
  creditLines: CreditLineRow[]
  onClose: () => void
}

// Un cashback pendiente es un ingreso sin cuenta. Aquí el usuario decide
// cuánto de él abona a la tarjeta de crédito (sin cuenta de origen); lo que
// sobre queda como ingreso pendiente para asignarle una cuenta.
export function ApplyCashbackDialog({
  transaction,
  userId,
  creditLines,
  onClose,
}: ApplyCashbackDialogProps) {
  const { t } = useTranslation()
  const apply = useApplyCashbackToCard()
  const [amount, setAmount] = useState('')
  const [lineId, setLineId] = useState('')
  const [txDate, setTxDate] = useState(todayISO())
  const [error, setError] = useState<string | null>(null)

  const lines = transaction
    ? creditLines.filter((l) => l.currency === transaction.currency)
    : []

  useEffect(() => {
    if (!transaction) return
    setAmount(String(transaction.amount))
    setTxDate(todayISO())
    setError(null)
    // Si el aviso trae "DiDi" y hay una línea con ese nombre, se preselecciona.
    const text = `${transaction.concept ?? ''}`.toLowerCase()
    const guess = lines.find((l) =>
      [l.name, l.bank_name ?? ''].some((k) => k.length >= 3 && text.includes(k.toLowerCase())),
    )
    setLineId(guess?.id ?? (lines.length === 1 ? lines[0].id : ''))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transaction?.id])

  async function handleSubmit() {
    if (!userId || !transaction) return
    const value = Number(amount)
    if (!Number.isFinite(value) || value <= 0 || value > transaction.amount + 0.005) {
      setError(
        t('Escribe un monto entre 0 y {{max}}.', {
          max: formatMoney(transaction.amount, transaction.currency),
        }),
      )
      return
    }
    if (!lineId) {
      setError(t('Selecciona la línea de crédito a pagar'))
      return
    }
    try {
      await apply.mutateAsync({
        userId,
        transaction,
        amount: value,
        creditLineId: lineId,
        txDate,
      })
      onClose()
    } catch (e) {
      setError((e as Error).message)
    }
  }

  const value = Number(amount)
  const rest =
    transaction && Number.isFinite(value) && value > 0
      ? Math.max(0, Math.round((transaction.amount - value) * 100) / 100)
      : 0

  return (
    <Modal open={!!transaction} title={t('Pagar la tarjeta con este cashback')} onClose={onClose}>
      {transaction && (
        <div className="grid gap-3">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            <strong>{transaction.concept || t('Sin concepto')}</strong>{' '}
            {t('por')} <strong>{formatMoney(transaction.amount, transaction.currency)}</strong>
          </p>
          {lines.length === 0 ? (
            <p className="rounded-lg bg-line-amber/10 p-2 text-xs text-line-amber">
              {t('No tienes una línea de crédito en {{currency}}.', {
                currency: transaction.currency,
              })}
            </p>
          ) : (
            <>
              <Select
                label={t('Línea de crédito a pagar')}
                value={lineId}
                onChange={(e) => setLineId(e.target.value)}
                options={[
                  { value: '', label: t('Selecciona…') },
                  ...lines.map((l) => ({
                    value: l.id,
                    label: l.bank_name ? `${l.name} (${l.bank_name})` : l.name,
                  })),
                ]}
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label={t('Monto a abonar')}
                  type="number"
                  step="0.01"
                  max={transaction.amount}
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
              {rest > 0 && (
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {t('Los {{rest}} restantes quedan como ingreso pendiente para que les asignes cuenta.', {
                    rest: formatMoney(rest, transaction.currency),
                  })}
                </p>
              )}
              {error && <p className="text-xs text-line-scarlet">{error}</p>}
              <div className="flex justify-end gap-2">
                <Button variant="ghost" onClick={onClose}>
                  {t('Cancelar')}
                </Button>
                <Button onClick={handleSubmit} disabled={apply.isPending}>
                  {apply.isPending ? t('Guardando…') : t('Abonar a la tarjeta')}
                </Button>
              </div>
            </>
          )}
        </div>
      )}
    </Modal>
  )
}
