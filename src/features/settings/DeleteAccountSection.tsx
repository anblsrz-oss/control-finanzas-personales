import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useDeleteMyAccount } from '@/hooks/useDeleteAccount'

// "Eliminar mi cuenta": se usa en Configuración y en la página pública
// /eliminar-cuenta (cuando hay sesión). Pide escribir ELIMINAR para confirmar.
export function DeleteAccountSection() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const deleteAccount = useDeleteMyAccount()
  const [open, setOpen] = useState(false)
  const [confirmText, setConfirmText] = useState('')

  if (!open) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {t('Borra tu cuenta y todos tus datos de forma permanente.')}
        </p>
        <Button size="sm" variant="danger" onClick={() => setOpen(true)}>
          {t('Eliminar mi cuenta')}
        </Button>
      </div>
    )
  }

  return (
    <div className="grid gap-3">
      <p className="text-sm text-slate-700 dark:text-slate-200">
        {t('Se borrarán para siempre tus movimientos, cuentas, tarjetas, presupuestos, reglas y conexiones de correo o calendario. Si tienes Premium, la suscripción se cancela. Esto no se puede deshacer.')}
      </p>
      <p className="text-xs text-slate-500 dark:text-slate-400">
        {t('Si quieres conservar tus movimientos, expórtalos a Excel antes (Reportes).')}
      </p>
      <label className="grid gap-1 text-sm text-slate-600 dark:text-slate-300">
        {t('Escribe ELIMINAR para confirmar')}
        <Input
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          autoCapitalize="characters"
          autoComplete="off"
        />
      </label>
      {deleteAccount.error && (
        <p className="break-words text-sm text-red-600">
          {(deleteAccount.error as Error).message}
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        <Button
          variant="danger"
          disabled={confirmText.trim().toUpperCase() !== 'ELIMINAR' || deleteAccount.isPending}
          onClick={() =>
            deleteAccount.mutate(undefined, {
              onSuccess: () => navigate('/bienvenida', { replace: true }),
            })
          }
        >
          {deleteAccount.isPending ? t('Eliminando…') : t('Eliminar definitivamente')}
        </Button>
        <Button
          variant="ghost"
          disabled={deleteAccount.isPending}
          onClick={() => {
            setOpen(false)
            setConfirmText('')
          }}
        >
          {t('Cancelar')}
        </Button>
      </div>
    </div>
  )
}
