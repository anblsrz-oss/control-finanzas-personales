import { NavIcon } from '@/components/layout/NavIcon'
import type { TourStep } from './tourSteps'

// Icono de un paso del recorrido / ayuda: el mismo de la sección en el menú, dentro de
// un recuadro de la marca. Los pasos sin ruta usan su id como ruta ('/configuracion').
export function StepIcon({ step, size = 'md' }: { step: TourStep; size?: 'md' | 'lg' }) {
  const key = step.route ?? (step.id === 'bienvenida' ? 'welcome' : `/${step.id}`)
  const box = size === 'lg' ? 'h-12 w-12' : 'h-10 w-10'
  return (
    <span
      aria-hidden="true"
      className={`flex shrink-0 items-center justify-center rounded-md bg-brand-50 text-brand-700 dark:bg-brand-800/40 dark:text-brand-500 ${box}`}
    >
      <NavIcon to={key} className={size === 'lg' ? 'h-6 w-6' : 'h-5 w-5'} />
    </span>
  )
}
