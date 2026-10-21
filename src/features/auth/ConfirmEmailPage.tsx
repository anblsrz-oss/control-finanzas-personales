import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { supabase } from '@/lib/supabase'
import { NATIVE_REDIRECT } from '@/lib/nativeAuth'

// Destino del botón de los correos de Supabase Auth (?token_hash=…&type=…).
// El token se canjea SOLO al pulsar el botón: los filtros de Outlook/Defender
// abren los enlaces antes que la persona y quemarían un enlace de un solo uso.
const TYPES = ['signup', 'recovery', 'email_change', 'invite'] as const
type EmailType = (typeof TYPES)[number]

export function ConfirmEmailPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const tokenHash = params.get('token_hash')
  const type = TYPES.find((x) => x === params.get('type')) as EmailType | undefined
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  async function confirm() {
    if (!tokenHash || !type) return
    setLoading(true)
    setError(null)
    const { error: err } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type })
    setLoading(false)
    if (err) {
      setError(t('Este enlace ya se usó o venció. Inicia sesión; si aún no puedes entrar, pide un correo nuevo desde el registro.'))
      return
    }
    if (type === 'recovery') navigate('/reset-password', { replace: true })
    else setDone(true)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas p-6">
      <Card className="w-full max-w-sm text-center">
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          {done ? t('¡Cuenta confirmada!') : t('Confirma tu correo')}
        </h1>
        {!tokenHash || !type ? (
          <p className="mt-3 text-sm text-red-600">{t('El enlace no es válido.')}</p>
        ) : done ? (
          <div className="mt-5 space-y-3">
            <Button className="w-full" onClick={() => navigate('/', { replace: true })}>
              {t('Continuar')}
            </Button>
            <a href={NATIVE_REDIRECT} className="block text-sm text-slate-500 underline">
              {t('Abrir la app')}
            </a>
          </div>
        ) : (
          <div className="mt-5 space-y-3">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {t('Pulsa el botón para activar tu cuenta.')}
            </p>
            <Button className="w-full" onClick={confirm} disabled={loading}>
              {loading ? t('Confirmando…') : t('Confirmar mi cuenta')}
            </Button>
          </div>
        )}
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        <Link to="/login" className="mt-4 block text-sm text-slate-500 underline">
          {t('Ir a iniciar sesión')}
        </Link>
      </Card>
    </div>
  )
}
