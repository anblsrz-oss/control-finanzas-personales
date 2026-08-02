import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Select } from '@/components/ui/Select'
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

  const options = [
    { value: 'today', label: t('Hoy') },
    { value: 'week', label: t('Esta semana') },
    { value: 'month', label: t('Este mes') },
    { value: 'custom', label: t('Personalizado') },
  ]

  const handlePresetChange = (value: string) => {
    setPreset(value as Preset)
    if (value !== 'custom') {
      onChange(presetRange(value as Exclude<Preset, 'custom'>))
    }
  }

  return (
    <div className="space-y-3">
      <Select
        label={t('Periodo')}
        value={preset}
        onChange={(e) => handlePresetChange(e.target.value)}
        options={options}
      />
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
