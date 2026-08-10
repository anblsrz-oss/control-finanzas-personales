import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/store/useAuth'
import { useOnboarding } from '@/store/useOnboarding'
import { useAppConfig } from '@/hooks/useAppConfig'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { getTourSteps, ONBOARDING_LAUNCH_DATE } from './tourSteps'

const DEFAULT_APP_TITLE = 'Mi Control de Finanzas Personales'

/**
 * Recorrido inicial de bienvenida. Solo se autoabre para cuentas creadas
 * después de ONBOARDING_LAUNCH_DATE — a las cuentas ya existentes no se les
 * fuerza, ya conocen la app (pueden verlo cuando quieran con el botón de
 * ayuda de cada sección).
 */
export function OnboardingTour() {
  const { t } = useTranslation()
  const { profile } = useAuth()
  const { data: appConfig } = useAppConfig()
  const hasSeenTour = useOnboarding((s) => s.hasSeenTour)
  const markTourSeen = useOnboarding((s) => s.markTourSeen)
  const [open, setOpen] = useState(false)
  const [index, setIndex] = useState(0)

  const steps = useMemo(() => getTourSteps(), [])
  const appTitle = appConfig?.app_title || DEFAULT_APP_TITLE

  useEffect(() => {
    if (!profile || hasSeenTour) return
    const isExistingAccount = !!profile.created_at && profile.created_at < ONBOARDING_LAUNCH_DATE
    if (isExistingAccount) {
      markTourSeen()
      return
    }
    setOpen(true)
  }, [profile, hasSeenTour, markTourSeen])

  function finish() {
    markTourSeen()
    setOpen(false)
    setIndex(0)
  }

  if (!steps.length) return null
  const step = steps[index]
  const isLast = index === steps.length - 1

  return (
    <Modal open={open} title={`${step.icon} ${t(step.title, { app: appTitle })}`} onClose={finish}>
      <p className="text-sm text-slate-600 dark:text-slate-300">{t(step.body)}</p>

      <div className="mt-4 flex items-center justify-center gap-1.5">
        {steps.map((s, i) => (
          <span
            key={s.id}
            className={`h-1.5 w-1.5 rounded-full ${
              i === index ? 'bg-brand-600' : 'bg-slate-300 dark:bg-slate-600'
            }`}
          />
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between gap-2">
        <Button variant="ghost" size="sm" onClick={finish}>
          {t('Omitir')}
        </Button>
        <div className="flex gap-2">
          {index > 0 && (
            <Button variant="ghost" size="sm" onClick={() => setIndex((i) => i - 1)}>
              {t('Anterior')}
            </Button>
          )}
          <Button size="sm" onClick={() => (isLast ? finish() : setIndex((i) => i + 1))}>
            {isLast ? t('Empezar') : t('Siguiente')}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
