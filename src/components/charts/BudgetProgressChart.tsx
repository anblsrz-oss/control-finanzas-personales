import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { useTranslation } from 'react-i18next'
import { useSettings, resolveIsDark } from '@/store/useSettings'
import { useMoneyFormat } from '@/components/ui/Money'
import { CHART_META, seriesColor } from '@/lib/charts'
import {
  GENERAL_BUDGET_LABEL,
  budgetRangeLabel,
  budgetPercent,
} from '@/lib/budgets'
import type { BudgetStatusRow } from '@/types/db'

interface BudgetProgressChartProps {
  data: BudgetStatusRow[]
}

export function BudgetProgressChart({ data }: BudgetProgressChartProps) {
  const { t } = useTranslation()
  const theme = useSettings((s) => s.theme)
  const config = useSettings((s) => s.chartConfigs['budget'])
  const money = useMoneyFormat()
  const dark = resolveIsDark(theme)
  const axisColor = dark ? '#94a3b8' : '#475569'
  const gridColor = dark ? '#334155' : '#e2e8f0'

  // Semáforo configurable. El "restante" sigue al tema salvo que el usuario lo
  // cambie, igual que en CreditUsageChart.
  const meta = CHART_META.budget
  const statusColors = {
    ok: seriesColor(config, meta, 'ok'),
    warn: seriesColor(config, meta, 'warn'),
    over: seriesColor(config, meta, 'over'),
  }
  const availableColor = config?.seriesColors?.['available'] ?? (dark ? '#334155' : '#e2e8f0')

  if (!data.length) {
    return (
      <p className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">
        {t('Sin presupuestos configurados.')}
      </p>
    )
  }

  // Barras apiladas gastado + restante: juntas suman el límite, así que el
  // largo total es comparable entre presupuestos. Cuando hay exceso el
  // restante es 0 y la barra queda roja completa; el cuánto se excedió va en
  // el detalle de abajo, que sí puede expresarlo con números.
  const chartData = data.map((d) => ({
    name:
      d.category_id === null
        ? t('General')
        : `${d.category_icon ? `${d.category_icon} ` : ''}${d.category_name ?? ''}`,
    spent: d.spent,
    available: Math.max(0, d.amount - d.spent),
    status: d.status,
    currency: d.currency,
  }))

  const height = Math.max(200, chartData.length * 56 + 60)

  return (
    <div className="space-y-3">
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={chartData} layout="vertical" margin={{ left: 8, right: 16 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <XAxis type="number" tick={{ fill: axisColor, fontSize: 12 }} stroke={gridColor} />
          <YAxis
            type="category"
            dataKey="name"
            width={110}
            tick={{ fill: axisColor, fontSize: 12 }}
            stroke={gridColor}
          />
          <Tooltip
            formatter={(value: number, name: string) => [
              money(value, chartData[0]?.currency),
              name,
            ]}
            contentStyle={{
              backgroundColor: dark ? '#1e293b' : '#ffffff',
              border: `1px solid ${gridColor}`,
              borderRadius: 8,
            }}
            labelStyle={{ color: dark ? '#f1f5f9' : '#000' }}
            itemStyle={{ color: axisColor }}
          />
          <Legend wrapperStyle={{ color: axisColor }} />
          <Bar dataKey="spent" stackId="budget" name={t('Gastado')}>
            {chartData.map((d) => (
              <Cell key={d.name} fill={statusColors[d.status]} />
            ))}
          </Bar>
          <Bar
            dataKey="available"
            stackId="budget"
            name={t('Restante')}
            fill={availableColor}
          />
        </BarChart>
      </ResponsiveContainer>

      {/* Detalle: el % exacto, el periodo vigente y el exceso, que la barra
          apilada por sí sola no alcanza a comunicar. */}
      <ul className="space-y-1 text-xs">
        {data.map((d) => {
          const percent = budgetPercent(d.percent)
          return (
            <li key={d.budget_id} className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
              <span
                className="inline-block h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: statusColors[d.status] }}
              />
              <span className="font-medium text-slate-700 dark:text-slate-200">
                {d.category_id === null ? t(GENERAL_BUDGET_LABEL) : d.category_name}
              </span>
              <span className="text-slate-500 dark:text-slate-400">
                {money(d.spent, d.currency)} / {money(d.amount, d.currency)} (
                {percent.toFixed(0)}%)
              </span>
              <span className="text-slate-400 dark:text-slate-500">
                · {budgetRangeLabel(d.period_start, d.period_end)}
              </span>
              {d.status === 'over' && (
                <span className="font-medium text-red-600 dark:text-red-400">
                  · {t('excedido por')} {money(d.spent - d.amount, d.currency)}
                </span>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
