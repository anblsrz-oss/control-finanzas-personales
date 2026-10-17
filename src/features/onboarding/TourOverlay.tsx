import type { CSSProperties } from 'react'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { StepIcon } from './StepIcon'
import type { TourStep } from './tourSteps'

interface TourOverlayProps {
  step: TourStep
  index: number
  total: number
  /** Rect del elemento a resaltar, o null para el callout centrado sin ancla (fallback). */
  rect: DOMRect | null
  appTitle: string
  onNext: () => void
  onPrev: () => void
  onSkip: () => void
}

const GAP = 12
const TOOLTIP_WIDTH = 320
const PADDING = 16

// Vista del recorrido guiado: recorta un "spotlight" alrededor del elemento
// real (rect) con un tooltip anclado junto a él, o cae a un callout
// centrado cuando no hay elemento que resaltar (fallback por timing o por
// función no disponible en este plan/plataforma). Z-index por encima del
// Modal (z-50) y de la hoja "Más" (z-40).
export function TourOverlay({ step, index, total, rect, appTitle, onNext, onPrev, onSkip }: TourOverlayProps) {
  const { t } = useTranslation()
  const isLast = index === total - 1
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640

  // Progreso como tramo de línea: lo recorrido va relleno y termina en una parada.
  const pct = total > 1 ? (index / (total - 1)) * 100 : 100
  const dots = (
    <div className="mt-5">
      <div className="relative h-1 rounded-full bg-slate-200 dark:bg-slate-700">
        <div
          className="h-full rounded-full bg-brand-600 transition-[width] duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none"
          style={{ width: `${pct}%` }}
        />
        <span
          aria-hidden="true"
          className="absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-brand-600 bg-surface transition-[left] duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none"
          style={{ left: `${Math.min(Math.max(pct, 2), 98)}%` }}
        />
      </div>
      <p className="mt-2 text-xs font-medium text-slate-500 dark:text-slate-400">
        {t('Paso {{n}} de {{total}}', { n: index + 1, total })}
      </p>
    </div>
  )

  const controls = (
    <div className="mt-4 flex items-center justify-between gap-2">
      <Button variant="ghost" size="sm" onClick={onSkip}>
        {t('Omitir')}
      </Button>
      <div className="flex gap-2">
        {index > 0 && (
          <Button variant="ghost" size="sm" onClick={onPrev}>
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            {t('Anterior')}
          </Button>
        )}
        <Button size="sm" onClick={onNext}>
          {isLast ? t('Empezar') : t('Siguiente')}
          {!isLast && <ArrowRight className="h-4 w-4" aria-hidden="true" />}
        </Button>
      </div>
    </div>
  )

  const card = (className: string, style?: CSSProperties) => (
    <div
      className={`w-full rounded-lg border border-slate-200 bg-surface p-5 shadow-2xl dark:border-slate-700 ${className}`}
      style={{ maxWidth: TOOLTIP_WIDTH, ...style }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-start gap-3">
        <StepIcon step={step} />
        <h3 className="pt-1.5 text-lg font-bold leading-tight tracking-tight text-slate-900 dark:text-slate-100">
          {t(step.title, { app: appTitle })}
        </h3>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{t(step.body)}</p>
      {dots}
      {controls}
    </div>
  )

  // Sin elemento a resaltar: callout centrado, mismo look que el Modal.
  if (!rect) {
    return (
      <div
        className="fixed inset-0 z-[100] flex items-end justify-center bg-[rgb(8_13_32)]/60 p-4 sm:items-center"
        onClick={onSkip}
      >
        {card('')}
      </div>
    )
  }

  // Recorte "spotlight": una caja transparente del tamaño del elemento con
  // un box-shadow enorme que oscurece todo lo demás — sin SVG ni librería.
  const spotlightPad = 6
  const spotlightStyle: CSSProperties = {
    position: 'fixed',
    left: rect.left - spotlightPad,
    top: rect.top - spotlightPad,
    width: rect.width + spotlightPad * 2,
    height: rect.height + spotlightPad * 2,
    borderRadius: 10,
    boxShadow: '0 0 0 9999px rgba(8, 13, 32, 0.68)',
    outline: '2px solid rgba(74, 120, 240, 0.9)',
    outlineOffset: 2,
    pointerEvents: 'none',
    transition: 'left 150ms ease, top 150ms ease, width 150ms ease, height 150ms ease',
    zIndex: 100,
  }

  let tooltipStyle: CSSProperties

  if (isMobile) {
    // En móvil, junto al elemento se puede salir de pantalla o chocar con la
    // barra inferior — más simple y confiable fijarlo abajo, sobre el área segura.
    tooltipStyle = {
      position: 'fixed',
      left: PADDING,
      right: PADDING,
      bottom: 'calc(env(safe-area-inset-bottom, 0px) + 72px)',
      maxWidth: 'none',
      zIndex: 101,
    }
  } else {
    const spaceBelow = window.innerHeight - rect.bottom
    const openBelow = spaceBelow > 260
    const left = Math.min(
      Math.max(rect.left, PADDING),
      window.innerWidth - TOOLTIP_WIDTH - PADDING,
    )
    tooltipStyle = openBelow
      ? { position: 'fixed', left, top: rect.bottom + GAP, zIndex: 101 }
      : { position: 'fixed', left, bottom: window.innerHeight - rect.top + GAP, zIndex: 101 }
  }

  return (
    <div className="fixed inset-0 z-[99]" onClick={onSkip}>
      <div style={spotlightStyle} />
      {card('', tooltipStyle)}
    </div>
  )
}
