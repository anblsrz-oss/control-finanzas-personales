import { useTranslation } from 'react-i18next'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Money } from '@/components/ui/Money'
import {
  BUDGET_STATUS_COLORS,
  BUDGET_PERIOD_LABELS,
  GENERAL_BUDGET_LABEL,
  GENERAL_BUDGET_ICON,
  budgetRangeLabel,
  budgetPercent,
} from '@/lib/budgets'
import type { BudgetStatusRow } from '@/types/db'

interface BudgetRowProps {
  status: BudgetStatusRow
  onEdit: () => void
  onDelete: () => void
  deleting?: boolean
}

export function BudgetRow({ status, onEdit, onDelete, deleting }: BudgetRowProps) {
  const { t } = useTranslation()
  const percent = budgetPercent(status.percent)
  const color = BUDGET_STATUS_COLORS[status.status]
  const isGeneral = status.category_id === null

  // La barra se llena hasta 100 aunque el porcentaje real sea mayor: el exceso
  // se comunica con el color rojo y con la línea "Excedido por".
  const fill = Math.min(100, percent)

  return (
    <Card>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-100">
            <span aria-hidden>
              {isGeneral ? GENERAL_BUDGET_ICON : status.category_icon || '📁'}
            </span>
            <span className="truncate">
              {isGeneral ? t(GENERAL_BUDGET_LABEL) : status.category_name}
            </span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t(BUDGET_PERIOD_LABELS[status.period])} ·{' '}
            {budgetRangeLabel(status.period_start, status.period_end)}
          </p>
        </div>
        <div className="text-right">
          <p className="font-semibold text-slate-800 dark:text-slate-100">
            <Money amount={status.spent} currency={status.currency} />
            <span className="text-slate-400 dark:text-slate-500">
              {' / '}
              <Money amount={status.amount} currency={status.currency} />
            </span>
          </p>
          <p className="text-xs font-medium" style={{ color }}>
            {percent.toFixed(0)}%
          </p>
        </div>
      </div>

      <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
        <div
          className="h-full rounded-full transition-[width] duration-500"
          style={{ width: `${fill}%`, backgroundColor: color }}
        />
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
        {status.status === 'over' ? (
          <span className="font-medium text-red-600 dark:text-red-400">
            {t('Excedido por')}{' '}
            <Money amount={status.spent - status.amount} currency={status.currency} />
          </span>
        ) : (
          <span className="text-slate-500 dark:text-slate-400">
            {t('Te quedan')}{' '}
            <Money amount={status.remaining} currency={status.currency} />
          </span>
        )}
        {status.spent_pending > 0 && (
          <span className="text-amber-600 dark:text-amber-400">
            +<Money amount={status.spent_pending} currency={status.currency} />{' '}
            {t('por revisar')}
          </span>
        )}
        <span className="text-slate-400 dark:text-slate-500">
          {t('avisa al {{n}}%', { n: status.alert_threshold })}
        </span>
      </div>

      <div className="mt-3 flex gap-2">
        <Button variant="ghost" size="sm" onClick={onEdit}>
          {t('Editar')}
        </Button>
        <Button variant="danger" size="sm" onClick={onDelete} disabled={deleting}>
          {t('Eliminar')}
        </Button>
      </div>
    </Card>
  )
}
