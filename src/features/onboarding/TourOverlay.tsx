import type { CSSProperties } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/Button'
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

  const dots = (
    <div className="mt-4 flex items-center justify-center gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={`h-1.5 w-1.5 rounded-full ${
            i === index ? 'bg-brand-600' : 'bg-slate-300 dark:bg-slate-600'
          }`}
        />
      ))}
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
            {t('Anterior')}
          </Button>
        )}
        <Button size="sm" onClick={onNext}>
          {isLast ? t('Empezar') : t('Siguiente')}
        </Button>
      </div>
    </div>
  )

  const card = (className: string, style?: CSSProperties) => (
    <div
      className={`w-full rounded-xl bg-white dark:bg-slate-800 p-5 shadow-xl ${className}`}
      style={{ maxWidth: TOOLTIP_WIDTH, ...style }}
      onClick={(e) => e.stopPropagation()}
    >
      <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
        {step.icon} {t(step.title, { app: appTitle })}
      </h3>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{t(step.body)}</p>
      {dots}
      {controls}
    </div>
  )

  // Sin elemento a resaltar: callout centrado, mismo look que el Modal.
  if (!rect) {
    return (
      <div
        className="fixed inset-0 z-[100] flex items-end justify-center bg-black/40 p-4 sm:items-center"
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
    boxShadow: '0 0 0 9999px rgba(15, 23, 42, 0.6)',
    outline: '2px solid rgba(59, 130, 246, 0.9)',
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
