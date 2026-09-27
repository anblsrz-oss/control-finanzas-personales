import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import data from './guides/guides.data.json'
import { ZoomableImage, renderRich } from './guides/GuideSteps'

// Pasos para que el sistema deje viva la captura en segundo plano, por
// fabricante — son los que de verdad matan el "oyente" de notificaciones
// aunque el permiso siga dado. Verificado en un Xiaomi (MIUI): sin esto,
// la app puede decir "Acceso concedido" y aun así no capturar nada porque
// el sistema mató el proceso. Lo usan la página de Captura por
// notificaciones y la de Preguntas frecuentes. Los pasos viven en
// guides/guides.data.json, que también alimenta el PDF de la guía.
interface BrandStep {
  text: string
  image?: string
}

interface BrandGuide {
  key: string
  brands: string
  steps: BrandStep[]
}

export const BRAND_GUIDES: BrandGuide[] = data.brandGuides

/** Lista de marcas desplegables, una abierta a la vez. */
export function BrandBatteryGuide() {
  const { t } = useTranslation()
  const [expandedBrand, setExpandedBrand] = useState<string | null>(null)

  return (
    <div className="grid gap-2">
      {BRAND_GUIDES.map((guide) => {
        const isOpen = expandedBrand === guide.key
        return (
          <div
            key={guide.key}
            className="rounded-lg border border-slate-200 dark:border-slate-700"
          >
            <button
              type="button"
              onClick={() => setExpandedBrand(isOpen ? null : guide.key)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between px-3 py-2 text-left text-sm font-medium text-slate-700 dark:text-slate-200"
            >
              {t(guide.brands)}
              <span className="text-xs text-slate-400">{isOpen ? '▲' : '▼'}</span>
            </button>
            {isOpen && (
              <ol className="grid gap-1.5 border-t border-slate-200 dark:border-slate-700 px-3 py-2 text-sm text-slate-600 dark:text-slate-300">
                {guide.steps.map((step, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="shrink-0 font-semibold text-brand-600 dark:text-brand-400">
                      {i + 1}.
                    </span>
                    <span className="min-w-0">
                      {renderRich(t(step.text))}
                      {step.image && <ZoomableImage src={`/guias/${step.image}`} alt={`${i + 1}`} />}
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </div>
        )
      })}
    </div>
  )
}
