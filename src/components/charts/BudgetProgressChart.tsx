import { useTranslation } from 'react-i18next'
import { useSettings } from '@/store/useSettings'
import { useMoneyFormat } from '@/components/ui/Money'
import { CHART_META, seriesColor } from '@/lib/charts'
import {
  GENERAL_BUDGET_LABEL,
  budgetRangeLabel,
  budgetPercent,
} from '@/lib/budgets'
import type { BudgetStatusRow } from '@/types/db'
import { ProgressTrack } from './ProgressTrack'

interface BudgetProgressChartProps {
  data: BudgetStatusRow[]
}

// Una pista por presupuesto: gastado vs. límite del periodo vigente, en el color
// de su estado (ok / cerca / excedido). El exceso se expresa con números.
export function BudgetProgressChart({ data }: BudgetProgressChartProps) {
  const { t } = useTranslation()
  const config = useSettings((s) => s.chartConfigs['budget'])
  const money = useMoneyFormat()

  const meta = CHART_META.budget
  const statusColors = {
    ok: seriesColor(config, meta, 'ok'),
    warn: seriesColor(config, meta, 'warn'),
    over: seriesColor(config, meta, 'over'),
  }
  const availableColor = config?.seriesColors?.['available']

  if (!data.length) {
    return (
      <p className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">
        {t('Sin presupuestos configurados.')}
      </p>
    )
  }

  return (
    <ul className="space-y-5">
      {data.map((d) => {
        const percent = budgetPercent(d.percent)
        const name = d.category_id === null ? t(GENERAL_BUDGET_LABEL) : d.category_name
        return (
          <li key={d.budget_id}>
            <div className="mb-2 flex flex-wrap items-baseline justify-between gap-x-3">
              <span className="font-semibold text-slate-900 dark:text-slate-100">
                {d.category_icon ? `${d.category_icon} ` : ''}{name}
              </span>
              <span className="text-sm tabular-nums text-slate-600 dark:text-slate-300">
                <span className="font-semibold text-slate-900 dark:text-slate-100">{money(d.spent, d.currency)}</span>
                {' / '}
                {money(d.amount, d.currency)}
              </span>
            </div>
            <ProgressTrack percent={percent} color={statusColors[d.status]} trackColor={availableColor} label={String(name)} />
            <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
              <span className="font-semibold" style={{ color: statusColors[d.status] }}>{percent.toFixed(0)}%</span>
              {' · '}{budgetRangeLabel(d.period_start, d.period_end)}
              {d.status === 'over' && (
                <span className="font-semibold text-line-scarlet">
                  {' · '}{t('excedido por')} {money(d.spent - d.amount, d.currency)}
                </span>
              )}
            </p>
          </li>
        )
      })}
    </ul>
  )
}
