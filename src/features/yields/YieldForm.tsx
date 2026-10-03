import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/store/useAuth'
import {
  useAccountDailyBalances,
  useCreateOrUpdateYield,
  useDeleteYield,
  type YieldRecord,
} from '@/hooks/useYields'
import { monthStartISO, formatMonthLabel } from '@/lib/dates'
import { averageBalance, projectYield, type YieldTier } from '@/lib/yields'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { formatMoney } from '@/lib/format'
import type { AccountRow } from '@/types/db'

interface YieldFormProps {
  account: AccountRow
  tiers: YieldTier[]
  currentBalance: number
  /** Registros de esta cuenta (para editar el del mes elegido). */
  records: YieldRecord[]
  initialMonth: string
  onDelete?: () => void
}

export function YieldForm({
  account,
  tiers,
  currentBalance,
  records,
  initialMonth,
  onDelete,
}: YieldFormProps) {
  const { t } = useTranslation()
  const { session } = useAuth()
  const createOrUpdate = useCreateOrUpdateYield()
  const deleteYield = useDeleteYield()

  const [selectedMonth, setSelectedMonth] = useState(initialMonth)
  const currentRecord = records.find((y) => y.period_month === selectedMonth)

  // El esperado se recalcula para el MES ELEGIDO con el saldo que hubo cada
  // día de ese mes (no con el saldo de hoy).
  const isDemand = (account.yield_kind ?? 'demand') === 'demand'
  const dailyQuery = useAccountDailyBalances(isDemand ? account.id : undefined, selectedMonth)
  const daily = dailyQuery.data
  const expectedGrowth = projectYield(account, tiers, selectedMonth, currentBalance, daily).net
  const ready = !isDemand || dailyQuery.isSuccess

  // Se precarga con el cálculo del sistema (con tramos y apartados ya
  // aplicados): "Verificar" pasa a ser confirmar ese número, no capturarlo a
  // mano — el usuario solo lo ajusta si su banco dio un monto distinto.
  const [actualGrowth, setActualGrowth] = useState(
    currentRecord?.actual_growth?.toString() ?? '',
  )
  const [touched, setTouched] = useState(false)
  useEffect(() => {
    if (touched) return
    if (currentRecord?.actual_growth != null) {
      setActualGrowth(currentRecord.actual_growth.toString())
    } else if (ready) {
      setActualGrowth(expectedGrowth.toFixed(2))
    }
  }, [touched, ready, expectedGrowth, currentRecord?.actual_growth])

  // Generar últimos 12 meses
  const months = []
  for (let i = 0; i < 12; i++) {
    const d = new Date()
    d.setDate(1) // evita que el mes se salte al restar (ej. 31 de marzo - 1 mes)
    d.setMonth(d.getMonth() - i)
    const monthStr = monthStartISO(d)
    months.push({
      value: monthStr,
      label: formatMonthLabel(monthStr, { year: 'numeric', month: 'long' }),
    })
  }

  const difference = actualGrowth
    ? parseFloat(actualGrowth) - expectedGrowth
    : 0
  const percentDiff =
    expectedGrowth > 0 ? ((difference / expectedGrowth) * 100).toFixed(1) : '0'

  const handleSubmit = async () => {
    if (!session?.user?.id || !actualGrowth.trim()) return

    createOrUpdate.mutate({
      userId: session.user.id,
      accountId: account.id,
      accountCurrency: account.currency,
      periodMonth: selectedMonth,
      expectedGrowth: Math.round(expectedGrowth * 100) / 100,
      actualGrowth: parseFloat(actualGrowth),
      verified: true,
    })
  }

  const handleDelete = () => {
    if (!session?.user?.id || !currentRecord) return
    if (confirm(t('¿Eliminar este registro?'))) {
      deleteYield.mutate(
        { id: currentRecord.id, userId: session.user.id },
        {
          onSuccess: () => {
            setActualGrowth('')
            setTouched(false)
            onDelete?.()
          },
        },
      )
    }
  }

  return (
    <Card className="border-blue-200 bg-blue-50 dark:bg-blue-900/20">
      <p className="mb-3 text-xs font-semibold text-slate-700 dark:text-slate-200">
        {t('Confirma el rendimiento calculado')}{' '}
        {currentRecord ? t('(Editar)') : selectedMonth === monthStartISO() ? t('de este mes') : ''}
      </p>
      <p className="-mt-2 mb-3 text-xs text-slate-500 dark:text-slate-400">
        {t('Ya viene precargado con el cálculo del sistema. Ajústalo solo si tu banco dio un monto distinto — al confirmar se registra como una transacción de ingreso.')}
      </p>
      <div className="space-y-3">
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-200">
              {t('Mes')}
            </label>
            <select
              value={selectedMonth}
              onChange={(e) => {
                setSelectedMonth(e.target.value)
                setTouched(false)
              }}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-600 px-3 py-2 text-sm"
            >
              {months.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>
          <Input
            label={t('Monto a contabilizar ($)')}
            type="number"
            step="0.01"
            placeholder={formatMoney(expectedGrowth, account.currency)}
            value={actualGrowth}
            onChange={(e) => {
              setActualGrowth(e.target.value)
              setTouched(true)
            }}
            className="flex-1"
          />
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400">
          {t('Esperado para {{month}}: {{amount}}', {
            month: formatMonthLabel(selectedMonth, { year: 'numeric', month: 'long' }),
            amount: formatMoney(expectedGrowth, account.currency),
          })}
          {daily && daily.length > 0 && (
            <>
              {' · '}
              {t('saldo promedio {{amount}}', {
                amount: formatMoney(averageBalance(daily), account.currency),
              })}
            </>
          )}
        </p>

        {actualGrowth && (
          <div className="text-sm text-slate-600 dark:text-slate-300">
            <p
              className={`font-semibold ${difference >= 0 ? 'text-green-600' : 'text-red-600 dark:text-red-400'}`}
            >
              {difference >= 0 ? '+' : ''}{formatMoney(difference, account.currency)} ({percentDiff}% {t('vs esperado')})
            </p>
          </div>
        )}

        <div className="flex gap-2">
          <Button
            onClick={handleSubmit}
            disabled={createOrUpdate.isPending || !actualGrowth.trim()}
            className="flex-1"
          >
            {createOrUpdate.isPending
              ? t('Guardando…')
              : currentRecord
                ? t('Actualizar')
                : t('Verificar y contabilizar')}
          </Button>
          {currentRecord && (
            <Button
              variant="danger"
              onClick={handleDelete}
              disabled={deleteYield.isPending}
            >
              {t('Eliminar')}
            </Button>
          )}
        </div>
      </div>
    </Card>
  )
}
