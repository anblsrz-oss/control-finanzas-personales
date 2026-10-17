import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { useTranslation } from 'react-i18next'
import { useSettings } from '@/store/useSettings'
import type { IncomeExpenseChartType } from '@/store/useSettings'
import { useMoneyFormat } from '@/components/ui/Money'
import { CHART_META, seriesColor } from '@/lib/charts'
import type { ChartId } from '@/lib/charts'
import { useChartTheme, ChartTooltip, ChartLegend, AXIS_TICK, compact, stationDot } from './chartTheme'

interface DataPoint {
  month: string
  monthLabel: string
  income: number
  expense: number
  credit?: number
}

interface IncomeExpenseChartProps {
  data: DataPoint[]
  // Si no se pasa, se usa la preferencia guardada en settings.
  type?: IncomeExpenseChartType
  currency?: string
  // ID para leer color/visibilidad de settings. Por defecto 'incomeExpense'.
  chartId?: ChartId
}

export function IncomeExpenseChart({
  data,
  type,
  currency = 'MXN',
  chartId = 'incomeExpense',
}: IncomeExpenseChartProps) {
  const { t } = useTranslation()
  const prefType = useSettings((s) => s.incomeExpenseChartType)
  const config = useSettings((s) => s.chartConfigs[chartId])
  const money = useMoneyFormat()
  const chartType = type ?? prefType
  const { axisColor, gridColor, surface, cursorFill } = useChartTheme()

  const meta = CHART_META.incomeExpense
  const incomeColor = seriesColor(config, meta, 'income')
  const expenseColor = seriesColor(config, meta, 'expense')
  const creditColor = seriesColor(config, meta, 'credit')
  const hidden = config?.hiddenSeries ?? []
  const showIncome = !hidden.includes('income')
  const showExpense = !hidden.includes('expense')
  // El desglose por tarjeta/cuenta reusa este gráfico sin datos de crédito.
  const hasCredit = data.some((d) => (d.credit ?? 0) !== 0)
  const showCredit = hasCredit && !hidden.includes('credit')

  const axes = (
    <>
      <CartesianGrid vertical={false} stroke={gridColor} />
      <XAxis dataKey="monthLabel" tick={{ ...AXIS_TICK, fill: axisColor }} tickLine={false} axisLine={{ stroke: gridColor }} tickMargin={8} />
      <YAxis tick={{ ...AXIS_TICK, fill: axisColor }} tickLine={false} axisLine={false} tickFormatter={compact} width={44} />
      <Tooltip
        cursor={{ stroke: gridColor, fill: cursorFill }}
        content={<ChartTooltip format={(v) => money(v, currency)} />}
      />
      <Legend content={<ChartLegend />} />
    </>
  )

  return (
    <ResponsiveContainer width="100%" height={300}>
      {chartType === 'line' ? (
        <LineChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
          {axes}
          {showIncome && (
            <Line type="linear" dataKey="income" stroke={incomeColor} name={t('Ingresos')} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" dot={stationDot(incomeColor, surface)} activeDot={stationDot(incomeColor, surface, 6)} />
          )}
          {showExpense && (
            <Line type="linear" dataKey="expense" stroke={expenseColor} name={t('Egresos')} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" dot={stationDot(expenseColor, surface)} activeDot={stationDot(expenseColor, surface, 6)} />
          )}
          {showCredit && (
            <Line type="linear" dataKey="credit" stroke={creditColor} name={t('Crédito usado')} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" dot={stationDot(creditColor, surface)} activeDot={stationDot(creditColor, surface, 6)} />
          )}
        </LineChart>
      ) : (
        <BarChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }} barGap={3} barCategoryGap="16%">
          {axes}
          {showIncome && <Bar dataKey="income" fill={incomeColor} name={t('Ingresos')} radius={[4, 4, 0, 0]} maxBarSize={30} />}
          {showExpense && <Bar dataKey="expense" fill={expenseColor} name={t('Egresos')} radius={[4, 4, 0, 0]} maxBarSize={30} />}
          {showCredit && <Bar dataKey="credit" fill={creditColor} name={t('Crédito usado')} radius={[4, 4, 0, 0]} maxBarSize={30} />}
        </BarChart>
      )}
    </ResponsiveContainer>
  )
}
