import { useTranslation } from 'react-i18next'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useDismissAmountlessSignal } from '@/hooks/useAmountlessSignals'
import type { AmountlessSignalRow } from '@/types/db'

// Avisos de salida a los que les falta el monto (p. ej. "¡Enviamos tu
// transferencia!" de Mercado Pago). Si el correo/SMS del mismo envío llega
// después, se completan solos y desaparecen de aquí.
export function AmountlessNotice({
  signals,
  onComplete,
}: {
  signals: AmountlessSignalRow[]
  onComplete: (s: AmountlessSignalRow) => void
}) {
  const { t, i18n } = useTranslation()
  const dismiss = useDismissAmountlessSignal()
  if (signals.length === 0) return null
  const when = (iso: string) =>
    new Date(iso).toLocaleString(i18n.language, {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    })
  return (
    <Card className="mb-4 border-sky-200 dark:border-sky-800 bg-sky-50 dark:bg-sky-900/20">
      <h3 className="text-sm font-semibold text-sky-900 dark:text-sky-100">
        {t('Movimientos sin monto ({{count}})', { count: signals.length })}
      </h3>
      <p className="mt-1 text-xs text-sky-800 dark:text-sky-200">
        {t('La app avisó de estos envíos sin decir cuánto. Si llega el correo o SMS con el monto se completan solos; si no, regístralos tú.')}
      </p>
      <ul className="mt-3 space-y-2">
        {signals.map((s) => (
          <li
            key={s.id}
            className="flex flex-wrap items-center justify-between gap-2 rounded-md bg-white/70 dark:bg-slate-900/50 px-3 py-2"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">
                {s.concept || t('Transferencia')}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {[s.app_name, when(s.occurred_at)].filter(Boolean).join(' · ')}
              </p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => onComplete(s)}>
                {t('Registrar monto')}
              </Button>
              <Button
                size="sm"
                variant="secondary"
                disabled={dismiss.isPending}
                onClick={() => dismiss.mutate({ id: s.id })}
              >
                {t('Descartar')}
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  )
}
