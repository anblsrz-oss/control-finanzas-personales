import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CircleAlert, CircleHelp, Info, TriangleAlert } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'

// Sustituto de window.alert / window.confirm: diálogos propios con la misma forma de
// uso (promesas), para no tener que rediseñar cada pantalla que los llama.
//   if (await confirmDialog('¿Eliminar esta cuenta?')) { … }
//   showAlert(`Error: ${e.message}`)
// <DialogHost /> debe estar montado una vez en la raíz de la app.

type Tone = 'danger' | 'info' | 'error'

interface Request {
  kind: 'confirm' | 'alert'
  message: string
  tone: Tone
  confirmLabel?: string
  resolve: (ok: boolean) => void
}

let push: ((r: Request) => void) | null = null

// Verbos de acción en el mensaje → etiqueta del botón y tono de aviso.
const VERBS: [RegExp, string][] = [
  [/eliminar/i, 'Eliminar'],
  [/borrar/i, 'Borrar'],
  [/desconectar/i, 'Desconectar'],
  [/quitar/i, 'Quitar'],
  [/cancelar/i, 'Cancelar suscripción'],
  [/salir/i, 'Salir'],
]

function inferConfirm(message: string): { tone: Tone; label?: string } {
  for (const [re, label] of VERBS) if (re.test(message)) return { tone: 'danger', label }
  return { tone: 'info' }
}

export function confirmDialog(message: string, opts?: { confirmLabel?: string; tone?: Tone }): Promise<boolean> {
  const guess = inferConfirm(message)
  return new Promise((resolve) => {
    // Sin host montado (no debería pasar), se cae al cuadro nativo para no perder la pregunta.
    if (!push) return resolve(window.confirm(message))
    push({
      kind: 'confirm',
      message,
      tone: opts?.tone ?? guess.tone,
      confirmLabel: opts?.confirmLabel ?? guess.label,
      resolve,
    })
  })
}

const ERROR_RE = /^\s*(error|no se pudo|falló|fallo)/i

export function showAlert(message: string, opts?: { tone?: Tone }): Promise<void> {
  return new Promise((resolve) => {
    if (!push) {
      window.alert(message)
      return resolve()
    }
    push({
      kind: 'alert',
      message,
      tone: opts?.tone ?? (ERROR_RE.test(message) ? 'error' : 'info'),
      resolve: () => resolve(),
    })
  })
}

const TONE_ICON = {
  danger: { Icon: TriangleAlert, chip: 'bg-line-amber/15 text-line-amber' },
  error: { Icon: CircleAlert, chip: 'bg-line-scarlet/10 text-line-scarlet' },
  info: { Icon: Info, chip: 'bg-brand-50 text-brand-700 dark:bg-brand-800/40 dark:text-brand-500' },
} as const

export function DialogHost() {
  const { t } = useTranslation()
  const [queue, setQueue] = useState<Request[]>([])
  const current = queue[0]

  useEffect(() => {
    push = (r) => setQueue((q) => [...q, r])
    return () => {
      push = null
    }
  }, [])

  // Mantiene el último contenido mientras el modal anima su salida.
  const [shown, setShown] = useState<Request | null>(null)
  useEffect(() => {
    if (current) setShown(current)
  }, [current])

  function close(ok: boolean) {
    if (!current) return
    current.resolve(ok)
    setQueue((q) => q.slice(1))
  }

  const req = current ?? shown
  const tone = req ? TONE_ICON[req.tone] : TONE_ICON.info
  const isConfirm = req?.kind === 'confirm'
  const Icon = isConfirm && req?.tone === 'info' ? CircleHelp : tone.Icon
  const title = !req
    ? ''
    : isConfirm
      ? req.tone === 'danger'
        ? t('¿Estás seguro?')
        : t('Confirmar')
      : req.tone === 'error'
        ? t('Algo salió mal')
        : t('Aviso')

  return (
    <Modal
      open={!!current}
      title={title}
      icon={
        <span aria-hidden="true" className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-md ${tone.chip}`}>
          <Icon className="h-5 w-5" />
        </span>
      }
      onClose={() => close(false)}
    >
      <p role="alertdialog" className="whitespace-pre-line text-sm leading-relaxed text-slate-600 dark:text-slate-300">
        {req?.message}
      </p>
      <div className="mt-6 flex justify-end gap-2">
        {isConfirm && (
          <Button variant="secondary" onClick={() => close(false)}>
            {t('Cancelar')}
          </Button>
        )}
        <Button
          variant={isConfirm && req?.tone === 'danger' ? 'danger' : 'primary'}
          onClick={() => close(true)}
          autoFocus
        >
          {isConfirm ? t(req?.confirmLabel ?? 'Aceptar') : t('Entendido')}
        </Button>
      </div>
    </Modal>
  )
}
