import { Link, Navigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/store/useAuth'
import { useAppConfig } from '@/hooks/useAppConfig'
import { useLocalePath } from '@/hooks/useLocalePath'
import { BrandLogo } from '@/components/ui/BrandLogo'
import { LinesDiagram } from '@/components/ui/LinesDiagram'

// Inicio de la app del celular (sin sesión). Una sola vista, sin scroll largo ni
// precios: los planes viven en /suscripcion una vez dentro. La landing web
// (/) sigue siendo la página de venta del navegador.
// Forzada al esmalte medianoche: es la primera impresión de la marca.

export function MobileWelcomePage() {
  const { t } = useTranslation()
  const lp = useLocalePath()
  const { session } = useAuth()
  const { data: appConfig } = useAppConfig()

  if (session) return <Navigate to="/" replace />

  return (
    <div className="safe-top safe-bottom flex min-h-screen flex-col bg-[rgb(8_13_32)] px-6 text-white">
      <header className="flex items-center gap-2 pt-6">
        <BrandLogo logoUrl={appConfig?.logo_url} />
        <span className="text-sm font-semibold text-white/80">
          {appConfig?.app_title || 'Mi Control de Finanzas Personales'}
        </span>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center gap-8 py-8">
        <LinesDiagram />
        <div className="max-w-sm text-center">
          <h1 className="text-balance text-4xl font-bold tracking-tight">
            {t('Tu dinero, en un mapa claro')}
          </h1>
          <p className="mt-3 text-pretty text-base text-white/70">
            {t('Tus cuentas y tarjetas se registran solas desde tus correos y notificaciones. Tú solo revisas.')}
          </p>
        </div>
      </main>

      <div className="flex flex-col gap-3 pb-6">
        <Link
          to="/login?mode=signup"
          className="rounded-md bg-white py-3 text-center text-base font-semibold text-[rgb(8_13_32)] transition-transform active:scale-[0.98]"
        >
          {t('Crear cuenta')}
        </Link>
        <Link
          to="/login"
          className="rounded-md border border-white/30 py-3 text-center text-base font-semibold text-white transition-transform active:scale-[0.98]"
        >
          {t('Ya tengo cuenta')}
        </Link>
        <p className="mt-2 text-center text-xs text-white/50">
          <Link to={lp('/terminos')} className="underline">{t('Términos y Condiciones')}</Link>
          {' · '}
          <Link to={lp('/privacidad')} className="underline">{t('Política de Privacidad')}</Link>
        </p>
      </div>
    </div>
  )
}
