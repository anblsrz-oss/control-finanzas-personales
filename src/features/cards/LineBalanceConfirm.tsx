import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/store/useAuth'
import { useConfirmLineBalance } from '@/hooks/useCreditLinePeriods'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Money } from '@/components/ui/Money'
import { currentPeriod } from '@/lib/creditDates'
import type { CreditLineRow, CreditLinePeriodRow } from '@/types/db'
import type { LineStatement } from '@/hooks/useCreditLines'

interface LineBalanceConfirmProps {
  line: CreditLineRow
  periods: CreditLinePeriodRow[]
  statement: LineStatement
}

/**
 * Deja confirmar el "a pagar" real de este periodo contra el estado de
 * cuenta. Un pago que no se capturó (SMS/correo que falló) desvía el cálculo
 * para siempre si no hay dónde anclarlo — confirmar aquí es ese ancla: el
 * siguiente periodo parte de este número en vez de arrastrar el error.
 */
export function LineBalanceConfirm({ line, periods, statement }: LineBalanceConfirmProps) {
  const { t } = useTranslation()
  const { session } = useAuth()
  const confirmBalance = useConfirmLineBalance()
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState('')

  const period = currentPeriod(line)
  if (!period) return null

  const existing = periods.find(
    (p) => p.credit_line_id === line.id && p.period_month === period.periodMonth,
  )
  const confirmedBalance = existing?.confirmed_balance ?? null
  const pending = Math.max(0, statement.amount - statement.paid)

  function startEditing() {
    setValue((confirmedBalance ?? pending).toFixed(2))
    setEditing(true)
  }

  function save() {
    const amount = Number(value)
    if (!session?.user?.id || !period || !Number.isFinite(amount)) return
    confirmBalance.mutate(
      {
        userId: session.user.id,
        credit_line_id: line.id,
        period_month: period.periodMonth,
        cut_date: existing?.cut_date ?? period.cutDate,
        payment_date: existing?.payment_date ?? period.paymentDate,
        confirmed_balance: amount,
      },
      { onSuccess: () => setEditing(false) },
    )
  }

  if (editing) {
    return (
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <div className="w-32">
          <Input
            type="number"
            step="0.01"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
        </div>
        <Button size="sm" onClick={save} disabled={confirmBalance.isPending || !value}>
          {t('Guardar')}
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>
          {t('Cancelar')}
        </Button>
      </div>
    )
  }

  return (
    <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
      {confirmedBalance != null ? (
        <span className="text-green-600 dark:text-green-400">
          ✓ {t('Saldo confirmado:')} <Money amount={confirmedBalance} currency={statement.currency} />
        </span>
      ) : (
        t('¿Coincide con tu estado de cuenta?')
      )}{' '}
      <button
        type="button"
        onClick={startEditing}
        className="text-brand-700 hover:underline dark:text-brand-500"
      >
        {confirmedBalance != null ? t('editar') : t('confirmar saldo')}
      </button>
    </p>
  )
}
