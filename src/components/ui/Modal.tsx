import { useEffect, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

interface ModalProps {
  open: boolean
  title: string
  /** Icono opcional a la izquierda del título. */
  icon?: ReactNode
  children: ReactNode
  onClose: () => void
}

// Modal simple centrado con overlay. Cierra al hacer clic fuera o en la X.
// Se monta en <body> vía portal: si viviera dentro de un ancestro con
// z-index propio (p. ej. el header sticky), quedaría atrapado debajo de la
// barra inferior fija.
export function Modal({ open, title, icon, children, onClose }: ModalProps) {
  const [rendered, setRendered] = useState(open)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (open) {
      setRendered(true)
      // deja pintar el estado inicial (oculto) antes de animar a visible
      const raf = requestAnimationFrame(() => setVisible(true))
      return () => cancelAnimationFrame(raf)
    }
    setVisible(false)
    const timeout = setTimeout(() => setRendered(false), 160)
    return () => clearTimeout(timeout)
  }, [open])

  if (!rendered) return null
  return createPortal(
    <div
      className={`fixed inset-0 z-50 flex items-end justify-center bg-[rgb(8_13_32)]/60 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-[calc(1rem+env(safe-area-inset-top))] transition-opacity duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] sm:items-center ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={onClose}
    >
      <div
        className={`flex max-h-full w-full max-w-md flex-col rounded-lg border border-slate-200 bg-surface p-5 shadow-2xl dark:border-slate-700 transition-[transform,opacity] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:translate-y-0 motion-reduce:scale-100 ${
          visible
            ? 'translate-y-0 scale-100 opacity-100'
            : 'translate-y-4 scale-100 opacity-0 sm:translate-y-0 sm:scale-95'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex shrink-0 items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            {icon}
            <h3 className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100">{title}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="-me-1 shrink-0 rounded-md p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            aria-label="Cerrar"
            title="Cerrar"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        <div className="min-h-0 overflow-y-auto">{children}</div>
      </div>
    </div>,
    document.body,
  )
}
