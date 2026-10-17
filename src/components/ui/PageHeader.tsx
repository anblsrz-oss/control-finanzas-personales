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
        <div className="flex items-center gap-2.5">
          {/* Marca de estación: tramo de línea con parada, identidad del diagrama. */}
          <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true" className="shrink-0 text-brand-600 dark:text-brand-500">
            <path d="M2 17 H8 L14 11 H20" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="14" cy="11" r="3.2" className="fill-surface" stroke="currentColor" strokeWidth="2" />
          </svg>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">{title}</h1>
          {helpId && <SectionHelpButton sectionId={helpId} />}
        </div>
        {subtitle && <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  )
}
