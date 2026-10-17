import type { ElementType, ReactNode } from 'react'
import { useInView } from '@/hooks/useInView'

// Entrada suave al hacer scroll: sube unos píxeles y aparece. `delay` (ms) escalona
// elementos hermanos. Con "reducir movimiento" el contenido simplemente se ve (index.css).
export function Reveal({
  as: Tag = 'div',
  delay = 0,
  className = '',
  children,
}: {
  as?: ElementType
  delay?: number
  className?: string
  children: ReactNode
}) {
  const [ref, seen] = useInView<HTMLElement>()
  return (
    <Tag
      ref={ref}
      data-in={seen ? '' : undefined}
      className={`reveal ${className}`}
      style={{ '--d': `${delay}ms` } as React.CSSProperties}
    >
      {children}
    </Tag>
  )
}
