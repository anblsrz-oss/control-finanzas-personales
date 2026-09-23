import { useTranslation } from 'react-i18next'
import { signalLabel } from '@/hooks/useIngestSignals'
import type { IngestSignalRow, TransactionRow } from '@/types/db'

// Marca "posible duplicado" (el mismo cargo parece haber llegado por dos
// canales, pero sin certeza suficiente para fusionarlo solo) con sus dos
// salidas: borrarlo como duplicado o descartar la sospecha.
export function PossibleDuplicateNotice({
  tx,
  original,
  onIsDuplicate,
  onDistinct,
  busy,
  compact = false,
}: {
  tx: TransactionRow
  original: TransactionRow | undefined
  onIsDuplicate: () => void
  onDistinct: () => void
  busy?: boolean
  compact?: boolean
}) {
  const { t } = useTranslation()
  if (!tx.possible_duplicate_of) return null
  return (
    <span
      className={`inline-flex flex-wrap items-center gap-1.5 rounded bg-orange-100 dark:bg-orange-900/40 px-1.5 py-0.5 font-medium text-orange-700 dark:text-orange-300 ${
        compact ? 'ml-1.5 text-[10px]' : 'mt-1 text-xs'
      }`}
      title={
        original
          ? t('Parecido a "{{concept}}" del {{date}}', {
              concept: original.concept ?? '',
              date: original.tx_date,
            })
          : undefined
      }
    >
      ⚠️ {t('Posible duplicado')}
      {!compact && original?.concept && (
        <span className="font-normal">· {original.concept}</span>
      )}
      <button
        type="button"
        onClick={onIsDuplicate}
        disabled={busy}
        className="underline hover:no-underline disabled:opacity-50"
      >
        {t('Es duplicado')}
      </button>
      <button
        type="button"
        onClick={onDistinct}
        disabled={busy}
        className="underline hover:no-underline disabled:opacity-50"
      >
        {t('Son distintos')}
      </button>
    </span>
  )
}

// "Recibido por: SMS · Notificación BBVA" cuando el cargo llegó por más de
// un canal y se fusionó en una sola transacción.
export function ReceivedVia({ signals }: { signals: IngestSignalRow[] | undefined }) {
  const { t } = useTranslation()
  if (!signals || signals.length < 2) return null
  const labels = [...new Set(signals.map((s) => signalLabel(s, t)))]
  return (
    <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
      📡 {t('Recibido por: {{channels}}', { channels: labels.join(' · ') })}
    </p>
  )
}
