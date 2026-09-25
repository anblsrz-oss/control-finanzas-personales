import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useOnboarding } from '@/store/useOnboarding'
import { Modal } from '@/components/ui/Modal'
import { formatDate } from '@/lib/format'
import { CHANGELOG, type ChangelogEntry } from './changelog'

// Una entrada deja de ser "novedad" a los 30 días. Siempre se muestran al
// menos las 3 más recientes (para que la lista nunca quede vacía en rachas
// sin releases). Las anteriores no se borran: quedan detrás de "Ver
// anteriores" como historial.
const RECENT_DAYS = 30
const MIN_RECENT = 3

function splitChangelog(entries: ChangelogEntry[]) {
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - RECENT_DAYS)
  const cutoffStr = cutoff.toISOString().slice(0, 10)
  const recentCount = Math.max(
    MIN_RECENT,
    entries.filter((e) => e.date >= cutoffStr).length,
  )
  return { recent: entries.slice(0, recentCount), older: entries.slice(recentCount) }
}

function EntryItem({ entry }: { entry: ChangelogEntry }) {
  const { t } = useTranslation()
  return (
    <li>
      <p className="text-xs text-slate-400 dark:text-slate-500">{formatDate(entry.date)}</p>
      <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{t(entry.title)}</p>
      <p className="text-sm text-slate-600 dark:text-slate-300">{t(entry.description)}</p>
    </li>
  )
}

/** Botón "🆕 Novedades" con punto rojo mientras haya una entrada sin ver. */
export function WhatsNewButton({ className = '' }: { className?: string }) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [showOlder, setShowOlder] = useState(false)
  const { recent, older } = splitChangelog(CHANGELOG)
  const lastSeenChangelogId = useOnboarding((s) => s.lastSeenChangelogId)
  const markChangelogSeen = useOnboarding((s) => s.markChangelogSeen)
  const hasUnseen = CHANGELOG.length > 0 && CHANGELOG[0].id !== lastSeenChangelogId

  function openModal() {
    setOpen(true)
    setShowOlder(false)
    if (CHANGELOG.length > 0) markChangelogSeen(CHANGELOG[0].id)
  }

  return (
    <>
      <button
        type="button"
        onClick={openModal}
        title={t('Novedades')}
        aria-label={t('Novedades')}
        className={`relative rounded-lg p-1.5 text-lg transition-colors sm:p-2 hover:bg-slate-100 dark:hover:bg-slate-700 ${className}`}
      >
        🆕
        {hasUnseen && (
          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />
        )}
      </button>

      <Modal open={open} title={`🆕 ${t('Novedades')}`} onClose={() => setOpen(false)}>
        {CHANGELOG.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">{t('No hay novedades por ahora.')}</p>
        ) : (
          <>
            <ul className="space-y-4">
              {recent.map((entry) => (
                <EntryItem key={entry.id} entry={entry} />
              ))}
            </ul>
            {older.length > 0 &&
              (showOlder ? (
                <ul className="mt-4 space-y-4 border-t border-slate-200 pt-4 opacity-80 dark:border-slate-700">
                  {older.map((entry) => (
                    <EntryItem key={entry.id} entry={entry} />
                  ))}
                </ul>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowOlder(true)}
                  className="mt-4 text-xs font-medium text-brand-600 transition-colors hover:text-brand-800 dark:text-brand-400"
                >
                  {t('Ver anteriores ({{n}})', { n: older.length })}
                </button>
              ))}
          </>
        )}
      </Modal>
    </>
  )
}
