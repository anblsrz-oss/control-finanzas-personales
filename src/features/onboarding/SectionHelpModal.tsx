import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Modal } from '@/components/ui/Modal'
import { getSectionHelp } from './tourSteps'

/** Botón "?" que abre la misma explicación de esta sección que muestra el tutorial inicial. */
export function SectionHelpButton({ sectionId }: { sectionId: string }) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const step = getSectionHelp(sectionId)
  if (!step) return null

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        title={t('Ayuda de esta sección')}
        aria-label={t('Ayuda de esta sección')}
        className="flex h-6 w-6 items-center justify-center rounded-full border border-slate-300 dark:border-slate-600 text-xs font-semibold text-slate-500 dark:text-slate-400 transition-colors hover:bg-slate-100 dark:hover:bg-slate-700"
      >
        ?
      </button>
      <Modal open={open} title={`${step.icon} ${t(step.title)}`} onClose={() => setOpen(false)}>
        <p className="text-sm text-slate-600 dark:text-slate-300">{t(step.body)}</p>
      </Modal>
    </>
  )
}
