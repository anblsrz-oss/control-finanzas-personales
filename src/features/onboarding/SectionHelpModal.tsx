import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Modal } from '@/components/ui/Modal'
import { CircleHelp } from 'lucide-react'
import { getSectionHelp } from './tourSteps'
import { StepIcon } from './StepIcon'

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
        className="flex h-7 w-7 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-brand-50 hover:text-brand-700 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-brand-500"
      >
        <CircleHelp className="h-5 w-5" aria-hidden="true" />
      </button>
      <Modal open={open} title={t(step.title)} icon={<StepIcon step={step} />} onClose={() => setOpen(false)}>
        <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">{t(step.body)}</p>
      </Modal>
    </>
  )
}
