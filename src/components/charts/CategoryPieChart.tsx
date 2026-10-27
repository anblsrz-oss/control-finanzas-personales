import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { useTranslation } from 'react-i18next'
import { useSettings } from '@/store/useSettings'
import type { CategoryChartType } from '@/store/useSettings'
import { useMoneyFormat } from '@/components/ui/Money'
import { resolveChartColor } from '@/lib/categoryColors'
import { useChartTheme, ChartTooltip, AXIS_TICK, compact } from './chartTheme'

interface CategoryData {
  name: string
  icon: string
  total: number
  color: string
}

interface CategoryPieChartProps {
  data: CategoryData[]
  // Si no se pasan, se usan las preferencias guardadas en settings.
  type?: CategoryChartType
  palette?: string
  currency?: string
}

export function CategoryPieChart({ data, type, palette, currency = 'MXN' }: CategoryPieChartProps) {
  const { t } = useTranslation()
  const prefType = useSettings((s) => s.categoryChartType)
  const prefPalette = useSettings((s) => s.chartPalette)
  const config = useSettings((s) => s.chartConfigs['category'])
  const money = useMoneyFormat()
  const chartType = type ?? prefType
  const paletteKey = palette ?? prefPalette
  const { axisColor, gridColor, surface, cursorFill } = useChartTheme()

  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-slate-500 dark:text-slate-400">
        {t('Sin gastos en este período')}
      </div>
    )
  }

  // "Por categoría" usa el color propio; una paleta fija sobreescribe todo; el
  // override por punto (config.pointColors, indexado por el nombre crudo de la
  // categoría) manda sobre ambos. Se ocultan las categorías en hiddenSeries.
  const hidden = config?.hiddenSeries ?? []
  const chartData = data
    .filter((d) => !hidden.includes(d.name))
    .map((d, i) => ({
      name: `${d.icon} ${t(d.name)}`,
      value: d.total,
      color: config?.pointColors?.[d.name] ?? resolveChartColor(d.color, i, paletteKey),
    }))

  const total = chartData.reduce((sum, d) => sum + d.value, 0)
  const fmt = (value: number) => `${money(value, currency)} (${Math.round((value / total) * 100)}%)`
  const tooltip = <Tooltip cursor={{ fill: cursorFill }} content={<ChartTooltip hideLabel format={fmt} />} />

  if (chartType === 'bar') {
    return (
      <ResponsiveContainer width="100%" height={Math.max(260, chartData.length * 40 + 40)}>
        <BarChart data={chartData} layout="vertical" margin={{ top: 4, left: 0, right: 16, bottom: 0 }}>
          <CartesianGrid horizontal={false} stroke={gridColor} />
          <XAxis type="number" tick={{ ...AXIS_TICK, fill: axisColor }} tickLine={false} axisLine={false} tickFormatter={compact} />
          <YAxis type="category" dataKey="name" width={120} tick={{ ...AXIS_TICK, fill: axisColor }} tickLine={false} axisLine={false} />
          {tooltip}
          <Bar dataKey="value" name="Gasto" radius={[0, 4, 4, 0]} maxBarSize={18}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    )
  }

  // Dona con el total al centro y la lista de categorías al lado: el nombre, el
  // monto y el % se leen sin depender del color ni de la leyenda del gráfico.
  return (
    <div className="grid items-center gap-6 md:grid-cols-[minmax(0,18rem)_1fr]">
      <div className="relative mx-auto h-64 w-full max-w-[18rem]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={chartType === 'donut' ? '62%' : 0}
              outerRadius="96%"
              paddingAngle={chartData.length > 1 ? 2 : 0}
              cornerRadius={chartType === 'donut' ? 4 : 0}
              stroke={surface}
              strokeWidth={chartType === 'donut' ? 0 : 2}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            {tooltip}
          </PieChart>
        </ResponsiveContainer>
        {chartType === 'donut' && (
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{t('Total')}</span>
            <span className="text-xl font-bold tracking-tight tabular-nums text-slate-900 dark:text-slate-100">
              {money(total, currency)}
            </span>
          </div>
        )}
      </div>
      <ul className="space-y-2.5">
        {chartData.map((d, i) => (
          <li key={i} className="flex items-center gap-3 text-sm">
            <span aria-hidden="true" className="h-1.5 w-5 shrink-0 rounded-full" style={{ backgroundColor: d.color }} />
            <span className="min-w-0 flex-1 truncate text-slate-700 dark:text-slate-200">{d.name}</span>
            <span className="tabular-nums text-slate-500 dark:text-slate-400">{money(d.value, currency)}</span>
            <span className="w-10 text-end font-semibold tabular-nums text-slate-900 dark:text-slate-100">
              {Math.round((d.value / total) * 100)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
