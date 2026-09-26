import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { BrandLogo } from '@/components/ui/BrandLogo'
import { useAppConfig } from '@/hooks/useAppConfig'
import { useAuth } from '@/store/useAuth'
import { DeleteAccountSection } from '@/features/settings/DeleteAccountSection'

// Página pública /eliminar-cuenta. Google Play pide una URL donde cualquiera
// pueda ver cómo borrar su cuenta sin tener que reinstalar la app. Con sesión
// iniciada permite borrarla aquí mismo; sin sesión explica los pasos y ofrece
// iniciar sesión o pedirlo por correo.

const CONTACT_EMAIL = 'anbl.srz@gmail.com'

export function DeleteAccountPage() {
  const { t } = useTranslation()
  const { data: appConfig } = useAppConfig()
  const { session, loading } = useAuth()

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <Link to="/bienvenida" className="text-xs text-slate-400 dark:text-slate-500 underline">
          {t('← Volver al inicio')}
        </Link>

        <Card className="mt-4">
          <div className="mb-2">
            <BrandLogo logoUrl={appConfig?.logo_url} size="h-9 w-9" emojiSize="text-3xl" />
          </div>
          <h1 className="text-2xl font-bold">{t('Eliminar tu cuenta')}</h1>

          <div className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-300">
            <p>
              {t('Puedes borrar tu cuenta de Mi Control de Finanzas Personales y todos tus datos cuando quieras. El borrado es inmediato y no se puede deshacer.')}
            </p>
            <p className="font-medium text-slate-700 dark:text-slate-200">{t('Qué se borra')}</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>{t('Tu perfil y tu inicio de sesión.')}</li>
              <li>{t('Movimientos, cuentas, tarjetas, líneas de crédito, presupuestos, suscripciones y categorías.')}</li>
              <li>{t('Reglas y conexiones de correo (Gmail/Outlook), Google Calendar y captura en el teléfono. Se revoca el acceso a Google.')}</li>
              <li>{t('Tu suscripción Premium, que se cancela en ese momento.')}</li>
            </ul>
            <p>
              {t('No conservamos copias de tus datos financieros después del borrado. El procesador de pagos (Stripe) puede conservar el registro de cobros que exige la ley.')}
            </p>
          </div>
        </Card>

        <Card className="mt-4">
          {loading ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">{t('Cargando…')}</p>
          ) : session ? (
            <>
              <p className="mb-3 text-sm text-slate-600 dark:text-slate-300">
                {t('Sesión iniciada como {{email}}.', { email: session.user.email ?? '' })}
              </p>
              <DeleteAccountSection />
            </>
          ) : (
            <div className="grid gap-3 text-sm text-slate-600 dark:text-slate-300">
              <p className="font-medium text-slate-700 dark:text-slate-200">{t('Cómo hacerlo')}</p>
              <ol className="list-decimal space-y-1 pl-5">
                <li>{t('Inicia sesión (en la app o aquí mismo).')}</li>
                <li>{t('Ve a Configuración → Eliminar mi cuenta.')}</li>
                <li>{t('Escribe ELIMINAR y confirma.')}</li>
              </ol>
              <div>
                <Link to="/login">
                  <Button size="sm">{t('Iniciar sesión')}</Button>
                </Link>
              </div>
              <p className="break-words">
                {t('¿No puedes entrar? Escríbenos desde el correo de tu cuenta a {{email}} y la borramos por ti.', {
                  email: CONTACT_EMAIL,
                })}
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
