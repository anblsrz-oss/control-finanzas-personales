import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAppConfig } from '@/hooks/useAppConfig'
import { getTourSteps } from './tourSteps'
import { TourOverlay } from './TourOverlay'

const DEFAULT_APP_TITLE = 'Mi Control de Finanzas Personales'
// Tiempo máximo esperando a que aparezca [data-tour="..."] tras navegar,
// antes de caer al callout centrado sin ancla (target condicional que no
// renderiza en este plan/plataforma, o simplemente tardó en montar).
const TARGET_TIMEOUT_MS = 2000
const POLL_INTERVAL_MS = 50

interface TourRunnerProps {
  onFinish: () => void
}

// El "cerebro" del recorrido: navega a la ruta real de cada paso, busca su
// elemento anclable en el DOM y le pasa el rect a TourOverlay (la vista) —
// o null si no lo encuentra, para el fallback centrado.
export function TourRunner({ onFinish }: TourRunnerProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { data: appConfig } = useAppConfig()
  const appTitle = appConfig?.app_title || DEFAULT_APP_TITLE
  const steps = useMemo(() => getTourSteps(appConfig?.page_order), [appConfig?.page_order])
  const [index, setIndex] = useState(0)
  const [rect, setRect] = useState<DOMRect | null>(null)

  const step = steps[index]

  useEffect(() => {
    setRect(null)
    if (!step) return

    if (step.route && location.pathname !== step.route) {
      navigate(step.route)
      return
    }
    if (!step.target) return

    let cancelled = false
    const start = Date.now()

    function poll() {
      if (cancelled) return
      const el = document.querySelector(`[data-tour="${step!.target}"]`)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
        // deja asentar el scroll antes de leer el rect final
        requestAnimationFrame(() =>
          requestAnimationFrame(() => {
            if (!cancelled) setRect(el.getBoundingClientRect())
          }),
        )
        return
      }
      if (Date.now() - start > TARGET_TIMEOUT_MS) return
      setTimeout(poll, POLL_INTERVAL_MS)
    }
    poll()

    return () => {
      cancelled = true
    }
  }, [step, location.pathname, navigate])

  // Reajusta la posición si la ventana cambia de tamaño o hace scroll
  // mientras el paso está abierto (el rect puede moverse).
  useEffect(() => {
    if (!step?.target) return
    function reposition() {
      const el = document.querySelector(`[data-tour="${step!.target}"]`)
      if (el) setRect(el.getBoundingClientRect())
    }
    window.addEventListener('resize', reposition)
    window.addEventListener('scroll', reposition, true)
    return () => {
      window.removeEventListener('resize', reposition)
      window.removeEventListener('scroll', reposition, true)
    }
  }, [step])

  if (!step) return null

  function next() {
    if (index === steps.length - 1) onFinish()
    else setIndex((i) => i + 1)
  }

  function prev() {
    setIndex((i) => Math.max(0, i - 1))
  }

  return (
    <TourOverlay
      step={step}
      index={index}
      total={steps.length}
      rect={rect}
      appTitle={appTitle}
      onNext={next}
      onPrev={prev}
      onSkip={onFinish}
    />
  )
}
