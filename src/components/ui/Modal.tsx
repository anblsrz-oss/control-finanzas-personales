import { useEffect, useState, type ReactNode } from 'react'

interface ModalProps {
  open: boolean
  title: string
  children: ReactNode
  onClose: () => void
}

// Modal simple centrado con overlay. Cierra al hacer clic fuera o en la X.
export function Modal({ open, title, children, onClose }: ModalProps) {
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
  return (
    <div
      className={`fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 transition-opacity duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] sm:items-center ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={onClose}
    >
      <div
        className={`w-full max-w-md rounded-xl bg-white dark:bg-slate-800 p-5 shadow-xl transition-[transform,opacity] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:translate-y-0 motion-reduce:scale-100 ${
          visible
            ? 'translate-y-0 scale-100 opacity-100'
            : 'translate-y-4 scale-100 opacity-0 sm:translate-y-0 sm:scale-95'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">{title}</h3>
          <button
            onClick={onClose}
            className="text-slate-400 dark:text-slate-500 hover:text-slate-600"
            aria-label="Cerrar"
            title="Cerrar"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
