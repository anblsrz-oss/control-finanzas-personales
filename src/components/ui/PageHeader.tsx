import type { ReactNode } from 'react'
import { SectionHelpButton } from '@/features/onboarding/SectionHelpModal'

interface PageHeaderProps {
  title: string
  subtitle?: string
  actions?: ReactNode
  /** Id de tourSteps.ts: si se da, muestra un botón "?" con la ayuda de esta sección. */
  helpId?: string
  /** Id de tourSteps.ts: ancla del recorrido guiado cuando la página no tiene un botón/control estable que resaltar. */
  tourTarget?: string
}

export function PageHeader({ title, subtitle, actions, helpId, tourTarget }: PageHeaderProps) {
  return (
    <div
      className="mb-6 flex flex-wrap items-center justify-between gap-3"
      data-tour={tourTarget}
    >
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-semibold text-slate-800 dark:text-slate-100">{title}</h1>
          {helpId && <SectionHelpButton sectionId={helpId} />}
        </div>
        {subtitle && <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  )
}
