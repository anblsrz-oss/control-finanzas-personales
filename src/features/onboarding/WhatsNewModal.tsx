import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useOnboarding } from '@/store/useOnboarding'
import { Modal } from '@/components/ui/Modal'
import { formatDate } from '@/lib/format'
import { CHANGELOG, type ChangelogEntry } from './changelog'

// Solo se muestran las entradas de las DOS fechas más recientes; las demás
// no se listan (changelog.ts también se poda a mano, esto lo garantiza aunque
// se olvide).
const RECENT_DATES = 2

function recentChangelog(entries: ChangelogEntry[]) {
  const dates = [...new Set(entries.map((e) => e.date))].sort().reverse().slice(0, RECENT_DATES)
  return entries.filter((e) => dates.includes(e.date))
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
  const recent = recentChangelog(CHANGELOG)
  const lastSeenChangelogId = useOnboarding((s) => s.lastSeenChangelogId)
  const markChangelogSeen = useOnboarding((s) => s.markChangelogSeen)
  const hasUnseen = CHANGELOG.length > 0 && CHANGELOG[0].id !== lastSeenChangelogId

  function openModal() {
    setOpen(true)
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
          </>
        )}
      </Modal>
    </>
  )
}
