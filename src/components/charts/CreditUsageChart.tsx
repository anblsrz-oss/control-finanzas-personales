import { useTranslation } from 'react-i18next'
import { useSettings } from '@/store/useSettings'
import { useMoneyFormat } from '@/components/ui/Money'
import { CHART_META, seriesColor } from '@/lib/charts'
import type { CreditUsageItem } from '@/hooks/useCreditLines'
import { ProgressTrack } from './ProgressTrack'

interface CreditUsageChartProps {
  data: CreditUsageItem[]
}

// Una pista por línea de crédito: cuánto del límite está usado y en qué zona
// (sano / medio / alto). Las tarjetas que comparten la línea van debajo.
export function CreditUsageChart({ data }: CreditUsageChartProps) {
  const { t } = useTranslation()
  const config = useSettings((s) => s.chartConfigs['creditUsage'])
  const money = useMoneyFormat()

  // Colores del semáforo y del disponible, configurables.
  const meta = CHART_META.creditUsage
  const lowColor = seriesColor(config, meta, 'low')
  const mediumColor = seriesColor(config, meta, 'medium')
  const highColor = seriesColor(config, meta, 'high')
  const availableColor = config?.seriesColors?.['available']

  // Por debajo de 30% es sano, arriba de 70% pesa en el buró y el pago mínimo.
  const usageColor = (percent: number): string => {
    if (percent >= 70) return highColor
    if (percent >= 30) return mediumColor
    return lowColor
  }

  if (!data.length) {
    return (
      <p className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">
        {t('Sin líneas de crédito registradas.')}
      </p>
    )
  }

  return (
    <ul className="space-y-5">
      {data.map((d) => (
        <li key={d.id}>
          <div className="mb-2 flex flex-wrap items-baseline justify-between gap-x-3">
            <span className="font-semibold text-slate-900 dark:text-slate-100">{d.name}</span>
            <span className="text-sm tabular-nums text-slate-600 dark:text-slate-300">
              <span className="font-semibold text-slate-900 dark:text-slate-100">{money(d.used, d.currency)}</span>
              {' / '}
              {money(d.creditLimit, d.currency)}
            </span>
          </div>
          <ProgressTrack percent={d.percent} color={usageColor(d.percent)} trackColor={availableColor} label={d.name} />
          <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
            <span className="font-semibold" style={{ color: usageColor(d.percent) }}>{d.percent.toFixed(0)}%</span>{' '}
            {t('usado')} · {money(Math.max(0, d.available), d.currency)} {t('Disponible').toLowerCase()}
            {d.cards.length > 0 && <> · {d.cards.join(', ')}</>}
          </p>
        </li>
      ))}
    </ul>
  )
}
