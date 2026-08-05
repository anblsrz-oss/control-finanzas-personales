import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Input } from '@/components/ui/Input'
import { todayISO, weekStartISO, monthStartISO } from '@/lib/dates'

type Preset = 'today' | 'week' | 'month' | 'custom'

interface DateRange {
  startDate: string
  endDate: string
}

interface PeriodSelectorProps {
  startDate: string
  endDate: string
  onChange: (range: DateRange) => void
}

function presetRange(preset: Exclude<Preset, 'custom'>): DateRange {
  const today = todayISO()
  switch (preset) {
    case 'today':
      return { startDate: today, endDate: today }
    case 'week':
      return { startDate: weekStartISO(), endDate: today }
    case 'month':
      return { startDate: monthStartISO(), endDate: today }
  }
}

function detectPreset(startDate: string, endDate: string): Preset {
  if (startDate === presetRange('today').startDate && endDate === presetRange('today').endDate) {
    return 'today'
  }
  if (startDate === presetRange('week').startDate && endDate === presetRange('week').endDate) {
    return 'week'
  }
  if (startDate === presetRange('month').startDate && endDate === presetRange('month').endDate) {
    return 'month'
  }
  return 'custom'
}

export function PeriodSelector({ startDate, endDate, onChange }: PeriodSelectorProps) {
  const { t } = useTranslation()
  // Fuente de verdad local: si se derivara solo del rango recibido, elegir
  // "Personalizado" mientras el rango coincide con un preset (p. ej. "Este
  // mes") se auto-detectaría de nuevo como ese preset y nunca mostraría los
  // inputs. Se resincroniza con el rango externo salvo mientras el usuario
  // está en modo personalizado.
  const [preset, setPreset] = useState<Preset>(() => detectPreset(startDate, endDate))

  useEffect(() => {
    if (preset === 'custom') return
    const next = detectPreset(startDate, endDate)
    if (next !== preset) setPreset(next)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate])

  const options: { value: Preset; label: string }[] = [
    { value: 'today', label: t('Hoy') },
    { value: 'week', label: t('Esta semana') },
    { value: 'month', label: t('Este mes') },
    { value: 'custom', label: t('Personalizado') },
  ]

  const handlePresetChange = (value: Preset) => {
    setPreset(value)
    if (value !== 'custom') {
      onChange(presetRange(value))
    }
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => handlePresetChange(opt.value)}
            aria-pressed={preset === opt.value}
            className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors sm:flex-1 ${
              preset === opt.value
                ? 'bg-brand-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
      {preset === 'custom' && (
        <div className="grid grid-cols-2 gap-3">
          <Input
            label={t('Desde')}
            type="date"
            value={startDate}
            onChange={(e) => onChange({ startDate: e.target.value, endDate })}
          />
          <Input
            label={t('Hasta')}
            type="date"
            value={endDate}
            onChange={(e) => onChange({ startDate, endDate: e.target.value })}
          />
        </div>
      )}
    </div>
  )
}
