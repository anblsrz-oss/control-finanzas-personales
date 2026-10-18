import { useTranslation } from 'react-i18next'
import { Input } from '@/components/ui/Input'
import { Segmented, Switch } from '@/components/ui/FormKit'
import { formatMoney } from '@/lib/format'
import { monthlyPayment } from '@/lib/installments'
import { interestFromRate, type InterestRateMode } from '@/lib/interest'

export interface InterestValue {
  interestFree: boolean
  rateMode: InterestRateMode
  /** Porcentaje (2 = 2%). */
  rate: number
}

/** Interés en monto de un plan según lo capturado en InterestFields. */
export function interestOf(v: InterestValue, total: number, months: number): number {
  return v.interestFree ? 0 : interestFromRate(total, months, v.rate, v.rateMode)
}

// Sin intereses / con tasa mensual o total, y vista previa de mensualidad,
// interés y total. Lo comparten la compra a MSI y "Diferir" de una compra ya
// registrada, para que ambos calculen igual.
export function InterestFields({
  value,
  onChange,
  total,
  months,
  currency,
}: {
  value: InterestValue
  onChange: (v: InterestValue) => void
  total: number
  months: number
  currency: string
}) {
  const { t } = useTranslation()
  const interest = interestOf(value, total, months)
  const monthly = monthlyPayment(total, interest, months)

  return (
    <div className="space-y-3">
      <Switch
        checked={value.interestFree}
        onChange={(v) => onChange({ ...value, interestFree: v })}
        label={t('Sin intereses (MSI)')}
      />
      {!value.interestFree && (
        <div className="grid gap-3 sm:grid-cols-2">
          <Segmented<InterestRateMode>
            label={t('Tipo de tasa')}
            value={value.rateMode}
            onChange={(m) => onChange({ ...value, rateMode: m })}
            options={[
              { value: 'monthly', label: t('% mensual') },
              { value: 'total', label: t('% total') },
            ]}
          />
          <Input
            label={value.rateMode === 'monthly' ? t('Tasa mensual (%)') : t('Interés total (%)')}
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0"
            value={value.rate || ''}
            onChange={(e) => onChange({ ...value, rate: Number(e.target.value) || 0 })}
          />
        </div>
      )}
      {months > 0 && total > 0 && (
        <p className="rounded bg-slate-100 p-2 text-xs text-slate-700 dark:bg-slate-800 dark:text-slate-200">
          {t('Mensualidad {{monthly}} · Interés {{interest}} · Total {{total}}', {
            monthly: formatMoney(monthly, currency),
            interest: formatMoney(interest, currency),
            total: formatMoney(total + interest, currency),
          })}
        </p>
      )}
    </div>
  )
}
