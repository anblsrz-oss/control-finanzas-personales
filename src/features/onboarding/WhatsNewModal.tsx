import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useOnboarding } from '@/store/useOnboarding'
import { Modal } from '@/components/ui/Modal'
import { formatDate } from '@/lib/format'
import { CHANGELOG } from './changelog'

/** Botón "🆕 Novedades" con punto rojo mientras haya una entrada sin ver. */
export function WhatsNewButton({ className = '' }: { className?: string }) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
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
        className={`relative rounded-lg p-2 text-lg transition-colors hover:bg-slate-100 dark:hover:bg-slate-700 ${className}`}
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
          <ul className="max-h-96 space-y-4 overflow-y-auto">
            {CHANGELOG.map((entry) => (
              <li key={entry.id}>
                <p className="text-xs text-slate-400 dark:text-slate-500">{formatDate(entry.date)}</p>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                  {t(entry.title)}
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-300">{t(entry.description)}</p>
              </li>
            ))}
          </ul>
        )}
      </Modal>
    </>
  )
}
